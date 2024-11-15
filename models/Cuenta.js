const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  tipo: { type: String, enum: ['Ingreso', 'Gasto'], required: true },
  monto: { type: Number, required: true },
  moneda: { type: mongoose.Schema.Types.ObjectId, ref: 'Moneda', required: true },
  descripcion: { type: String },
  categoria: { 
    type: String, 
    enum: ['Comisiones', 'Recarga', 'Envio', 'Compra Shein', 'Cobro banco', 'Salarios', 'Cambio', 'Otros'], 
    default: null 
  }, // Campo para categoría
});

// Evitar la sobreescritura del modelo
module.exports = mongoose.models.Cuenta || mongoose.model('Cuenta', cuentaSchema);
