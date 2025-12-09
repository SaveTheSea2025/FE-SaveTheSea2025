const sharp = require("sharp");
const fg = require("fast-glob");
const path = require("path");
const fs = require("fs");

(async () => {
  console.log("🔍 PNG/JPG → WebP 변환 시작...");

  const files = await fg([
    "src/assets/**/*.{png,jpg,jpeg}",
    "public/**/*.{png,jpg,jpeg}",
  ]);

  if (files.length === 0) {
    console.log("⚠ 변환할 이미지가 없습니다.");
    return;
  }

  const outputDir = "src/assets-webp";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let success = 0;

  for (const file of files) {
    const fileName = path.basename(file).replace(/\.(png|jpg|jpeg)$/i, ".webp");
    const outputPath = path.join(outputDir, fileName);

    try {
      await sharp(file).webp({ quality: 80 }).toFile(outputPath);
      success++;
    } catch (err) {
      console.error(`❌ 변환 실패: ${file}`, err);
    }
  }

  console.log(`✨ 변환 완료! 총 ${success}개의 이미지 → WebP`);
})();
