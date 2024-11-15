"use client"

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const API_BASE_URL = ''

export function MonthlyReportComponent() {
  const [currencies, setCurrencies] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [categoryExpenses, setCategoryExpenses] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/monedas`)
      .then(response => setCurrencies(response.data))
      .catch(error => console.error('Error fetching currencies:', error))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (currencies.length > 0) {
      fetchMonthlyData(selectedMonth)
    }
  }, [selectedMonth, currencies])

  const fetchMonthlyData = (month) => {
    setIsLoading(true)
    axios.get(`${API_BASE_URL}/api/cuentas`)
      .then(response => {
        const filteredAccounts = filterAccountsByMonth(response.data, month)
        calculateMonthlyTotals(filteredAccounts)
        calculateCategoryExpenses(filteredAccounts)
      })
      .catch(error => console.error('Error fetching monthly data:', error))
      .finally(() => setIsLoading(false))
  }

  const filterAccountsByMonth = (accounts, month) => {
    return accounts.filter(account => {
      const accountMonth = account.fecha.slice(0, 7)
      return accountMonth === month
    })
  }

  const calculateMonthlyTotals = (accounts) => {
    const usdRate = currencies.find(c => c.nombre === 'USD')?.tasaCambio || 1
    const currencyRateMap = currencies.reduce((acc, cur) => {
      acc[cur.nombre] = cur.tasaCambio
      return acc
    }, {})

    let incomeTotalCUP = 0
    let expenseTotalCUP = 0
    let cambioAmountCUP = 0

    accounts.forEach(account => {
      const cupRate = currencyRateMap[account.moneda.nombre] || 1
      const amountInCUP = account.monto * cupRate

      if (account.tipo === 'Ingreso') {
        incomeTotalCUP += amountInCUP
      } else if (account.tipo === 'Gasto') {
        if (account.categoria === 'Cambio') {
          cambioAmountCUP += amountInCUP
        } else {
          expenseTotalCUP += amountInCUP
        }
      }
    })

    setTotalIncome((incomeTotalCUP - cambioAmountCUP) / usdRate)
    setTotalExpense(expenseTotalCUP / usdRate)
  }

  const calculateCategoryExpenses = (accounts) => {
    const usdRate = currencies.find(c => c.nombre === 'USD')?.tasaCambio || 1
    const currencyRateMap = currencies.reduce((acc, cur) => {
      acc[cur.nombre] = cur.tasaCambio
      return acc
    }, {})

    const categoryTotals = {}

    accounts.forEach(account => {
      const cupRate = currencyRateMap[account.moneda.nombre] || 1
      const amountInCUP = account.monto * cupRate

      if (account.tipo === 'Gasto' && account.categoria !== 'Cambio') {
        categoryTotals[account.categoria] = (categoryTotals[account.categoria] || 0) + amountInCUP
      }
    })

    Object.keys(categoryTotals).forEach(category => {
      categoryTotals[category] = categoryTotals[category] / usdRate
    })

    setCategoryExpenses(categoryTotals)
  }

  const handleMonthChange = (value) => {
    setSelectedMonth(value)
  }

  const getMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = date.toISOString().slice(0, 7)
      const label = format(date, 'MMMM yyyy')
      options.push({ value, label })
    }
    return options
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6 relative z-10">
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full sm:w-[250px] bg-gray-800/70 text-white border-gray-700">
            <SelectValue placeholder="Selecciona Mes" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800/90 border-gray-700">
            {getMonthOptions().map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700/50">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-800/70 backdrop-blur-md shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Reporte Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-[250px] mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-[200px] mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-[150px] bg-gray-700" />
              </>
            ) : (
              <>
                <p className="text-lg text-white">Total Ingresos: ${totalIncome.toFixed(2)}</p>
                <p className="text-lg text-white">Total Gastos: ${totalExpense.toFixed(2)}</p>
                <p className="text-lg text-white">Balance Neto: ${(totalIncome - totalExpense).toFixed(2)}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gray-800/70 backdrop-blur-md shadow-md">
          <CardHeader>
            <CardTitle className="text-white">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-[200px] mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-[180px] mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-[160px] bg-gray-700" />
              </>
            ) : (
              Object.keys(categoryExpenses).map(category => (
                <p key={category} className="text-lg text-white">
                  {category}: ${categoryExpenses[category].toFixed(2)}
                </p>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}