"use client"
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NavigationBarComponent } from '../components/navigation-bar';
import Head from "next/head"; // Importar para modificar el head
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // Para navegar en Next.js
import Link from "next/link";
import { Button } from "@/components/ui/button";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "Liz Moda Shop",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 

{
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para saber si el usuario está logueado

  useEffect(() => {
    // Al cargar el componente, revisamos si hay algo en el localStorage
    const loggedIn = localStorage.getItem('userLoggedIn');
    setIsLoggedIn(loggedIn === 'true');
    
  }, []);

  const pathname = usePathname();

  // El navbar solo debería ser visible si no estamos en la página de login
  if (pathname.includes('login')) {
    return (
      <html lang="es">
        <body>{children}</body>
      </html>
    );
  }

  if (pathname.includes('catalog') &&  localStorage.getItem('userLoggedIn') !== 'true' ) {
    return (
      <html lang="es">
        
        <body>
        <Link href="/login">
          <Button variant="link" className="text-sm text-primary hover:text-primary/80">
            Login
          </Button>
        </Link>
        
          {children}</body>
      </html>
    );
  }
  return (
    <html lang="en">
      <Head>
        {/* Cambiamos el favicon para usar tu propio logo */}
        <link rel="icon" href="/logo.jpg" type="image/jpg" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Fondo con imagen */}
        <div className="min-h-screen bg-cover bg-center" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')"}}
        >
          {/* Hacemos el navbar fijo */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              width: '100%',
              
              zIndex: 1000,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <NavigationBarComponent />
          </div>
          
          {/* Ajustamos el padding-top para evitar que el contenido se superponga con el navbar */}
          <main style={{ paddingTop: '60px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
