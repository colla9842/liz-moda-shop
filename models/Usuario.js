const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo_electronico: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: { type: String, enum: ['administrador', 'gestor'], required: true }
});

// Hash la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next(); // Cambiado de 'contraseña' a 'contrasena'
  this.contrasena = await bcrypt.hash(this.contrasena, 10);
  next();
});

// Comparar contraseñas
usuarioSchema.methods.compareContrasena = function(plainPassword) {
  return bcrypt.compare(plainPassword, this.contrasena);
};

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema); // Cambiado para evitar sobrescritura
