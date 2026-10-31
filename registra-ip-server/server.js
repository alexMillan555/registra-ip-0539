const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// 1. Middlewares básicos
app.use(cors());
app.use(express.json()); // Para parsear JSON en futuros endpoints

// 2. Definir rutas de carpetas
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data', 'obras');

// 3. Crear carpetas si no existen (por seguridad)
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 4. Configuración de Multer (para el archivo)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único: timestamp + nombre original
    const nombreUnico = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, nombreUnico);
  }
});

const upload = multer({ storage: storage });

// 5. ENDPOINT: POST /obras
app.post('/obras', upload.single('archivo'), (req, res) => {
  try {
    // A) Validar que venga el archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    // B) Extraer los metadatos del body (vienen como texto porque es multipart/form-data)
    const { folio, titulo, categoria, descripcion, autor } = req.body;

    // C) Validar que vengan los metadatos obligatorios
    if (!folio || !titulo || !categoria || !autor) {
      // Si faltan datos, borramos el archivo que ya se subió para no dejar basura
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Faltan metadatos obligatorios (folio, titulo, categoria, autor).' });
    }

    // D) Crear el objeto JSON con los metadatos
    const metadata = {
      folio,
      titulo,
      categoria,
      descripcion: descripcion || '',
      autor,
      archivo: req.file.filename,       // Nombre del archivo en uploads/
      rutaArchivo: `/uploads/${req.file.filename}`, // Para acceder desde el frontend
      fechaRegistro: new Date().toISOString()
    };

    // E) Guardar el JSON en data/obras/{folio}.json
    const jsonPath = path.join(dataDir, `${folio}.json`);
    
    // Validar que el folio no exista ya (para no sobreescribir)
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(req.file.path); // Borramos el archivo subido
      return res.status(409).json({ error: `Ya existe una obra con el folio ${folio}.` });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), 'utf-8');

    // F) Responder al cliente con éxito
    res.status(201).json({
      mensaje: 'Obra registrada exitosamente',
      obra: metadata
    });

  } catch (error) {
    console.error('Error al registrar obra:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// 6. Ruta para ver los archivos subidos (públicos)
app.use('/uploads', express.static(uploadsDir));

// 7. Ruta de prueba
// ==========================================
// ENDPOINT: GET /obras (Listar todas las obras)
// ==========================================
app.get('/obras', (req, res) => {
  try {
    // 1. Verificamos que la carpeta exista
    if (!fs.existsSync(dataDir)) {
      return res.json({ total: 0, obras: [] });
    }

    // 2. Leemos todos los archivos de la carpeta
    const archivos = fs.readdirSync(dataDir);

    // 3. Filtramos solo los que son .json y los procesamos
    const obras = archivos
      .filter(archivo => archivo.endsWith('.json'))
      .map(archivo => {
        // A) Construimos la ruta completa del archivo
        const rutaCompleta = path.join(dataDir, archivo);
        
        // B) Leemos el contenido como texto
        const contenido = fs.readFileSync(rutaCompleta, 'utf-8');
        
        // C) Convertimos el texto a objeto JSON
        return JSON.parse(contenido);
      });

    // 4. Devolvemos la lista de obras
    res.json({
      total: obras.length,
      obras: obras
    });

  } catch (error) {
    console.error('Error al listar obras:', error);
    res.status(500).json({ error: 'Error interno del servidor al listar las obras.' });
  }
});

// 8. Encender servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});