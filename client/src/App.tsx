import axios from 'axios'
import { useToast } from './hooks/useToast'
import { Modal } from './components/custom/Modal'
import { Header } from './cloud/components/Header'
import { Toasts } from './components/custom/Toasts'
import { Sidebar } from './components/custom/Sidebar'
import { Preview } from './components/custom/Preview'
import { DropZone } from './cloud/components/DropZone'
import { FileGrid } from './cloud/components/FileGrid'
import { useSearch } from './cloud/context/SearchContext'
import { Breadcrum } from './components/custom/Breadcrum'
import { FolderGrid } from './cloud/components/FolderGrid'
import { useSidebar } from './cloud/context/SidebarContext'
import { ContextMenu } from './cloud/components/ContextMenu'
import { Cloud, Upload, Loader, FolderUp } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { SearchResults } from './cloud/components/SearchResults'
import { deleteFileAction } from './cloud/actions/delete-file.action'
import { renameItemAction } from './cloud/actions/rename-item.action'
import { postNewFolderAction } from './cloud/actions/post-new-folder.action'
import { getResultSearchAction } from './cloud/actions/get-results-search.action'
import type { ContextMenuProp, DataFiles, DataFolders, DataSearchs, FileData, SearchData, StorageInfo, UploadInfo } from './types'

const API = import.meta.env.VITE_PUBLIC_URL + "/api"

type FileWithRelativePath = File & { webkitRelativePath?: string };

declare global {
  interface FileSystemEntry {
    readonly isFile: boolean;
    readonly isDirectory: boolean;
    readonly fullPath: string;
    file(callback: (file: File) => void): void;
    createReader?(): {
      readEntries(callback: (entries: FileSystemEntry[]) => void): void;
    };
  }
}

