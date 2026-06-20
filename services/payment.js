const midtransClient = require("midtrans-client");

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

async function createPayment(orderId, amount) {
  try {
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
    };

    console.log("🔥 KIRIM KE MIDTRANS");  
    const transaction = await snap.createTransaction(parameter);
    console.log("🔥 RESPON MIDTRANS DITERIMA");

    console.log("MIDTRANS RESPONSE:");
    console.log(JSON.stringify(transaction, null, 2));

    return transaction.redirect_url;

  } catch (error) {
    console.error("MIDTRANS ERROR:", error);
    return null;
  }
}

module.exports = { createPayment };