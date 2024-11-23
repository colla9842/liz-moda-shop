import React, { useEffect, useState } from 'react';
import { NavigationBarComponent } from './navigation-bar';
const Layout = ({ children }) => {
    const [showNavBar, setShowNavBar] = useState(true);
    useEffect(() => {
        // Verificamos la ruta actual con window.location.pathname
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            // Si estamos en la página de login, no mostrar el navbar
            if (path === '/login') {
                setShowNavBar(false);
            }
            else {
                setShowNavBar(true);
            }
        }
    }, []);
    return (<>
      {showNavBar && <NavigationBarComponent />}
      <main>{children}</main>
    </>);
};
export default Layout;
