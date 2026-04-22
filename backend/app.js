const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: "../.env" });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/paciente", require("./src/routes/pacienteRoutes"));
app.use("/api/medico", require("./src/routes/medicoRoutes"));

module.exports = app;
