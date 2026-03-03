
interface DiskInfo {
  total: number,
  free: number,
  used: number
}

export interface StorageInfo {
  used: number,
  totalFiles: number,
  disk: DiskInfo
}
