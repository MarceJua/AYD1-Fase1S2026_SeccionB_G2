const jwt = require('jsonwebtoken');

// Acepta el rol esperado como parámetro
const verifyAdminToken = (expectedRole) => (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== expectedRole) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verifyAdminToken;