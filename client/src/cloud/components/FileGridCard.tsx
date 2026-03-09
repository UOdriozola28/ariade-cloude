import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { canPreview, formatBytes, formatDate } from "../../utils/helpers";
import { FileIcon } from "../../components/custom/FileIcon";
import type { FileData, SearchData } from "../../types";

interface Props {
  file: FileData,
  onHandleContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: SearchData, isFolder: boolean) => void,
  onHandleChangePreview: (file: FileData) => void,
  downloadFile: (filePath: string) => void,
  handleRenameFile: ({ file, name }: { file: FileData, name: string }) => void,
  deleteItem: (itemPath: string) => void
}

export const FileGridCard = ({
  file,
  onHandleContextMenu,
  onHandleChangePreview,
  downloadFile,
  handleRenameFile,
  deleteItem
}: Props) => {
  return (
    <div
      className="file-card"
      onContextMenu={e => onHandleContextMenu(e, { ...file, isFolder: false }, false)}
      onDoubleClick={() => canPreview(file.extension) && onHandleChangePreview(file)}
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
          <button className="file-action-btn" onClick={() => onHandleChangePreview(file)} title="Ver">
            <Eye />
          </button>
        )}
        <button className="file-action-btn" onClick={() => downloadFile(file.path)} title="Descargar">
          <Download />
        </button>
        <button
          className="file-action-btn"
          onClick={() => handleRenameFile({ file, name: file.name })}
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
  )
}
