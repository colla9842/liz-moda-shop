"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowUpDown, Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_BASE_URL = 'https://testing-uozy.onrender.com/'
const api = axios.create({ baseURL: API_BASE_URL })

const PAGE_SIZE = 25

export default function CuentasTable() {
  const [cuentas, setCuentas] = useState([])
  const [monedas, setMonedas] = useState([])
  const [tasaCambioUSD, setTasaCambioUSD] = useState(1)
  const [activeTab, setActiveTab] = useState('ingresos')
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [editMode, setEditMode] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cuentasResponse, monedasResponse] = await Promise.all([
          api.get('/api/cuentas'),
          api.get('/api/monedas')
        ])
        setCuentas(cuentasResponse.data)
        setMonedas(monedasResponse.data)
        const usdMoneda = monedasResponse.data.find(m => m.nombre === 'USD')
        if (usdMoneda) setTasaCambioUSD(usdMoneda.tasaCambio)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const convertirACUP = (monto, tasaCambioCUP) => monto * tasaCambioCUP
  const convertirAUSD = (montoCUP) => montoCUP / tasaCambioUSD

  const calcularTotalesPorMoneda = (cuentas) => {
    return cuentas.reduce((acc, cuenta) => {
      const moneda = cuenta.moneda.nombre
      const tasaCambioCUP = monedas.find(m => m.nombre === moneda)?.tasaCambio || 1
      if (!acc[moneda]) acc[moneda] = { total: 0, monto: 0 }
      const montoCUP = convertirACUP(cuenta.monto, tasaCambioCUP)
      acc[moneda].total += montoCUP
      acc[moneda].monto += cuenta.monto
      return acc
    }, {})
  }

  const calcularBalancePorMoneda = (ingresosPorMoneda, gastosPorMoneda) => {
    const balance = {}
    const monedas = new Set([...Object.keys(ingresosPorMoneda), ...Object.keys(gastosPorMoneda)])
    monedas.forEach(moneda => {
      const ingresosTotal = ingresosPorMoneda[moneda]?.total || 0
      const gastosTotal = gastosPorMoneda[moneda]?.total || 0
      balance[moneda] = ingresosTotal - gastosTotal
    })
    return balance
  }

  const ingresos = cuentas.filter(cuenta => cuenta.tipo.toLowerCase() === 'ingreso')
  const gastos = cuentas.filter(cuenta => cuenta.tipo.toLowerCase() === 'gasto')

  const ingresosPorMoneda = calcularTotalesPorMoneda(ingresos)
  const gastosPorMoneda = calcularTotalesPorMoneda(gastos)
  const balancePorMoneda = calcularBalancePorMoneda(ingresosPorMoneda, gastosPorMoneda)

  const sortCuentas = (cuentas) => {
    return [...cuentas].sort((a, b) => {
      const aKey = a[sortConfig.key]
      const bKey = b[sortConfig.key]
      if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1
      if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handlePageClick = (pageNumber) => setCurrentPage(pageNumber)

  const getPaginatedData = (data) => {
    const startIndex = currentPage * PAGE_SIZE
    return data.slice(startIndex, startIndex + PAGE_SIZE)
  }

  const handleEditChange = (e, id, field) => {
    const newValue = e.target.value
    setCuentas(cuentas.map(cuenta =>
      cuenta._id === id ? { ...cuenta, [field]: newValue } : cuenta
    ))
  }

  const handleSaveEdit = async (id) => {
    try {
      const cuenta = cuentas.find(cuenta => cuenta._id === id)
      await api.put(`/api/cuentas/${id}`, cuenta)
      setEditMode(null)
    } catch (error) {
      console.error('Error updating data:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/cuentas/${id}`)
      setCuentas(cuentas.filter(cuenta => cuenta._id !== id))
    } catch (error) {
      console.error('Error deleting data:', error)
    }
  }

  const renderTableBody = (cuentas) => {
    return getPaginatedData(cuentas).map(cuenta => {
      const tasaCambioCUP = monedas.find(m => m.nombre === cuenta.moneda.nombre)?.tasaCambio || 1
      const isEditing = editMode === cuenta._id

      return (
        <TableRow key={cuenta._id}>
          <TableCell>
            {isEditing ? (
              <Input
                type="date"
                value={cuenta.fecha.split('T')[0]}
                onChange={(e) => handleEditChange(e, cuenta._id, 'fecha')}
              />
            ) : (
              format(new Date(cuenta.fecha), 'dd/MM/yyyy')
            )}
          </TableCell>
          <TableCell>
            {isEditing ? (
              <Select
                value={cuenta.tipo}
                onValueChange={(value) => handleEditChange({ target: { value } }, cuenta._id, 'tipo')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                  <SelectItem value="Gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              cuenta.tipo
            )}
          </TableCell>
          <TableCell>
            {isEditing ? (
              <Input
                type="number"
                value={cuenta.monto}
                onChange={(e) => handleEditChange(e, cuenta._id, 'monto')}
              />
            ) : (
              cuenta.monto.toFixed(2)
            )}
          </TableCell>
          <TableCell>
            {isEditing ? (
              <Select
                value={cuenta.moneda.nombre}
                onValueChange={(value) => handleEditChange({ target: { value } }, cuenta._id, 'moneda.nombre')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map(moneda => (
                    <SelectItem key={moneda._id} value={moneda.nombre}>{moneda.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              cuenta.moneda.nombre
            )}
          </TableCell>
          <TableCell>{tasaCambioCUP.toFixed(2)}</TableCell>
          <TableCell>
            {isEditing ? (
              <Input
                type="text"
                value={cuenta.descripcion || ''}
                onChange={(e) => handleEditChange(e, cuenta._id, 'descripcion')}
              />
            ) : (
              cuenta.descripcion || 'N/A'
            )}
          </TableCell>
          <TableCell>
            {isEditing ? (
              <>
                <Button onClick={() => handleSaveEdit(cuenta._id)} variant="outline" size="sm" className="mr-2">
                  Guardar
                </Button>
                <Button onClick={() => setEditMode(null)} variant="outline" size="sm">
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditMode(cuenta._id)} variant="outline" size="icon" className="mr-2">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleDelete(cuenta._id)} variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </TableCell>
        </TableRow>
      )
    })
  }

  const filterCuentas = (cuentas) => {
    return cuentas.filter(cuenta =>
      cuenta.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cuenta.moneda.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const sortedIngresos = sortCuentas(filterCuentas(ingresos))
  const sortedGastos = sortCuentas(filterCuentas(gastos))

  const calcularTotalUSD = (totalesPorMoneda) => {
    return Object.keys(totalesPorMoneda).reduce((totalUSD, moneda) => {
      const totalCUP = totalesPorMoneda[moneda].total || 0
      return totalUSD + convertirAUSD(totalCUP)
    }, 0).toFixed(2)
  }

  const renderTable = (data) => (
    <>
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Buscar por descripción o moneda"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('fecha')} className="cursor-pointer">
              Fecha <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('tipo')} className="cursor-pointer">
              Tipo <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('monto')} className="cursor-pointer">
              Monto <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('moneda.nombre')} className="cursor-pointer">
              Moneda <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead>Tasa de Cambio</TableHead>
            <TableHead onClick={() => handleSort('descripcion')} className="cursor-pointer">
              Descripción <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderTableBody(data)}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(data.length / PAGE_SIZE) }, (_, i) => (
          <Button
            key={i}
            onClick={() => handlePageClick(i)}
            variant={currentPage === i ? "default" : "outline"}
            className="mx-1"
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </>
  )

  const renderTotales = (title, data) => (
    <>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Moneda</TableHead>
            <TableHead>Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.keys(data).map(moneda => (
            <TableRow key={moneda}>
              <TableCell>{moneda}</TableCell>
              <TableCell>{(data[moneda].total / monedas.find(m => m.nombre === moneda)?.tasaCambio).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-bold">Total USD</TableCell>
            <TableCell className="font-bold">{calcularTotalUSD(data)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )

  return (
    <div className="container mx-auto py-10">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="totales">Totales</TabsTrigger>
        </TabsList>
        <TabsContent value="ingresos">
          {renderTable(sortedIngresos)}
        </TabsContent>
        <TabsContent value="gastos">
          {renderTable(sortedGastos)}
        </TabsContent>
        <TabsContent value="totales">
          <div className="space-y-8">
            {renderTotales("Ingresos", ingresosPorMoneda)}
            {renderTotales("Gastos", gastosPorMoneda)}
          
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}