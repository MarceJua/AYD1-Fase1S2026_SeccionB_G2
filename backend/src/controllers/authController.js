const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTRO DE PACIENTE
const registrarPaciente = async (req, res) => {
  const { nombre, dpi, correo, password } = req.body;

  try {
    // 1. Verificar si el paciente ya existe por correo o DPI
    const userExist = await pool.query(
      "SELECT * FROM pacientes WHERE correo = $1 OR dpi = $2",
      [correo, dpi],
    );
    if (userExist.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El correo o DPI ya están registrados." });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 3. Guardar en la base de datos
    const nuevoPaciente = await pool.query(
      "INSERT INTO pacientes (nombre, dpi, correo, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, rol",
      [nombre, dpi, correo, passwordEncriptada, "paciente"],
    );

    res.status(201).json({
      mensaje: "Paciente registrado exitosamente",
      usuario: nuevoPaciente.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor al registrar paciente" });
  }
};

// INICIO DE SESIÓN DE PACIENTE
const loginPaciente = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // 1. Buscar al usuario
    const result = await pool.query(
      "SELECT * FROM pacientes WHERE correo = $1",
      [correo],
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    // 2. Comparar la contraseña ingresada con la encriptada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // 3. Generar el Token de Sesión
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

module.exports = {
  registrarPaciente,
  loginPaciente,
};
