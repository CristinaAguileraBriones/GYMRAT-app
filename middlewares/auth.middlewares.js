const jwt = require("jsonwebtoken");

// Middleware para verificar si el usuario tiene un token válido
function verifyToken(req, res, next) {
  console.log(req.headers);

  try {
    const tokenArr = req.headers.authorization.split(" ");
    const token = tokenArr[1];

    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.payload = payload;
    req.userId = payload._id;
    req.userRole = payload.role; 

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token no válido" });
  }
}

// Middleware para verificar si el usuario es ADMIN
function isAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores pueden acceder." });
  }
  next();
}

module.exports = { verifyToken, isAdmin };
