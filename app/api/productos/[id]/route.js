import { NextResponse } from 'next/server';
import { connectToDatabase } from './../../../../lib/mongodb'; // Asegúrate de que esta ruta sea válida
import Producto from './../../../../models/Producto'; // Asegúrate de que esta ruta sea válida
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    const { id } = params;

    console.log('ID recibido:', id); // Verificar que el ID se recibe correctamente

    // Verificar si se proporciona el ID
    if (!id) {
        return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error('Formato de ID no válido:', id);
        return NextResponse.json({ error: 'ID no válido' }, { status: 400 });
    }

    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Buscar el producto por ID
        const producto = await Producto.findById(id);

        // Si no se encuentra el producto, retornar un error controlado
        if (!producto) {
            console.error(`Producto con ID ${id} no encontrado.`);
            return NextResponse.json(
                { error: `Producto con ID ${id} no encontrado` },
                { status: 404 }
            );
        }

        // Si el producto se encuentra, devolverlo
        return NextResponse.json(producto);
    } catch (error) {
        // Capturar y retornar cualquier error interno del servidor
        console.error('Error al obtener el producto:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor. Por favor, intenta de nuevo.' },
            { status: 500 }
        );
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
        precio_venta_usd: parseFloat(formData.get('precio_venta_usd')),
        cantidad_stock: parseInt(formData.get('cantidad_stock') ),
        talla: formData.get('talla'),
        categoria: formData.get('categoria'),
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
  