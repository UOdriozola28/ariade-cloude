import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import {
  Cloud, Upload, FolderPlus, Search, Home, HardDrive,
  Folder, FileText, Image, Film, Code, Archive, File,
  Download, Trash2, Pencil, X, ChevronRight, Menu,
  LayoutGrid, List, RefreshCw, Eye, Loader,
  FolderUp, FolderInput
} from 'lucide-react'

const API = 'http://localhost:4000/api'

// ============ UTILIDADES ============

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Ahora mismo'
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getFileCategory(ext) {
  const categories = {
    img: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
    doc: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'],
    code: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'go', 'rs', 'php'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  }
  for (const [cat, exts] of Object.entries(categories)) {
    if (exts.includes(ext)) return cat
  }
  return 'default'
}

function FileIcon({ extension, size = 40 }) {
  const category = getFileCategory(extension)
  const icons = {
    img: Image,
    video: Film,
    doc: FileText,
    code: Code,
    archive: Archive,
    default: File,
  }
  const Icon = icons[category]
  return (
    <div className={`file-icon ${category}`} style={{ width: size, height: size }}>
      {extension ? extension.slice(0, 4) : <Icon size={18} />}
    </div>
  )
}

// ============ TOAST SYSTEM ============

let toastId = 0
function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, show }
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  )
}

// ============ COMPONENTES ============

function Modal({ title, onClose, onConfirm, children, confirmText = 'Crear', danger = false }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Preview({ file, onClose }) {
  const cat = getFileCategory(file.extension)
  const url = `http://localhost:4000/files/${file.path}`

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-container" onClick={e => e.stopPropagation()}>
        <button className="preview-close" onClick={onClose}>
          <X size={24} />
        </button>
        {cat === 'img' && <img src={url} alt={file.name} />}
        {cat === 'video' && <video src={url} controls autoPlay />}
        <p className="preview-name">{file.name}</p>
      </div>
    </div>
  )
}

// ============ APP PRINCIPAL ============

