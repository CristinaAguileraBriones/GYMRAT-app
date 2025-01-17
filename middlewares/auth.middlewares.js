const jwt = require("jsonwebtoken")

function verifyToken(req, res, next) {

  console.log(req.headers)

  try {

    const tokenArr = req.headers.authorization.split(" ")
    const token = tokenArr[1]

    const payload = jwt.verify(token, process.env.TOKEN_SECRET)
    req.payload = payload
    req.userId = payload._id

    next() 

  } catch (error) {
    res.status(401).json({message: "Token no válido"})
  }
}

module.exports = {verifyToken}