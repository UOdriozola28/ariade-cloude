import { Download, Folder, Search, X } from "lucide-react";
import { useViewMode } from "../context/ViewModeContext";
import { FileIcon } from "../../components/custom/FileIcon";
import { formatBytes, formatDate } from "../../utils/helpers";
import type { DataSearchs } from "../../types";

interface Props {
  searchResults: null | DataSearchs,
  searchQuery: string,
  onChangeSearch: () => void,
  navigateTo: (path: string) => void,
  downloadFile: (filePath: string) => void
}

export const SearchResults = ({ searchResults, searchQuery, onChangeSearch, navigateTo, downloadFile }: Props) => {

  const { viewMode } = useViewMode()

  return (
    <>
      <div className="search-results-header">
        <h2>Resultados de búsqueda</h2>
        <span className="result-count">{searchResults?.length} encontrado(s)</span>
        <button
          className="btn btn-ghost"
          onClick={onChangeSearch}
          style={{ marginLeft: 'auto' }}
        >
          <X size={16} /> Limpiar
        </button>
      </div>

      {searchResults?.length === 0 ? (
        <div className="empty-state">
          <Search size={64} />
          <p>No se encontraron resultados para "{searchQuery}"</p>
        </div>
      ) : (
        <div className={`file-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {searchResults?.map(item => (
            item.isFolder ? (
              <div
                key={item.path}
                className="folder-card"
                onClick={() => { navigateTo(item.path); onChangeSearch() }}
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
                  <FileIcon extension={item.extension ?? 'jpg'} />
                  <span className="file-name" title={item.name}>{item.name}</span>
                </div>
                <div className="file-meta">
                  <span className="file-size">{formatBytes(item.size ?? 0)}</span>
                  <span className="file-date">{formatDate(item.modified ?? '1999/01/01')}</span>
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
  )
}
