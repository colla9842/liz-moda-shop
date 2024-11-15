// models/Moneda.js
const mongoose = require('mongoose');

const monedaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tasaCambio: { type: Number, required: true }
});

module.exports = mongoose.models.Moneda || mongoose.model('Moneda', monedaSchema);
