const router = require("express").Router()
const express = require("express")
const User = require("../models/User.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const {verifyToken, isAdmin}= require("../middlewares/auth.middlewares")

//post "api/auth/admin/signup"
// Ruta protegida para crear administradores
router.post("/admin/signup", verifyToken, isAdmin, async (req, res, next) => {
  console.log(req.body);
  const { email, password, username, role } = req.body;

  // Validaciones
  if (!email || !username || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  // Validación de formato de email y contraseña
  const passwordSecurity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/gm;
  if (!passwordSecurity.test(password)) {
      return res.status(400).json({
          message: "La contraseña debe tener al menos, una mayúscula, una minúscula, un número y entre 8 y 16 caracteres"
      });
  }

  try {
      // Verificar si el email ya está registrado
      const foundUser = await User.findOne({ email: email });
      if (foundUser) {
          return res.status(400).json({ message: "Usuario ya registrado con ese email" });
      }

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(12);
      const hashPassword = await bcrypt.hash(password, salt);

      // Crear el usuario con el rol proporcionado
      const newUser = await User.create({
          username,
          password: hashPassword,
          email,
          role: role || "usuario" // Si no se especifica, por defecto será "usuario"
      });

      res.status(201).json({ message: "Administrador creado exitosamente", user: newUser });

  } catch (error) {
      next(error);
  }
});


//POST "/api/auth/signup" : crea al usuario con sus datos 
router.post("/signup", async (req, res, next) => {
  // Validaciones de backend
 
  console.log(req.body)
  const { email, password, username, role } = req.body;

  // Campos obligatorios
  if (!email || !username || !password) {
    res.status(400).json({ message: "Estos campos son requeridos" })
    return //esto detiene la función en caso de que falte algún campo
  }

  // Requerimientos de contraseña
  const passwordSecurity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/gm
  if (!passwordSecurity.test(password)) {
    res
      .status(400)
      .json({
        message:
          "La contraseña debe tener al menos, una mayúscula, una minúscula, un número y entre 8 y 16 caracteres",
      })
    return //esto detiene la función en caso de que la contraseña no cumpla la seguridad
  }

  // Estructura de email
  const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gm
  if (!emailFormat.test(email)) {
    res.status(400).json({ message: "El formato del correo electrónico es inválido" })
    return
  }

  try {
    //Antes de crear al usuario hay que buscar a otro usuario con los mismos datos
    console.log("estamos encontrando al usuario")
    const foundUser = await User.findOne({email: email})
    if(foundUser){
        res.status(400).json({ message: "Usuario registrado con ese email" })
    return
    }
    //encriptar la contraseña
    const salt = await bcrypt.genSalt(12)
    const hashPassword = await bcrypt.hash(password, salt)
    //validar el rol
    console.log(req.body)
    const validRoles = ["admin", "proff", "userOnly"];
    let assignedRole = role; 

    if (!role || !validRoles.includes(role)) {
      assignedRole = "usuario";
    }
    if (role === "admin") {
      return res.status(403).json({ message: "No tienes permisos para crear una cuenta de administrador." });
    }

    console.log("Creando usuario con rol:", assignedRole)
    //crear el qr
    const qrData = JSON.stringify({ email, username })
    const qrCode = await QRCode.toDataURL(qrData)

    // Crear el usuario en la base de datos
    await User.create({
      username,
      password: hashPassword,
      email,
      role: assignedRole,
      qrCode
    })

   
      

    // Respuesta exitosa
    res.status(201).json({ message: "Usuario creado exitosamente" })
  } catch (error) {
    next(error) // Enviar el error al middleware de manejo de errores
  }
})

// POST "/api/auth/login" : verifica que ese usuario existe y lo deja entrar si el token es correcto 
router.post("/login", async (req, res, next) => {
    const { password, email } = req.body
    console.log(email, password)

    // Validar que todos los campos tengan información
    if (!password || !email) {
        res.status(400).json({ message: "Todos los campos son requeridos" })
        return
    }

    let foundUser;  // Declarar foundUser fuera del try

    try {
        // Buscar si el usuario existe en la base de datos
        foundUser = await User.findOne({ email: email })

        // Agregar un log para verificar si se encuentra el usuario
        console.log("Usuario encontrado:", foundUser);

        if (!foundUser) {
            // Si no se encuentra el usuario, detener el flujo y responder
            res.status(400).json({ message: "El usuario no existe, verifica el correo electrónico que has introducido" });
            return
        }

        // Validar contraseña
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Contraseña incorrecta" })
            return
        }

    } catch (error) {
        console.error("Error en la búsqueda de usuario o validación:", error)
        next(error)
        return
    }

    // Usuario autenticado -> entregar token
    //todo, en el payload están los permisos de cada tipo de usuario que tengo que agregar
    try {
        const payload = {
          _id: foundUser._id,
          email: foundUser.email,
          role: foundUser.role
        }

        console.log("Payload del token:", payload);

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: "7d",
        })

        res.status(200).json({ authToken: authToken })
    } catch (error) {
        console.error("Error generando el token:", error)
        next(error);
    }
})

//GET verify 

router.get("/verify", verifyToken, (req, res)=>{

    console.log(req.payload)

    res.status(200).json(req.payload)

})







module.exports = router