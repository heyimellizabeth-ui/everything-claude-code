def draw_image():
    width, height = 1200, 630
    bg_color = (10, 10, 10)
    text_color = (245, 240, 232)
    accent_color = (232, 65, 90)
    accent_dim = (232, 65, 90, 102)  # ~40% opacity

    # Create base image with dark background
    img = Image.new("RGBA", (width, height), bg_color + (255,))
    draw = ImageDraw.Draw(img, "RGBA")

    # Border frame inset 60px from each edge
    inset = 60
    frame_rect = [inset, inset, width - inset, height - inset]
    draw.rectangle(frame_rect, outline=accent_dim, width=1)

    # Small red dots at the four inner corners of the frame
    dot_radius = 4
    corners = [
        (inset, inset),
        (width - inset, inset),
        (inset, height - inset),
        (width - inset, height - inset),
    ]
    for cx, cy in corners:
        draw.ellipse(
            [cx - dot_radius, cy - dot_radius, cx + dot_radius, cy + dot_radius],
            fill=accent_color + (255,),
        )

    # Try to load a large bold monospace font for "KUDT"
    font_large = None
    font_size_large = 160
    candidate_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf",
        "/usr/share/fonts/TTF/DejaVuSansMono-Bold.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "cour.ttf",
        "DejaVuSansMono-Bold.ttf",
    ]
    for font_path in candidate_fonts:
        try:
            font_large = ImageFont.truetype(font_path, font_size_large)
            break
        except (IOError, OSError):
            continue

    font_medium = None
    font_size_medium = 18
    for font_path in candidate_fonts:
        try:
            font_medium = ImageFont.truetype(font_path, font_size_medium)
            break
        except (IOError, OSError):
            continue

    font_small = None
    font_size_small = 13
    for font_path in candidate_fonts:
        try:
            font_small = ImageFont.truetype(font_path, font_size_small)
            break
        except (IOError, OSError):
            continue

    if font_large is None:
        font_large = ImageFont.load_default()
    if font_medium is None:
        font_medium = ImageFont.load_default()
    if font_small is None:
        font_small = ImageFont.load_default()

    # Draw "KUDT" centered
    kudt_text = "KUDT"
    bbox = draw.textbbox((0, 0), kudt_text, font=font_large)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    # Vertical center slightly above middle to leave room below
    kudt_y = (height // 2) - (text_h // 2) - 60
    kudt_x = (width - text_w) // 2
    draw.text((kudt_x - bbox[0], kudt_y - bbox[1]), kudt_text, font=font_large, fill=text_color + (255,))

    # Horizontal red line below the wordmark
    line_y = kudt_y - bbox[1] + text_h + 18
    line_margin = 120
    draw.line([(line_margin, line_y), (width - line_margin, line_y)], fill=accent_color + (255,), width=1)

    # "PARTY IN A QUEER SPACE" with simulated letter spacing
    subtitle_text = "P A R T Y   I N   A   Q U E E R   S P A C E"
    subtitle_y = line_y + 28
    bbox_s = draw.textbbox((0, 0), subtitle_text, font=font_medium)
    sub_w = bbox_s[2] - bbox_s[0]
    sub_x = (width - sub_w) // 2
    draw.text((sub_x - bbox_s[0], subtitle_y - bbox_s[1]), subtitle_text, font=font_medium, fill=text_color + (255,))

    # "ALKMAAR · EST. 2022 · CLUBKUDT.NL" smaller, dimmed
    info_text = "ALKMAAR  ·  EST. 2022  ·  CLUBKUDT.NL"
    info_y = subtitle_y - bbox_s[1] + (bbox_s[3] - bbox_s[1]) + 18
    bbox_i = draw.textbbox((0, 0), info_text, font=font_small)
    info_w = bbox_i[2] - bbox_i[0]
    info_x = (width - info_w) // 2
    dim_opacity = int(255 * 0.35)
    draw.text((info_x - bbox_i[0], info_y - bbox_i[1]), info_text, font=font_small, fill=text_color + (dim_opacity,))

    # Flatten RGBA to RGB
    result = Image.new("RGB", (width, height), bg_color)
    result.paste(img, mask=img.split()[3])
    return result