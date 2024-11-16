'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Search, ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'

const API_BASE_URL = ''

export function ProductCatalogComponent() {
  const [products, setProducts] = useState({})
  const [categories, setCategories] = useState({})
  const [sortedCategoryIds, setSortedCategoryIds] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get(`${API_BASE_URL}/api/productos`)
        const categorizedProducts = productsResponse.data

        const sortedProducts = categorizedProducts.sort((a, b) => {
          if (a.categoria === 'otros') return 1
          if (b.categoria === 'otros') return -1
          return 0
        })

        const groupedProducts = sortedProducts.reduce((acc, product) => {
          const category = product.categoria
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(product)
          return acc
        }, {})

        setProducts(groupedProducts)

        const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categorias`)
        const categoriesData = categoriesResponse.data.reduce((acc, category) => {
          acc[category._id] = category.nombre
          return acc
        }, {})

        const sortedCategoryIds = Object.keys(categoriesData).sort((a, b) => {
          const nameA = categoriesData[a].toLowerCase()
          const nameB = categoriesData[b].toLowerCase()
          return nameA.localeCompare(nameB)
        })

        setCategories({ 'todos': 'Todos', ...categoriesData })
        setSortedCategoryIds(['todos', ...sortedCategoryIds])

      } catch (error) {
        console.error('Error al obtener productos o categorías:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleImageClick = (image) => {
    setSelectedImage(image)
    setShowModal(true)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filterProducts = (productsArray) => {
    return productsArray.filter(product =>
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase())&&
      product.cantidad_stock >= 1 // Validación de stock
    )
  }

  

  const handleImageError = (productId) => {
    setImageError(prev => ({ ...prev, [productId]: true }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>
        <Tabs defaultValue="todos">
          <TabsList className="mb-6 flex flex-wrap">
            {sortedCategoryIds.map(categoryId => (
              <TabsTrigger key={categoryId} value={categoryId} className="mb-2">
                {categories[categoryId] || 'Desconocida'}
              </TabsTrigger>
            ))}
          </TabsList>
          {sortedCategoryIds.map(categoryId => (
            <TabsContent key={categoryId} value={categoryId}>
              <h2 className="text-2xl font-semibold mb-4">{categories[categoryId] || 'Desconocida'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(categoryId === 'todos' ? Object.values(products).flat() : products[categoryId] || []).map(product => (
                  filterProducts([product]).map(filteredProduct => (
                    <Card key={filteredProduct._id} className="overflow-hidden">
                      <CardHeader className="p-0">
                        <div 
                          className="relative aspect-square w-full overflow-hidden cursor-pointer"
                          onClick={() => handleImageClick(API_BASE_URL + filteredProduct.imagen)}
                        >
                          <Image
                            src={filteredProduct.imagen && !imageError[filteredProduct._id] ? filteredProduct.imagen :filteredProduct.imagen}
                            alt={filteredProduct.nombre}
                            layout="fill"
                            objectFit="cover"
                            className="transition-all hover:scale-105"
                            unoptimized
                            onError={() => handleImageError(filteredProduct._id)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg font-semibold mb-2">{filteredProduct.nombre}</CardTitle>
                        <p className="text-sm text-gray-600 mb-2">{filteredProduct.descripcion}</p>
                        <p className="text-sm mb-2">Talla: {filteredProduct.talla}</p>
                        <p className="text-lg font-bold">${filteredProduct.precio_venta_usd}</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => window.location.href = `https://wa.me/5354677486?text=Hola,%20me%20interesa%20el%20producto%20${encodeURIComponent(filteredProduct.nombre)}%20con%20precio%20${encodeURIComponent(filteredProduct.precio_venta_usd)}%20y%20talla%20${encodeURIComponent(filteredProduct.talla)}.`}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> Comprar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0">
            <DialogHeader className="absolute top-2 right-2 z-10">
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="relative w-full h-[90vh]">
              <Image
                src={selectedImage}
                alt="Producto"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Liz Moda Shop. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}