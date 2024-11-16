import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Cuenta from '@/models/Cuenta'; // Verifica la ruta del modelo

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
export async function PUT(req: Request) {
  await connectToDatabase();

  try {
    // Paso 1: Extraer el id y los datos de actualización del cuerpo de la solicitud
    const { id, ...updates } = await req.json();
    console.log('Datos de la solicitud PUT:', { id, updates });

    // updates: {
    //   moneda: {
    //     _id: '66a93eb72c6ec1a55e88aadb',
    //     nombre: 'CUP Transferencia',
    //     tasaCambio: 1
    //   },
    //   monto: '6501',
    //   descripcion: 'Zapatos Blancos y Verdes'
    // }

    // Paso 2: Buscar y actualizar la cuenta por el id
    const updatedCuenta = await Cuenta.findByIdAndUpdate(id, {
      moneda: updates.moneda._id,
      monto: updates.monto,
      descripcion: updates.descripcion
    }, {
      new: true,
      runValidators: true,
    }).populate('moneda');

    // Paso 3: Verificar si la cuenta fue encontrada
    if (!updatedCuenta) {
      return NextResponse.json({ message: 'Cuenta no encontrada' }, { status: 404 });
    }

    // Paso 4: Devolver la cuenta actualizada como respuesta
    return NextResponse.json(updatedCuenta);
  } catch (error) {
    // Paso 5: Manejo de errores
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
