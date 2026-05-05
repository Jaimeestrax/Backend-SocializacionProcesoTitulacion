import fs from 'node:fs';

// Helper para eliminación de archivos
const eliminarArchivoFisico = (ruta) => {
    if (ruta) {
        fs.unlinkSync(ruta);
    }
}

export default eliminarArchivoFisico;