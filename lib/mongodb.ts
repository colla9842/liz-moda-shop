// lib/mongodb.js
import mongoose from 'mongoose';

let isConnected = false; // Variable global para controlar el estado de la conexión

export async function connectToDatabase() {
  if (isConnected) {
    console.log('Conexión ya establecida con MongoDB');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gabrielsimoncollazo:MongoGsc2022!@cluster0.l3txlc8.mongodb.net/mi_base_de_datos?retryWrites=true&w=majority';

  if (!MONGODB_URI) {
    throw new Error('La URI de MongoDB no está definida');
  }

  try {
    // Conectar a MongoDB sin las opciones que ya no se requieren en versiones recientes de Mongoose
    await mongoose.connect(MONGODB_URI);

    isConnected = true;
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}
