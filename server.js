const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        ok: false,
        message: "Por favor completa todos los campos.",
      });
    }

    const fechaHora = new Date().toLocaleString("es-BO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          name,
          email,
          phone,
          service: "SPB - Sistema de Planillas Multiempresa",
          message,
          time: fechaHora,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Error EmailJS:", errorText);

      return res.status(500).json({
        ok: false,
        message: "No se pudo enviar el mensaje.",
      });
    }

    return res.json({
      ok: true,
      message: "Mensaje enviado correctamente.",
    });
  } catch (error) {
    console.error("Error en /api/contact:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});