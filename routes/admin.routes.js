const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Professional = require("../models/Professional.model");
const { verifyToken, isAdmin } = require("../middlewares/auth.middlewares");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

// Middleware: Solo los administradores pueden acceder a estas rutas
router.use(verifyToken, isAdmin);

// Alta de usuarios
router.post("/usuarios", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    try {
        const foundUser = await User.findOne({ email });
        if (foundUser) {
            return res.status(400).json({ message: "El usuario ya está registrado" });
        }

        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ username, email, password: hashPassword, role: role || "usuario" });

        res.status(201).json({ message: "Usuario creado exitosamente", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error al crear usuario", error });
    }
});

// Baja de usuarios
router.delete("/usuarios/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error });
    }
});

// Alta de profesionales
router.post("/profesionales", async (req, res) => {
    const { name, email, specialty } = req.body;

    if (!name || !email || !specialty) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    try {
        const foundProfessional = await Professional.findOne({ email });
        if (foundProfessional) {
            return res.status(400).json({ message: "El profesional ya está registrado" });
        }

        const newProfessional = await Professional.create({ name, email, specialty });

        res.status(201).json({ message: "Profesional registrado exitosamente", professional: newProfessional });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar profesional", error });
    }
});

// Baja de profesionales
router.delete("/profesionales/:id", async (req, res) => {
    try {
        const deletedProfessional = await Professional.findByIdAndDelete(req.params.id);
        if (!deletedProfessional) {
            return res.status(404).json({ message: "Profesional no encontrado" });
        }
        res.status(200).json({ message: "Profesional eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar profesional", error });
    }
});

// Enviar correos electrónicos
router.post("/enviar-correo", async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: message,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Correo enviado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar correo", error });
    }
});

// Generar QR de acceso para usuarios
router.get("/generar-qr/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const qrData = `Usuario: ${user.username}, ID: ${user._id}`;
        const qrCode = await QRCode.toDataURL(qrData);

        res.status(200).json({ qrCode });
    } catch (error) {
        res.status(500).json({ message: "Error al generar QR", error });
    }
});
//actualizar rol de usuario
router.patch("/cambiar-rol/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validar que el nuevo rol sea permitido
        const rolesPermitidos = ["admin", "proff", "userOnly"];
        if (!rolesPermitidos.includes(role)) {
            return res.status(400).json({ message: "Rol no válido" });
        }

        // Buscar usuario y actualizar su rol
        const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: `Rol actualizado a ${role}`, user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el rol", error });
    }
});


module.exports = router;
