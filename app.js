require("dotenv").config();

const express = require("express");
const app = express();

const { generateQRFile } = require("./services/qr");
const { sendWhatsApp } = require("./services/whatsapp");
const { orderMap, router: webhookRoutes } = require("./routes/webhook");

app.use(express.json());

// tiket sementara
let tickets = {};

// supaya QR bisa diakses browser
app.use("/tmp", express.static(__dirname + "/tmp"));

// ==============================
// TEST
// ==============================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ==============================
// WEBHOOK
// ==============================
app.use("/webhook", webhookRoutes);

// ==============================
// VERIFY TICKET
// ==============================
app.get("/verify-ticket/:orderId", (req, res) => {
  const { orderId } = req.params;

  const ticket = tickets[orderId];

  if (!ticket) {
    return res.json({
      valid: false,
      message: "Ticket not found",
    });
  }

  if (ticket.status === "USED") {
    return res.json({
      valid: false,
      message: "Ticket already used",
    });
  }

  return res.json({
    valid: true,
    message: "Ticket valid",
    ticket,
  });
});

// ==============================
// USE TICKET
// ==============================
app.post("/use-ticket/:orderId", (req, res) => {
  const { orderId } = req.params;

  const ticket = tickets[orderId];

  if (!ticket) {
    return res.json({
      success: false,
      message: "Ticket not found",
    });
  }

  ticket.status = "USED";
  ticket.usedAt = new Date();

  return res.json({
    success: true,
    message: "Ticket marked as USED",
  });
});

// ==============================
// MIDTRANS CALLBACK
// ==============================
app.post("/midtrans-callback", async (req, res) => {
  const body = req.body;

  console.log("🔥 Midtrans Callback:", body);

  const orderId = body.order_id;
  const status = body.transaction_status;

  if (status === "settlement" || status === "capture") {
    try {
      console.log("✅ Pembayaran sukses:", orderId);

      // generate QR
      await generateQRFile(orderId);

      // simpan tiket
      tickets[orderId] = {
        orderId,
        status: "ACTIVE",
        createdAt: new Date(),
      };

      const phone = process.env.PHONE; // nomor tujuan WA

      const imageUrl =
        `https://cruncher-viewpoint-condition.ngrok-free.dev/tmp/${orderId}.png`;

      console.log("QR URL:", imageUrl);

      await sendWhatsApp(
        phone,
        `🎟️ E-Ticket Wisata

Order: ${orderId}

Pembayaran berhasil.

Silakan buka QR tiket berikut:

${imageUrl}

Tunjukkan QR tersebut saat masuk lokasi wisata.`
      );

      console.log("🎉 Tiket berhasil dikirim ke WhatsApp");
    } catch (error) {
      console.error("❌ ERROR KIRIM WA:", error);
    }
  }

  res.sendStatus(200);
});

// ==============================
// RUN SERVER
// ==============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});