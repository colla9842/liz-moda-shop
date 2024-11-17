import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Producto from '@/models/Producto'; // Verify the path
import { v2 as cloudinary } from 'cloudinary';

interface ProductoUpdateData {
  nombre: string | null;
  descripcion: string;
  precio_venta_usd: number | null;
  cantidad_stock: number | null;
  talla: string | null;
  categoria: string | null;
  imagen: string | null;
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: "du3ycwhmx",
  api_key: "652461147199923",
  api_secret: "hoAtCzASC9LgscVgxhvrEJer_wI",
});

interface Params {
  id: string; // Adjust the type of `id` as needed (e.g., string or number)
}

// GET method to fetch a product by ID
export async function GET(request: Request,  params :  Promise<{ id: string }>) {
  const { id } = await params; // Await params for dynamic API compatibility
  await connectToDatabase();

  try {
    const producto = await Producto.findById(id);
    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.error();
  }
}

// PUT method to update a product
export async function PUT(request: Request, { params }) {
  const { id } = await params; // Await params for dynamic API compatibility
  await connectToDatabase();

  try {
    const formData = await request.formData();
    const updateData: ProductoUpdateData = {
      nombre: formData.get('nombre') as string | null,
      descripcion: 'Prenda',
      precio_venta_usd: formData.get('precioVentaUsd') ? parseFloat(formData.get('precioVentaUsd') as string) : null,
      cantidad_stock: formData.get('cantidadStock') ? parseInt(formData.get('cantidadStock') as string, 10) : null,
      talla: formData.get('talla') as string | null,
      categoria: formData.get('categoriaId') as string | null,
      imagen: formData.get('imagen') as string | null,
    };

console.log(updateData);

    const producto = await Producto.findByIdAndUpdate(id, updateData, { new: true }).populate('categoria');

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE method to delete a product
export async function DELETE(request: Request, { params }) {
  const { id } = await params; // Await params for dynamic API compatibility
  await connectToDatabase();

  try {
    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
