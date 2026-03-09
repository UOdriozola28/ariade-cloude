import { FolderInput, FolderPlus, LayoutGrid, List, Menu, RefreshCw, Search, Upload } from "lucide-react";
import { useSearch } from "../context/SearchContext";
import { useViewMode } from "../context/ViewModeContext";
import { useSidebar } from "../context/SidebarContext";

interface Props {
  onHandleSearch: (query: string) => void,
  handleUpload: (fileList: FileList | null, isFolder?: boolean) => Promise<void>,
  handleChangeShowNewFolder: () => void,
  onOpenFilePicker: () => void,
  onOpenFolderPicker: () => void,
  fileInputRef: React.RefObject<HTMLInputElement>,
  folderInputRef: React.RefObject<HTMLInputElement>,
  onLoadFiles: () => void
}

export const Header = ({
  onHandleSearch,
  handleUpload,
  handleChangeShowNewFolder,
  onOpenFilePicker,
  onOpenFolderPicker,
  fileInputRef,
  folderInputRef,
  onLoadFiles
}: Props) => {

  const { searchQuery } = useSearch()
  const { viewMode, handleChangeViewMode } = useViewMode()
  const { sidebarOpen, handleChangeSidebarOpen } = useSidebar()

  return (
    <header className="header">
      <button className="menu-toggle" onClick={() => handleChangeSidebarOpen(!sidebarOpen)}>
        <Menu size={20} />
      </button>

      <div className="search-bar">
        <Search />
        <input
          type="text"
          placeholder="Buscar archivos y carpetas..."
          value={searchQuery}
          onChange={e => onHandleSearch(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <button
          className={`btn btn-ghost`}
          onClick={handleChangeViewMode}
          title={viewMode === 'grid' ? 'Vista lista' : 'Vista cuadrícula'}
        >
          {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
        </button>
        <button className="btn btn-ghost" onClick={onLoadFiles} title="Recargar">
          <RefreshCw size={18} />
        </button>
        <button className="btn btn-secondary" onClick={handleChangeShowNewFolder}>
          <FolderPlus size={16} /> Nueva carpeta
        </button>
        <button className="btn btn-secondary" onClick={onOpenFolderPicker}>
          <FolderInput size={16} /> Subir carpeta
        </button>
        <button className="btn btn-primary" onClick={onOpenFilePicker}>
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
          style={{ display: 'none' }}
          onChange={e => { handleUpload(e.target.files, true); e.target.value = ''; }}
        // {...({ webkitdirectory: true, directory: true } as any)}
        />
      </div>
    </header>
  )
}
