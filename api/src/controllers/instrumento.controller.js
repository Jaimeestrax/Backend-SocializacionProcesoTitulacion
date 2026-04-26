import Instrumento from "../schemas/intrumento.model.js";
import fs from 'node:fs';

// Helper para eliminación de archivos
const eliminarArchivoFisico = (ruta) => {
    if (ruta) {
        fs.unlinkSync(ruta);
    }
}

// Registro de instrumentos
async function registrarInstrumento(req, res) {
    try {
        const { identificador, nombre, descripcion, id_encargado } = req.body;

        if (!identificador || !nombre || !descripcion || !id_encargado) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del instrumento' });
        }

        // Verificar que el archivo haya sido recibido
        if (!req.file) {
            return res.status(400).send({ message: 'No se ha proporcionado el archivo' });
        }

        // Creación del nuevo instrumento
        const nuevoInstrumento = new Instrumento({
            identificador: `IT-${identificador}`,
            ruta: req.file.path,
            nombre,
            descripcion,
            id_encargado,
            estado: true
        });

        // Guardar nuevo instrumento en la base de datos
        await nuevoInstrumento.save();

        res.status(201).send({ message: 'Instrumento registrado exitosamente' });

    } catch (error) {
        console.error('No se pudo registrar el instrumento', error.name);
        if (req.file) {
            eliminarArchivoFisico(req.file.path);
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerInstrumentos(req, res) {
    try {
        const options = {
            page: req.body.page || 1,
            limit: req.body.limit || 10
        };

        const instrumentos = await Instrumento.paginate({}, options);

        if (instrumentos.length === 0) {
            return res.status(404).send({ message: 'No se encontraron instrumentos' });
        }

        res.status(200).send({
            message: 'Instrumentos obtenidos exitosamente',
            data: instrumentos
        });

    } catch (error) {
        console.error('No se pudo obtener los instrumentos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const InstrumentoController = {
    registrarInstrumento,
    obtenerInstrumentos
}

export default InstrumentoController;