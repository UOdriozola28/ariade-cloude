# ☁️ Mi Nube — Tu almacenamiento personal

Una aplicación web de almacenamiento en la nube **autoalojada**, hecha con **React + Node.js/Express**.  
Sube archivos desde tu navegador y se guardan directo en tu PC. ¡Tu propia nube!

![Stack](https://img.shields.io/badge/React-18-blue) ![Stack](https://img.shields.io/badge/Node.js-Express-green) ![Stack](https://img.shields.io/badge/Vite-5-purple)

---

## ✨ Características

- 📁 **Subir archivos** arrastrando o haciendo clic (hasta 500MB)
- 📂 **Crear carpetas** y organizar tus archivos
- 🔍 **Búsqueda** de archivos por nombre
- 👁️ **Vista previa** de imágenes y videos
- ✏️ **Renombrar** archivos y carpetas
- 🗑️ **Eliminar** archivos y carpetas
- ⬇️ **Descargar** archivos
- 📊 **Info de almacenamiento** usado
- 🖥️ **Vista cuadrícula y lista**
- 📱 **Responsive** (funciona en móvil)
- 🖱️ **Menú contextual** (clic derecho)

---

## 🚀 Instalación rápida

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior
- npm (viene con Node.js)

### Pasos

```bash
# 1. Entra a la carpeta del proyecto
cd mi-nube

# 2. Instala todas las dependencias
npm run install:all

# 3. (Opcional) Instala concurrently para correr ambos con un solo comando
npm install

# 4. ¡Arranca la app!
npm run dev
```

Eso abrirá:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000

### O córrelos por separado:

```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

---

## 📂 Dónde se guardan los archivos

Por defecto, los archivos se guardan en la carpeta `mi-almacen/` dentro del proyecto.

**Para cambiar la ubicación** (por ejemplo a un disco externo), edita `server/index.js` línea 9:

```javascript
// Cambia esta ruta a tu disco de respaldo
const UPLOAD_DIR = path.join(__dirname, '..', 'mi-almacen');

// Ejemplo: disco externo en Windows
const UPLOAD_DIR = 'D:\\MiNube';

// Ejemplo: disco externo en Mac/Linux
const UPLOAD_DIR = '/media/mi-disco/MiNube';
```

---

## 🌐 Acceder desde otro dispositivo en tu red local

Para acceder desde tu celular u otra PC en tu misma red WiFi:

1. Busca tu IP local (ej: `192.168.1.100`)
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` o `ip addr`
2. Abre en tu navegador: `http://192.168.1.100:3000`

---

## 🔧 Estructura del proyecto

```
mi-nube/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx         # Componente principal
│   │   ├── index.css       # Estilos
│   │   └── main.jsx        # Punto de entrada
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Backend (Node.js + Express)
│   ├── index.js            # Servidor API
│   └── package.json
├── mi-almacen/             # Carpeta de archivos (se crea automáticamente)
├── package.json            # Scripts raíz
└── README.md
```

---

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/files?path=` | Listar archivos y carpetas |
| POST | `/api/upload` | Subir archivos (multipart) |
| POST | `/api/folder` | Crear carpeta |
| DELETE | `/api/files` | Eliminar archivo/carpeta |
| PUT | `/api/files/rename` | Renombrar |
| GET | `/api/download?path=` | Descargar archivo |
| GET | `/api/search?q=` | Buscar archivos |
| GET | `/api/storage` | Info de almacenamiento |

---

## 🔮 Ideas para mejoras futuras

- 🔐 Login con usuario y contraseña
- 🔗 Compartir archivos con enlaces públicos
- 📋 Copiar/mover archivos entre carpetas
- 🏷️ Etiquetas y favoritos
- 🗂️ Papelera de reciclaje
- 📤 Arrastrar para mover entre carpetas
- 🌐 Acceso desde internet (con Tailscale o Cloudflare Tunnel)

---

## 📝 Licencia

Uso personal libre. ¡Haz lo que quieras con él! 🎉
