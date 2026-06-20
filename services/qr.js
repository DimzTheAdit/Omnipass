const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

async function generateQRFile(text) {
  try {
    const dir = path.join(__dirname, "../tmp");

    // buat folder kalau belum ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const filePath = path.join(dir, `${text}.png`);

    await QRCode.toFile(filePath, text);

    return filePath;
  } catch (err) {
    console.error("QR ERROR:", err);
  }
}

module.exports = { generateQRFile };