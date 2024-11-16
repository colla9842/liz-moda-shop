'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_BASE_URL = ''
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/du3ycwhmx/image/upload'
const UPLOAD_PRESET = 'uploads'

export function AddProductComponent() {
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Otros')
  const [categoriaId, setCategoriaId] = useState('6482f3a3c6f84d3c6226df4d')
  const [precioVentaUsd, setPrecioVentaUsd] = useState(0)
  const [cantidadStock, setCantidadStock] = useState(1)
  const [talla, setTalla] = useState('')
  const [imagen, setImagen] = useState<File | null>(null)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [categories, setCategories] = useState<Array<{ _id: string, nombre: string }>>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categorias`)
        setCategories(response.data)
        if (!response.data.find((cat: { _id: string }) => cat._id === categoriaId)) {
          setCategoria('Otros')
          setCategoriaId('6482f3a3c6f84d3c6226df4d')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setAlertMessage('Error al cargar categorías')
        setAlertType('error')
      }
    }

    fetchCategories()
  }, [categoriaId])

  const findClosestCategory = (input: string) => {
    if (!input) return { nombre: 'Otros', _id: '6482f3a3c6f84d3c6226df4d' }

    const searchTerm = input.split(' ')[0].toLowerCase()
    let closestCategory = categories.find(cat => cat.nombre === 'Otros')
    let minDistance = Infinity

    categories.forEach(category => {
      const distance = calculateLevenshteinDistance(searchTerm, category.nombre.toLowerCase())
      if (distance < minDistance) {
        minDistance = distance
        closestCategory = category
      }
    })

    return minDistance <= 3 ? closestCategory : categories.find(cat => cat.nombre === 'Otros')
  }

  const calculateLevenshteinDistance = (a: string, b: string) => {
    const matrix: number[][] = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, 
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  useEffect(() => {
    const closestCategory = findClosestCategory(nombre)
    setCategoria(closestCategory?.nombre || 'Otros')
    setCategoriaId(closestCategory?._id || '6482f3a3c6f84d3c6226df4d')
  }, [nombre, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoriaId || !categories.find(cat => cat._id === categoriaId)) {
      setAlertMessage('Categoría no válida')
      setAlertType('error')
      return
    }

    setUploading(true)
    setAlertMessage('')

    try {
      let imageUrl = ''
      if (imagen) {
        const formData = new FormData()
        formData.append('file', imagen)
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

      const productData = {
        nombre,
        descripcion: 'Prenda',
        precio_compra_usd: 0,
        precio_venta_usd: precioVentaUsd,
        cantidad_stock: cantidadStock,
        talla,
        categoria: categoriaId,
        imagen: imageUrl // Usar la URL de Cloudinary
      }

      const response = await axios.post(`${API_BASE_URL}/api/productos`, productData)
      
      setAlertMessage('Producto agregado exitosamente')
      setAlertType('success')
      console.log(response);
      // Limpiar el formulario
      setNombre('')
      setPrecioVentaUsd(0)
      setCantidadStock(1)
      setTalla('')
      setImagen(null)
      setCategoria('Otros')
      setCategoriaId('6482f3a3c6f84d3c6226df4d')
    } catch (error) {
      console.error('Error al agregar producto:', error)
      setAlertMessage('Error al agregar producto: ' + (error instanceof Error ? error.message : String(error)))
      setAlertType('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center backdrop-blur-sm p-8">
      <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Agregar Nuevo Producto</CardTitle>
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
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="bg-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría:</Label>
              <Select value={categoria} onValueChange={(value) => {
                const selectedCategory = categories.find(cat => cat.nombre === value)
                if (selectedCategory) {
                  setCategoria(selectedCategory.nombre)
                  setCategoriaId(selectedCategory._id)
                }
              }}>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat.nombre}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precioVentaUsd">Precio Venta (USD):</Label>
                <Input
                  id="precioVentaUsd"
                  type="number"
                  step="0.01"
                  value={precioVentaUsd}
                  onChange={(e) => setPrecioVentaUsd(Number(e.target.value))}
                  required
                  className="bg-white/70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cantidadStock">Cantidad en Stock:</Label>
                <Input
                  id="cantidadStock"
                  type="number"
                  value={cantidadStock}
                  onChange={(e) => setCantidadStock(Number(e.target.value))}
                  required
                  className="bg-white/70"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="talla">Talla:</Label>
              <Input
                id="talla"
                type="text"
                value={talla}
                onChange={(e) => setTalla(e.target.value)}
                required
                className="bg-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen:</Label>
              <Input
                id="imagen"
                type="file"
                onChange={(e) => setImagen(e.target.files ? e.target.files[0] : null)}
                className="bg-white/70"
              />
            </div>
            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Agregar Producto'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}