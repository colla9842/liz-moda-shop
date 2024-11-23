'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { setCookie } from 'cookies-next';
import Link from 'next/link';
export function LoginViewComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        localStorage.setItem('userLoggedIn', 'false');
        setCookie('userLoggedIn', false);
        try {
            const response = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo_electronico: email, contrasena: password }),
            });
            const data = await response.json();
            if (response.ok) {
                setIsSuccess(true);
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('usuario', email);
                setCookie('userLoggedIn', true);
                // Espera 2 segundos antes de redirigir
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            }
            else {
                setError(data.error);
            }
        }
        catch (error) {
            setError('Ocurrió un error al intentar iniciar sesión');
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')", backgroundRepeat: 'no-repeat' }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <Card className="w-full max-w-md relative z-10 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Iniciar Sesión</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder a su cuenta</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="nombre@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/50"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary">Contraseña</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/50"/>
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (<EyeOff className="h-4 w-4 text-gray-500"/>) : (<Eye className="h-4 w-4 text-gray-500"/>)}
                </Button>
              </div>
            </div>
            {error && (<Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>)}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
              {isLoading ? (<Loader className="mr-2 h-4 w-4 animate-spin"/>) : isSuccess ? (<CheckCircle className="mr-2 h-4 w-4 text-green-500"/>) : null}
              {isLoading ? 'Iniciando sesión...' : isSuccess ? 'Sesión iniciada' : 'Iniciar Sesión'}
            </Button>
            <Link href="/catalog">
              <Button variant="link" className="text-sm text-primary hover:text-primary/80">
                Catálogo
              </Button>
            </Link>
            
          </CardFooter>
        </form>
      </Card>
    </div>);
}
