const axios = require("axios");

async function sendWhatsApp(number, message) {
  try {
    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: number,
        message: message,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_API_KEY,
        },
      }
    );

    console.log("WA SENT:", response.data);
  } catch (error) {
    console.error(
      "WA ERROR:",
      error.response?.data || error.message
    );
  }
}

module.exports = { sendWhatsApp };