"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowUpDown, Edit2, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "./ui/tabs";
const API_BASE_URL = '';
const api = axios.create({ baseURL: API_BASE_URL });
const PAGE_SIZE = 25;
export function CuentasTableComponent() {
    const [cuentas, setCuentas] = useState([]);
    const [monedas, setMonedas] = useState([]);
    const [tasaCambioUSD, setTasaCambioUSD] = useState(1);
    const [activeTab, setActiveTab] = useState('ingresos');
    const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        monto: 0, // Valor por defecto para el monto
        moneda: monedas[0] || {}, // La primera moneda de la lista o un objeto vacío
        descripcion: '', // Valor por defecto para la descripción
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cuentasResponse, monedasResponse] = await Promise.all([
                    api.get('/api/cuentas'),
                    api.get('/api/monedas')
                ]);
                setCuentas(cuentasResponse.data);
                setMonedas(monedasResponse.data);
                const usdMoneda = monedasResponse.data.find(m => m.nombre === 'USD');
                if (usdMoneda)
                    setTasaCambioUSD(usdMoneda.tasaCambio);
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    };
    const handlePageClick = (page) => {
        setCurrentPage(page);
    };
    const handleEdit = (cuenta) => {
        setEditingId(cuenta._id);
        setEditForm({
            moneda: cuenta.moneda,
            monto: cuenta.monto,
            descripcion: cuenta.descripcion
        });
    };
    const handleSave = async (id) => {
        try {
            // Paso 1: Hacer la solicitud PUT con los datos en el cuerpo
            await api.put('/api/cuentas', Object.assign({ id }, editForm // Incluimos los datos actualizados
            ), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Paso 2: Actualizar localmente la lista de cuentas
            const updatedCuentas = cuentas.map(cuenta => cuenta._id === id
                ? Object.assign(Object.assign(Object.assign({}, cuenta), editForm), { moneda: { nombre: editForm.moneda.nombre } }) : cuenta);
            // Paso 3: Actualizar el estado de cuentas
            setCuentas(updatedCuentas);
            // Paso 4: Resetear el estado de edición
            setEditingId(null);
            console.log('Cuenta actualizada correctamente');
        }
        catch (error) {
            // Manejo de errores
            console.error('Error al actualizar la cuenta:', error);
        }
    };
    const handleCancel = () => {
        setEditingId(null);
        setEditForm({
            monto: 0, // Valor por defecto para el monto
            moneda: monedas[0] || {}, // La primera moneda de la lista o un objeto vacío
            descripcion: '', // Valor por defecto para la descripción
        });
    };
    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/cuentas`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                data: { id } // enviar el id en el cuerpo de la solicitud
            });
            setCuentas(cuentas.filter(cuenta => cuenta._id !== id));
            console.log('Cuenta eliminada exitosamente');
        }
        catch (error) {
            console.error('Error al eliminar la cuenta:', error);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleSelectChange = (value) => {
        setEditForm(prev => (Object.assign(Object.assign({}, prev), { moneda: value })));
    };
    const filterCuentas = (cuentas) => {
        return cuentas.filter(cuenta => {
            const searchTermLower = searchTerm.toLowerCase();
            return (cuenta.descripcion.toLowerCase().includes(searchTermLower) ||
                cuenta.moneda.nombre.toLowerCase().includes(searchTermLower));
        });
    };
    const sortCuentas = (cuentas) => {
        return [...cuentas].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };
    const ingresos = cuentas.filter(cuenta => cuenta.tipo.toLowerCase() === 'ingreso');
    const gastos = cuentas.filter(cuenta => cuenta.tipo.toLowerCase() === 'gasto');
    const sortedIngresos = sortCuentas(filterCuentas(ingresos));
    const sortedGastos = sortCuentas(filterCuentas(gastos));
    const convertirAUSD = (montoCUP) => montoCUP / tasaCambioUSD;
    const calcularTotalesPorMoneda = (cuentas) => {
        return cuentas.reduce((acc, cuenta) => {
            var _a;
            const moneda = cuenta.moneda.nombre;
            if (!acc[moneda]) {
                acc[moneda] = { total: 0, monto: 0 };
            }
            acc[moneda].total += cuenta.monto * (((_a = monedas.find(m => m.nombre === moneda)) === null || _a === void 0 ? void 0 : _a.tasaCambio) || 1);
            acc[moneda].monto += cuenta.monto;
            return acc;
        }, {});
    };
    const calcularTotalUSD = (totalesPorMoneda) => {
        return Object.keys(totalesPorMoneda).reduce((totalUSD, moneda) => {
            const totalCUP = totalesPorMoneda[moneda].total || 0;
            return totalUSD + convertirAUSD(totalCUP);
        }, 0).toFixed(2);
    };
    const ingresosPorMoneda = calcularTotalesPorMoneda(ingresos);
    const gastosPorMoneda = calcularTotalesPorMoneda(gastos);
    const renderTable = (data) => (<Card className="bg-gray-800/70 backdrop-blur-md shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Input type="text" placeholder="Buscar por descripción o moneda" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm bg-gray-700/50 text-white placeholder-gray-400"/>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-700">
                <TableHead onClick={() => handleSort('fecha')} className="cursor-pointer text-gray-300">
                  Fecha <ArrowUpDown className="ml-2 h-4 w-4 inline"/>
                </TableHead>
                <TableHead onClick={() => handleSort('tipo')} className="cursor-pointer text-gray-300">
                  Tipo <ArrowUpDown className="ml-2 h-4 w-4 inline"/>
                </TableHead>
                <TableHead onClick={() => handleSort('monto')} className="cursor-pointer text-gray-300">
                  Monto <ArrowUpDown className="ml-2 h-4 w-4 inline"/>
                </TableHead>
                <TableHead onClick={() => handleSort('moneda.nombre')} className="cursor-pointer text-gray-300">
                  Moneda <ArrowUpDown className="ml-2 h-4 w-4 inline"/>
                </TableHead>
                <TableHead className="text-gray-300">Tasa de Cambio</TableHead>
                <TableHead onClick={() => handleSort('descripcion')} className="cursor-pointer text-gray-300">
                  Descripción <ArrowUpDown className="ml-2 h-4 w-4 inline"/>
                </TableHead>
                <TableHead className="text-gray-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody(data)}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(data.length / PAGE_SIZE) }, (_, i) => (<Button key={i} onClick={() => handlePageClick(i)} variant={currentPage === i ? "secondary" : "outline"} className="mx-1 bg-gray-700/50 text-white hover:bg-gray-600/50">
              {i + 1}
            </Button>))}
        </div>
      </CardContent>
    </Card>);
    const renderTableBody = (data) => {
        const startIndex = currentPage * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedData = data.slice(startIndex, endIndex);
        return paginatedData.map((cuenta) => {
            var _a;
            return (<TableRow key={cuenta._id} className="border-b border-gray-700">
        <TableCell className="text-gray-300">{format(new Date(cuenta.fecha), 'dd/MM/yyyy')}</TableCell>
        <TableCell className="text-gray-300">{cuenta.tipo}</TableCell>
        <TableCell className="text-gray-300">
          {editingId === cuenta._id ? (<Input type="number" name="monto" value={editForm.monto} onChange={handleInputChange} className="bg-gray-700/50 text-white"/>) : (cuenta.monto)}
        </TableCell>
        <TableCell className="text-gray-300">
          {editingId === cuenta._id ? (<Select value={editForm.moneda} onValueChange={handleSelectChange}>
              <SelectTrigger className="bg-gray-700/50 text-white border-gray-600">
                <SelectValue placeholder="Seleccionar moneda"/>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                {monedas.map(moneda => (<SelectItem key={moneda._id} value={moneda}>
                    {moneda.nombre}
                  </SelectItem>))}
              </SelectContent>
            </Select>) : (cuenta.moneda.nombre)}
        </TableCell>
        <TableCell className="text-gray-300">
          {((_a = monedas.find(m => m.nombre === cuenta.moneda.nombre)) === null || _a === void 0 ? void 0 : _a.tasaCambio.toFixed(2)) || 'N/A'}
        </TableCell>
        <TableCell className="text-gray-300">
          {editingId === cuenta._id ? (<Input type="text" name="descripcion" value={editForm.descripcion} onChange={handleInputChange} className="bg-gray-700/50 text-white"/>) : (cuenta.descripcion)}
        </TableCell>
        <TableCell className="flex gap-2">
          {editingId === cuenta._id ? (<>
              <Button onClick={() => handleSave(cuenta._id)} size="icon" variant="outline">
                <Save className="h-4 w-4"/>
              </Button>
              <Button onClick={handleCancel} size="icon" variant="outline">
                <X className="h-4 w-4"/>
              </Button>
            </>) : (<>
              <Button onClick={() => handleEdit(cuenta)} size="icon" variant="outline">
                <Edit2 className="h-4 w-4"/>
              </Button>
              <Button onClick={() => handleDelete(cuenta._id)} size="icon" variant="outline">
                <Trash2 className="h-4 w-4"/>
              </Button>
            </>)}
        </TableCell>
      </TableRow>);
        });
    };
    const renderTotales = (title, data) => (<Card className="bg-gray-800/70 backdrop-blur-md shadow-md mb-6">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className="text-gray-300">Moneda</TableHead>
              <TableHead className="text-gray-300">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(data).map(moneda => (<TableRow key={moneda} className="border-b border-gray-700">
                <TableCell className="text-gray-300">{moneda}</TableCell>
                <TableCell className="text-gray-300">
                  {data[moneda].monto}
                </TableCell>
              </TableRow>))}
             <TableRow className="border-b border-gray-700">
            <TableCell className="font-bold text-white">Total USD</TableCell>
            <TableCell className="font-bold text-white">{calcularTotalUSD(data)}</TableCell>
          </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>);
    return (<div className="container mx-auto py-10 px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-800/70 backdrop-blur-md">
          <TabsTrigger value="ingresos" className="text-gray-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Ingresos</TabsTrigger>
          <TabsTrigger value="gastos" className="text-gray-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Gastos</TabsTrigger>
          <TabsTrigger value="totales" className="text-gray-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Totales</TabsTrigger>
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
    </div>);
}
