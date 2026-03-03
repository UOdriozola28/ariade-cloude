import type { SearchData } from "./results"

export interface ContextMenuProp {
  x?: number,
  y?: number,
  item: SearchData
  isFolder: boolean
}