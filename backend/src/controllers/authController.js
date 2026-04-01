const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// REGISTRO DE PACIENTE
const registrarPaciente = async (req, res) => {
  const tokenVerificacion = generarToken();
  // 1. Extraer TODOS los campos que pide el enunciado
  const {
    nombre,
    apellido,
    dpi,
    genero,
    direccion,
    telefono,
    fecha_nacimiento,
    correo,
    password,
  } = req.body;

  // 2. Extraer foto si viene (es opcional para pacientes)
  const fotoPath = req.file ? req.file.path : null;

  try {
    // 3. Verificar si el paciente ya existe por correo o DPI
    const userExist = await pool.query(
      "SELECT * FROM pacientes WHERE correo = $1 OR dpi = $2",
      [correo, dpi],
    );
    if (userExist.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El correo o DPI ya están registrados." });
    }

    // 4. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 5. Guardar en la base de datos CON ESTADO PENDIENTE
    const nuevoPaciente = await pool.query(
      `INSERT INTO pacientes (
        nombre, apellido, dpi, genero, direccion, telefono, 
        fecha_nacimiento, foto, correo, password, rol, estado, token_verificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING id, nombre, correo, estado`,
      [
        nombre,
        apellido,
        dpi,
        genero,
        direccion,
        telefono,
        fecha_nacimiento,
        fotoPath,
        correo,
        passwordEncriptada,
        "paciente",
        "pendiente",
        tokenVerificacion,
      ],
    );
    await enviarCorreoVerificacion(correo, nombre, tokenVerificacion);

    res.status(201).json({
      mensaje:
        "Registro completado. Su cuenta está pendiente de aprobación por el administrador.",
      usuario: nuevoPaciente.rows[0],
    });
  } catch (error) {
    console.error("Error en registro paciente:", error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor al registrar paciente" });
  }
};

// Función para generar un token alfanumérico de 6 caracteres
const generarToken = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Función para enviar el correo con la plantilla solicitada en la rúbrica
const enviarCorreoVerificacion = async (correo, nombre, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Clínica SaludPlus" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: "¡Bienvenido a SaludPlus! Código de Verificación",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png" alt="SaludPlus Logo" style="width: 80px; margin-bottom: 20px;">
        </div>
        <h2 style="color: #0056b3; text-align: center;">¡Bienvenido a SaludPlus, ${nombre}!</h2>
        <p style="color: #555; font-size: 16px;">Nos alegra mucho tenerte en nuestra plataforma. Para activar tu cuenta de forma segura y evitar el spam, necesitamos verificar tu correo electrónico.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #333; font-size: 14px;">Tu código de verificación es:</p>
          <h1 style="color: #28a745; letter-spacing: 5px; margin: 10px 0;">${token}</h1>
        </div>

        <h3 style="color: #333;">Instrucciones para tu primer ingreso:</h3>
        <ol style="color: #555; font-size: 14px; line-height: 1.6;">
          <li>Espera a que el Administrador apruebe tu perfil en el sistema.</li>
          <li>Ve a la pantalla de Inicio de Sesión de SaludPlus.</li>
          <li>Ingresa tu correo, tu contraseña y este código de verificación.</li>
          <li>¡Listo! Tu correo quedará verificado de forma permanente.</li>
        </ol>
        
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">Si no solicitaste este registro, por favor ignora este correo.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// INICIO DE SESIÓN DE PACIENTE
const loginPaciente = async (req, res) => {
  const { correo, password, token: tokenVerificacionIngresado } = req.body;

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

    // 2. VALIDACIÓN CRÍTICA: ¿Está aprobado?
    if (usuario.estado !== "aprobado") {
      return res.status(403).json({
        error: "Su cuenta está pendiente de aprobación por el administrador.",
      });
    }

    // 3. Comparar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    if (!usuario.correo_verificado) {
      // Si su correo NO está verificado, EXIGIMOS que mande el token en la petición
      if (!tokenVerificacionIngresado) {
        return res.status(403).json({
          error:
            "Primer inicio de sesión. Por favor, ingrese el token de verificación enviado a su correo.",
          requiereToken: true, // Mandamos esta bandera para que el Frontend sepa qué mostrar
        });
      }

      // ---HU-202: VALIDACIÓN DE CORREO ---
      // Validamos que el token ingresado coincida con el de la base de datos
      if (
        tokenVerificacionIngresado.toUpperCase() !== usuario.token_verificacion
      ) {
        return res
          .status(400)
          .json({ error: "El token de verificación es incorrecto." });
      }

      // Si el token es correcto, actualizamos la base de datos
      await pool.query(
        "UPDATE pacientes SET correo_verificado = TRUE, token_verificacion = NULL WHERE id = $1",
        [usuario.id],
      );
    }

    // 4. Generar el Token de Sesión
    const tokenSesion = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token: tokenSesion,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    console.error("Error en login paciente:", error.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

// REGISTRO DE MÉDICO (HU-002)
const registrarMedico = async (req, res) => {
  // 1. Extraer los campos del cuerpo de la petición (req.body)
  const tokenVerificacion = generarToken();
  const {
    nombre,
    apellido,
    dpi,
    fecha_nacimiento,
    genero,
    direccion,
    telefono,
    numero_colegiado,
    especialidad,
    direccion_clinica,
    correo,
    password,
  } = req.body;

  // 2. Validar que la foto exista (Requisito Crítico)
  if (!req.file) {
    return res.status(400).json({
      error: "La fotografía es obligatoria para el registro de médicos.",
    });
  }

  const fotoPath = req.file.path; // Ruta donde multer guardó la imagen

  try {
    // 3. Verificar si el médico ya existe (Correo, DPI o Número Colegiado)
    const medicoExist = await pool.query(
      "SELECT * FROM medicos WHERE correo = $1 OR dpi = $2 OR numero_colegiado = $3",
      [correo, dpi, numero_colegiado],
    );

    if (medicoExist.rows.length > 0) {
      return res.status(400).json({
        error: "El correo, DPI o Número de Colegiado ya están registrados.",
      });
    }

    // 4. Encriptar la contraseña (Igual que pacientes)
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 5. Insertar en la tabla 'medicos' creada previamente con el usuario 'admin'
    const nuevoMedico = await pool.query(
      `INSERT INTO medicos (
        nombre, apellido, dpi, fecha_nacimiento, genero, 
        direccion, telefono, foto, numero_colegiado, 
        especialidad, direccion_clinica, correo, contrasena, estado, token_verificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING id, nombre, correo, estado`,
      [
        nombre,
        apellido,
        dpi,
        fecha_nacimiento,
        genero,
        direccion,
        telefono,
        fotoPath,
        numero_colegiado,
        especialidad,
        direccion_clinica,
        correo,
        passwordEncriptada,
        "pendiente",
        tokenVerificacion,
      ],
    );

    await enviarCorreoVerificacion(correo, nombre, tokenVerificacion);

    res.status(201).json({
      mensaje:
        "Registro completado. Su cuenta está pendiente de aprobación por el administrador.",
      usuario: nuevoMedico.rows[0],
    });
  } catch (error) {
    console.error("Error en registro médico:", error.message);
    res.status(500).json({ error: "Error en el servidor al registrar médico" });
  }
};

// INICIO DE SESIÓN DE MÉDICO (HU-002)
const loginMedico = async (req, res) => {
  const { correo, password, token: tokenVerificacionIngresado } = req.body;

  try {
    // 1. Buscar al médico en la tabla que creamos
    const result = await pool.query("SELECT * FROM medicos WHERE correo = $1", [
      correo,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const medico = result.rows[0];

    // 2. VALIDACIÓN CRÍTICA: ¿Está aprobado? (Requisito de la Fase 1)
    if (medico.estado !== "aprobado") {
      return res.status(403).json({
        error: "Su cuenta está pendiente de aprobación por el administrador.",
      });
    }

    // 3. Comparar contraseña (Hash)
    const passwordValida = await bcrypt.compare(password, medico.contrasena);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // --- HU-202: VALIDACIÓN DE CORREO ---
    if (!medico.correo_verificado) {
      if (!tokenVerificacionIngresado) {
        return res.status(403).json({
          error:
            "Primer inicio de sesión. Por favor, ingrese el token de verificación enviado a su correo.",
          requiereToken: true,
        });
      }

      if (
        tokenVerificacionIngresado.toUpperCase() !== medico.token_verificacion
      ) {
        return res
          .status(400)
          .json({ error: "El token de verificación es incorrecto." });
      }

      await pool.query(
        "UPDATE medicos SET correo_verificado = TRUE, token_verificacion = NULL WHERE id = $1",
        [medico.id],
      );
    }

    // 4. Generar Token de Sesión (Igual que pacientes, pero con rol 'medico')
    const tokenSesion = jwt.sign(
      { id: medico.id, rol: "medico" },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token: tokenSesion,
      usuario: {
        id: medico.id,
        nombre: medico.nombre,
        rol: "medico",
        foto: medico.foto,
      },
    });
  } catch (error) {
    console.error("Error en login médico:", error.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

// LOGIN ADMINISTRADOR - PRIMER FACTOR (HU-004)
// Solo valida usuario y contraseña predeterminados
const loginAdmin = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    // Credenciales predeterminadas del administrador
    const adminUsuario = "admin";
    const adminPassword = "admin123";

    console.log("Primer factor - Validando credenciales iniciales...");
    console.log("Usuario ingresado:", usuario);
    console.log("Usuario esperado:", adminUsuario);

    // Validar usuario y password del primer factor
    if (usuario !== adminUsuario || password !== adminPassword) {
      console.log("Credenciales inválidas en primer factor");
      return res.status(400).json({ error: "Usuario o contraseña inválidos" });
    }

    console.log("Primer factor validado - Generando token temporal...");

    // Generar token temporal con rol "admin-pending-2fa" (válido por 10 minutos)
    const tokenTemporal = jwt.sign(
      { id: "admin", rol: "admin-pending-2fa", usuario },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "10m" },
    );

    res.json({
      mensaje:
        "Primer factor completado. Proceda con la autenticación de segundo factor.",
      tokenTemporal,
      requiere2FA: true,
    });
  } catch (error) {
    console.error("Error en primer factor:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// VALIDACIÓN DE SEGUNDO FACTOR (HU-004)
// Valida la contraseña encriptada del archivo auth2-ayd1.txt
const validar2FA = async (req, res) => {
  const { password2fa } = req.body;
  const tokenTemporal = req.headers.authorization?.split(" ")[1];

  try {
    // 1. Verificar token temporal
    if (!tokenTemporal) {
      return res.status(401).json({ error: "Token temporal no proporcionado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        tokenTemporal,
        process.env.JWT_SECRET || "mi_clave_secreta",
      );
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Token temporal expirado. Inicie sesión nuevamente" });
    }

    if (decoded.rol !== "admin-pending-2fa") {
      return res
        .status(401)
        .json({ error: "Token inválido para segundo factor" });
    }

    console.log("Segundo factor - Validando contraseña encriptada...");

    // 2. Leer el archivo auth2-ayd1.txt
    const filePath = path.join(process.cwd(), "auth2-ayd1.txt");
    console.log("Buscando archivo en:", filePath);

    const passwordHash = fs.readFileSync(filePath, "utf-8").trim();
    console.log("Archivo leído correctamente");

    // 3. Comparar password con el hash del archivo (bcryptjs)
    const passwordValida = await bcrypt.compare(password2fa, passwordHash);
    console.log("Contraseña ingresada comparada con hash del archivo");

    if (!passwordValida) {
      console.log("Contraseña encriptada inválida");
      return res
        .status(400)
        .json({ error: "Contraseña de segundo factor inválida" });
    }

    console.log("Segundo factor validado - Generando token final...");

    // 4. Generar token final con rol "admin" completo (8 horas)
    const tokenFinal = jwt.sign(
      { id: "admin", rol: "admin", usuario: decoded.usuario },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Autenticación completada exitosamente",
      token: tokenFinal,
      usuario: {
        id: "admin",
        nombre: "Administrador",
        rol: "admin",
        usuario: decoded.usuario,
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Archivo auth2-ayd1.txt no encontrado");
      return res
        .status(500)
        .json({ error: "Error de configuración del servidor" });
    }
    console.error("Error en segundo factor:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Modulo administrador (HU-005) para aprobar o rechazar usuarios.
const obtenerMedicosPendientes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, foto, nombre, apellido, dpi, genero, especialidad, numero_colegiado, correo, estado FROM medicos WHERE estado = 'pendiente'",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener médicos pendientes" });
  }
};

// --- NUEVAS FUNCIONES PARA PACIENTES (HU-005) ---
const obtenerPacientesPendientes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, foto, nombre, apellido, dpi, genero, fecha_nacimiento, correo, estado FROM pacientes WHERE estado = 'pendiente'",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener pacientes pendientes" });
  }
};

const aprobarPaciente = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE pacientes SET estado = 'aprobado' WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Paciente no encontrado" });
    res.json({ mensaje: "Paciente aprobado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al aprobar paciente" });
  }
};

const rechazarPaciente = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "UPDATE pacientes SET estado = 'rechazado' WHERE id = $1",
      [id],
    );
    res.json({ mensaje: "Paciente rechazado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al rechazar paciente" });
  }
};

