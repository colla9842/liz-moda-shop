'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
const API_BASE_URL = '';
const api = axios.create({
    baseURL: API_BASE_URL,
});
export function ExtraIncomeComponent() {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const [description, setDescription] = useState('');
    const [currencies, setCurrencies] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await api.get('/api/monedas');
                setCurrencies(response.data);
            }
            catch (error) {
                console.error('Error fetching currencies:', error);
                setAlertMessage('Error al cargar las monedas');
                setAlertType('error');
            }
        };
        fetchCurrencies();
    }, []);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setAlertMessage('');
        const newIncome = {
            tipo: 'Ingreso',
            monto: parseFloat(amount),
            moneda: currency,
            descripcion: description,
            fecha: new Date().toISOString(),
        };
        try {
            await api.post('/api/cuentas', newIncome);
            setAlertMessage('Ingreso extra agregado exitosamente');
            setAlertType('success');
            setAmount('');
            setCurrency('');
            setDescription('');
        }
        catch (error) {
            console.error('Error al agregar ingreso extra:', error);
            setAlertMessage('Ocurrió un error al agregar el ingreso extra');
            setAlertType('error');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="min-h-screen bg-cover bg-center backdrop-blur-sm p-8">
      <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Agregar Ingreso Extra</CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessage && (<Alert variant={alertType === 'success' ? 'default' : 'destructive'} className="mb-6">
              {alertType === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
              <AlertTitle>{alertType === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>)}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input id="amount" type="number" placeholder="Ingrese el monto" value={amount} onChange={(e) => setAmount(e.target.value)} required className="pl-10 bg-white/70"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={setCurrency} required>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Seleccione una moneda"/>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (<SelectItem key={curr._id} value={curr._id}>
                      {curr.nombre}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" type="text" placeholder="Ingrese una descripción" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white/70"/>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Agregando...' : 'Agregar Ingreso'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>);
}
