import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar  from './TopBar.jsx'
import styles  from './Layout.module.css'

// Imágenes de fondo
import bg1 from '../assets/images/pexels-cottonbro-5722159.jpg'
import bg2 from '../assets/images/pexels-mikhail-nilov-27914820.jpg'
import bg3 from '../assets/images/pexels-n-voitkevich-6942008.jpg'
import bg4 from '../assets/images/pexels-pavel-danilyuk-5998493.jpg'

export default function Layout() {
  const location = useLocation();

  // Mapeo de imágenes por ruta
  const getBgImage = () => {
    switch (location.pathname) {
      case '/dashboard': return bg1;
      case '/ventas':    return bg2;
      case '/inventario': return bg3;
      case '/reportes':   return bg4;
      default: return bg1;
    }
  };

  return (
    <div className="app-layout">
      {/* FONDO DINÁMICO DE SISTEMA (UNA IMAGEN POR SECCIÓN) */}
      <div className={styles.appBackground}>
        <img src={getBgImage()} alt="" className={styles.singleBg} />
        <div className={styles.bgSilverOverlay} />
      </div>

      <div className={styles.systemOverlay} />
      <Sidebar />
      <div className={styles.main}>
        <TopBar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
