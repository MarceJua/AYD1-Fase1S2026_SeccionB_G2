const { Pool } = require("pg");
// Cargamos las variable de entorno desde el archivo .env ubicado en la raíz del proyecto
require("dotenv").config({ path: "../.env" });

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "saludplus_db",
});

pool.on("connect", () => {
  console.log("🔗 Conectado a la base de datos PostgreSQL");
});

module.exports = pool;
