import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Cuenta from '@/models/cuenta'; // Verifica la ruta del modelo

// Obtener todas las cuentas
export async function GET(req: Request) {
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

// Actualizar parcialmente una cuenta (PATCH)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const { id } = params;
    const updates = await req.json();
    const cuenta = await Cuenta.findByIdAndUpdate(id, updates, { new: true });

    if (!cuenta) {
      return NextResponse.json({ message: 'Cuenta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(cuenta);
  } catch (error) {
    console.error('Error al actualizar parcialmente la cuenta:', error);
    return NextResponse.json({ message: 'Error al actualizar la cuenta', error }, { status: 400 });
  }
}

// Actualizar una cuenta existente (PUT)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const { id } = params;
    const updates = await req.json();
    const updatedCuenta = await Cuenta.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('moneda');

    if (!updatedCuenta) {
      return NextResponse.json({ message: 'Cuenta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedCuenta);
  } catch (error) {
    console.error('Error al actualizar la cuenta:', error);
    return NextResponse.json({ message: 'Error al actualizar la cuenta', error }, { status: 400 });
  }
}

// Eliminar una cuenta existente (DELETE)
export async function DELETE(req: Request) {
  await connectToDatabase();

  try {
    const { id } = await req.json(); // obtener el id desde el cuerpo
    const deletedCuenta = await Cuenta.findByIdAndDelete(id);

    if (!deletedCuenta) {
      return NextResponse.json({ message: 'Cuenta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(deletedCuenta);
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    return NextResponse.json({ message: 'Error al eliminar la cuenta', error }, { status: 500 });
  }
}



// OPTIONS para manejar los métodos permitidos
export async function OPTIONS() {
  return NextResponse.json(
    { message: 'Métodos permitidos: GET, POST, PATCH, PUT, DELETE' },
    { status: 200 }
  );
}
