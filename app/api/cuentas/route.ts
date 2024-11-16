import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Cuenta from '@/models/Cuenta'; // Asegúrate de que la ruta al modelo sea correcta

// Obtener todas las cuentas
export async function GET() {
  await connectToDatabase();

  try {
    const cuentas = await Cuenta.find({}).populate('moneda');
    return NextResponse.json(cuentas);
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return NextResponse.error();
  }
}

// Crear una nueva cuenta
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const nuevaCuenta = new Cuenta(body);
    await nuevaCuenta.save();
    return NextResponse.json(nuevaCuenta, { status: 201 });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    return NextResponse.error();
  }
}
