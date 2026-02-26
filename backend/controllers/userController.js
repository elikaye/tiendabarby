import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Op } from 'sequelize';

/* ==================== LOGIN ==================== */
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.scope('withPassword').findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const passwordOk = await usuario.comparePassword(password);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    await User.create(req.body);
    res.status(201).json({ success: true, message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error('❌ registrarUsuario:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
}; 

/* ==================== transporter Gmail ==================== */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true sería 465
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* ==================== FORGOT PASSWORD ==================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      return res.json({ success: true, message: 'Si el email existe, te enviaremos instrucciones' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = Date.now() + 1000 * 60 * 30;

    usuario.resetToken = resetToken;
    usuario.resetTokenExp = resetTokenExp;
    await usuario.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Tienda Barbie" <${process.env.GOOGLE_EMAIL}>`,
      to: usuario.email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Hacé clic para restablecer tu contraseña:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expira en 30 minutos.</p>
      `,
    });

    res.json({ success: true, message: 'Si el email existe, te enviaremos instrucciones' });
  } catch (error) {
    console.error('❌ forgotPassword:', error);
    res.status(500).json({ success: false });
  }
};

/* ==================== RESET PASSWORD ==================== */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await User.scope('withPassword').findOne({
      where: {
        resetToken: token,
        resetTokenExp: { [Op.gt]: Date.now() },
      },
    });

    if (!usuario) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }

    usuario.password = password;
    usuario.resetToken = null;
    usuario.resetTokenExp = null;
    await usuario.save();

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ resetPassword:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};