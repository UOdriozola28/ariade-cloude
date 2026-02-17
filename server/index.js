import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const UPLOAD_DIR = process.env.DIRECTORY_URL;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use('/files', express.static(UPLOAD_DIR));

// Configurar multer para subida de archivos Y carpetas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const basePath = req.body.path || '';
    // Si el archivo viene de una carpeta, file.originalname incluye la ruta relativa
    // El frontend envía la ruta relativa en el header custom 'x-relative-path'
    // Pero multer no da acceso a headers por archivo, así que usamos el campo relativePaths
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // Si el nombre contiene '/', es una ruta relativa de carpeta
    const hasSubPath = originalName.includes('/');
    let destDir = basePath;

    if (hasSubPath) {
      // Extraer la carpeta del nombre (ej: "MiCarpeta/subcarpeta/foto.jpg" → "MiCarpeta/subcarpeta")
      const relativeDir = path.dirname(originalName);
      destDir = path.join(basePath, relativeDir);
    }

    const fullPath = path.join(UPLOAD_DIR, destDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    // Si tiene ruta relativa, solo usar el nombre del archivo
    const fileName = path.basename(originalName);
    const basePath = req.body.path || '';

    // Reconstruir la ruta de destino
    const hasSubPath = originalName.includes('/');
    let destDir = basePath;
    if (hasSubPath) {
      destDir = path.join(basePath, path.dirname(originalName));
    }

    const targetPath = path.join(UPLOAD_DIR, destDir, fileName);

    if (fs.existsSync(targetPath)) {
      const ext = path.extname(fileName);
      const name = path.basename(fileName, ext);
      cb(null, `${name}_${Date.now()}${ext}`);
    } else {
      cb(null, fileName);
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB máximo por archivo
});

// ============ RUTAS API ============

