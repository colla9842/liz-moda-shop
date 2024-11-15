"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Home, FileText, DollarSign, Package, User, LogOut } from 'lucide-react'
import { deleteCookie  } from 'cookies-next'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function NavigationBarComponent() {
  const [usuario, setUsuario] = useState('')
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para saber si el usuario está logueado
  
  useEffect(() => {
    // Al cargar el componente, revisamos si hay algo en el localStorage
    const loggedIn = localStorage.getItem('userLoggedIn');
    const user = localStorage.getItem('usuario');

    if(user){
      setUsuario(user);
    }

    setIsLoggedIn(loggedIn === 'true');
  }, []);

  

  
  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn'); // Eliminar la marca de usuario logueado
    deleteCookie ('userLoggedIn');
    window.location.href = '/login'; // Redirigir al login
  };

  const NavItem = useCallback(({ href, children, icon: Icon }) => (
    <Link href={href} className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors duration-200">
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </Link>
  ), [])

  const NavDropdown = useCallback(({ title, items, icon: Icon }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 text-gray-200 hover:text-white hover:bg-white/10">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#FF885B]/60 border-gray-700" sideOffset={5}>
        {items.map((item, index) => (
          <DropdownMenuItem key={index} className="focus:bg-gray-700/50" onSelect={() => router.push(item.href)}>
            <div className="flex items-center space-x-2 w-full text-gray-200 hover:text-white">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ), [router])

  return (
    <nav className="bg-[#FF885B]/60 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-white">Liz Moda Shop</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <NavItem href="/" icon={Home}>Home</NavItem>
            <NavDropdown
              title="Reportes"
              icon={FileText}
              items={[
                { href: "/cuentas", label: "Resumen de las Cuentas" },
                { href: "/reporte_mensual", label: "Reporte Mensual" },
                { href: "/gasto_categoria", label: "Gastos por categoría" },
              ]}
            />
            <NavDropdown
              title="Cuentas"
              icon={DollarSign}
              items={[
                { href: "/venta", label: "Registrar Venta" },
                { href: "/ingreso_extra", label: "Ingreso Extra" },
                { href: "/gastos", label: "Registrar Gasto" },
                { href: "/cambio", label: "Cambio de Divisas" },
              ]}
            />
            <NavDropdown
              title="Productos"
              icon={Package}
              items={[
                { href: "/addProduct", label: "Añadir Artículo" },
                { href: "/editar-producto", label: "Editar Productos" },
                { href: "/catalog", label: "Catálogo" },
              ]}
            />
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-gray-200 hover:text-white hover:bg-white/10">
                    <User className="w-5 h-5" />
                    <span>{usuario}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800/90 border-gray-700" sideOffset={5}>
                  <DropdownMenuItem className="focus:bg-gray-700/50" onSelect={handleLogout}>
                    <div className="flex items-center space-x-2 w-full text-red-400 hover:text-red-300">
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium">
                Iniciar Sesión
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-gray-200 hover:text-white hover:bg-white/10">
                  <span className="sr-only">Abrir menú principal</span>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-800/90 border-gray-700">
                <nav className="flex flex-col space-y-4">
                  <NavItem href="/" icon={Home}>Home</NavItem>
                  <NavDropdown
                    title="Reportes"
                    icon={FileText}
                    items={[
                      { href: "/cuentas", label: "Resumen de las Cuentas" },
                      { href: "/reporte_mensual", label: "Reporte Mensual" },
                      { href: "/gasto_categoria", label: "Gastos por categoría" },
                    ]}
                  />
                  <NavDropdown
                    title="Cuentas"
                    icon={DollarSign}
                    items={[
                      { href: "/venta", label: "Registrar Venta" },
                      { href: "/ingreso_extra", label: "Ingreso Extra" },
                      { href: "/gastos", label: "Registrar Gasto" },
                      { href: "/cambio", label: "Cambio de Divisas" },
                    ]}
                  />
                  <NavDropdown
                    title="Productos"
                    icon={Package}
                    items={[
                      { href: "/addProduct", label: "Añadir Artículo" },
                      { href: "/editar-producto", label: "Editar Productos" },
                      { href: "/catalog", label: "Catálogo" },
                    ]}
                  />
                  {usuario ? (
                    <>
                      <Link href="/perfil" className="flex items-center space-x-2 text-gray-200 hover:text-white">
                        <User className="w-5 h-5" />
                        <span>Perfil</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="flex items-center space-x-2 text-gray-200 hover:text-white">
                      <User className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}