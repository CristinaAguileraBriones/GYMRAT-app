const express = require("express");
const router = express.Router();
const Professional = require("../models/Professional.model");
const User = require("../models/User.model");
const Class = require("../models/Class.model");
const Routine = require("../models/Routine.model");
const { verifyToken, isProfessional } = require("../middlewares/auth.middlewares");


// Crear una nueva clase
router.post("/clases", verifyToken, isProfessional, async (req, res) => {
    try {
        const { title, description, date, duration, maxParticipants } = req.body;
        const instructorId = req.userId;

        const newClass = await Class.create({
            title,
            description,
            instructor: instructorId,
            date,
            duration,
            maxParticipants
        });

        res.status(201).json({ message: "Clase creada correctamente", class: newClass });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la clase", error });
    }
});

// Obtener todas las clases creadas por un profesional
router.get("/clases", verifyToken, isProfessional, async (req, res) => {
    try {
        const instructorId = req.userId;
        const classes = await Class.find({ instructor: instructorId }).populate("enrolledUsers");

        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las clases", error });
    }
});

// Modificar una clase
router.patch("/clases/:id", verifyToken, isProfessional, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedClass = await Class.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedClass) {
            return res.status(404).json({ message: "Clase no encontrada" });
        }

        res.status(200).json({ message: "Clase actualizada correctamente", class: updatedClass });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la clase", error });
    }
});

// Crear una rutina personalizada para un usuario
router.post("/rutinas", verifyToken, isProfessional, async (req, res) => {
    try {
        const { userId, exercises } = req.body;
        const trainerId = req.userId;

        const newRoutine = await Routine.create({
            trainer: trainerId,
            user: userId,
            exercises
        });

        res.status(201).json({ message: "Rutina creada correctamente", routine: newRoutine });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la rutina", error });
    }
});

// Obtener todas las rutinas creadas por un profesional
router.get("/rutinas", verifyToken, isProfessional, async (req, res) => {
    try {
        const trainerId = req.userId;
        const routines = await Routine.find({ trainer: trainerId }).populate("user");

        res.status(200).json(routines);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las rutinas", error });
    }
});

// Modificar una rutina
router.patch("/rutinas/:id", verifyToken, isProfessional, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedRoutine = await Routine.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedRoutine) {
            return res.status(404).json({ message: "Rutina no encontrada" });
        }

        res.status(200).json({ message: "Rutina actualizada correctamente", routine: updatedRoutine });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la rutina", error });
    }
});
//ver codigo qr

router.get("/qr", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("qrCode");
        if (!user) {
            return res.status(404).json({ message: "Profesional no encontrado" });
        }
        res.status(200).json({ qrCode: user.qrCode });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener QR", error });
    }
});

module.exports = router;
