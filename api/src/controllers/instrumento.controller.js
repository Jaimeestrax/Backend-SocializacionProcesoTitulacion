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

        if (!identificador || !nombre || !id_encargado) {
            if (req.file) {
                eliminarArchivoFisico(req.file.path);
            }
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
            page: req.body.pagina || 1,
            limit: req.body.limite || 10,
            populate: {
                path: 'id_encargado',
                select: 'nombres apellidos' // Campos de usuario
            }
        };

        const instrumentosEncontrados = await Instrumento.paginate({ estado: true }, options);

        if (instrumentosEncontrados.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron instrumentos' });
        }

        res.status(200).send({
            message: 'Instrumentos obtenidos exitosamente',
            data: instrumentosEncontrados
        });

    } catch (error) {
        console.error('No se pudo obtener los instrumentos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerInstrumentoPorId(req, res) {
    try {
        const { id } = req.params; // Obtenemos el id desde url
        const instrumentoEncontrado = await Instrumento.findById(id);
        res.status(200).send({
            message: 'Instrumento obtenido exitosamente',
            data: instrumentoEncontrado
        });
    } catch (error) {
        console.error('No se pudo obtener el instrumento', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarInstrumento(req, res) {
    try {
        const { id } = req.params;

        const datosActualizar = { ...req.body };

        // Solo actualiza la ruta si se subió un nuevo archivo
        if (req.file) {
            datosActualizar.ruta = req.file.path;
        }

        const instrumentoActualizado = await Instrumento.findByIdAndUpdate(id, datosActualizar, { new: true });
        // new: true, devuelve el documento actualizado
        res.status(200).send({
            message: 'Instrumento actualizado exitosamente',
            data: instrumentoActualizado
        });
    } catch (error) {
        console.error('No se pudo actualizar el instrumento', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoInstrumento(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const instrumentoActualizado = await Instrumento.findByIdAndUpdate(id, { estado }, { new: true });

        res.status(200).send({
            message: 'Estado del instrumento actualizado exitosamente',
            data: instrumentoActualizado
        });
    } catch (error) {
        console.error('No se pudo actualizar el estado del instrumento', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function listarInstrumentos(req, res) {
    try {
        const instrumentosEncontrados = await Instrumento.find({ estado: true });
        if (!instrumentosEncontrados) {
            return res.status(404).send({ message: 'No se encontraron instrumentos' });
        }
        res.status(200).send({
            message: 'Instrumentos obtenidos exitosamente',
            data: instrumentosEncontrados
        });
    } catch (error) {
        console.error('Error al listar instrumentos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const InstrumentoController = {
    registrarInstrumento,
    obtenerInstrumentos,
    obtenerInstrumentoPorId,
    actualizarInstrumento,
    actualizarEstadoInstrumento,
    listarInstrumentos
}

export default InstrumentoController;