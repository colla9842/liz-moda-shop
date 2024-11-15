// models/Gestor.js
const mongoose = require('mongoose');

const gestorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  articulosVendidos: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.models.Gestor || mongoose.model('Gestor', gestorSchema);