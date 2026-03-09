import { Download, Eye, Folder, Pencil, Trash2 } from "lucide-react"
import type { ContextMenuProp, SearchData } from "../../types"
import { canPreview } from "../../utils/helpers"

interface Props {
  contextMenu: null | ContextMenuProp,
  navigateTo: (path: string) => void,
  onChangeContextMenu: () => void,
  deleteItem: (itemPath: string) => void,
  onChangeTagToContextMenu: ({ item, name }: { item: SearchData | null, name: string }) => void,
  downloadFile: (filePath: string) => void,
  onChangePreviewToContextMenu: ({ item }: { item: SearchData }) => void
}

export const ContextMenu = ({ contextMenu, navigateTo, onChangeContextMenu, deleteItem, onChangeTagToContextMenu, downloadFile, onChangePreviewToContextMenu }: Props) => {

  if (contextMenu === null) return

  return (
    <div
      className="context-menu"
      style={{ left: contextMenu?.x, top: contextMenu?.y }}
      onClick={e => e.stopPropagation()}
    >
      {contextMenu?.isFolder ? (
        <>
          <button
            className="context-menu-item"
            onClick={() => { navigateTo(contextMenu?.item.path); onChangeContextMenu(); }}
          >
            <Folder size={15} /> Abrir
          </button>
          <button
            className="context-menu-item"
            onClick={() =>
              onChangeTagToContextMenu({ item: contextMenu?.item, name: contextMenu?.item.name })
            }
          >
            <Pencil size={15} /> Renombrar
          </button>
          <button
            className="context-menu-item danger"
            onClick={() => {
              if (confirm(`¿Eliminar carpeta "${contextMenu.item.name}" y todo su contenido?`)) {
                deleteItem(contextMenu.item.path)
              }
            }}
          >
            <Trash2 size={15} /> Eliminar
          </button>
        </>
      ) : (
        <>
          {
            (canPreview(contextMenu?.item.extension ?? 'jpg') && (
              <button
                className="context-menu-item"
                onClick={() => {
                  onChangePreviewToContextMenu({ item: contextMenu?.item })
                }}
              >
                <Eye size={15} /> Vista previa
              </button>
            ))
          }

          <button
            className="context-menu-item"
            onClick={() => downloadFile(contextMenu?.item.path)}
          >
            <Download size={15} /> Descargar
          </button>
          <button
            className="context-menu-item"
            onClick={() => onChangeTagToContextMenu({ item: contextMenu?.item, name: contextMenu?.item.name })}
          >
            <Pencil size={15} /> Renombrar
          </button>
          <button
            className="context-menu-item danger"
            onClick={() => {
              if (confirm(`¿Eliminar "${contextMenu?.item.name}"?`)) {
                deleteItem(contextMenu?.item.path)
              }
            }}
          >
            <Trash2 size={15} /> Eliminar
          </button>
        </>
      )}
    </div>
  )
}
