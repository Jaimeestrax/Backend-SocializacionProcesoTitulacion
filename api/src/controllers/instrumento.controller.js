import Instrumento from "../schemas/intrumento.model.js";
import eliminarArchivoFisico from "../utils/eliminarArchivo.js";

async function registrarInstrumento(req, res) {
    // Por defecto al registrar un nuevo instrumento -> estado true (activo), vigente true (activo)
    try {
        const { nombre, descripcion, idEncargadoGenerar } = req.body;

        if (!nombre || !idEncargadoGenerar) {
            if (req.file) {
                eliminarArchivoFisico(req.file.path);
            }
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del instrumento' });
        }

        // Verificar que el archivo haya sido recibido
        if (!req.file) {
            return res.status(400).send({ message: 'No se ha proporcionado el archivo' });
        }

        // Asignación de código -> identifica historico de instrumentos
        const ultimoCodigo = await Instrumento.findOne().sort({ codigo: -1 }); // Ordena de mayor a menor
        const nuevoCodigo = ultimoCodigo ? ultimoCodigo.codigo + 1 : 1;

        // Creación del nuevo instrumento
        const nuevoInstrumento = new Instrumento({
            codigo: nuevoCodigo,
            nombre,
            descripcion,
            archivo: req.file.path.replace(/\\/g, '/'),
            idEncargadoGenerar
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
    // Listado -> muestra solo instrumentos estado true (activo - ultimo instrumento del histórico) -> se puede alterar vigencia
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10,
            sort: { _id: -1 },
            populate: [
                { path: 'idEncargadoGenerar', select: 'nombres apellidos' },
                { path: 'idEncargadoActualizar', select: 'nombres apellidos' }
            ]
        };

        const filtro = { estado: true }

        if (req.body.palabra && req.body.palabra.trim() !== "") {
            filtro.$or = [
                { nombre: { $regex: req.body.palabra.trim(), $options: "i" } },
                { descripcion: { $regex: req.body.palabra.trim(), $options: "i" } }
            ];
        }

        const instrumentosEncontrados = await Instrumento.paginate(filtro, options);

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

async function listarInstrumentos(req, res) {
    try {
        const instrumentosEncontrados = await Instrumento.find({ estado: true });

        res.status(200).send({
            message: 'Instrumentos obtenidos exitosamente',
            data: instrumentosEncontrados
        });
    } catch (error) {
        console.error('Error al listar instrumentos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerInstrumentoPorId(req, res) {
    // Instrumento especifico por id (PK) en db
    try {
        const { id } = req.params; // Obtenemos el id desde url
        const instrumentoEncontrado = await Instrumento.findById(id);

        if (!instrumentoEncontrado) {
            return res.status(404).send({ message: 'No se encontro el instrumento' });
        }

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
    // Se actualiza la metadata -> solo cambian datos del mismo registro
    // Se actualiza archivo -> crea nuevo registro -> comparte código (vigente y estado true) -> los demás de ese mismo código false
    try {
        // Info de la solicitud
        const { id } = req.params;
        let datosActualizar = { ...req.body };

        // Si cargo un nuevo archivo es otra versión
        if (req.file) {
            // Asignación de código -> mismo código del instrumento que se esta actualizando
            const instrumentoReferencia = await Instrumento.findById(id);

            // Creación del nuevo instrumento
            const nuevoInstrumento = new Instrumento({
                codigo: instrumentoReferencia.codigo,
                nombre: instrumentoReferencia.nombre,
                descripcion: instrumentoReferencia.descripcion || null,
                archivo: req.file.path.replace(/\\/g, '/'),
                version: instrumentoReferencia.version + 1, // Aumenta la versión
                // El que edita (carga nuevo archivo) es el que esta generando esa nueva versión de instrumento
                idEncargadoGenerar: datosActualizar.idEncargadoActualizar
            });

            // Guardar nueva version de instrumento
            await nuevoInstrumento.save();
            // Actualizar estado y vigencia del historico de ese instrumento -> se pone estado y vigencia false
            await Instrumento.findByIdAndUpdate(id, {
                estado: false,
                vigente: false,
                fechaFin: new Date(),
                fechaActualizacion: new Date(),
                idEncargadoActualizar: datosActualizar.idEncargadoActualizar
            }, { new: true });

            res.status(200).send({ message: 'Nueva versión del instrumento creada exitosamente' });

        } else { // Sino unicamente es actualización de metadata
            // Se actualiza los datos de auditoria
            datosActualizar.fechaActualizacion = new Date();
            const instrumentoActualizado = await Instrumento.findByIdAndUpdate(id, datosActualizar, { new: true });
            // new: true, devuelve el documento actualizado
            if (instrumentoActualizado) {
                res.status(200).send({ message: 'Instrumento actualizado exitosamente' });
            } else {
                if (req.file) {
                    eliminarArchivoFisico(req.file.path);
                }
                res.status(404).send({ message: 'No se ha podido actualizar el instrumento' });
            }
        }

    } catch (error) {
        console.error('No se pudo actualizar el instrumento', error.name);
        if (req.file) {
            eliminarArchivoFisico(req.file.path);
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarVigenciaInstrumento(req, res) {
    try {
        const { id } = req.params;
        const { vigente } = req.body;

        // Si se cambia a vigente true -> actualiza fecha de inicio y fecha fin null
        let instrumentoActualizar = {};
        if (vigente) {
            instrumentoActualizar = {
                vigente: vigente,
                fechaInicio: new Date(),
                fechaFin: null
            }
        } else { // Cambio a vigente false -> establece fecha fin
            instrumentoActualizar = {
                vigente: vigente,
                fechaFin: new Date()
            }
        }

        const instrumentoActualizado = await Instrumento.findByIdAndUpdate(id, instrumentoActualizar, { new: true });

        res.status(200).send({
            message: 'Vigencia del instrumento actualizado exitosamente',
            data: instrumentoActualizado
        });
    } catch (error) {
        console.error('No se pudo actualizar el estado del instrumento', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerHistoricoInstrumento(req, res) {
    // Historico de un intrumento específico -> busca código y muestra todas las versiones
    try {
        const { codigo } = req.params;
        const instrumentosEncontrados = await Instrumento.find({ codigo })
            .populate('idEncargadoGenerar', 'nombres apellidos') // Info del usuario que generó
            .populate('idEncargadoActualizar', 'nombres apellidos') // Info del usuario que actualizó
            .sort({ version: -1 }); // Ordenar por versión descendente

        res.status(200).send({
            message: 'Historico del instrumento obtenido exitosamente',
            data: instrumentosEncontrados
        });
    } catch (error) {
        console.error('No se pudo obtener el historico del instrumento', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function contarInstrumentosVigentes(req, res) {
    try {
        const instrumentosEncontrados = await Instrumento.countDocuments({ vigente: true });
        res.status(200).send({
            message: 'Instrumentos vigentes obtenidos exitosamente',
            data: instrumentosEncontrados
        });
    } catch (error) {
        console.error('No se pudo obtener el conteo de instrumentos vigentes', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const InstrumentoController = {
    registrarInstrumento,
    obtenerInstrumentos,
    obtenerInstrumentoPorId,
    actualizarInstrumento,
    actualizarVigenciaInstrumento,
    listarInstrumentos,
    obtenerHistoricoInstrumento,
    contarInstrumentosVigentes
}

export default InstrumentoController;