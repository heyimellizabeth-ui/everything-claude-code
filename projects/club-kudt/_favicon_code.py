def draw_image():
    width, height = 32, 32
    img = Image.new("RGB", (width, height), color="#0a0a0a")
    draw = ImageDraw.Draw(img)

    letter = "K"
    font = None
    font_size = 28

    while font_size >= 8:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except (IOError, OSError):
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except (IOError, OSError):
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except (IOError, OSError):
                    font = None
        if font is not None:
            bbox = draw.textbbox((0, 0), letter, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            if text_w <= width - 2 and text_h <= height - 4:
                break
            else:
                font_size -= 2
        else:
            break

    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), letter, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    text_x = (width - text_w) // 2 - bbox[0]
    text_y = (height - text_h) // 2 - bbox[1] - 2

    draw.text((text_x, text_y), letter, fill="#F5F0E8", font=font)

    letter_bottom = text_y + bbox[1] + text_h
    line_y = letter_bottom + 2
    if line_y >= height:
        line_y = height - 2

    draw.line([(2, line_y), (width - 3, line_y)], fill="#E8415A", width=1)

    return img