export const App = () => {

  // Estados
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState<DataFiles>([])
  const [folders, setFolders] = useState<DataFolders>([])
  const [loading, setLoading] = useState(true)
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ used: 0, totalFiles: 0, disk: { total: 0, free: 0, used: 0 } })
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadInfo, setUploadInfo] = useState<UploadInfo | null>(null)
  const [searchResults, setSearchResults] = useState<DataSearchs | null>(null)
  const [preview, setPreview] = useState<FileData | null>(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameTarget, setRenameTarget] = useState<FileData | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuProp | null>(null)
  const { handleChangeSidebarOpen } = useSidebar()
  const { searchQuery, handleChangeSearchQuery } = useSearch()
  const { toasts, showToast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleChangeContextMenu = () => {
    setContextMenu(null);
  }

  const handleChangePreviewToContextMenu = ({ item }: { item: SearchData }) => {
    setPreview(item);
    setContextMenu(null);
  }

  const handleChangeTagToContextMenu = ({ item, name }: { item: SearchData | null, name: string }) => {
    setRenameTarget(item)
    setRenameValue(name)
    setContextMenu(null)
  }

  const handleChangeSearch = () => {
    setSearchResults(null);
    handleChangeSearchQuery('');
  }

  const handleChangePreview = (file: FileData) => {
    setPreview(file)
  }

  const handleRenameFile = ({ file, name }: { file: FileData, name: string }) => {
    setRenameTarget(file);
    setRenameValue(name);
  }

  const openFilePicker = () => fileInputRef.current?.click()
  const openFolderPicker = () => folderInputRef.current?.click()

  const handleChangeShowNewFolder = () => setShowNewFolder(true)

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
    handleChangeSearchQuery('')
  }, [currentPath])

  const navigateTo = (path: string) => {
    setCurrentPath(path)
    handleChangeSidebarOpen(false)
  }

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : []

  // Subir archivos (soporta archivos sueltos y carpetas completas)
  const handleUpload = async (fileList: FileList | FileWithRelativePath[] | null, isFolder = false) => {
    if (!fileList || fileList.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setUploadInfo({ total: fileList.length, current: 0, folderName: '' })

    // Detectar si son archivos de carpeta (tienen webkitRelativePath)
    const firstFile = fileList[0]
    const isFolderUpload = isFolder || (firstFile?.webkitRelativePath && firstFile.webkitRelativePath.includes('/'))

    if (isFolderUpload && firstFile?.webkitRelativePath) {
      const folderName = firstFile?.webkitRelativePath.split('/')[0]
      setUploadInfo(prev => ({ ...prev, folderName } as UploadInfo))
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

        await axios.post(`${API}/upload?path=${encodeURIComponent(currentPath)}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const batchProgress = Math.round((e.loaded * 100) / (e.total ?? 0))
            const totalProgress = Math.round(((uploaded + (batch.length * batchProgress / 100)) / files.length) * 100)
            setUploadProgress(Math.min(totalProgress, 99))
          }
        })

        uploaded += batch.length
        setUploadInfo(prev => ({ ...prev, current: uploaded } as UploadInfo))
        setUploadProgress(Math.round((uploaded / files.length) * 100))
      }

      setUploadProgress(100)

      if (isFolderUpload) {
        const folderName = files[0]?.webkitRelativePath?.split('/')[0] || 'carpeta'
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
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }


  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const items = e.dataTransfer.items as DataTransferItemList;

    if (items && items.length > 0) {
      const fileEntries: FileWithRelativePath[] = [];

      const readEntry = (entry: FileSystemEntry): Promise<void> => {
        return new Promise<void>((resolve) => {
          if (entry.isFile) {
            entry.file((file) => {
              Object.defineProperty(file, 'webkitRelativePath', {
                value: entry.fullPath.slice(1),
                writable: false,
              });
              fileEntries.push(file as FileWithRelativePath);
              resolve();
            });
          } else if (entry.isDirectory && entry.createReader) {
            const reader = entry.createReader();
            const readAllEntries = (all: FileSystemEntry[] = []) => {
              reader.readEntries(async (entries) => {
                if (entries.length === 0) {
                  for (const e of all) {
                    await readEntry(e);
                  }
                  resolve();
                } else {
                  readAllEntries([...all, ...entries]);
                }
              });
            };
            readAllEntries();
          } else {
            resolve();
          }
        });
      };

      const promises: Promise<void>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const entry = item?.webkitGetAsEntry?.();
        if (entry) promises.push(readEntry(entry));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        if (fileEntries.length > 0) {
          handleUpload(fileEntries, true);
          return;
        }
      }
    }

    handleUpload(e.dataTransfer.files);
  };

  // Búsqueda
  const handleSearch = async (query: string) => {
    handleChangeSearchQuery(query)
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    try {
      const { data } = await getResultSearchAction({ query })
      const { success, message, results } = data
      if (success) setSearchResults(results)
      else showToast(message, 'error')
    } catch (err) {
      showToast('Error en la búsqueda', 'error')
    }
  }

  // Crear carpeta
  const createFolder = async () => {
    if (!newFolderName.trim()) return
    try {

      const { data } = await postNewFolderAction({ name: newFolderName, path: currentPath })
      const { message, success } = data

      if (success) {
        showToast(message)
        setShowNewFolder(false)
        setNewFolderName('')
        loadFiles(currentPath)
      } else {
        showToast(message, 'error')
      }

    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error : 'Error al crear carpeta'
      showToast(errorMessage || 'Error al crear carpeta', 'error')
    }
  }

  // Eliminar
  const deleteItem = async (itemPath: string) => {
    try {

      const { data } = await deleteFileAction({ itemPath })
      const { message, success } = data

      if (success) {
        showToast(message)
        loadFiles(currentPath)
      } else {
        showToast('Error al eliminar', 'error')
      }

    } catch (err) {
      showToast('Error al eliminar', 'error')
    }
    setContextMenu(null)
  }

  // Renombrar
  const doRename = async () => {
    if (!renameValue.trim()) return
    try {

      const { data } = await renameItemAction({ oldPath: renameTarget?.path ?? '', newName: renameValue })
      const { message, success } = data

      if (success) {
        showToast(message)
        setRenameTarget(null)
        setRenameValue('')
        loadFiles(currentPath)
      } else {
        showToast(message, 'error')
      }

    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error : 'Error al renombrar'
      showToast(errorMessage || 'Error al renombrar', 'error')
    }
  }

  // Descargar
  const downloadFile = (filePath: string) => {
    window.open(`${API}/download?path=${encodeURIComponent(filePath)}`, '_blank')
    setContextMenu(null)
  }

  // Context menu
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: SearchData, isFolder: boolean) => {
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
      <Toasts toasts={toasts} />

      {/* Sidebar */}
      <Sidebar currentPath={currentPath} storageInfo={storageInfo} folders={folders} navigateTo={navigateTo} />

      {/* Main */}
      <main className="main-content">
        {/* Header */}

        <Header
          onHandleSearch={handleSearch}
          handleUpload={handleUpload}
          handleChangeShowNewFolder={handleChangeShowNewFolder}
          onOpenFilePicker={openFilePicker}
          onOpenFolderPicker={openFolderPicker}
          fileInputRef={fileInputRef}
          folderInputRef={folderInputRef}
          onLoadFiles={() => loadFiles(currentPath)}
        />

        {/* Breadcrumbs */}
        <Breadcrum
          pathParts={pathParts}
          navigateTo={navigateTo}
        />

        {/* Content */}
        <div className="content-area">

          {/* Drop Zone */}
          <DropZone
            dragging={dragging}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            openFilePicker={openFilePicker}
          />

          {/* Search Results */}
          {searchResults !== null ? (

            <SearchResults
              searchResults={searchResults}
              searchQuery={searchQuery}
              onChangeSearch={handleChangeSearch}
              navigateTo={navigateTo}
              downloadFile={downloadFile}
            />

          ) : loading ? (
            <div className="empty-state">
              <Loader size={48} className="animate-spin" />
              <p>Cargando archivos...</p>
            </div>
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <FolderGrid
                  folders={folders}
                  navigateTo={navigateTo}
                  handleContextMenu={handleContextMenu}
                />
              )}

              {/* Files */}
              {files.length > 0 && (
                <FileGrid
                  files={files}
                  onHandleContextMenu={handleContextMenu}
                  handleChangePreview={handleChangePreview}
                  downloadFile={downloadFile}
                  handleRenameFile={handleRenameFile}
                  deleteItem={deleteItem}
                />
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
            {uploadInfo && uploadInfo?.total > 1 && (
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
        <ContextMenu
          contextMenu={contextMenu}
          navigateTo={navigateTo}
          onChangeContextMenu={handleChangeContextMenu}
          deleteItem={deleteItem}
          onChangeTagToContextMenu={handleChangeTagToContextMenu}
          downloadFile={downloadFile}
          onChangePreviewToContextMenu={handleChangePreviewToContextMenu}
        />
      )}
    </div>
  )
}
