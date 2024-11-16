'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {  DollarSign, Users, Calendar, X, Search } from 'lucide-react'
import Image from 'next/image'

const API_BASE_URL = ''
const api = axios.create({
  baseURL: API_BASE_URL,
})

export function AddSaleComponent() {
  const [productos, setProductos] = useState([])
  const [monedas, setMonedas] = useState([])
  const [gestores, setGestores] = useState([])
  const [saleData, setSaleData] = useState({
    productos: [],
    fecha: new Date().toISOString().split('T')[0],
    precioTotal: 0,
    moneda: '',
    gestor: '',
    nuevoGestor: '',
    comision: 0,
    cambio: 0,
    monedaCambio: ''
  })
  const [alertMessage, setAlertMessage] = useState('')
  const [modalShow, setModalShow] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosRes, monedasRes, gestoresRes] = await Promise.all([
          api.get('/api/productos'),
          api.get('/api/monedas'),
          api.get('/api/gestores')
        ])
        setProductos(productosRes.data)
        setMonedas(monedasRes.data)
        setGestores(gestoresRes.data)
      } catch (error) {
        setAlertMessage('Error fetching data')
        console.error('Error fetching data', error)
      }
    }

    fetchData()
  }, [])

  const handleSelectProduct = (product) => {
    setSaleData(prevState => ({
      ...prevState,
      productos: [...prevState.productos, { articulo: product._id, cantidad: 1 }]
    }))
  }

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...saleData.productos]
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    }
    setSaleData(prevState => ({
      ...prevState,
      productos: updatedProducts
    }))
  }

  const handleRemoveProduct = index => {
    setSaleData(prevState => ({
      ...prevState,
      productos: prevState.productos.filter((_, i) => i !== index)
    }))
  }

  const handleChange = e => {
    const { name, value } = e.target
    setSaleData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      let gestorId = saleData.gestor

      if (gestorId === 'nuevo' && saleData.nuevoGestor) {
        const newGestorRes = await api.post('/api/gestores', {
          nombre: saleData.nuevoGestor
        })
        gestorId = newGestorRes.data._id
      }

      const productoNombres = saleData.productos.map(p => {
        const producto = productos.find(prod => prod._id === p.articulo)
        return producto ? producto.nombre : 'Desconocido'
      })

      await api.post('/api/ventas', {
        fecha: saleData.fecha,
        articulos: saleData.productos.map(p => ({
          producto: p.articulo,
          cantidad: p.cantidad
        })),
        total: saleData.precioTotal,
        moneda: saleData.moneda,
        gestor: gestorId,
        comision: saleData.comision
      })

      await api.post('/api/cuentas', {
        fecha: new Date(),
        tipo: 'Gasto',
        monto: saleData.comision,
        moneda: '66a93eb72c6ec1a55e88aadb',
        descripcion: `Comisión por venta de ${productoNombres.join(', ')}`,
        categoria: 'Comisiones'
      })

      await api.post('/api/cuentas', {
        fecha: new Date(),
        tipo: 'Ingreso',
        monto: saleData.precioTotal,
        moneda: saleData.moneda,
        descripcion: `Venta de ${productoNombres.join(', ')}`
      })

      if (saleData.cambio > 0) {
        if (!saleData.monedaCambio) {
          setAlertMessage('Por favor selecciona una moneda para el cambio.')
          return
        }
        
        await api.post('/api/cuentas', {
          fecha: new Date(),
          tipo: 'Gasto',
          monto: saleData.cambio,
          moneda: saleData.monedaCambio,
          descripcion: `Cambio dado por venta de ${productoNombres.join(', ')}`,
          categoria: 'Otros'
        })
      }

      setSaleData({
        productos: [],
        fecha: new Date().toISOString().split('T')[0],
        precioTotal: 0,
        moneda: '',
        gestor: '',
        nuevoGestor: '',
        comision: 0,
        cambio: 0,
        monedaCambio: ''
      })

      setAlertMessage('Venta registrada exitosamente')
    } catch (error) {
      console.error('Error al registrar la venta', error)
      setAlertMessage('Error al registrar la venta')
    }
  }

  const filteredProducts = productos.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase())&&
    product.cantidad_stock >= 1 // Validación de stock
    
  )

  return (
    <div className="min-h-screen p-8">
      <Card className="max-w-4xl mx-auto bg-white/50 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Agregar Venta</CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessage && <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">{alertMessage}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Calendar className="text-gray-500" />
              <Input
                type="date"
                id="fecha"
                name="fecha"
                value={saleData.fecha}
                onChange={handleChange}
                required
                className="flex-grow"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Productos</h3>
              <Dialog open={modalShow} onOpenChange={setModalShow}>
                <DialogTrigger asChild>
                  <Button variant="outline">Seleccionar Productos</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] sm:h-[80vh] overflow-hidden flex flex-col bg-white/90 backdrop-blur-md">
                  <DialogHeader>
                    <DialogTitle>Seleccionar Productos</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 p-4">
                    <Search className="text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                  <ScrollArea className="flex-grow">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                      {filteredProducts.map(product => {
                        const isSelected = saleData.productos.some(p => p.articulo === product._id)
                        return (
                          <Card key={product._id} className={`overflow-hidden ${isSelected ? 'opacity-50' : ''}`}>
                            <div className="relative h-40 w-full">
                              <Image
                                src={product.imagen || '/placeholder.svg'}
                                alt={product.nombre}
                                layout="fill"
                                objectFit="cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2 text-sm">{product.nombre}</h4>
                              <p className="text-sm text-gray-600 mb-2">${product.precio_venta_usd}</p>
                              <Button 
                                onClick={() => handleSelectProduct(product)} 
                                size="sm" 
                                className="w-full"
                                disabled={isSelected}
                              >
                                {isSelected ? 'Agregado' : 'Agregar'}
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              {saleData.productos.map((prod, index) => (
                <div key={index} className="flex items-center space-x-4 mt-2">
                  <Input
                    type="text"
                    readOnly
                    value={productos.find(p => p._id === prod.articulo)?.nombre || 'Seleccionar producto'}
                    className="flex-grow"
                  />
                  <Input
                    type="number"
                    value={prod.cantidad}
                    onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                    min="1"
                    required
                    className="w-24"
                  />
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveProduct(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 flex-grow">
                <DollarSign className="text-gray-500" />
                <Input
                  type="number"
                  id="precioTotal"
                  name="precioTotal"
                  value={saleData.precioTotal}
                  onChange={handleChange}
                  required
                  placeholder="Precio Total"
                />
              </div>
              <Select name="moneda" onValueChange={(value) => handleChange({ target: { name: 'moneda', value } })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map(moneda => (
                    <SelectItem key={moneda._id} value={moneda._id}>{moneda.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4">
              <Input
                type="number"
                id="cambio"
                name="cambio"
                value={saleData.cambio}
                onChange={handleChange}
                placeholder="Cambio"
                className="flex-grow"
              />
              {saleData.cambio > 0 && (
                <Select name="monedaCambio" onValueChange={(value) => handleChange({ target: { name: 'monedaCambio', value } })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Moneda del Cambio" />
                  </SelectTrigger>
                  <SelectContent>
                    {monedas.map(moneda => (
                      <SelectItem key={moneda._id} value={moneda._id}>{moneda.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex space-x-4">
              <Select name="gestor" onValueChange={(value) => handleChange({ target: { name: 'gestor', value } })} className="flex-grow">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un gestor" />
                </SelectTrigger>
                <SelectContent>
                  {gestores.map(gestor => (
                    <SelectItem key={gestor._id} value={gestor._id}>{gestor.nombre}</SelectItem>
                  ))}
                  <SelectItem value="nuevo">Crear nuevo gestor</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                id="comision"
                name="comision"
                value={saleData.comision}
                onChange={handleChange}
                required
                placeholder="Comisión"
                className="w-32"
              />
            </div>

            {saleData.gestor === 'nuevo' && (
              <div className="flex items-center space-x-2">
                <Users className="text-gray-500" />
                <Input
                  type="text"
                  id="nuevoGestor"
                  name="nuevoGestor"
                  value={saleData.nuevoGestor}
                  onChange={handleChange}
                  placeholder="Nombre del nuevo gestor"
                  className="flex-grow"
                />
              </div>
            )}

            <Button type="submit" className="w-full">Registrar Venta</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}