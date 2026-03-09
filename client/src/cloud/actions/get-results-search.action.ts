import type { ApiResponseSearch } from "../../types"
import { itemApi } from "../api/item.api"

export const getResultSearchAction = async ({ query }: { query: string }) => {
  const response = itemApi.get<ApiResponseSearch>(`/search`, { params: { q: query } })
  return response
}
