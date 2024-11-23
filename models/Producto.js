const mongoose = require('mongoose');
const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: false },
    precio_compra_usd: { type: Number, required: false },
    precio_venta_usd: { type: Number, required: false },
    cantidad_stock: { type: Number, required: true },
    talla: { type: String, required: false },
    imagen: { type: String, required: false }, // Campo para la URL de la imagen
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }
});
// Evita la sobrescritura del modelo
module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema);
