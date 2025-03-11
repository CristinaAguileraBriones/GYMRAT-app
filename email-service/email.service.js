require("dotenv").config();
const nodemailer = require("nodemailer");

// Configurar el transporter con Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Tu email
        pass: process.env.EMAIL_PASS  // Contraseña o contraseña de aplicación
    }
});

// Función para enviar correos
async function enviarCorreo(destinatario, asunto, mensaje) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: destinatario,
            subject: asunto,
            text: mensaje
        };

        await transporter.sendMail(mailOptions);
        console.log("Correo enviado correctamente a:", destinatario);
        return { success: true, message: "Correo enviado correctamente" };
    } catch (error) {
        console.error("Error enviando el correo:", error);
        return { success: false, message: "Error enviando el correo", error };
    }
}

module.exports = { enviarCorreo };
