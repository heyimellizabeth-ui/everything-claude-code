//! Colour engine for the Unified Design Studio.
//!
//! Same maths as `engine/color.js`, exported to WebAssembly with plain `u32`
//! colours (0xRRGGBB) and `f64`s, so it needs no wasm-bindgen and no glue code.

fn channels(n: u32) -> [f64; 3] {
    [((n >> 16) & 255) as f64, ((n >> 8) & 255) as f64, (n & 255) as f64]
}

fn pack(r: f64, g: f64, b: f64) -> u32 {
    ((r.round() as u32) << 16) | ((g.round() as u32) << 8) | (b.round() as u32)
}

#[no_mangle]
pub extern "C" fn luminance(n: u32) -> f64 {
    let w = [0.2126, 0.7152, 0.0722];
    let c = channels(n);
    let mut acc = 0.0;
    for i in 0..3 {
        let v = c[i] / 255.0;
        let lin = if v <= 0.03928 { v / 12.92 } else { ((v + 0.055) / 1.055).powf(2.4) };
        acc += w[i] * lin;
    }
    acc
}

#[no_mangle]
pub extern "C" fn contrast(a: u32, b: u32) -> f64 {
    let (x, y) = (luminance(a), luminance(b));
    (x.max(y) + 0.05) / (x.min(y) + 0.05)
}

#[no_mangle]
pub extern "C" fn mix(a: u32, b: u32, t: f64) -> u32 {
    let (ca, cb) = (channels(a), channels(b));
    pack(ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t)
}

fn to_hsl(n: u32) -> (f64, f64, f64) {
    let c = channels(n);
    let (r, g, b) = (c[0] / 255.0, c[1] / 255.0, c[2] / 255.0);
    let mx = r.max(g).max(b);
    let mn = r.min(g).min(b);
    let d = mx - mn;
    let l = (mx + mn) / 2.0;
    if d == 0.0 {
        return (0.0, 0.0, l);
    }
    let s = d / (1.0 - (2.0 * l - 1.0).abs());
    // `%` matches JavaScript's remainder (sign follows the dividend).
    let h = if mx == r {
        ((g - b) / d) % 6.0
    } else if mx == g {
        (b - r) / d + 2.0
    } else {
        (r - g) / d + 4.0
    };
    ((h * 60.0 + 360.0) % 360.0, s, l)
}

fn from_hsl(h: f64, s: f64, l: f64) -> u32 {
    let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
    let hp = h / 60.0;
    let x = c * (1.0 - ((hp % 2.0) - 1.0).abs());
    let m = l - c / 2.0;
    let (r, g, b) = if hp < 1.0 {
        (c, x, 0.0)
    } else if hp < 2.0 {
        (x, c, 0.0)
    } else if hp < 3.0 {
        (0.0, c, x)
    } else if hp < 4.0 {
        (0.0, x, c)
    } else if hp < 5.0 {
        (x, 0.0, c)
    } else {
        (c, 0.0, x)
    };
    pack((r + m) * 255.0, (g + m) * 255.0, (b + m) * 255.0)
}

const WHITE: u32 = 0xffffff;
const INK: u32 = 0x111111;

fn accent_passes(c: u32, bg: u32) -> bool {
    contrast(c, bg) >= 4.5 && contrast(WHITE, c).max(contrast(INK, c)) >= 4.5
}

/// Nearest accent (same hue and saturation, lightness moved as little as
/// possible) that works as a link colour on `bg` and carries a readable label.
#[no_mangle]
pub extern "C" fn fix_accent(accent: u32, bg: u32) -> u32 {
    let (h, s, l) = to_hsl(accent);
    for k in 0..=200 {
        for sign in [-1.0, 1.0] {
            let l2 = l + sign * k as f64 * 0.005;
            if !(0.0..=1.0).contains(&l2) {
                continue;
            }
            let c = from_hsl(h, s, l2);
            if accent_passes(c, bg) {
                return c;
            }
        }
    }
    accent
}

fn wheel_at(bg: u32, steps: u32, sat: f64, i: u32) -> u32 {
    fix_accent(from_hsl(i as f64 * 360.0 / steps as f64, sat, 0.5), bg)
}

static mut WHEEL: [u32; 4096] = [0; 4096];

/// Fills an internal buffer with one passing accent per hue step and returns
/// its address, so JavaScript can read the result straight from wasm memory.
#[no_mangle]
pub extern "C" fn wheel(bg: u32, steps: u32, sat: f64) -> *const u32 {
    let n = steps.min(4096);
    // SAFETY: wasm32 is single-threaded and the buffer is only touched here.
    let buf = unsafe { &mut *core::ptr::addr_of_mut!(WHEEL) };
    for i in 0..n {
        buf[i as usize] = wheel_at(bg, steps, sat, i);
    }
    buf.as_ptr()
}

/// Same work as `wheel` without the buffer: used by the benchmark.
#[no_mangle]
pub extern "C" fn wheel_checksum(bg: u32, steps: u32, sat: f64) -> u32 {
    (0..steps).fold(0u32, |acc, i| acc.wrapping_add(wheel_at(bg, steps, sat, i)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn black_on_white_is_21() {
        assert!((contrast(0x000000, 0xffffff) - 21.0).abs() < 1e-9);
    }

    #[test]
    fn mix_halfway() {
        assert_eq!(mix(0x000000, 0xffffff, 0.5), 0x808080);
    }

    #[test]
    fn hsl_round_trip() {
        for c in [0xc2577a, 0x2f6f5e, 0xff4f00, 0x2563c9, 0x1d4f91] {
            let (h, s, l) = to_hsl(c);
            assert_eq!(from_hsl(h, s, l), c);
        }
    }

    #[test]
    fn fixed_accent_passes() {
        let bg = 0xfbf9fb;
        let fixed = fix_accent(0xffd400, bg);
        assert!(accent_passes(fixed, bg));
        // An accent that already passes is left alone.
        assert_eq!(fix_accent(0x1d4f91, 0xffffff), 0x1d4f91);
    }
}
