import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Cuenta from '@/models/Cuenta';
import Moneda from '@/models/Moneda';

export async function GET() {
  await connectToDatabase();

  try {
    // Define `saldo` with a proper type
    const monedas = await Moneda.find({});
    const saldo: Record<string, number> = {}; // Use `Record<string, number>` to allow dynamic keys

    // Initialize `saldo` for each currency
    monedas.forEach(moneda => {
      saldo[moneda.nombre] = 0;
    });

    const cuentas = await obtenerCuentasDelDia();

    cuentas.forEach(cuenta => {
      if (cuenta.tipo === 'Ingreso') {
        saldo[cuenta.moneda.nombre] += cuenta.monto;
      } else if (cuenta.tipo === 'Gasto') {
        saldo[cuenta.moneda.nombre] -= cuenta.monto;
      }
    });

    return NextResponse.json(saldo);
  } catch (error) {
    console.error('Error al obtener el balance diario:', error);
    return NextResponse.error();
  }
}

// Función auxiliar para obtener cuentas del día
async function obtenerCuentasDelDia() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return await Cuenta.find({
    fecha: { $gte: today, $lt: tomorrow },
  }).populate('moneda');
}
