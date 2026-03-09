import type { ApiResponseSimple } from "../../types"
import { itemApi } from "../api/item.api"

export const deleteFileAction = async ({ itemPath }: { itemPath: string }) => {
  const response = await itemApi.delete<ApiResponseSimple>(`/files`, { data: { path: itemPath } })
  return response
}
