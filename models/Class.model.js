const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true }, 
    maxParticipants: { type: Number, required: true },
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] 
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
