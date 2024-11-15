import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';
import bcrypt from 'bcryptjs';

// Crear un nuevo usuario (POST)
export async function POST(req) {
  try {
    const { nombre, correo_electronico, contrasena, rol } = await req.json();

    // Validar datos aquí
    if (!nombre || !correo_electronico || !contrasena || !rol) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el nuevo usuario
    const newUser = new Usuario({
      nombre,
      correo_electronico,
      contrasena: hashedPassword,
      rol,
    });

    await newUser.save();

    return NextResponse.json({ message: 'Usuario registrado con éxito' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Obtener usuarios (GET)
export async function GET(req, { params }) {
  try {
    // Si no hay params, significa que no se proporcionó un ID
    if (!params || !params.id) {
      // Si no se proporciona un ID, devuelve todos los usuarios
      const usuarios = await Usuario.find();
      return NextResponse.json(usuarios);
    }

    // Si se proporciona un ID, devuelve el usuario específico
    const usuario = await Usuario.findById(params.id);
    if (!usuario) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Actualizar un usuario por ID (PUT)
export async function PUT(req, { params }) {
  try {
    const { nombre, correo_electronico, contrasena } = await req.json();
    const usuario = await Usuario.findById(params.id);
    if (!usuario) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });

    usuario.nombre = nombre || usuario.nombre;
    usuario.correo_electronico = correo_electronico || usuario.correo_electronico;

    if (contrasena) {
      usuario.contrasena = await bcrypt.hash(contrasena, 10);
    }

    await usuario.save();
    return NextResponse.json({ message: 'Usuario actualizado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Eliminar un usuario por ID (DELETE)
export async function DELETE(req, { params }) {
  try {
    const usuario = await Usuario.findByIdAndDelete(params.id);
    if (!usuario) return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
