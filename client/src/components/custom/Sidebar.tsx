import { Folder, Home } from "lucide-react"
import { formatBytes } from "../../utils/helpers"
import type { DataFolders, StorageInfo } from "../../types"
import { useSidebar } from "../../cloud/context/SidebarContext"

interface Props {
  currentPath: string,
  storageInfo: StorageInfo,
  folders: DataFolders,
  navigateTo: (path: string) => void
}

export const Sidebar = ({ currentPath, storageInfo, folders, navigateTo }: Props) => {

  const { sidebarOpen } = useSidebar()

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">☁️</div>
          <h1>Mi Nube</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navegación</div>
        <button
          className={`nav-item ${currentPath === '' ? 'active' : ''}`}
          onClick={() => navigateTo('')}
        >
          <Home size={18} /> Inicio
        </button>

        {folders.length > 0 && (
          <>
            <div className="nav-label" style={{ marginTop: 16 }}>Carpetas</div>
            {folders.map(f => (
              <button
                key={f.path}
                className="nav-item"
                onClick={() => navigateTo(f.path)}
              >
                <Folder size={18} /> {f.name}
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="storage-info">
        <div className="storage-label">Almacenamiento</div>
        <div className="storage-bar">
          {(() => {
            const pct = storageInfo.disk.total > 0
              ? Math.round((storageInfo.disk.used / storageInfo.disk.total) * 100)
              : 0
            const colorClass = pct > 90 ? 'danger' : pct > 70 ? 'warning' : ''
            return (
              <div
                className={`storage-bar-fill ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            )
          })()}
        </div>
        <div className="storage-text">
          {storageInfo.disk.total > 0 ? (
            <>
              {formatBytes(storageInfo.disk.used)} / {formatBytes(storageInfo.disk.total)}
            </>
          ) : (
            <>{formatBytes(storageInfo.used)} usado</>
          )}
        </div>
        <div className="storage-text" style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
          {formatBytes(storageInfo.disk.free || 0)} libre · {storageInfo.totalFiles} archivos
        </div>
      </div>
    </aside>
  )
}
