import axios from "axios";

const BASE_URL = import.meta.env.VITE_PUBLIC_URL

export const itemApi = axios.create({
  baseURL: BASE_URL + '/api'
})
