'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlertCircle, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Image from 'next/image';
const API_BASE_URL = '';
const api = axios.create({
    baseURL: API_BASE_URL,
});
export function ProductCatalogEditionComponent() {
    const [productos, setProductos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const router = useRouter();
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await api.get('/api/productos'); // Obtener todos los productos
                setProductos(response.data);
            }
            catch (error) {
                console.error('Error al cargar los productos:', error);
                setAlertMessage('Error al cargar los productos');
                setAlertType('error');
            }
        };
        fetchProductos();
    }, []);
    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/productos/${id}`); // Eliminar producto
            setProductos(productos.filter(producto => producto._id !== id));
            setAlertMessage('Producto eliminado exitosamente');
            setAlertType('success');
        }
        catch (error) {
            console.error('Error al eliminar el producto:', error);
            setAlertMessage('Error al eliminar el producto');
            setAlertType('error');
        }
    };
    const handleEdit = (id) => {
        router.push(`/editar-producto/${id}`); // Editar producto
    };
    const filterProducts = () => {
        return productos.filter(producto => producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    return (<div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Catálogo de Productos (Edición)</h1>
        
        {alertMessage && (<Alert variant={alertType === 'success' ? 'default' : 'destructive'} className="mb-6">
            {alertType === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
            <AlertTitle>{alertType === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>)}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <Input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-white/70"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterProducts().map(producto => (<Card key={producto._id} className={`overflow-hidden ${producto.cantidad_stock < 1 ? 'bg-gray-200' : 'bg-white'} backdrop-blur-md`}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                <Image src={producto.imagen} alt={producto.nombre} layout="fill" objectFit="cover" className="transition-all hover:scale-105" unoptimized/>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold mb-2">{producto.nombre}</CardTitle>
                <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                <p className="text-sm mb-1">Precio: ${producto.precio_venta_usd}</p>
                <p className="text-sm mb-1">Cantidad: {producto.cantidad_stock}</p>
                <p className="text-sm mb-2">Talla: {producto.talla}</p>
                {producto.cantidad_stock < 1 && (<p className="text-xs text-red-600 font-semibold">¡Producto agotado!</p>)}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEdit(producto._id)}>
                  <Pencil className="mr-2 h-4 w-4"/>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(producto._id)}>
                  <Trash2 className="mr-2 h-4 w-4"/>
                  Eliminar
                </Button>
              </CardFooter>
            </Card>))}
        </div>
      </div>
    </div>);
}
