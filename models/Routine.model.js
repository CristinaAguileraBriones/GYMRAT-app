const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exercises: [{
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        videoUrl: { type: String } 
    }],
    createdAt: { type: Date, default: Date.now }
});

const Routine = mongoose.model("Routine", routineSchema);
module.exports = Routine;
