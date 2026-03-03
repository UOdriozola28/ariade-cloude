function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Ahora mismo'
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Categories = 'img' | 'video' | 'doc' | 'code' | 'archive' | 'default';

function getFileCategory(ext: string): Categories {
  const categories = {
    img: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'],
    doc: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'],
    code: ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml', 'go', 'rs', 'php'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  }
  for (const [cat, exts] of Object.entries(categories)) {
    if (exts.includes(ext)) return cat as Categories
  }
  return 'default'
}

const canPreview = (ext: string) => {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mov'].includes(ext)
}


export {
  formatBytes,
  formatDate,
  getFileCategory,
  canPreview
}