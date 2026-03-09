import type { DataSearchs } from "./results";

export interface ApiResponseSimple {
  success: boolean,
  message: string,
}

export interface ApiResponseSearch extends ApiResponseSimple {
  results: DataSearchs
}