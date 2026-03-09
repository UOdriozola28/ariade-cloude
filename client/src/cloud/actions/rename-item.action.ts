import type { ApiResponseSimple } from "../../types"
import { itemApi } from "../api/item.api"

export const renameItemAction = async ({ oldPath, newName }: { oldPath: string, newName: string }) => {
  const response = itemApi.put<ApiResponseSimple>(`/files/rename`, { oldPath, newName })
  return response
}