const aprobarMedico = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE medicos SET estado = 'aprobado' WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Médico no encontrado" });
    }

    res.json({ mensaje: "Médico aprobado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al aprobar médico" });
  }
};

const rechazarMedico = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE medicos SET estado = 'rechazado' WHERE id = $1", [
      id,
    ]);

    res.json({ mensaje: "Médico rechazado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al rechazar médico" });
  }
};

// --- HU-014: VER USUARIOS APROBADOS ---
const obtenerMedicosAprobados = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, foto, nombre, apellido, dpi, genero, especialidad, numero_colegiado, correo FROM medicos WHERE estado = 'aprobado'",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener médicos aprobados" });
  }
};

const obtenerPacientesAprobados = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, foto, nombre, apellido, dpi, genero, correo FROM pacientes WHERE estado = 'aprobado'",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pacientes aprobados" });
  }
};

// --- HU-014: DAR DE BAJA USUARIOS ---
const darBajaMedico = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE medicos SET estado = 'baja' WHERE id = $1", [id]);
    res.json({ mensaje: "Médico dado de baja exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al dar de baja al médico" });
  }
};

const darBajaPaciente = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE pacientes SET estado = 'baja' WHERE id = $1", [
      id,
    ]);
    res.json({ mensaje: "Paciente dado de baja exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al dar de baja al paciente" });
  }
};

