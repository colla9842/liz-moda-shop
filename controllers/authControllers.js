const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const config = require('../config/config');

const login = async (req, res) => {
  const { correo_electronico, contrasena } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo_electronico });
    if (!usuario) return res.status(400).json({ message: 'Credenciales incorrectas' });

    const isMatch = await usuario.compareContraseña(contrasena);
    if (!isMatch) return res.status(400).json({ message: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo_electronico: usuario.correo_electronico,
      },
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};

module.exports = {
  login,
};
