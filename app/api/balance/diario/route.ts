import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Cuenta from '../../../../models/cuenta';
import Moneda from '../../../../models/moneda';

export async function GET() {
  await connectToDatabase();

  try {
    const monedas = await Moneda.find({});
    const saldo = {};
    monedas.forEach(moneda => (saldo[moneda.nombre] = 0));

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
