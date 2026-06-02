import Noticia from "../schemas/noticia.model.js";
import Planificacion from "../schemas/planificacion.model.js";
import eliminarArchivoFisico from "../utils/eliminarArchivo.js";

async function registrarNoticia(req, res) {
    try {
        const { titulo, descripcion, prioridad, idPlanificacion, idEncargadoGenerar } = req.body;

        if (!titulo || !descripcion || !prioridad || !idPlanificacion || !idEncargadoGenerar) {
            if (req.file) {
                eliminarArchivoFisico(req.file.path);
            }
            return res.status(400).send({ message: 'No se ha proporcionado la información de la noticia' });
        }

        const dataNoticia = {
            titulo,
            descripcion,
            prioridad,
            idPlanificacion,
            idEncargadoGenerar
        }

        if (req.file) {
            dataNoticia.imagen = req.file.path.replace(/\\/g, '/');
        }

        const nuevaNoticia = new Noticia(dataNoticia);
        await nuevaNoticia.save();

        res.status(201).send({ message: 'Noticia registrada exitosamente' });

    } catch (error) {
        console.log('No se pudo registrar la noticia', error.name);
        if (req.file) {
            eliminarArchivoFisico(req.file.path);
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarNoticia(req, res) {
    try {
        const { id } = req.params;
        const { titulo, descripcion, prioridad, idEncargadoActualizar } = req.body;

        if (!titulo || !descripcion || !prioridad || !idEncargadoActualizar) {
            if (req.file) {
                eliminarArchivoFisico(req.file.path);
            }
            return res.status(400).send({ message: 'No se ha proporcionado la información de la noticia' });
        }

        const dataNoticia = {
            titulo,
            descripcion,
            prioridad,
            idEncargadoActualizar
        }

        // Si viene una nueva imagen
        if (req.file) {
            dataNoticia.imagen = req.file.path.replace(/\\/g, '/');
        } else if (!req.body.imagen) { // Deja el campo null de imagen al actualizar
            dataNoticia.imagen = null;
        }

        // Si llega un nuevo archivo o no llega nada -> se verifica si hay imagen para eliminarla
        const noticiaAnterior = req.file || !req.body.imagen ? await Noticia.findById(id).select('imagen') : null;
        const noticiaActualizada = await Noticia.findByIdAndUpdate(id, dataNoticia, { new: true });

        if (noticiaActualizada) {
            if ((req.file || !req.body.imagen) && noticiaAnterior && noticiaAnterior.imagen) {
                await eliminarArchivoFisico(noticiaAnterior.imagen);
            }
            res.status(200).send({ message: 'Noticia actualizada exitosamente' });
        } else {
            if (req.file) {
                eliminarArchivoFisico(req.file.path);
            }
            res.status(404).send({ message: 'No se encontro la noticia' });
        }
    } catch (error) {
        console.log('No se pudo actualizar la noticia', error.name);
        if (req.file) {
            eliminarArchivoFisico(req.file.path);
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerNoticias(req, res) {
    try {
        const options = {
            page: req.body.page || 1,
            limit: req.body.limit || 10,
            sort: { _id: -1 },
            populate: [
                { path: 'idPlanificacion', select: 'periodo' },
                { path: 'idEncargadoGenerar', select: 'nombres apellidos' }
            ]
        };

        // Solo mostrar las noticias del periodo actual
        const planificacionActual = await Planificacion.findOne({ estado: true });

        if (!planificacionActual) {
            return res.status(404).send({ message: 'No se encontró la planificación vigente' });
        }

        let filtro = { idPlanificacion: planificacionActual._id };

        if (req.body.palabra && req.body.palabra.trim() !== "") {
            filtro.titulo = { $regex: req.body.palabra.trim(), $options: "i" };
        }

        const noticiasEncontradas = await Noticia.paginate(filtro, options);

        res.status(200).send({
            message: 'Noticias obtenidas exitosamente',
            data: noticiasEncontradas
        });

    } catch (error) {
        console.log('No se pudo obtener las noticias', error.message);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoNoticia(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!id || !estado) {
            return res.status(400).send({ message: 'No se ha proporcionado la información de la noticia' });
        }

        const noticiaActualizada = await Noticia.findByIdAndUpdate(id, { estado }, { new: true });
        if (noticiaActualizada) {
            res.status(200).send({ message: 'Noticia actualizada exitosamente' });
        } else {
            res.status(404).send({ message: 'No se encontro la noticia' });
        }
    } catch (error) {
        console.log('No se pudo actualizar el estado de la noticia', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerNoticiaPorId(req, res) {
    try {
        const { id } = req.params;
        const noticiaEncontrada = await Noticia.findById(id).populate('idPlanificacion', 'periodo');

        if (!noticiaEncontrada) {
            return res.status(404).send({ message: 'No se encontro la noticia' });
        }

        res.status(200).send({
            message: 'Noticia obtenida exitosamente',
            data: noticiaEncontrada
        });
    } catch (error) {
        console.log('No se pudo obtener la noticia', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function eliminarNoticia(req, res) {
    try {
        const { id } = req.params;
        const noticiaEncontrada = await Noticia.findByIdAndDelete(id);

        if (!noticiaEncontrada) {
            return res.status(404).send({ message: 'No se encontro la noticia' });
        }

        res.status(200).send({ message: 'Noticia eliminada exitosamente' });
    } catch (error) {
        console.log('No se pudo eliminar la noticia', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const NoticiaController = {
    registrarNoticia,
    actualizarNoticia,
    obtenerNoticias,
    actualizarEstadoNoticia,
    obtenerNoticiaPorId,
    eliminarNoticia
}

export default NoticiaController;