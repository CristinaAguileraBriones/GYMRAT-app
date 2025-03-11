const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    specialty: { type: String, required: true }
});

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
