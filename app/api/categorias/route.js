import { NextResponse } from 'next/server';
import { connectToDatabase } from './../../../lib/mongodb';
import Categoria from './../../../models/Categoria'; // Verifica la ruta del modelo
// Obtener todas las categorías
export async function GET() {
    await connectToDatabase();
    try {
        const categorias = await Categoria.find({});
        return NextResponse.json(categorias);
    }
    catch (error) {
        console.error('Error al obtener categorías:', error);
        return NextResponse.error();
    }
}
// Crear una nueva categoría
export async function POST(req) {
    await connectToDatabase();
    try {
        const { nombre } = await req.json();
        const nuevaCategoria = new Categoria({ nombre });
        await nuevaCategoria.save();
        return NextResponse.json(nuevaCategoria, { status: 201 });
    }
    catch (error) {
        console.error('Error al crear categoría:', error);
        return NextResponse.error();
    }
}
// OPTIONS para manejar los métodos permitidos
export async function OPTIONS() {
    return NextResponse.json({ message: 'Métodos permitidos: GET, POST' }, { status: 200 });
}
