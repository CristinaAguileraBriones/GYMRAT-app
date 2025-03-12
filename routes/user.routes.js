const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Class = require("../models/Class.model");
const QRCode = require("qrcode");
const { verifyToken } = require("../middlewares/auth.middlewares");

// Obtener perfil del usuario
router.get("/perfil", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener perfil", error });
    }
});

// Editar perfil del usuario
router.patch("/perfil", verifyToken, async (req, res) => {
    try {
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json({ message: "Perfil actualizado correctamente", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar perfil", error });
    }
});

// Pagar membresía (simulación)
router.post("/pagar", verifyToken, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, { paymentStatus: "pagado" });
        res.status(200).json({ message: "Pago realizado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al procesar el pago", error });
    }
});

// Consultar clases disponibles
router.get("/clases", verifyToken, async (req, res) => {
    try {
        const classes = await Class.find().populate("instructor");
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener clases", error });
    }
});

// Reservar una clase
router.post("/reservar-clase/:classId", verifyToken, async (req, res) => {
    try {
        const { classId } = req.params;
        const userId = req.userId;

        const classToJoin = await Class.findById(classId);
        if (!classToJoin) {
            return res.status(404).json({ message: "Clase no encontrada" });
        }

        if (classToJoin.enrolledUsers.includes(userId)) {
            return res.status(400).json({ message: "Ya estás inscrito en esta clase" });
        }

        classToJoin.enrolledUsers.push(userId);
        await classToJoin.save();

        await User.findByIdAndUpdate(userId, { $push: { reservations: classId } });

        res.status(200).json({ message: "Clase reservada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al reservar clase", error });
    }
});

//ver código qr

router.get("/qr", verifyToken, async (req, res) => {
  try {
      const user = await User.findById(req.userId).select("qrCode");
      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.status(200).json({ qrCode: user.qrCode });
  } catch (error) {
      res.status(500).json({ message: "Error al obtener QR", error });
  }
});









module.exports = router;
