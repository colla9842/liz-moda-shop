import { NextResponse } from 'next/server';
import Gestor from '@/models/Gestor'; // Verifica que la ruta sea correcta

// Obtener todos los gestores
export async function GET() {
  try {
    const gestores = await Gestor.find();
    return NextResponse.json(gestores);
  } catch (err) {
    return NextResponse.json({ message: 'Error al obtener gestores', error: err }, { status: 500 });
  }
}

// Crear un nuevo gestor
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gestor = new Gestor(body);
    await gestor.save();
    return NextResponse.json(gestor, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Error al crear gestor', error: err }, { status: 400 });
  }
}
