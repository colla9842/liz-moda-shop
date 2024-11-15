const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  articulos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
      cantidad: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  moneda: { type: mongoose.Schema.Types.ObjectId, ref: 'Moneda', required: true },
});

// Evita el error de sobreescritura del modelo
module.exports = mongoose.models.Venta || mongoose.model('Venta', ventaSchema);
