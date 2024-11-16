'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Package, RefreshCcw, ArrowUpDown } from 'lucide-react'
import { Input } from "@/components/ui/input"

export function DashboardComponent() {
  const [balances, setBalances] = useState({})
  const [dailyBalances, setDailyBalances] = useState({})
  const [currencies, setCurrencies] = useState([])
  const [totalUSD, setTotalUSD] = useState(0)
  const [dailyTotalUSD, setDailyTotalUSD] = useState(0)
  const [productTotal, setProductTotal] = useState(0)
  const [sortColumn, setSortColumn] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filter, setFilter] = useState('')

  const API_BASE_URL = ''
  const api = axios.create({
    baseURL: API_BASE_URL,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, dailyBalanceRes, currencyRes, productRes] = await Promise.all([
          api.get('/api/balance'),
          api.get('/api/balance/diario'),
          api.get('/api/monedas'),
          api.get('/api/productos'),
        ])

        setBalances(balanceRes.data)
        setDailyBalances(dailyBalanceRes.data)
        setCurrencies(Array.isArray(currencyRes.data) ? currencyRes.data : [])
        calculateTotalUSD(balanceRes.data, Array.isArray(currencyRes.data) ? currencyRes.data : [], setTotalUSD)
        calculateTotalUSD(dailyBalanceRes.data, Array.isArray(currencyRes.data) ? currencyRes.data : [], setDailyTotalUSD)
        calculateProductTotal(productRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const calculateTotalUSD = (balances, currencies, setTotal) => {
    const cupToUsdRate = currencies.find(c => c.nombre === 'USD')?.tasaCambio || 1
    const cupRateMap = currencies.reduce((acc, cur) => {
      acc[cur.nombre] = cur.tasaCambio
      return acc
    }, {})

    let totalCUP = 0
    for (const [currency, amount] of Object.entries(balances)) {
      const cupRate = cupRateMap[currency] || 1
      totalCUP += amount * cupRate
    }

    setTotal(totalCUP / cupToUsdRate)
  }

  const calculateProductTotal = (products) => {
    // const usdRate = currencies.find(c => c.nombre === 'USD')?.tasaCambio || 1
  
    const total = products.reduce((acc, product) => {
      const price = product.precio_venta_usd - 2
      return acc + price * product.cantidad_stock
    }, 0)
  
    setProductTotal(total)
  }

  const usdRate = currencies.find(c => c.nombre === 'USD')?.tasaCambio || 1
  const mlcRate = currencies.find(c => c.nombre === 'MLC')?.tasaCambio || 1

  const sortData = (data) => {
    return Object.entries(data).sort((a, b) => {
      if (sortColumn === 'currency') {
        return sortDirection === 'asc' ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])
      } else if (sortColumn === 'amount') {
        return sortDirection === 'asc' ? a[1] - b[1] : b[1] - a[1]
      }
      return 0
    }).filter(([currency]) => 
      currency.toLowerCase().includes(filter.toLowerCase())
    )
  }

  const handleSort = (column) => {
    setSortDirection(sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc')
    setSortColumn(column)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)
  }

  const renderTable = (data, title) => (
    <Card className="bg-white/50 backdrop-blur-md border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
        <Input
          placeholder="Filtrar por moneda"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm bg-white/70"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer text-gray-800 font-bold" onClick={() => handleSort('currency')}>
                Moneda {sortColumn === 'currency' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
              </TableHead>
              <TableHead className="cursor-pointer text-right text-gray-800 font-bold" onClick={() => handleSort('amount')}>
                Monto {sortColumn === 'amount' && <ArrowUpDown className="ml-2 h-4 w-4 inline" />}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortData(data).map(([currency, amount]) => (
              <TableRow key={currency} className="hover:bg-white/40 transition-colors">
                <TableCell className="font-medium text-gray-800">{currency}</TableCell>
                <TableCell className="text-right text-gray-800 font-semibold">{formatNumber(amount)}</TableCell>
              </TableRow>
            ))}
            {sortData(data).length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-800">No hay datos disponibles</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-cover bg-center backdrop-blur-sm p-8" >
      <div className="min-h-screen bg-black/20 backdrop-blur-sm p-8">
        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">Dashboard de Balance General</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total en USD", value: totalUSD, icon: DollarSign },
            { title: "Balance Diario en USD", value: dailyTotalUSD, icon: TrendingUp },
            { title: "Total en Productos", value: productTotal, icon: Package },
            { title: "Tasas de Cambio", value: `USD: ${usdRate} | MLC: ${mlcRate}`, icon: RefreshCcw },
          ].map((item, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-md border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-800">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {typeof item.value === 'number' ? `$${formatNumber(item.value)}` : item.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="general" className="bg-white/30 backdrop-blur-md rounded-lg p-2">
          <TabsList className="grid w-full grid-cols-2 bg-white/40">
            <TabsTrigger value="general" className="data-[state=active]:bg-white/60 text-gray-800">Balance General</TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-white/60 text-gray-800">Balance Diario</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            {renderTable(balances, "Detalles del Balance General")}
          </TabsContent>
          <TabsContent value="daily">
            {renderTable(dailyBalances, "Balance Diario")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}