export default function App() {
  // Estado
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [storageInfo, setStorageInfo] = useState({ used: 0, totalFiles: 0, disk: { total: 0, free: 0, used: 0 } })
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadInfo, setUploadInfo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [preview, setPreview] = useState(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameTarget, setRenameTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState(null)

  const fileInputRef = useRef()
  const folderInputRef = useRef()
  const { toasts, show: showToast } = useToast()

  // Cargar archivos
  const loadFiles = useCallback(async (path = currentPath) => {
    setLoading(true)
    try {
      const [filesRes, storageRes] = await Promise.all([
        axios.get(`${API}/files`, { params: { path } }),
        axios.get(`${API}/storage`)
      ])
      setFiles(filesRes.data.files || [])
      setFolders(filesRes.data.folders || [])
      setStorageInfo(storageRes.data)
    } catch (err) {
      showToast('Error al cargar archivos', 'error')
    }
    setLoading(false)
  }, [currentPath, showToast])

  useEffect(() => {
    loadFiles(currentPath)
    setSearchResults(null)
    setSearchQuery('')
  }, [currentPath])

  // Navegación
  const navigateTo = (path) => {
    setCurrentPath(path)
    setSidebarOpen(false)
  }

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : []

  // Subir archivos (soporta archivos sueltos y carpetas completas)
  const handleUpload = async (fileList, isFolder = false) => {
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setUploadInfo({ total: fileList.length, current: 0, folderName: '' })

    // Detectar si son archivos de carpeta (tienen webkitRelativePath)
    const firstFile = fileList[0]
    const isFolderUpload = isFolder || (firstFile.webkitRelativePath && firstFile.webkitRelativePath.includes('/'))

    if (isFolderUpload && firstFile.webkitRelativePath) {
      const folderName = firstFile.webkitRelativePath.split('/')[0]
      setUploadInfo(prev => ({ ...prev, folderName }))
    }

    // Subir en lotes de 20 archivos para no saturar
    const BATCH_SIZE = 20
    const files = Array.from(fileList)
    let uploaded = 0

    try {
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE)
        const formData = new FormData()

        batch.forEach(f => {
          // Si el archivo tiene ruta relativa (viene de carpeta), preservarla
          const name = f.webkitRelativePath || f.name
          formData.append('files', f, name)
        })

        formData.append('path', currentPath)

        await axios.post(`${API}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const batchProgress = Math.round((e.loaded * 100) / e.total)
            const totalProgress = Math.round(((uploaded + (batch.length * batchProgress / 100)) / files.length) * 100)
            setUploadProgress(Math.min(totalProgress, 99))
          }
        })

        uploaded += batch.length
        setUploadInfo(prev => ({ ...prev, current: uploaded }))
        setUploadProgress(Math.round((uploaded / files.length) * 100))
      }

      setUploadProgress(100)

      if (isFolderUpload) {
        const folderName = files[0].webkitRelativePath?.split('/')[0] || 'carpeta'
        showToast(`📁 Carpeta "${folderName}" subida (${files.length} archivos)`)
      } else {
        showToast(`${files.length} archivo(s) subido(s)`)
      }

      loadFiles(currentPath)
    } catch (err) {
      showToast('Error al subir archivos', 'error')
    }
    setUploading(false)
    setUploadInfo(null)
  }

  // Drag & Drop (soporta carpetas)
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragging(false)

    // Intentar obtener items del DataTransfer (soporta carpetas en Chrome/Edge)
    const items = e.dataTransfer.items
    if (items && items.length > 0) {
      const fileEntries = []

      const readEntry = (entry) => {
        return new Promise((resolve) => {
          if (entry.isFile) {
            entry.file(file => {
              // Preservar la ruta relativa
              Object.defineProperty(file, 'webkitRelativePath', {
                value: entry.fullPath.slice(1), // quitar el "/" inicial
                writable: false,
              })
              fileEntries.push(file)
              resolve()
            })
          } else if (entry.isDirectory) {
            const reader = entry.createReader()
            const readAllEntries = (allEntries = []) => {
              reader.readEntries(async (entries) => {
                if (entries.length === 0) {
                  // Procesamos todas las entradas
                  for (const e of allEntries) {
                    await readEntry(e)
                  }
                  resolve()
                } else {
                  readAllEntries([...allEntries, ...entries])
                }
              })
            }
            readAllEntries()
          } else {
            resolve()
          }
        })
      }

      const promises = []
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.() || items[i].getAsEntry?.()
        if (entry) {
          promises.push(readEntry(entry))
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises)
        if (fileEntries.length > 0) {
          handleUpload(fileEntries, true)
          return
        }
      }
    }

    // Fallback: archivos normales
    handleUpload(e.dataTransfer.files)
  }

  // Búsqueda
  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    try {
      const res = await axios.get(`${API}/search`, { params: { q: query } })
      setSearchResults(res.data.results)
    } catch (err) {
      showToast('Error en la búsqueda', 'error')
    }
  }

  // Crear carpeta
  const createFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await axios.post(`${API}/folder`, { name: newFolderName, path: currentPath })
      showToast(`Carpeta "${newFolderName}" creada`)
      setShowNewFolder(false)
      setNewFolderName('')
      loadFiles(currentPath)
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al crear carpeta', 'error')
    }
  }

  // Eliminar
  const deleteItem = async (itemPath) => {
    try {
      await axios.delete(`${API}/files`, { data: { path: itemPath } })
      showToast('Eliminado correctamente')
      loadFiles(currentPath)
    } catch (err) {
      showToast('Error al eliminar', 'error')
    }
    setContextMenu(null)
  }

  // Renombrar
  const doRename = async () => {
    if (!renameValue.trim()) return
    try {
      await axios.put(`${API}/files/rename`, {
        oldPath: renameTarget.path,
        newName: renameValue
      })
      showToast('Renombrado correctamente')
      setRenameTarget(null)
      setRenameValue('')
      loadFiles(currentPath)
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al renombrar', 'error')
    }
  }

  // Descargar
  const downloadFile = (filePath) => {
    window.open(`${API}/download?path=${encodeURIComponent(filePath)}`, '_blank')
    setContextMenu(null)
  }

  // Preview
  const canPreview = (ext) => {
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov'].includes(ext)
  }

  // Context menu
  const handleContextMenu = (e, item, isFolder = false) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      isFolder
    })
  }

  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // ============ RENDER ============

  return (
    <div className="app-layout">
      <ToastContainer toasts={toasts} />

      {/* Sidebar */}
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

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>

          <div className="search-bar">
            <Search />
            <input
              type="text"
              placeholder="Buscar archivos y carpetas..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button
              className={`btn btn-ghost`}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              title={viewMode === 'grid' ? 'Vista lista' : 'Vista cuadrícula'}
            >
              {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
            </button>
            <button className="btn btn-ghost" onClick={() => loadFiles(currentPath)} title="Recargar">
              <RefreshCw size={18} />
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNewFolder(true)}>
              <FolderPlus size={16} /> Nueva carpeta
            </button>
            <button className="btn btn-secondary" onClick={() => folderInputRef.current?.click()}>
              <FolderInput size={16} /> Subir carpeta
            </button>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Subir archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={e => { handleUpload(e.target.files); e.target.value = ''; }}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              webkitdirectory=""
              directory=""
              style={{ display: 'none' }}
              onChange={e => { handleUpload(e.target.files, true); e.target.value = ''; }}
            />
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="breadcrumb-bar">
          <button
            className={`breadcrumb-item ${pathParts.length === 0 ? 'active' : ''}`}
            onClick={() => navigateTo('')}
          >
            <HardDrive size={14} /> Mi Nube
          </button>
          {pathParts.map((part, i) => {
            const path = pathParts.slice(0, i + 1).join('/')
            const isLast = i === pathParts.length - 1
            return (
              <span key={path} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronRight size={12} className="breadcrumb-sep" />
                <button
                  className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                  onClick={() => !isLast && navigateTo(path)}
                >
                  {part}
                </button>
              </span>
            )
          })}
        </div>

        {/* Content */}
        <div className="content-area">
          {/* Drop Zone */}
          <div
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* <CloudUpload className="drop-icon" size={48} /> */}
            <p>
              Arrastra tus <strong>archivos o carpetas</strong> aquí, o{' '}
              <span className="drop-highlight">haz clic para seleccionar</span>
            </p>
            <span className="drop-hint">
              Soporta carpetas completas · Hasta 2GB por archivo
            </span>
          </div>

          {/* Search Results */}
          {searchResults !== null ? (
            <>
              <div className="search-results-header">
                <h2>Resultados de búsqueda</h2>
                <span className="result-count">{searchResults.length} encontrado(s)</span>
                <button
                  className="btn btn-ghost"
                  onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                  style={{ marginLeft: 'auto' }}
                >
                  <X size={16} /> Limpiar
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="empty-state">
                  <Search size={64} />
                  <p>No se encontraron resultados para "{searchQuery}"</p>
                </div>
              ) : (
                <div className={`file-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {searchResults.map(item => (
                    item.isFolder ? (
                      <div
                        key={item.path}
                        className="folder-card"
                        onClick={() => { navigateTo(item.path); setSearchResults(null); setSearchQuery(''); }}
                      >
                        <div className="folder-icon"><Folder size={20} /></div>
                        <div className="folder-info">
                          <div className="folder-name">{item.name}</div>
                          <div className="folder-count">Carpeta</div>
                        </div>
                      </div>
                    ) : (
                      <div key={item.path} className="file-card">
                        <div className="file-card-header">
                          <FileIcon extension={item.extension} />
                          <span className="file-name" title={item.name}>{item.name}</span>
                        </div>
                        <div className="file-meta">
                          <span className="file-size">{formatBytes(item.size)}</span>
                          <span className="file-date">{formatDate(item.modified)}</span>
                        </div>
                        <div className="file-actions">
                          <button className="file-action-btn" onClick={() => downloadFile(item.path)} title="Descargar">
                            <Download />
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </>
          ) : loading ? (
            <div className="empty-state">
              <Loader size={48} className="animate-spin" />
              <p>Cargando archivos...</p>
            </div>
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <>
                  <div className="section-title">Carpetas ({folders.length})</div>
                  <div className="folder-grid">
                    {folders.map(folder => (
                      <div
                        key={folder.path}
                        className="folder-card"
                        onClick={() => navigateTo(folder.path)}
                        onContextMenu={e => handleContextMenu(e, folder, true)}
                      >
                        <div className="folder-icon"><Folder size={20} /></div>
                        <div className="folder-info">
                          <div className="folder-name">{folder.name}</div>
                          <div className="folder-count">
                            {folder.itemCount} {folder.itemCount === 1 ? 'elemento' : 'elementos'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Files */}
              {files.length > 0 && (
                <>
                  <div className="section-title">Archivos ({files.length})</div>
                  <div className={`file-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {files.map(file => (
                      <div
                        key={file.path}
                        className="file-card"
                        onContextMenu={e => handleContextMenu(e, file, false)}
                        onDoubleClick={() => canPreview(file.extension) && setPreview(file)}
                      >
                        <div className="file-card-header">
                          <FileIcon extension={file.extension} />
                          <span className="file-name" title={file.name}>{file.name}</span>
                        </div>
                        <div className="file-meta">
                          <span className="file-size">{formatBytes(file.size)}</span>
                          <span className="file-date">{formatDate(file.modified)}</span>
                        </div>
                        <div className="file-actions">
                          {canPreview(file.extension) && (
                            <button className="file-action-btn" onClick={() => setPreview(file)} title="Ver">
                              <Eye />
                            </button>
                          )}
                          <button className="file-action-btn" onClick={() => downloadFile(file.path)} title="Descargar">
                            <Download />
                          </button>
                          <button
                            className="file-action-btn"
                            onClick={() => { setRenameTarget(file); setRenameValue(file.name); }}
                            title="Renombrar"
                          >
                            <Pencil />
                          </button>
                          <button
                            className="file-action-btn danger"
                            onClick={() => { if (confirm(`¿Eliminar "${file.name}"?`)) deleteItem(file.path) }}
                            title="Eliminar"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Empty */}
              {folders.length === 0 && files.length === 0 && (
                <div className="empty-state">
                  <Cloud size={64} />
                  <p>Esta carpeta está vacía</p>
                  <p style={{ marginTop: 8 }}>Arrastra archivos o haz clic en "Subir" para comenzar</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Upload Progress */}
      {uploading && (
        <div className="upload-overlay">
          <h4>
            {uploadInfo?.folderName
              ? <><FolderUp size={16} /> Subiendo carpeta "{uploadInfo.folderName}"...</>
              : <><Upload size={16} /> Subiendo archivos...</>
            }
          </h4>
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <div className="upload-progress-text">
            {uploadProgress}%
            {uploadInfo && uploadInfo.total > 1 && (
              <span> · {uploadInfo.current}/{uploadInfo.total} archivos</span>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && <Preview file={preview} onClose={() => setPreview(null)} />}

      {/* New Folder Modal */}
      {showNewFolder && (
        <Modal
          title="Nueva carpeta"
          onClose={() => { setShowNewFolder(false); setNewFolderName(''); }}
          onConfirm={createFolder}
        >
          <input
            autoFocus
            placeholder="Nombre de la carpeta"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createFolder()}
          />
        </Modal>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <Modal
          title="Renombrar"
          onClose={() => { setRenameTarget(null); setRenameValue(''); }}
          onConfirm={doRename}
          confirmText="Renombrar"
        >
          <input
            autoFocus
            placeholder="Nuevo nombre"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doRename()}
          />
        </Modal>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.isFolder ? (
            <>
              <button
                className="context-menu-item"
                onClick={() => { navigateTo(contextMenu.item.path); setContextMenu(null); }}
              >
                <Folder size={15} /> Abrir
              </button>
              <button
                className="context-menu-item"
                onClick={() => {
                  setRenameTarget(contextMenu.item)
                  setRenameValue(contextMenu.item.name)
                  setContextMenu(null)
                }}
              >
                <Pencil size={15} /> Renombrar
              </button>
              <button
                className="context-menu-item danger"
                onClick={() => {
                  if (confirm(`¿Eliminar carpeta "${contextMenu.item.name}" y todo su contenido?`)) {
                    deleteItem(contextMenu.item.path)
                  }
                }}
              >
                <Trash2 size={15} /> Eliminar
              </button>
            </>
          ) : (
            <>
              {canPreview(contextMenu.item.extension) && (
                <button
                  className="context-menu-item"
                  onClick={() => { setPreview(contextMenu.item); setContextMenu(null); }}
                >
                  <Eye size={15} /> Vista previa
                </button>
              )}
              <button
                className="context-menu-item"
                onClick={() => downloadFile(contextMenu.item.path)}
              >
                <Download size={15} /> Descargar
              </button>
              <button
                className="context-menu-item"
                onClick={() => {
                  setRenameTarget(contextMenu.item)
                  setRenameValue(contextMenu.item.name)
                  setContextMenu(null)
                }}
              >
                <Pencil size={15} /> Renombrar
              </button>
              <button
                className="context-menu-item danger"
                onClick={() => {
                  if (confirm(`¿Eliminar "${contextMenu.item.name}"?`)) {
                    deleteItem(contextMenu.item.path)
                  }
                }}
              >
                <Trash2 size={15} /> Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
