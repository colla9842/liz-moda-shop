import { NextResponse } from 'next/server';
import Usuario from '@/models/Usuario';  // Modelo de usuario
import bcrypt from 'bcryptjs';  // Para comparar contraseñas

// Este es el controlador POST para el login
export async function POST(req) {
  try {
    const { correo_electronico, contrasena } = await req.json(); // Paso 1

    // Validamos si los campos están vacíos
    if (!correo_electronico || !contrasena) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos' }, { status: 400 }); // Paso 2
    }

    // Buscamos al usuario por correo electrónico
    const usuario = await Usuario.findOne({ correo_electronico }); // Paso 3
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 }); // Paso 4
    }

    // Comparamos la contraseña con la almacenada en la base de datos
    const match = await bcrypt.compare(contrasena, usuario.contrasena); // Paso 5
    if (!match) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 }); // Paso 6
    }

    // Si la contraseña es correcta, retornamos un mensaje de éxito
    return NextResponse.json({ message: 'Login exitoso' }, { status: 200 }); // Paso 7
  } catch (error) {
    return NextResponse.json({ error: error.messages }, { status: 500 }); // Paso 8
  }
}