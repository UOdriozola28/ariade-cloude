import { X } from "lucide-react"
import { getFileCategory } from "../../utils/helpers"
import type { ItemContextMenu } from "../../types"

interface Props {
  file: ItemContextMenu,
  onClose: () => void
}

const API = import.meta.env.VITE_PUBLIC_URL + '/files'

export const Preview = ({ file, onClose }: Props) => {
  const cat = getFileCategory(file.extension)
  const url = `${API}/${file.path}`

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