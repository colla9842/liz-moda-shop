import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import multer from 'multer';
import ProductoAgotado from '../../../models/ProductoAgotado'; // Verifica la ruta

// Configuración de multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ajusta el destino si es necesario
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage }).single('imagenFile');

// Middleware para procesar las solicitudes de carga de archivos
export async function POST(req: Request) {
  await connectToDatabase();
  
  return new Promise((resolve, reject) => {
    upload(req as any, {} as any, async (err: any) => {
      if (err) {
        return reject(NextResponse.error());
      }

      try {
        const newProductoAgotado = new ProductoAgotado({
          nombre: req.body.nombre,
          descripcion: req.body.descripcion,
          precio_compra_usd: req.body.precio_compra_usd,
          precio_venta_usd: req.body.precio_venta_usd,
          cantidad_stock: req.body.cantidad_stock,
          talla: req.body.talla,
          imagen: req.file ? req.file.path : undefined,
        });
        await newProductoAgotado.save();
        return resolve(NextResponse.json(newProductoAgotado, { status: 201 }));
      } catch (error) {
        console.error('Error al crear producto agotado:', error);
        return reject(NextResponse.error());
      }
    });
  });
}

// Obtener todos los productos agotados
export async function GET(req: Request) {
  await connectToDatabase();

  try {
    const productosAgotados = await ProductoAgotado.find();
    return NextResponse.json(productosAgotados);
  } catch (error) {
    console.error('Error al obtener productos agotados:', error);
    return NextResponse.error();
  }
}

// Obtener un producto agotado por ID
export async function GET_BY_ID(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Obtener el ID de la URL

  try {
    const productoAgotado = await ProductoAgotado.findById(id);
    if (!productoAgotado) {
      return NextResponse.json({ message: 'Producto agotado no encontrado' }, { status: 404 });
    }
    return NextResponse.json(productoAgotado);
  } catch (error) {
    console.error('Error al obtener producto agotado:', error);
    return NextResponse.error();
  }
}

// Actualizar un producto agotado por ID
export async function PUT(req: Request) {
  await connectToDatabase();
  
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Obtener el ID de la URL

  return new Promise((resolve, reject) => {
    upload(req as any, {} as any, async (err: any) => {
      if (err) {
        return reject(NextResponse.error());
      }

      try {
        const updates = {
          nombre: req.body.nombre,
          descripcion: req.body.descripcion,
          precio_compra_usd: req.body.precio_compra_usd,
          precio_venta_usd: req.body.precio_venta_usd,
          cantidad_stock: req.body.cantidad_stock,
          talla: req.body.talla,
          imagen: req.file ? req.file.path : undefined
        };

        const updatedProductoAgotado = await ProductoAgotado.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProductoAgotado) {
          return resolve(NextResponse.json({ message: 'Producto agotado no encontrado' }, { status: 404 }));
        }

        return resolve(NextResponse.json(updatedProductoAgotado));
      } catch (error) {
        console.error('Error al actualizar producto agotado:', error);
        return reject(NextResponse.error());
      }
    });
  });
}

// Eliminar un producto agotado por ID
export async function DELETE(req: Request) {
  await connectToDatabase();

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Obtener el ID de la URL

  try {
    const productoAgotado = await ProductoAgotado.findByIdAndDelete(id);
    if (!productoAgotado) {
      return NextResponse.json({ message: 'Producto agotado no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Producto agotado eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto agotado:', error);
    return NextResponse.error();
  }
}
