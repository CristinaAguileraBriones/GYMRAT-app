const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema({
    name: { type: String, required: true },

    email: { type: String, unique: true, required: true },

    password: {
        type: String,
        required: [true, 'Password is required.']
      },

    specialty: { type: String, required: true },

    qrCode: { type: String },

    role : {type: String, required: true, 

      enum: ["admin", "proff", "userOnly"],

      default: "proff"}
    
});

const Professional = mongoose.model("Professional", professionalSchema);
module.exports = Professional;
