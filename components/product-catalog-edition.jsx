'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from './ui/use-toast';

const API_BASE_URL = '';
const api = axios.create({
  baseURL: API_BASE_URL,
});

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        {children}
      </div>
    </div>
  );
};

export function ProductCatalogEditionComponent() {
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const scrollPositionRef = useRef(0);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get('/api/productos');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al cargar los productos:', error);
        addToast('Error al cargar los productos', 'error');
      }
    };
    fetchProductos();
  }, [addToast]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
    scrollPositionRef.current = window.pageYOffset;
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/productos/${productToDelete._id}`);
      setProductos(productos.filter(producto => producto._id !== productToDelete._id));
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
      addToast(`El producto "${productToDelete.nombre}" ha sido eliminado.`, 'success');
      setTimeout(() => window.scrollTo(0, scrollPositionRef.current), 0);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      setIsDeleting(false);
      addToast('No se pudo eliminar el producto. Por favor, inténtelo de nuevo.', 'error');
    }
  };

  const handleEdit = (id) => {
    router.push(`/editar-producto/${id}`);
  };

  const filterProducts = () => {
    return productos.filter(producto => producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Catálogo de Productos (Edición)</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterProducts().map(producto => (
            <div key={producto._id} className={`bg-white rounded-lg shadow-md overflow-hidden ${producto.cantidad_stock < 1 ? 'opacity-75' : ''}`}>
              <div className="relative h-48">
                <Image 
                  src={producto.imagen} 
                  alt={producto.nombre} 
                  layout="fill" 
                  objectFit="cover" 
                  className="transition-all hover:scale-105" 
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{producto.nombre}</h2>
                <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                <p className="text-sm mb-1">Precio: ${producto.precio_venta_usd}</p>
                <p className="text-sm mb-1">Cantidad: {producto.cantidad_stock}</p>
                <p className="text-sm mb-2">Talla: {producto.talla}</p>
                {producto.cantidad_stock < 1 && (
                  <p className="text-xs text-red-600 font-semibold">¡Producto agotado!</p>
                )}
              </div>
              <div className="flex justify-between p-4 bg-gray-50">
                <button 
                  onClick={() => handleEdit(producto._id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Pencil className="inline-block mr-2 h-4 w-4"/>
                  Editar
                </button>
                <button 
                  onClick={() => handleDeleteClick(producto)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="inline-block mr-2 h-4 w-4"/>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
        <p className="mb-4">
          ¿Estás seguro de que quieres eliminar el producto "{productToDelete?.nombre}"?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

