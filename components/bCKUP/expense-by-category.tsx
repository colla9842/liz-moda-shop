"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { Search, Save } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

const categories = ['Comisiones', 'Recarga', 'Envio', 'Compra Shein', 'Cobro banco', 'Salarios', 'Cambio', 'Otros', 'Sin Categorizar']

export function ExpenseByCategoryComponent() {
  const [expenses, setExpenses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Comisiones')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryMap, setCategoryMap] = useState({})

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('https://testing-uozy.onrender.com/api/cuentas')
        const expensesData = response.data.filter(expense => expense.tipo === 'Gasto')
        setExpenses(expensesData)
      } catch (error) {
        console.error('Error fetching expenses:', error)
      }
    }

    fetchExpenses()
  }, [])

  const handleCategoryChange = (expenseId, category) => {
    setCategoryMap(prev => ({
      ...prev,
      [expenseId]: category,
    }))
  }

  const handleUpdateCategory = async (expenseId) => {
    const newCategory = categoryMap[expenseId]
    if (newCategory) {
      try {
        await axios.patch(`https://testing-uozy.onrender.com/api/cuentas/${expenseId}`, {
          categoria: newCategory,
        })
        alert('Categoría actualizada exitosamente')
        // Refresh expenses after update
        const response = await axios.get('https://testing-uozy.onrender.com/api/cuentas')
        const expensesData = response.data.filter(expense => expense.tipo === 'Gasto')
        setExpenses(expensesData)
      } catch (error) {
        console.error('Error updating category:', error)
        alert('Error al actualizar la categoría')
      }
    }
  }

  const filteredExpenses = expenses
    .filter(expense => expense.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

  const categorizedExpenses = categories.reduce((acc, category) => {
    acc[category] = filteredExpenses.filter(expense => 
      category === 'Sin Categorizar' 
        ? !expense.categoria || expense.categoria === 'Sin Categorizar'
        : expense.categoria === category
    )
    return acc
  }, {})

  const renderExpenseTable = (expenses) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-white w-[100px]">Fecha</TableHead>
          <TableHead className="text-white font-medium">Monto</TableHead>
          <TableHead className="text-white font-medium">Descripción</TableHead>
          <TableHead className="text-white text-right">Modificar Categoría</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map(expense => (
          <TableRow key={expense._id}>
            <TableCell className="text-white font-medium">{format(new Date(expense.fecha), 'dd/MM/yyyy')}</TableCell>
            <TableCell className="text-white font-medium">{expense.monto.toFixed(2)}</TableCell>
            <TableCell className="text-white font-medium">{expense.descripcion}</TableCell>
            <TableCell className="text-white text-right">
              <div className="flex items-center justify-end space-x-2">
                <Select
                  value={categoryMap[expense._id] || expense.categoria || 'Sin Categorizar'}
                  onValueChange={(value) => handleCategoryChange(expense._id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => handleUpdateCategory(expense._id)}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="bg-gray-800/70 backdrop-blur-md shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-700/50 text-white placeholder-gray-400 border-gray-600"
            />
          </div>
          <Tabs defaultValue="Comisiones" className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-2 bg-gray-700/50">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(category => (
              <TabsContent key={category} value={category}>
                <Card className="bg-gray-800/70 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderExpenseTable(categorizedExpenses[category])}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}