/**
 * REPORTE 1: Top 5 Médicos con más pacientes atendidos
 */
const reporteMedicosMasAtendidos = async (req, res) => {
  try {
    const query = `
      SELECT m.nombre, m.apellido, COUNT(c.id) AS total_citas
      FROM medicos m
      JOIN citas c ON m.id = c.medico_id
      WHERE c.estado = 'Atendido'
      GROUP BY m.id, m.nombre, m.apellido
      ORDER BY total_citas DESC
      LIMIT 5;
    `;
    const result = await pool.query(query);

    // Formateamos los datos para enviarlos limpios al frontend
    const data = result.rows.map((row) => ({
      nombre: `Dr. ${row.nombre} ${row.apellido}`,
      total_citas: parseInt(row.total_citas, 10),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error en reporteMedicosMasAtendidos:", error);
    res
      .status(500)
      .json({ error: "Error interno al generar el reporte de médicos." });
  }
};

/**
 * REPORTE 2: Especialidades más solicitadas (historicas)
 */
const reporteEspecialidades = async (req, res) => {
  try {
    const query = `
      SELECT m.especialidad, COUNT(c.id) AS total
      FROM medicos m
      JOIN citas c ON m.id = c.medico_id
      GROUP BY m.especialidad
      ORDER BY total DESC;
    `;
    const result = await pool.query(query);

    const data = result.rows.map((row) => ({
      especialidad: row.especialidad,
      total: parseInt(row.total, 10),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error en reporteEspecialidades:", error);
    res.status(500).json({
      error: "Error interno al generar el reporte de especialidades.",
    });
  }
};

module.exports = {
  registrarPaciente,
  loginPaciente,
  registrarMedico,
  loginMedico,
  loginAdmin,
  validar2FA,
  obtenerMedicosPendientes,
  aprobarMedico,
  rechazarMedico,
  obtenerPacientesPendientes,
  aprobarPaciente,
  rechazarPaciente,
  obtenerMedicosAprobados,
  obtenerPacientesAprobados,
  darBajaMedico,
  darBajaPaciente,
  reporteMedicosMasAtendidos,
  reporteEspecialidades,
};
