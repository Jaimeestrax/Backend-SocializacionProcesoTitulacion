// Manejo de multipart/form-data -> archivo/texto
import multer from "multer";
// Libreria nativa de node para manejo de rutas
import path from 'node:path';

// Tipos de archivos permitidos
const allowedMimeFiles = new Set([
    // MIME (Multiporpuse Internet Mail Extensions) -> Identifica naturaleza y formato de archivo independientemente de su extension
    'application/pdf', // .pdf
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'image/jpeg', // .jpg .jpeg
    'image/png', // .png

]);

// cb -> función callback (error, resultado)
const fileFilter = (req, file, cb) => {
    // Validar tambien extensión
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']);

    if (allowedMimeFiles.has(file.mimetype) && allowedExts.has(ext)) {
        // accept
        cb(null, true);
    } else {
        // reject
        cb(new Error('Tipo de archivo no permitido'), false);
    }
}

export const upload = (rutaDestino) => {
    const storage = multer.diskStorage({
        // Directorio donde se guarda el archivo -> independiente del SO
        destination: (req, file, cb) => {
            const ruta = path.join("uploads", rutaDestino);
            cb(null, ruta);
        },
        // Nombre asignado
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname); // extension del archivo
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // identificador unico
            cb(null, `${uniqueSuffix}${ext}`);
        }
    });

    return multer({
        storage,
        limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
        fileFilter
    });
}