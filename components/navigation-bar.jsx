"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronDown, Home, FileText, DollarSign, Package, User, LogOut, X } from 'lucide-react';
import { deleteCookie } from "cookies-next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const NavItem = React.memo(({ href, children, icon: Icon, onClick }) => (
  <Link
    href={href}
    className="flex items-center space-x-2 text-gray-200 hover:text-white transition-colors duration-200"
    onClick={onClick}
  >
    <Icon className="w-5 h-5" />
    <span>{children}</span>
  </Link>
));

NavItem.displayName = "NavItem";

const NavDropdown = React.memo(({ title, items, icon: Icon, closeMenu }) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 text-gray-200 hover:text-white hover:bg-white/10">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gradient-to-br from-[#FF885B] to-[#FF5722] border-gray-700" sideOffset={5}>
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            className="focus:bg-white/20"
            onSelect={() => {
              router.push(item.href);
              closeMenu();
            }}
          >
            <div className="flex items-center space-x-2 w-full text-gray-200 hover:text-white">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NavDropdown.displayName = "NavDropdown";

export function NavigationBarComponent() {
  const [usuario, setUsuario] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("userLoggedIn");
    const user = localStorage.getItem("usuario");
    if (user) {
      setUsuario(user);
    }
    setIsLoggedIn(loggedIn === "true");

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    deleteCookie("userLoggedIn");
    window.location.href = "/login";
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    {
      title: "Reportes",
      icon: FileText,
      items: [
        { href: "/cuentas", label: "Resumen de las Cuentas" },
        { href: "/reporte_mensual", label: "Reporte Mensual" },
        { href: "/gasto_categoria", label: "Gastos por categoría" },
      ],
    },
    {
      title: "Cuentas",
      icon: DollarSign,
      items: [
        { href: "/venta", label: "Registrar Venta" },
        { href: "/ingreso_extra", label: "Ingreso Extra" },
        { href: "/gastos", label: "Registrar Gasto" },
        { href: "/cambio", label: "Cambio de Divisas" },
      ],
    },
    {
      title: "Productos",
      icon: Package,
      items: [
        { href: "/addProduct", label: "Añadir Artículo" },
        { href: "/editar-producto", label: "Editar Productos" },
        { href: "/catalog", label: "Catálogo" },
      ],
    },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FF885B]/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <motion.span
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Liz Moda Shop
              </motion.span>
            </Link>
          </div>
          <div className="hidden lg:ml-6 lg:flex lg:items-center space-x-4">
            {navItems.map((item, index) =>
              item.items ? (
                <NavDropdown key={index} {...item} closeMenu={closeMenu} />
              ) : (
                <NavItem key={index} href={item.href} icon={item.icon}>
                  {item.label}
                </NavItem>
              )
            )}
          </div>
          <div className="hidden lg:flex lg:items-center">
            {usuario ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-white/10"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Sesión
              </Button>
            ) : (
              <Button asChild variant="ghost" className="text-gray-200 hover:text-white hover:bg-white/10">
                <Link href="/login">
                  <User className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-gray-200 hover:text-white hover:bg-white/10">
                  <span className="sr-only">Abrir menú principal</span>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] bg-gradient-to-br from-[#FF885B] to-[#FF5722] border-gray-700"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Menú</h2>
                  <Button
                    variant="ghost"
                    className="text-gray-200 hover:text-white hover:bg-white/10"
                    onClick={closeMenu}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex flex-col space-y-4">
                  <AnimatePresence>
                    {navItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {item.items ? (
                          <NavDropdown {...item} closeMenu={closeMenu} />
                        ) : (
                          <NavItem href={item.href} icon={item.icon} onClick={closeMenu}>
                            {item.label}
                          </NavItem>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {usuario ? (
                    <motion.button
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: navItems.length * 0.1 }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Cerrar Sesión</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: navItems.length * 0.1 }}
                    >
                      <Link
                        href="/login"
                        className="flex items-center space-x-2 text-gray-200 hover:text-white"
                        onClick={closeMenu}
                      >
                        <User className="w-5 h-5" />
                        <span>Iniciar Sesión</span>
                      </Link>
                    </motion.div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

