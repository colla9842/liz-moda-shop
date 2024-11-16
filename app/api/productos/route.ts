import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Producto from '@/models/Producto'; // Verifica la ruta

export async function GET() {
  await connectToDatabase();

  try {
    const productos = await Producto.find({});
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.error();
  }
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();
    const nuevoProducto = new Producto(body);
    await nuevoProducto.save();
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.error();
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    { message: 'Métodos permitidos: GET, POST' },
    { status: 200 }
  );
}
