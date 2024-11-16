import { NextResponse } from 'next/server';
import Venta from '@/models/Venta';
import Producto from '@/models/Producto'; // Asegúrate de que la ruta sea correcta

// Ruta para registrar una venta (POST)
export async function POST(req) {
  const { fecha, articulos, total, moneda } = await req.json();

  try {
    // Crear una nueva venta
    const nuevaVenta = new Venta({
      fecha,
      articulos,
      total,
      moneda,
    });

    // Guardar la venta en la base de datos
    await nuevaVenta.save();
    console.log('Venta guardada:', nuevaVenta);

    // Actualizar el stock de los productos vendidos
    for (const articulo of articulos) {
      const producto = await Producto.findById(articulo.producto);
      if (producto) {
        // Restar la cantidad vendida del stock
        producto.cantidad_stock -= articulo.cantidad;
        console.log(`Actualizando stock del producto ${producto._id}: ${producto.cantidad_stock}`);
        // Guardar los cambios en el producto
        await producto.save();
      } else {
        console.log(`Producto con ID ${articulo.producto} no encontrado.`);
      }
    }

    return NextResponse.json(nuevaVenta, { status: 201 });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    return NextResponse.json({ error: 'Error al registrar venta', details: error.message }, { status: 500 });
  }
}

// Ruta para obtener todas las ventas (GET)
export async function GET() {
  try {
    const ventas = await Venta.find().populate('moneda').populate('articulos.producto');
    return NextResponse.json(ventas, { status: 200 });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json({ error: 'Error al obtener ventas', details: error.message }, { status: 500 });
  }
}
