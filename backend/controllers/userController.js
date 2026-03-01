import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import crypto from 'crypto';
import { Op } from 'sequelize';
import sgMail from '@sendgrid/mail';

/* ==================== CONFIG SENDGRID ==================== */
console.log("📨 SENDGRID_API_KEY existe?", !!process.env.SENDGRID_API_KEY);
console.log("📨 EMAIL_FROM:", process.env.EMAIL_FROM);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* ==================== LOGIN ==================== */
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login intento:", email);

    const usuario = await User.scope('withPassword').findOne({ where: { email } });

    if (!usuario) {
      console.log("❌ Usuario no encontrado");
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const passwordOk = await usuario.comparePassword(password);

    if (!passwordOk) {
      console.log("❌ Password incorrecto");
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("✅ Login exitoso:", usuario.email);

    res.json({
      success: true,
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    console.error('❌ loginUsuario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

/* ==================== REGISTRO ==================== */
export const registrarUsuario = async (req, res) => {
  try {
    console.log("📝 Registrando usuario:", req.body.email);

    await User.create(req.body);

    console.log("✅ Usuario creado correctamente");

    res.status(201).json({ success: true, message: 'Usuario creado correctamente' });

  } catch (error) {
    console.error('❌ registrarUsuario:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
};

/* ==================== FORGOT PASSWORD ==================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔁 Forgot password solicitado para:", email);

    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      console.log("⚠️ Usuario no encontrado, pero respondemos success por seguridad");
      return res.json({
        success: true,
        message: 'Si el email existe, te enviaremos instrucciones'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = Date.now() + 1000 * 60 * 30;

    console.log("🪙 Token generado:", resetToken);

    usuario.resetToken = resetToken;
    usuario.resetTokenExp = resetTokenExp;
    await usuario.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log("🔗 URL de reset:", resetUrl);
    console.log("📤 Enviando email a:", usuario.email);

    await sgMail.send({
      to: usuario.email,
      from: process.env.EMAIL_FROM, // debe estar verificado en SendGrid
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Hacé clic para restablecer tu contraseña:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expira en 30 minutos.</p>
        <p>Si no ves el email, revisá tu bandeja de entrada o la carpeta de spam.</p>
      `,
    });

    console.log("✅ Email enviado correctamente");

    res.json({
      success: true,
      message: 'Si el email existe, te enviaremos instrucciones'
    });

  } catch (error) {
    console.error('❌ forgotPassword ERROR COMPLETO:', error);
    res.status(500).json({ success: false });
  }
};

/* ==================== RESET PASSWORD ==================== */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("🔐 Reset password con token:", token);

    const usuario = await User.scope('withPassword').findOne({
      where: {
        resetToken: token,
        resetTokenExp: { [Op.gt]: Date.now() },
      },
    });

    if (!usuario) {
      console.log("❌ Token inválido o expirado");
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    usuario.password = password;
    usuario.resetToken = null;
    usuario.resetTokenExp = null;

    await usuario.save();

    console.log("✅ Contraseña actualizada para:", usuario.email);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('❌ resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};