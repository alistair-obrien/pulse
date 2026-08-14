from pathlib import Path
from PIL import Image
import argparse


def split_sprite_sheet(image_path: str, rows: int, columns: int):
    image_path = Path(image_path)

    with Image.open(image_path) as image:
        width, height = image.size

        sprite_width = width // columns
        sprite_height = height // rows

        output_dir = image_path.parent / image_path.stem
        output_dir.mkdir(exist_ok=True)

        for row in range(rows):
            for column in range(columns):
                left = column * sprite_width
                top = row * sprite_height
                right = left + sprite_width
                bottom = top + sprite_height

                sprite = image.crop((left, top, right, bottom))

                output_path = output_dir / f"{row}_{column}.png"
                sprite.save(output_path)

                print(f"Saved: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Split a sprite sheet into individual images."
    )

    parser.add_argument("image", help="Path to the sprite sheet")
    parser.add_argument("rows", type=int, help="Number of rows")
    parser.add_argument("columns", type=int, help="Number of columns")

    args = parser.parse_args()

    split_sprite_sheet(
        args.image,
        args.rows,
        args.columns
    )