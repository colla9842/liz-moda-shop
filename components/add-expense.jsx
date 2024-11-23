'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AlertCircle, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
const API_BASE_URL = '';
const api = axios.create({
    baseURL: API_BASE_URL,
});
export function AddExpenseComponent() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [monto, setMonto] = useState('');
    const [moneda, setMoneda] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [monedas, setMonedas] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const fetchMonedas = async () => {
            try {
                const response = await api.get('/api/monedas');
                if (Array.isArray(response.data)) {
                    setMonedas(response.data);
                }
                else {
                    console.error('Unexpected response data:', response.data);
                    setAlertMessage('Error al cargar las monedas');
                    setAlertType('error');
                }
            }
            catch (error) {
                console.error('Error fetching monedas:', error);
                setAlertMessage('Error al cargar las monedas');
                setAlertType('error');
            }
        };
        fetchMonedas();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAlertMessage('');
        const expenseData = {
            fecha,
            tipo: 'Gasto',
            monto: parseFloat(monto),
            moneda,
            descripcion,
            categoria
        };
        try {
            await api.post('/api/cuentas', expenseData);
            setFecha(new Date().toISOString().split('T')[0]);
            setMonto('');
            setMoneda('');
            setDescripcion('');
            setCategoria('');
            setAlertMessage('Gasto agregado exitosamente');
            setAlertType('success');
        }
        catch (error) {
            console.error('Error agregando gasto:', error);
            setAlertMessage('Hubo un error al agregar el gasto');
            setAlertType('error');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<div className="min-h-screen bg-cover bg-center backdrop-blur-sm p-8">
      <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Agregar Nuevo Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          {alertMessage && (<Alert variant={alertType === 'success' ? 'default' : 'destructive'} className="mb-6">
              {alertType === 'success' ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
              <AlertTitle>{alertType === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>)}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className="pl-10 bg-white/70"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                <Input id="monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} required className="pl-10 bg-white/70" placeholder="Ingrese el monto"/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Select value={moneda} onValueChange={setMoneda} required>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Seleccionar moneda"/>
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(monedas) && monedas.map((moneda) => (<SelectItem key={moneda._id} value={moneda._id}>{moneda.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria} required>
                <SelectTrigger className="bg-white/70">
                  <SelectValue placeholder="Seleccionar categoría"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comisiones">Comisiones</SelectItem>
                  <SelectItem value="Recarga">Recarga</SelectItem>
                  <SelectItem value="Envio">Envio</SelectItem>
                  <SelectItem value="Compra Shein">Compra Shein</SelectItem>
                  <SelectItem value="Cobro banco">Cobro banco</SelectItem>
                  <SelectItem value="Salarios">Salarios</SelectItem>
                  <SelectItem value="Cambio">Cambio</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input id="descripcion" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="bg-white/70" placeholder="Ingrese una descripción"/>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Agregando...' : 'Agregar Gasto'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>);
}
