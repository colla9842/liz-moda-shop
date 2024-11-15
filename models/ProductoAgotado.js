// models/ProductoAgotado.js
const mongoose = require('mongoose');

const productoAgotadoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: false },
  precio_compra_usd: { type: Number, required: false },
  precio_venta_usd: { type: Number, required: false },
  cantidad_stock: { type: Number, required: true },
  talla: { type: String, required: false },
  imagen: { type: String, required: true  }, // Campo para la URL de la imagen
  fechaEliminacion: { type: Date, default: Date.now } // Fecha de eliminación
});

module.exports = mongoose.models.ProductoAgotado || mongoose.model('ProductoAgotado', productoAgotadoSchema);
