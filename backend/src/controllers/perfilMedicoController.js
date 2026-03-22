// backend/src/controllers/perfilMedicoController.js
// HU-013: Ver y Actualizar Perfil Médico
const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/medico/perfil
 * Retorna todos los datos del médico autenticado (sin contraseña).
 */
const obtenerPerfilMedico = async (req, res) => {
  const medicoId = req.medico.id;

  try {
    const result = await pool.query(
      `SELECT id, nombre, apellido, dpi, fecha_nacimiento, genero,
              direccion, telefono, foto, numero_colegiado, especialidad,
              direccion_clinica, correo
       FROM medicos
       WHERE id = $1`,
      [medicoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Médico no encontrado.' });
    }

    res.json({ medico: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener perfil médico:', error);
    res.status(500).json({ error: 'Error interno al obtener el perfil.' });
  }
};

/**
 * PUT /api/medico/perfil
 * Actualiza los datos del médico si hay autenticacion.
 * correo no  modificable.
 * Soporta actualización de fotografía con multipart/form-data.
 */
const actualizarPerfilMedico = async (req, res) => {
  const medicoId = req.medico.id;
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
  } = req.body;

  try {
    // Verificar que el médico existe y obtener foto actual
    const actual = await pool.query(
      'SELECT foto FROM medicos WHERE id = $1',
      [medicoId]
    );

    if (actual.rows.length === 0) {
      return res.status(404).json({ error: 'Médico no encontrado.' });
    }

    // Si se sube una nueva foto, usar la nueva; de lo contrario conservar la actual
    let nuevaFoto = actual.rows[0].foto;
    if (req.file) {
      // Eliminar foto anterior si existe y es un archivo local
      if (actual.rows[0].foto) {
        const fotoAnterior = path.join(__dirname, '..', 'uploads', path.basename(actual.rows[0].foto));
        if (fs.existsSync(fotoAnterior)) {
          fs.unlinkSync(fotoAnterior);
        }
      }
      nuevaFoto = req.file.path;
    }

    const updateQuery = `
      UPDATE medicos
      SET nombre           = $1,
          apellido         = $2,
          dpi              = $3,
          fecha_nacimiento = $4,
          genero           = $5,
          direccion        = $6,
          telefono         = $7,
          foto             = $8,
          numero_colegiado = $9,
          especialidad     = $10,
          direccion_clinica = $11
      WHERE id = $12
      RETURNING id, nombre, apellido, dpi, fecha_nacimiento, genero,
                direccion, telefono, foto, numero_colegiado, especialidad,
                direccion_clinica, correo
    `;

    const result = await pool.query(updateQuery, [
      nombre,
      apellido,
      dpi,
      fecha_nacimiento,
      genero,
      direccion,
      telefono,
      nuevaFoto,
      numero_colegiado,
      especialidad,
      direccion_clinica,
      medicoId,
    ]);

    res.json({
      mensaje: 'Perfil actualizado correctamente.',
      medico: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar perfil médico:', error);
    // Unicidad de DPI o número colegiado
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El DPI o número colegiado ya está en uso por otro médico.' });
    }
    res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
  }
};

module.exports = { obtenerPerfilMedico, actualizarPerfilMedico };
