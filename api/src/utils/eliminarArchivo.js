import fs from 'node:fs';

// Helper para eliminación de archivos
const eliminarArchivoFisico = async (ruta) => {
    if (!ruta) return;
    try {
        // Trata de eliminar el archivo de manera asincrona
        await fs.promises.unlink(ruta);
    } catch (error) {
        // Si no hay archivo muestra mensaje de error pero no corta flujo
        console.error('Error al eliminar el archivo:', error.message);
    }
}

export default eliminarArchivoFisico;