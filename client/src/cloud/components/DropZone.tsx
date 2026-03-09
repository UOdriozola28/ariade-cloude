import { Cloud } from "lucide-react"
interface Props {
  dragging: boolean,
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void,
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void,
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void,
  openFilePicker: () => void
}

export const DropZone = ({
  dragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  openFilePicker
}: Props) => {
  return (
    <div
      className={`drop-zone ${dragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFilePicker}
    >
      <Cloud className="drop-icon" size={48} />
      <p>
        Arrastra tus <strong>archivos o carpetas</strong> aquí, o{' '}
        <span className="drop-highlight">haz clic para seleccionar</span>
      </p>
      <span className="drop-hint">
        Soporta carpetas completas · Hasta 2GB por archivo
      </span>
    </div>
  )
}
