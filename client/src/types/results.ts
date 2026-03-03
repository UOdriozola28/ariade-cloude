export interface FileData {
  name: string,
  path: string,
  size?: number,
  modified?: Date | string;
  extension?: string,
}

export interface SearchData extends FileData {
  isFolder: boolean,
}

export interface FolderData {
  name: string,
  path: string,
  modified: Date | string,
  itemCount: number,
}

export type DataFolders = FolderData[]
export type DataFiles = FileData[]
export type DataSearchs = SearchData[]