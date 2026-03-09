import type { DataFiles, FileData, SearchData } from "../../types"
import { useViewMode } from "../context/ViewModeContext"
import { FileGridCard } from "./FileGridCard"

interface Props {
  files: DataFiles,
  onHandleContextMenu: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, item: SearchData, isFolder: boolean) => void,
  handleChangePreview: (file: FileData) => void,
  downloadFile: (filePath: string) => void,
  handleRenameFile: ({ file, name }: { file: FileData, name: string }) => void,
  deleteItem: (itemPath: string) => void
}

export const FileGrid = ({
  files,
  onHandleContextMenu,
  handleChangePreview,
  downloadFile,
  handleRenameFile,
  deleteItem
}: Props) => {

  const { viewMode } = useViewMode()

  return (
    <>
      <div className="section-title">Archivos ({files.length})</div>
      <div className={`file-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
        {files.map(file => (
          <FileGridCard
            key={file.path}
            file={file}
            onHandleContextMenu={onHandleContextMenu}
            onHandleChangePreview={handleChangePreview}
            downloadFile={downloadFile}
            handleRenameFile={handleRenameFile}
            deleteItem={deleteItem}
          />
        ))}
      </div>
    </>
  )
}
