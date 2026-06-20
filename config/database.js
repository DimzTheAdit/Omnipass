const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "chatbot_ticketing",
  null,
  null,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 1433,
    dialect: "mssql",

    dialectOptions: {
      options: {
        trustServerCertificate: true,
      },
    },

    logging: false,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();

    console.log("✅ MSSQL connected successfully");

    await sequelize.sync({ alter: false });

    console.log("✅ Database models synchronized");
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
}

module.exports = {
  sequelize,
  connectDB,
};