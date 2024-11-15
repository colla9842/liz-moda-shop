import { NextResponse } from 'next/server';

// Este middleware se ejecuta para todas las rutas
export function middleware(req) {
  // Obtenemos la URL de la solicitud
  const pathname = req.nextUrl.pathname;

  // Si el usuario está en la página de login o catalog, permitimos el acceso
  if (pathname.startsWith('/login') || pathname.startsWith('/catalog')) {
    return NextResponse.next(); // Permite el acceso a estas páginas
  }

  // Verificar si el usuario está logueado (por ejemplo, usando cookies)
  const userLoggedIn = req.cookies.get('userLoggedIn'); // Accedemos a la cookie directamente
  console.log('Usuario logueado>'+userLoggedIn);

  // Si no está logueado, redirigir a login
  if (!userLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl); // Redirige a login si no está logueado
  }

  // Si está logueado, continuar con la solicitud
  return NextResponse.next();
}

// El middleware se aplica a todas las rutas especificadas en el matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
  , // Asegura que el middleware se aplique a las rutas especificadas
};
