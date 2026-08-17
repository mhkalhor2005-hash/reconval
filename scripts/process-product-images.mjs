// One-off script: reads the raw product photos from the uploads folder,
// resizes/compresses them, and writes clean-named webp files into
// public/products/. Not part of the app runtime — safe to delete later.
import sharp from "sharp";
import path from "path";
import fs from "fs";

const SRC_DIR = "/mnt/user-data/uploads/ریکنوال";
const OUT_DIR = path.join(process.cwd(), "public", "products");

const MAP = [
  { src: "ضدآفتاب-بی-رنگ-نرمال-تا-خشک1.jpg", out: "sunscreen-clear-normal-dry.webp" },
  { src: "ضدآفتاب-بی-رنگ-چرب2.jpg", out: "sunscreen-clear-oily.webp" },
  { src: "ضدآفتاب-رنگی-مناسب-لک.jpg", out: "sunscreen-tinted-dark-spot.webp" },
  { src: "ضدآفتاب-رنگی-نرمال-تا-خشک2.jpg", out: "sunscreen-tinted-normal-dry.webp" },
  { src: "کرم-روز-مناسب-پوست-دارای-لک-کرم3.webp", out: "day-cream-dark-spot.webp" },
  { src: "کرم-روشن-کننده-پوست-بدن3.webp", out: "brightening-body-cream.webp" },
  { src: "کرم-شب-مناسب-پوست-دارای-لک3.webp", out: "night-cream-dark-spot.webp" },
  { src: "کرم-مناسب-تیرگی-و-پف-دور-چشم2.webp", out: "eye-cream-dark-circles.webp" },
  { src: "کرم-مناسب-پوست-دارای-چروک2.webp", out: "wrinkle-cream.webp" },
  { src: "کرم-مناسب-چروک-دور-چشم2.webp", out: "eye-wrinkle-cream.webp" },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const { src, out } of MAP) {
  const inputPath = path.join(SRC_DIR, src);
  const outputPath = path.join(OUT_DIR, out);
  await sharp(inputPath)
    .resize(720, 720, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(outputPath);
  const { size } = fs.statSync(outputPath);
  console.log(`${out}: ${(size / 1024).toFixed(0)} KB`);
}
console.log("done");
