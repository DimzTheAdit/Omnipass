const { createPayment } = require("../services/payment");
const express = require("express");
const router = express.Router();

let userState = {};
let orderMap = {}; // 🔥 mapping orderId → userId

router.post("/", async (req, res) => {
  const data = req.body;

  const userId = data.sender;
  const message = data.message;

  let reply = "";

  const state = userState[userId];

  if (message === "halo") {
    reply = "Halo! 👋\n\n1. Beli Tiket\n2. Info";
    userState[userId] = "MENU";
  }

  else if (message === "1" && state === "MENU") {
    reply = "Pilih destinasi:\n1. Ragunan - 20.000\nKetik 'beli'";
    userState[userId] = "PILIH_DESTINASI";
  }

  else if (message === "beli" && state === "PILIH_DESTINASI") {
    reply = "Masukkan jumlah tiket:";
    userState[userId] = "JUMLAH_TIKET";
  }

  else if (state === "JUMLAH_TIKET") {
    reply = `Anda membeli ${message} tiket.\nKetik 'bayar' untuk lanjut`;
    userState[userId] = "KONFIRMASI";
  }

else if (message === "bayar" && state === "KONFIRMASI") {

  console.log("🔥 MASUK KE BLOK BAYAR");

  const orderId = "ORDER-" + Date.now();
  const amount = 20000;

  console.log("🔥 SEBELUM CREATE PAYMENT");

  const paymentUrl = await createPayment(orderId, amount);

  console.log("🔥 SETELAH CREATE PAYMENT");
  console.log("PAYMENT URL:", paymentUrl);

  orderMap[orderId] = userId;

  reply = `Silakan bayar:\n${paymentUrl}`;

  userState[userId] = null;
}

  else {
    reply = "Ulangi dari awal ketik 'halo'";
  }

  console.log("State:", userState[userId]);

  res.json({ reply });
});

module.exports = { router, orderMap };