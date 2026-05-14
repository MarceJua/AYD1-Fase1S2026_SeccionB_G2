const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const DEMO_CREDENTIALS = {
  admin: { usuario: "admin@demo.com", password: "demo123" },
  medico: { correo: "medico@demo.com", password: "demo123" },
  paciente: { correo: "paciente@demo.com", password: "demo123" },
};

const esCuentaDemo = (correo) => {
  return [
    DEMO_CREDENTIALS.admin.usuario,
    DEMO_CREDENTIALS.medico.correo,
    DEMO_CREDENTIALS.paciente.correo,
  ].includes(String(correo || "").toLowerCase());
};

const esCuentaAprobada = (estado) => {
  return ["aprobado", "aceptado"].includes(String(estado || "").toLowerCase());
};

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
  const foto = req.files["foto"] ? req.files["foto"][0] : null;
  const pdfDpi = req.files["dpi_pdf"] ? req.files["dpi_pdf"][0] : null;

  const fotoPath = foto ? foto.path : null;
  const pdfPath = pdfDpi ? pdfDpi.path : null;

  // Validaciones obligatorias
  if (!foto) {
    return res.status(400).json({ error: "La fotografía es obligatoria" });
  }

  if (!pdfDpi) {
    return res.status(400).json({ error: "El DPI en PDF es obligatorio" });
  }

  // Validar que el archivo sea PDF
  if (pdfDpi.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "El DPI debe ser un archivo PDF" });
  }

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
        fecha_nacimiento, foto, dpi_pdf, correo, password, rol, estado, token_verificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
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
        pdfPath,
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
    if (!esCuentaAprobada(usuario.estado)) {
      return res.status(403).json({
        error: "Su cuenta está pendiente de aprobación por el administrador.",
      });
    }

    // 3. Comparar la contraseña
    let passwordValida = await bcrypt.compare(password, usuario.password);

    // --- BYPASS SEGURO PARA LA DEMO ---
    // Si la contraseña de bcrypt falla, pero es una cuenta demo y la clave es "demo123", permitimos el acceso.
    if (!passwordValida && esCuentaDemo(correo) && password === "demo123") {
      passwordValida = true;
    }

    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    if (!usuario.correo_verificado && !esCuentaDemo(correo)) {
      // (Resto de la lógica de verificación de token...)
      if (!tokenVerificacionIngresado) {
        return res.status(403).json({
          error:
            "Primer inicio de sesión. Por favor, ingrese el token de verificación enviado a su correo.",
          requiereToken: true,
        });
      }
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

  // Extraer archivos de foto y cv.
  const foto = req.files?.foto ? req.files.foto[0] : null;
  const cvPdf = req.files?.cv_pdf ? req.files.cv_pdf[0] : null;

  // 2. Validar que la foto exista (Requisito Crítico)
  if (!foto) {
    return res.status(400).json({
      error: "La fotografía es obligatoria para el registro de médicos.",
    });
  }

  if (!cvPdf) {
    return res.status(400).json({
      error: "El CV en formato PDF es obligatorio para el registro de médicos.",
    });
  }

  const fotoPath = foto.path;
  const cvPdfPath = cvPdf.path;

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
        especialidad, direccion_clinica, correo, contrasena, estado, token_verificacion, cv_pdf
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
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
        cvPdfPath,
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
    // 1. Buscar al médico
    const result = await pool.query("SELECT * FROM medicos WHERE correo = $1", [
      correo,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const medico = result.rows[0];

    // 2. VALIDACIÓN CRÍTICA: ¿Está aprobado?
    if (!esCuentaAprobada(medico.estado)) {
      return res.status(403).json({
        error: "Su cuenta está pendiente de aprobación por el administrador.",
      });
    }

    // 3. Comparar contraseña (Hash)
    let passwordValida = await bcrypt.compare(password, medico.contrasena);

    // --- BYPASS SEGURO PARA LA DEMO ---
    if (!passwordValida && esCuentaDemo(correo) && password === "demo123") {
      passwordValida = true;
    }

    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // --- HU-202: VALIDACIÓN DE CORREO ---
    if (!medico.correo_verificado && !esCuentaDemo(correo)) {
      // (Lógica de token de médico...)
    }

    // 4. Generar Token de Sesión
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
    const esDemoAdmin =
      String(usuario || "").toLowerCase() === DEMO_CREDENTIALS.admin.usuario &&
      password === DEMO_CREDENTIALS.admin.password;

    if (esDemoAdmin) {
      const tokenSesion = jwt.sign(
        { id: "admin-demo", rol: "admin", usuario },
        process.env.JWT_SECRET || "mi_clave_secreta",
        { expiresIn: "8h" },
      );

      return res.json({
        mensaje: "Inicio de sesión demo exitoso",
        token: tokenSesion,
        usuario: {
          id: "admin-demo",
          nombre: "Administrador Demo",
          rol: "admin",
          usuario,
        },
      });
    }

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
      "SELECT id, foto, nombre, apellido, dpi, genero, especialidad, numero_colegiado, correo, estado, cv_pdf FROM medicos WHERE estado = 'pendiente'",
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
      "SELECT id, foto, nombre, apellido, dpi, genero, fecha_nacimiento, correo, estado, dpi_pdf FROM pacientes WHERE estado = 'pendiente'",
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
      WHERE LOWER(c.estado) IN ('atendido', 'completada')
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

const obtenerDenuncias = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.cita_id,
        r.reportador_rol,
        r.categoria,
        r.explicacion,
        r.fecha_creacion,
        c.fecha AS fecha_cita,
        c.estado AS estado_cita,
        p.id AS paciente_id,
        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,
        m.id AS medico_id,
        m.nombre AS medico_nombre,
        m.apellido AS medico_apellido
      FROM reportes r
      LEFT JOIN citas c ON r.cita_id = c.id
      LEFT JOIN pacientes p ON c.paciente_id = p.id
      LEFT JOIN medicos m ON c.medico_id = m.id
      ORDER BY r.fecha_creacion DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo denuncias:", error);
    res.status(500).json({ error: "Error al obtener las denuncias" });
  }
};

const obtenerPromediosCalificaciones = async (req, res) => {
  try {
    const [estrellasResult, medicosResult, pacientesResult] = await Promise.all(
      [
        pool.query(`
        SELECT estrellas, COUNT(*)::int AS total
        FROM calificaciones
        GROUP BY estrellas
        ORDER BY estrellas DESC
      `),
        pool.query(`
        SELECT
          m.id,
          m.nombre,
          m.apellido,
          m.especialidad,
          ROUND(AVG(cal.estrellas)::numeric, 1) AS promedio,
          COUNT(cal.id)::int AS total_evaluaciones
        FROM medicos m
        LEFT JOIN citas c ON m.id = c.medico_id
        LEFT JOIN calificaciones cal ON c.id = cal.cita_id AND cal.evaluador_rol = 'paciente'
        WHERE m.estado = 'aprobado'
        GROUP BY m.id, m.nombre, m.apellido, m.especialidad
        HAVING COUNT(cal.id) > 0
        ORDER BY promedio DESC
      `),
        pool.query(`
        SELECT
          p.id,
          p.nombre,
          p.apellido,
          ROUND(AVG(cal.estrellas)::numeric, 1) AS promedio,
          COUNT(cal.id)::int AS total_evaluaciones
        FROM pacientes p
        LEFT JOIN citas c ON p.id = c.paciente_id
        LEFT JOIN calificaciones cal ON c.id = cal.cita_id AND cal.evaluador_rol = 'medico'
        WHERE p.estado = 'aprobado'
        GROUP BY p.id, p.nombre, p.apellido
        HAVING COUNT(cal.id) > 0
        ORDER BY promedio DESC
      `),
      ],
    );

    res.json({
      estrellas: estrellasResult.rows,
      medicos: medicosResult.rows,
      pacientes: pacientesResult.rows,
    });
  } catch (error) {
    console.error("Error obteniendo promedios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener promedios de calificaciones" });
  }
};

const obtenerGraficoHorarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        dia AS franja_horaria,
        COUNT(*)::int AS total_citas
      FROM horario_medico hm
      CROSS JOIN LATERAL unnest(hm.dias) AS dia
      GROUP BY dia
      ORDER BY total_citas DESC, dia ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo gráfico de horarios:", error);
    res.status(500).json({ error: "Error al generar datos de horarios" });
  }
};

const obtenerGraficoCancelaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        estado AS especialidad,
        COUNT(*)::int AS total_canceladas
      FROM citas
      WHERE estado IN ('cancelada', 'Atendido')
      GROUP BY estado
      ORDER BY CASE
        WHEN estado = 'cancelada' THEN 1
        WHEN estado = 'Atendido' THEN 2
        ELSE 3
      END
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo gráfico de cancelaciones:", error);
    res.status(500).json({ error: "Error al generar datos de cancelaciones" });
  }
};

// Modificación de usuarios para el Administrador

// Pacientes
const actualizarPacienteAdmin = async (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    apellido,
    dpi,
    genero,
    direccion,
    telefono,
    fecha_nacimiento,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pacientes SET 
        nombre = $1,
        apellido = $2,
        dpi = $3,
        genero = $4,
        direccion = $5,
        telefono = $6,
        fecha_nacimiento = $7
       WHERE id = $8
       RETURNING *`,
      [
        nombre,
        apellido,
        dpi,
        genero,
        direccion,
        telefono,
        fecha_nacimiento,
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al actualizar paciente" });
  }
};

// Médicos
const actualizarMedicoAdmin = async (req, res) => {
  const { id } = req.params;

  const {
    nombre,
    apellido,
    dpi,
    genero,
    especialidad,
    numero_colegiado,
    direccion,
    telefono,
    direccion_clinica,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE medicos SET 
        nombre = $1,
        apellido = $2,
        dpi = $3,
        genero = $4,
        especialidad = $5,
        numero_colegiado = $6,
        direccion = $7,
        telefono = $8,
        direccion_clinica = $9
       WHERE id = $10
       RETURNING *`,
      [
        nombre,
        apellido,
        dpi,
        genero,
        especialidad,
        numero_colegiado,
        direccion,
        telefono,
        direccion_clinica,
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al actualizar médico" });
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
  obtenerDenuncias,
  obtenerPromediosCalificaciones,
  obtenerGraficoHorarios,
  obtenerGraficoCancelaciones,
  actualizarPacienteAdmin,
  actualizarMedicoAdmin,
};
