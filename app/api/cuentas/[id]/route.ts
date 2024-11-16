import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Cuenta from '@/models/Cuenta'; // Asegúrate de que la ruta al modelo sea correcta

// Actualizar una cuenta existente (PUT)
export async function PUT(req: Request, context: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const { id } = context.params; // Acceder al parámetro 'id'
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
export async function DELETE(req: Request, context: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const { id } = context.params;  // Acceder al 'id'
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
