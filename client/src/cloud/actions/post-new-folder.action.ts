import type { ApiResponseSimple } from "../../types"
import { itemApi } from "../api/item.api"

export const postNewFolderAction = async ({ name, path }: { name: string, path: string }) => {
  const response = itemApi.post<ApiResponseSimple>(`/folder`, { name, path })
  return response
}