// Obtener archivos y carpetas de un directorio
app.get('/api/files', (req, res) => {
  const dirPath = req.query.path || '';
  const fullPath = path.join(UPLOAD_DIR, dirPath);

  if (!fs.existsSync(fullPath)) {
    return res.json({ files: [], folders: [] });
  }

  try {
    const items = fs.readdirSync(fullPath);
    const files = [];
    const folders = [];

    items.forEach(item => {
      if (item.startsWith('.')) return; // Ignorar ocultos

      const itemPath = path.join(fullPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        // Contar items dentro de la carpeta
        let itemCount = 0;
        try {
          itemCount = fs.readdirSync(itemPath).filter(i => !i.startsWith('.')).length;
        } catch (e) { }

        folders.push({
          name: item,
          path: path.join(dirPath, item),
          modified: stats.mtime,
          itemCount
        });
      } else {
        files.push({
          name: item,
          path: path.join(dirPath, item),
          size: stats.size,
          modified: stats.mtime,
          extension: path.extname(item).toLowerCase().slice(1)
        });
      }
    });

    // Ordenar: carpetas primero, luego archivos por fecha
    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    res.json({ files, folders, currentPath: dirPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subir archivos (soporta carpetas completas)
app.post('/api/upload', upload.array('files', 500), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se recibieron archivos' });
  }

  const uploaded = req.files.map(f => ({
    name: f.filename,
    size: f.size,
    path: req.body.path || ''
  }));

  res.json({ message: `${uploaded.length} archivo(s) subido(s)`, files: uploaded });
});

// Crear carpeta
app.post('/api/folder', (req, res) => {
  const { name, path: dirPath = '' } = req.body;

  if (!name) return res.status(400).json({ error: 'Nombre requerido' });

  const sanitized = name.replace(/[<>:"/\\|?*]/g, '_');
  const fullPath = path.join(UPLOAD_DIR, dirPath, sanitized);

  if (fs.existsSync(fullPath)) {
    return res.status(409).json({ error: 'La carpeta ya existe' });
  }

  fs.mkdirSync(fullPath, { recursive: true });
  res.json({ message: 'Carpeta creada', name: sanitized });
});

// Eliminar archivo o carpeta
app.delete('/api/files', (req, res) => {
  const { path: filePath } = req.body;

  if (!filePath) return res.status(400).json({ error: 'Ruta requerida' });

  const fullPath = path.join(UPLOAD_DIR, filePath);

  // Seguridad: evitar salir de UPLOAD_DIR
  if (!fullPath.startsWith(UPLOAD_DIR)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  try {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true });
    } else {
      fs.unlinkSync(fullPath);
    }
    res.json({ message: 'Eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Renombrar archivo o carpeta
app.put('/api/files/rename', (req, res) => {
  const { oldPath, newName } = req.body;

  if (!oldPath || !newName) {
    return res.status(400).json({ error: 'Ruta y nuevo nombre requeridos' });
  }

  const fullOldPath = path.join(UPLOAD_DIR, oldPath);
  const dir = path.dirname(fullOldPath);
  const sanitized = newName.replace(/[<>:"/\\|?*]/g, '_');
  const fullNewPath = path.join(dir, sanitized);

  if (!fullOldPath.startsWith(UPLOAD_DIR)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  if (!fs.existsSync(fullOldPath)) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  if (fs.existsSync(fullNewPath)) {
    return res.status(409).json({ error: 'Ya existe un archivo con ese nombre' });
  }

  fs.renameSync(fullOldPath, fullNewPath);
  res.json({ message: 'Renombrado correctamente' });
});

// Descargar archivo
app.get('/api/download', (req, res) => {
  const filePath = req.query.path;

  if (!filePath) return res.status(400).json({ error: 'Ruta requerida' });

  const fullPath = path.join(UPLOAD_DIR, filePath);

  if (!fullPath.startsWith(UPLOAD_DIR)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  res.download(fullPath);
});

// Info de almacenamiento
app.get('/api/storage', (req, res) => {
  const getDirectorySize = (dirPath) => {
    let size = 0;
    try {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          size += getDirectorySize(fullPath);
        } else {
          size += stats.size;
        }
      });
    } catch (e) { }
    return size;
  };

  const countFiles = (dirPath) => {
    let count = 0;
    try {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          count += countFiles(fullPath);
        } else {
          count++;
        }
      });
    } catch (e) { }
    return count;
  };

  const totalSize = getDirectorySize(UPLOAD_DIR);
  const totalFiles = countFiles(UPLOAD_DIR);

  let diskTotal = 0;
  let diskFree = 0;

  try {
    if (fs.statfsSync) {
      const diskInfo = fs.statfsSync(UPLOAD_DIR);
      diskTotal = diskInfo.blocks * diskInfo.bsize;
      diskFree = diskInfo.bavail * diskInfo.bsize;
    }
  } catch (e) {
    try {
      const { execSync } = require('child_process');
      const platform = process.platform;

      if (platform === 'win32') {
        const drive = path.resolve(UPLOAD_DIR).slice(0, 2);
        const output = execSync(`wmic logicaldisk where "DeviceID='${drive}'" get Size,FreeSpace /format:csv`, { encoding: 'utf8' });
        const lines = output.trim().split('\n').filter(l => l.trim());
        const lastLine = lines[lines.length - 1];
        const parts = lastLine.split(',');
        if (parts.length >= 3) {
          diskFree = parseInt(parts[1]) || 0;
          diskTotal = parseInt(parts[2]) || 0;
        }
      } else {
        const output = execSync(`df -B1 "${UPLOAD_DIR}" | tail -1`, { encoding: 'utf8' });
        const parts = output.trim().split(/\s+/);
        if (parts.length >= 4) {
          diskTotal = parseInt(parts[1]) || 0;
          diskFree = parseInt(parts[3]) || 0;
        }
      }
    } catch (e2) { }
  }

  const diskUsed = diskTotal - diskFree;

  res.json({
    used: totalSize,
    totalFiles,
    storagePath: UPLOAD_DIR,
    disk: {
      total: diskTotal,
      free: diskFree,
      used: diskUsed
    }
  });
});

// Buscar archivos
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  if (!query) return res.json({ results: [] });

  const results = [];

  const searchDir = (dirPath, relativePath = '') => {
    try {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        if (item.startsWith('.')) return;
        const fullPath = path.join(dirPath, item);
        const relPath = path.join(relativePath, item);
        const stats = fs.statSync(fullPath);

        if (item.toLowerCase().includes(query)) {
          results.push({
            name: item,
            path: relPath,
            isFolder: stats.isDirectory(),
            size: stats.isDirectory() ? 0 : stats.size,
            modified: stats.mtime,
            extension: stats.isDirectory() ? '' : path.extname(item).toLowerCase().slice(1)
          });
        }

        if (stats.isDirectory() && results.length < 50) {
          searchDir(fullPath, relPath);
        }
      });
    } catch (e) { }
  };

  searchDir(UPLOAD_DIR);
  res.json({ results: results.slice(0, 50) });
});

app.listen(PORT, () => {
  console.log(`\n☁️  Mi Nube corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos guardados en: ${UPLOAD_DIR}\n`);
});
