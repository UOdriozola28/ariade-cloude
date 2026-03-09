
import type { DataFolders, SearchData } from "../../types"
import { FolderGridCard } from "./FolderGridCard"

interface Props {
  folders: DataFolders,
  navigateTo: (path: string) => void,
  handleContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: SearchData, isFolder: boolean) => void
}

export const FolderGrid = ({
  folders,
  navigateTo,
  handleContextMenu
}: Props) => {
  return (
    <>
      <div className="section-title">Carpetas ({folders.length})</div>
      <div className="folder-grid">
        {folders.map(folder => (
          <FolderGridCard
            key={folder.path}
            folder={folder}
            navigateTo={navigateTo}
            handleContextMenu={handleContextMenu}
          />
        ))}
      </div>
    </>
  )
}
