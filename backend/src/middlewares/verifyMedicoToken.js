const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar que el token JWT pertenece a un médico.
 * Si el token es válido, coloca los datos decodificados en req.medico.
 * Patrón idéntico a verifyAdminToken.js pero para rol 'medico'.
 * PRobablemente esto se rompa xd
 */
const verifyMedicoToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta');

    // Solo se permite el rol 'medico'
    if (decoded.rol !== 'medico') {
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol médico' });
    }

    req.medico = decoded; // Disponible en el controlador como req.medico.id
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verifyMedicoToken;
