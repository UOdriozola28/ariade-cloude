import { Archive, Code, File, FileText, Film, Image } from "lucide-react"
import { getFileCategory } from "../../utils/helpers"

interface Props {
  extension: string,
  size?: number
}

export const FileIcon = ({ extension, size = 40 }: Props) => {
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
