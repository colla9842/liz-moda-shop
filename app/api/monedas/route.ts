import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import moneda from '@/models/Moneda'; // Verifica la ruta del modelo

// Obtener todas las monedas
export async function GET() {
  await connectToDatabase();

  try {
    const monedas = await moneda.find({});
    return NextResponse.json(monedas);
  } catch (error) {
    console.error('Error al obtener monedas:', error);
    return NextResponse.error();
  }
}

// Crear una nueva moneda
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const nuevaMoneda = new moneda(body);
    await nuevaMoneda.save();
    return NextResponse.json(nuevaMoneda, { status: 201 });
  } catch (error) {
    console.error('Error al crear moneda:', error);
    return NextResponse.error();
  }
}

// OPTIONS para manejar los métodos permitidos
export async function OPTIONS() {
  return NextResponse.json(
    { message: 'Métodos permitidos: GET, POST' },
    { status: 200 }
  );
}
