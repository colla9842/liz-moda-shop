'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AlertCircle, CheckCircle2, DollarSign, ArrowRightLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
const API_BASE_URL = '';
const api = axios.create({
    baseURL: API_BASE_URL,
});
export function CurrencyExchangeComponent() {
    const [amountGiven, setAmountGiven] = useState('');
    const [currencyGiven, setCurrencyGiven] = useState('');
    const [amountReceived, setAmountReceived] = useState('');
    const [currencyReceived, setCurrencyReceived] = useState('');
    const [currencies, setCurrencies] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    useEffect(() => {
        api.get('/api/monedas')
            .then(response => setCurrencies(response.data))
            .catch(error => {
            console.error('Error fetching currencies:', error);
            setAlertMessage('Error al cargar las monedas');
            setAlertType('error');
        });
    }, []);
    const handleSubmit = async (e) => {
        var _a, _b;
        e.preventDefault();
        setIsSubmitting(true);
        setAlertMessage('');
        const exchangeDescription = `Cambio de ${amountGiven} ${(_a = currencies.find(m => m._id === currencyGiven)) === null || _a === void 0 ? void 0 : _a.nombre} por ${amountReceived} ${(_b = currencies.find(m => m._id === currencyReceived)) === null || _b === void 0 ? void 0 : _b.nombre}`;
        try {
            await api.post('/api/cuentas', {
                fecha: new Date(),
                tipo: 'Gasto',
                monto: amountGiven,
                moneda: currencyGiven,
                descripcion: exchangeDescription,
                categoria: 'Cambio'
            });
            await api.post('/api/cuentas', {
                fecha: new Date(),
                tipo: 'Ingreso',
                monto: amountReceived,
                moneda: currencyReceived,
                descripcion: exchangeDescription,
            });
            setAlertMessage('El cambio de divisas se realizó con éxito.');
            setAlertType('success');
            setAmountGiven('');
            setCurrencyGiven('');
            setAmountReceived('');
            setCurrencyReceived('');
        }
        catch (error) {
            console.error('Error saving the exchange:', error.response ? error.response.data : error.message);
            setAlertMessage('Hubo un error al realizar el cambio de divisas.');
            setAlertType('error');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="min-h-screen bg-cover bg-center backdrop-blur-sm p-8">
      <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Cambio de Divisa</CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessage && (<Alert variant={alertType === 'success' ? 'default' : 'destructive'} className="mb-6">
              {alertType === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
              <AlertTitle>{alertType === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>)}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amountGiven">Cantidad entregada</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input id="amountGiven" type="number" value={amountGiven} onChange={(e) => setAmountGiven(e.target.value)} required className="pl-10 bg-white/70" placeholder="Ingrese la cantidad"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencyGiven">Moneda entregada</Label>
              <Select value={currencyGiven} onValueChange={setCurrencyGiven} required>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Elegir Moneda"/>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (<SelectItem key={currency._id} value={currency._id}>
                      {currency.nombre}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <ArrowRightLeft className="text-gray-400" size={24}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountReceived">Cantidad recibida</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input id="amountReceived" type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} required className="pl-10 bg-white/70" placeholder="Ingrese la cantidad"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currencyReceived">Moneda recibida</Label>
              <Select value={currencyReceived} onValueChange={setCurrencyReceived} required>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Elegir Moneda"/>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (<SelectItem key={currency._id} value={currency._id}>
                      {currency.nombre}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Realizar Cambio'}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);
}
