"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { Search, Save } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

const categories = ['Comisiones', 'Recarga', 'Envio', 'Compra Shein', 'Cobro banco', 'Salarios', 'Cambio', 'Otros', 'Sin Categorizar']

export function ExpenseByCategoryComponent() {
  const [expenses, setExpenses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Comisiones')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryMap, setCategoryMap] = useState({})

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('/api/cuentas')
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
        await axios.patch(`/api/cuentas/${expenseId}`, {
          categoria: newCategory,
        })
        alert('Categoría actualizada exitosamente')
        // Refresh expenses after update
        const response = await axios.get('/api/cuentas')
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
    .filter(expense => 
      selectedCategory === 'Sin Categorizar' 
        ? !expense.categoria || expense.categoria === 'Sin Categorizar'
        : expense.categoria === selectedCategory
    )

  const renderExpenseTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/30">
            <TableHead className="text-white">Fecha</TableHead>
            <TableHead className="text-white">Monto</TableHead>
            <TableHead className="text-white">Descripción</TableHead>
            <TableHead className="text-right text-white">Modificar Categoría</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredExpenses.map(expense => (
            <TableRow key={expense._id} className="border-b border-white/10">
              <TableCell className="font-medium text-white">{format(new Date(expense.fecha), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-white">${expense.monto.toFixed(2)}</TableCell>
              <TableCell className="text-white">{expense.descripcion}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Select
                    value={categoryMap[expense._id] || expense.categoria || 'Sin Categorizar'}
                    onValueChange={(value) => handleCategoryChange(expense._id, value)}
                  >
                    <SelectTrigger className="w-[180px] bg-white/10 text-white border-white/20">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FF885B]/80 text-white border-white/20">
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat} className="hover:bg-white/20">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => handleUpdateCategory(expense._id)} className="bg-white text-[#FF885B] hover:bg-white/80">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="bg-[#FF885B]/60 backdrop-blur-md shadow-md border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="flex items-center space-x-2 w-full md:w-1/2">
              <Search className="text-white" />
              <Input
                type="text"
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-white/10 text-white placeholder-white/50 border-white/20"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-white/10 text-white border-white/20">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent className="bg-[#FF885B]/80 text-white border-white/20">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="hover:bg-white/20">{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {renderExpenseTable()}
        </CardContent>
      </Card>
    </div>
  )
}