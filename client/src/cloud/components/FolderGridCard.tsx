import { Folder } from "lucide-react"
import type { FolderData, SearchData } from "../../types"

interface Props {
  folder: FolderData,
  navigateTo: (path: string) => void,
  handleContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: SearchData, isFolder: boolean) => void
}

export const FolderGridCard = ({
  folder,
  navigateTo,
  handleContextMenu
}: Props) => {
  return (
    <div
      className="folder-card"
      onClick={() => navigateTo(folder.path)}
      onContextMenu={e => handleContextMenu(e, { name: folder.name, path: folder.path, isFolder: true }, true)}
    >
      <div className="folder-icon"><Folder size={20} /></div>
      <div className="folder-info">
        <div className="folder-name">{folder.name}</div>
        <div className="folder-count">
          {folder.itemCount} {folder.itemCount === 1 ? 'elemento' : 'elementos'}
        </div>
      </div>
    </div>
  )
}
