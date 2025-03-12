const mongoose = require("mongoose")
const { Schema, model } = require("mongoose")


const userSchema = new Schema(

  {
    role: {
      type: String,
      enum: ["admin", "proff", "userOnly"],
      default: "userOnly"
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    username: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    profilepicture: {
      type: String

    },
    contactInfo: { type: String },

    paymentStatus: { type: String, enum: ["pendiente", "pagado"], default: "pendiente" },

    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }], 

    qrCode: { type: String }
    
  },
    
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
