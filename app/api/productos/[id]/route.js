import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Producto from '@/models/Producto';
import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "du3ycwhmx",
  api_key: "652461147199923",
  api_secret: "hoAtCzASC9LgscVgxhvrEJer_wI",
});

// Método GET para obtener un producto por ID
export async function GET(request, { params }) {
  const { id } = params;
  await connectToDatabase();

  try {
    const productos = await Producto.findById(id);
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.error();
  }
}

// Método PUT para actualizar un producto
export async function PUT(request, { params }) {
  const { id } = params;
  await connectToDatabase();

  // Agregar un log para verificar el tipo de contenido que llega
  console.log('Content-Type:', request.headers.get('content-type'));

  try {
    const formData = await request.formData();
    const updateData = {
      nombre: formData.get('nombre'),
      descripcion: 'Prenda',
      precio_venta_usd: parseFloat(formData.get('precioVentaUsd')),
      cantidad_stock: parseInt(formData.get('cantidadStock')),
      talla: formData.get('talla'),
      categoria: formData.get('categoriaId'),
      imagen: formData.get('imagen'),
    };

    const producto = await Producto.findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoria');

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Método DELETE para eliminar un producto
export async function DELETE(request, { params }) {
  const { id } = params;
  await connectToDatabase();

  try {
    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
