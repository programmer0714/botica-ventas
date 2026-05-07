import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar  from './TopBar.jsx'
import styles  from './Layout.module.css'

export default function Layout() {
  return (
    <div className="app-layout">
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
