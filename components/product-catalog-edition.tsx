'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from 'next/image'

const API_BASE_URL = ''

const api = axios.create({
  baseURL: API_BASE_URL,
})

export function ProductCatalogEditionComponent() {
  const [productos, setProductos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const router = useRouter()

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const [productosResponse, productosAgotadosResponse] = await Promise.all([
          api.get('/api/productos'),
          api.get('/api/productosAgotados'),
        ])

        const productosDisponibles = productosResponse.data
        const productosAgotados = productosAgotadosResponse.data.map(producto => ({
          ...producto,
          agotado: true,
        }))

        const productosCombinados = [
          ...productosDisponibles,
          ...productosAgotados,
        ]

        setProductos(productosCombinados)
      } catch (error) {
        console.error('Error al cargar los productos:', error)
        setAlertMessage('Error al cargar los productos')
        setAlertType('error')
      }
    }

    fetchProductos()
  }, [])

  const handleDelete = async (id, agotado) => {
    try {
      const endpoint = agotado ? `/api/productosAgotados/${id}` : `/api/productos/${id}`
      await api.delete(endpoint)
      setProductos(productos.filter(producto => producto._id !== id))
      setAlertMessage('Producto eliminado exitosamente')
      setAlertType('success')
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      setAlertMessage('Error al eliminar el producto')
      setAlertType('error')
    }
  }

  const handleEdit = (id, agotado) => {
    const route = agotado ? `/editar-producto-agotado/${id}` : `/editar-producto/${id}`
    router.push(route)
  }

  const filterProducts = () => {
    return productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Catálogo de Productos (Edición)</h1>
        
        {alertMessage && (
          <Alert variant={alertType === 'success' ? 'default' : 'destructive'} className="mb-6">
            {alertType === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{alertType === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/70"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterProducts().map(producto => (
            <Card key={producto._id} className={`overflow-hidden ${producto.agotado ? 'bg-red-100/50' : 'bg-white/50'} backdrop-blur-md`}>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={API_BASE_URL + producto.imagen}
                    alt={producto.nombre}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold mb-2">{producto.nombre}</CardTitle>
                <p className="text-sm text-gray-600 mb-2">{producto.descripcion}</p>
                <p className="text-sm mb-1">Precio: ${producto.precio_venta_usd}</p>
                <p className="text-sm mb-1">Cantidad: {producto.cantidad_stock}</p>
                <p className="text-sm mb-2">Talla: {producto.talla}</p>
                {producto.agotado && (
                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Agotado
                  </span>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEdit(producto._id, producto.agotado)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(producto._id, producto.agotado)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}