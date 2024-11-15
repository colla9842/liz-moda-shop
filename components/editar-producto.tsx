'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from 'next/image'

const API_BASE_URL = ''
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/du3ycwhmx/image/upload'
const UPLOAD_PRESET = 'uploads'

const api = axios.create({
  baseURL: API_BASE_URL,
})

export function EditarProductoComponent() {
  const { id } = useParams()
  const router = useRouter()
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio_compra_usd: 0,
    precio_venta_usd: 0,
    cantidad_stock: 0,
    talla: '',
    imagen: '',
    categoria: ''
  })
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Array<{ _id: string, nombre: string }>>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productoResponse, categoriasResponse] = await Promise.all([
          api.get(`/api/productos/${id}`),
          api.get('/api/categorias')
        ])
        setProducto(productoResponse.data)
        setCategorias(categoriasResponse.data)
      } catch (error) {
        console.error('Error al obtener datos:', error)
        setAlertMessage('Error al cargar los datos del producto')
        setAlertType('error')
      }
    }

    fetchData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProducto(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagenFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setAlertMessage('')

    try {
        let imageUrl = producto.imagen

        if (imagenFile) {
            const formData = new FormData()
            formData.append('file', imagenFile)
            formData.append('upload_preset', UPLOAD_PRESET)

            const cloudinaryResponse = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData,
            })

            if (!cloudinaryResponse.ok) {
                throw new Error('Error al subir la imagen a Cloudinary')
            }

            const cloudinaryData = await cloudinaryResponse.json()
            imageUrl = cloudinaryData.secure_url
        }

        // Ahora crea un FormData para enviar a tu API
        const formData = new FormData()
        formData.append('nombre', producto.nombre)
        formData.append('descripcion', 'Prenda')
        formData.append('precioVentaUsd', producto.precio_venta_usd.toString())
        formData.append('cantidadStock', producto.cantidad_stock.toString())
        formData.append('talla', producto.talla)
        formData.append('categoriaId', producto.categoria)
        formData.append('imagen', imageUrl)

        // Enviar el FormData
        const response = await api.put(`/api/productos/${id}`, formData)
        console.log('Producto actualizado:', response.data)
        setAlertMessage('Producto actualizado exitosamente')
        setAlertType('success')
        router.push('/editar-producto')

    } catch (error) {
        console.error('Error al actualizar el producto:', error)
        setAlertMessage('Error al actualizar el producto')
        setAlertType('error')
    } finally {
        setLoading(false)
    }
}


  const handleCancel = () => {
    router.push('/editar-producto')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <Card className="max-w-2xl mx-auto bg-white/50 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Editar Producto</CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessage && (
            <Alert variant={alertType === 'success' ? 'default' : 'destructive'} className="mb-6">
              {alertType === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{alertType === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre:</Label>
              <Input
                id="nombre"
                name="nombre"
                value={producto.nombre}
                onChange={handleChange}
                className="bg-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción:</Label>
              <Input
                id="descripcion"
                name="descripcion"
                value={producto.descripcion}
                onChange={handleChange}
                className="bg-white/70"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_compra_usd">Precio Compra USD:</Label>
                <Input
                  id="precio_compra_usd"
                  name="precio_compra_usd"
                  type="number"
                  value={producto.precio_compra_usd}
                  onChange={handleChange}
                  className="bg-white/70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_venta_usd">Precio Venta USD:</Label>
                <Input
                  id="precio_venta_usd"
                  name="precio_venta_usd"
                  type="number"
                  value={producto.precio_venta_usd}
                  onChange={handleChange}
                  className="bg-white/70"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad_stock">Cantidad Stock:</Label>
                <Input
                  id="cantidad_stock"
                  name="cantidad_stock"
                  type="number"
                  value={producto.cantidad_stock}
                  onChange={handleChange}
                  className="bg-white/70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="talla">Talla:</Label>
                <Input
                  id="talla"
                  name="talla"
                  value={producto.talla}
                  onChange={handleChange}
                  className="bg-white/70"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen:</Label>
              <Input
                id="imagen"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-white/70"
              />
              {producto.imagen && (
                <div className="mt-2">
                  <Image
                    src={producto.imagen}
                    alt="Imagen actual"
                    width={200}
                    height={200}
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría:</Label>
              <Select 
                value={producto.categoria} 
                onValueChange={(value) => setProducto(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}