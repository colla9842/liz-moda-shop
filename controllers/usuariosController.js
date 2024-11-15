const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

async function registrarUsuario(req, res) {
    const { nombre, correo_electronico, contrasena, rol } = req.body;
    try {
        // Verifica si el correo electrónico ya está registrado
        const usuarioExistente = await Usuario.findOne({ correo_electronico });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Hashear la contraseña
        const hashedContrasena = await bcrypt.hash(contrasena, 10);

        // Crear un nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre,
            correo_electronico,
            contrasena: hashedContrasena,
            rol
        });

        // Guardar el usuario en la base de datos
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error registrando usuario' });
    }
}

module.exports = { registrarUsuario };
