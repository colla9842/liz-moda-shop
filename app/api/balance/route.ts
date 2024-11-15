import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Cuenta from '../../../models/cuenta'; // Verifica la ruta del modelo
import Moneda from '../../../models/moneda'; // Verifica la ruta del modelo

// Ruta para el balance general y balance diario
export async function GET(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const isDiario = url.pathname.endsWith('/diario'); // Detectar si la ruta es /diario

  try {
    const monedas = await Moneda.find({});
    const monedaMap = new Map(monedas.map(moneda => [moneda.nombre, moneda]));

    // Si es balance diario, obtener cuentas del día
    const cuentas = isDiario
      ? await obtenerCuentasDelDia()
      : await Cuenta.find({}).populate('moneda'); // Si no, obtener todas las cuentas

    const saldo = {};
    monedas.forEach(moneda => (saldo[moneda.nombre] = 0));

    cuentas.forEach(cuenta => {
      if (cuenta.tipo === 'Ingreso') {
        saldo[cuenta.moneda.nombre] += cuenta.monto;
      } else if (cuenta.tipo === 'Gasto') {
        saldo[cuenta.moneda.nombre] -= cuenta.monto;
      }
    });

    return NextResponse.json(saldo);
  } catch (error) {
    console.error('Error al obtener el balance:', error);
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

// OPTIONS para manejar los métodos permitidos
export async function OPTIONS() {
  return NextResponse.json(
    { message: 'Métodos permitidos: GET' },
    { status: 200 }
  );
}
