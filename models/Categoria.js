const mongoose = require('mongoose');
const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true }
});
// Verifica si el modelo ya está registrado antes de crearlo
module.exports = mongoose.models.Categoria || mongoose.model('Categoria', categoriaSchema);
