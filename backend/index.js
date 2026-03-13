const express = require("express");
const cors = require("cors");
// Cargamos las variable de entorno desde el archivo .env ubicado en la raíz del proyecto
require("dotenv").config({ path: "../.env" });
const app = express();

// Middlewares
app.use(cors()); // Permite peticiones del Frontend
app.use(express.json()); // Permite leer JSON en el body de las peticiones

// Rutas
app.use("/api/auth", require("./src/routes/authRoutes"));

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});


