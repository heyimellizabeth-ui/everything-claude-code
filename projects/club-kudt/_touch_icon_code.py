def draw_image():
    width, height = 180, 180
    background_color = (10, 10, 10)
    text_color = (245, 240, 232)
    accent_color = (232, 65, 90)

    image = PIL.Image.new("RGB", (width, height), background_color)
    draw = PIL.ImageDraw.Draw(image)

    font_size = 52
    font = None

    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf",
        "/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Monaco.dfont",
        "C:/Windows/Fonts/cour.ttf",
        "C:/Windows/Fonts/courbd.ttf",
        "/usr/share/fonts/truetype/ubuntu/UbuntuMono-B.ttf",
    ]

    for path in font_paths:
        try:
            font = PIL.ImageFont.truetype(path, font_size)
            break
        except (IOError, OSError):
            continue

    if font is None:
        try:
            font = PIL.ImageFont.load_default(size=font_size)
        except TypeError:
            font = PIL.ImageFont.load_default()

    text = "KUDT"

    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        offset_x = bbox[0]
        offset_y = bbox[1]
    except AttributeError:
        text_width, text_height = draw.textsize(text, font=font)
        offset_x = 0
        offset_y = 0

    text_x = (width - text_width) // 2 - offset_x
    text_y = (height - text_height) // 2 - offset_y - 10

    draw.text((text_x, text_y), text, fill=text_color, font=font)

    try:
        bbox = draw.textbbox((text_x, text_y), text, font=font)
        line_y = bbox[3] + 6
        line_x_start = bbox[0]
        line_x_end = bbox[2]
    except AttributeError:
        line_y = text_y + text_height + 6
        line_x_start = text_x
        line_x_end = text_x + text_width

    line_thickness = 3
    draw.rectangle(
        [line_x_start, line_y, line_x_end, line_y + line_thickness - 1],
        fill=accent_color
    )

    return image