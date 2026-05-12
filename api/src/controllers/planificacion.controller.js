import Planificacion from "../schemas/planificacion.model.js";
import Noticia from "../schemas/noticia.model.js";

async function registrarPlanificacion(req, res) {
    try {
        const { periodo, fechaInicio, fechaFin, subprocesos, idEncargadoGenerar } = req.body;

        // Información general de la planificación
        if (!periodo || !fechaInicio || !fechaFin || !subprocesos || subprocesos.length === 0 || !idEncargadoGenerar) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información de la planificación' });
        }

        // Validar subprocesos relacionados a la planificación
        for (const subproceso of subprocesos) {
            const { identificador, nombre, descripcion, fechaInicio, fechaFin } = subproceso;

            if (!identificador || !nombre || !descripcion || !fechaInicio || !fechaFin) {
                return res.status(400).send({ message: `El subproceso "${nombre || 'sin nombre'}" tiene datos incompletos` });
            }

            for (const actividad of subproceso.actividades) {
                const { nombre, descripcion, fechaInicio, fechaFin, idParticipante } = actividad;

                if (!nombre || !descripcion || !fechaInicio || !fechaFin || !idParticipante) {
                    return res.status(400).send({ message: `La actividad "${nombre || 'sin nombre'}" tiene datos incompletos` });
                }

                for (const instrumento of actividad.instrumentos) {
                    const { idInstrumento, identificador } = instrumento;

                    if (!idInstrumento || !identificador) {
                        return res.status(400).send({ message: `El instrumento "${idInstrumento || 'sin nombre'}" tiene datos incompletos` });
                    }
                }
            }
        }

        // Creación de planificación con subprocesos embebidos
        const nuevaPlanificacion = new Planificacion({
            periodo,
            fechaInicio,
            fechaFin,
            subprocesos,
            idEncargadoGenerar
        });

        await nuevaPlanificacion.save();

        // Las demás planificaciones se marcan como deshabilitadas -> solo una queda vigente
        await Planificacion.updateMany({ _id: { $ne: nuevaPlanificacion._id } }, { estado: false });
        // Las noticias automáticamente pasan a estado false
        await Noticia.updateMany({ idPlanificacion: { $ne: nuevaPlanificacion._id }, estado: true }, { estado: false });
        // No usa type objectId porque se usa la info de la planificacion creada

        res.status(201).send({ message: 'Planificación registrada exitosamente' });
    } catch (error) {
        console.error("No se pudo registrar la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPlanificaciones(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10,
            populate: [
                { path: 'subprocesos.actividades.idParticipante', select: 'nombre' },
                { path: 'subprocesos.actividades.instrumentos.idInstrumento', select: 'codigo nombre archivo version' }
            ]
        }

        const planificacionesEncontradas = await Planificacion.paginate({}, options);

        if (planificacionesEncontradas.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron planificaciones' });
        }

        res.status(200).send({
            message: "Planificaciones encontradas exitosamente",
            data: planificacionesEncontradas
        });

    } catch (error) {
        console.error("No se pudo obtener las planificaciones: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function actualizarPlanificacion(req, res) {
    try {
        const { id } = req.params;

        const datosActualizar = { ...req.body };

        // Validación general
        if (
            !datosActualizar.periodo ||
            !datosActualizar.fechaInicio ||
            !datosActualizar.fechaFin ||
            !datosActualizar.subprocesos ||
            datosActualizar.subprocesos.length === 0 ||
            !datosActualizar.idEncargadoActualizar
        ) {
            return res.status(400).send({ message: "No se ha proporcionado toda la información de la planificación" });
        }

        // Validación de subprocesos
        for (const subproceso of datosActualizar.subprocesos) {
            if (
                !subproceso.identificador ||
                !subproceso.nombre ||
                !subproceso.descripcion ||
                !subproceso.fechaInicio ||
                !subproceso.fechaFin
            ) {
                return res.status(400).send({ message: `El subproceso "${subproceso.nombre || 'sin nombre'}" tiene datos incompletos` });
            }

            // Validación de actividades
            for (const actividad of subproceso.actividades) {
                if (
                    !actividad.nombre ||
                    !actividad.descripcion ||
                    !actividad.fechaInicio ||
                    !actividad.fechaFin ||
                    !actividad.idParticipante
                ) {
                    return res.status(400).send({ message: `La actividad "${actividad.nombre || 'sin nombre'}" tiene datos incompletos` });
                }

                // Validación instrumentos
                for (const instrumento of actividad.instrumentos) {
                    if (
                        !instrumento.idInstrumento ||
                        !instrumento.identificador
                    ) {
                        return res.status(400).send({ message: `Un instrumento de la actividad "${actividad.nombre}" tiene datos incompletos` });
                    }
                }
            }
        }

        datosActualizar.fechaActualizacion = new Date();

        const planificacionActualizada = await Planificacion.findByIdAndUpdate(id, datosActualizar, { new: true });

        if (!planificacionActualizada) {
            return res.status(404).send({ message: "No se encontró la planificación" });
        }

        res.status(200).send({
            message: "Planificación actualizada exitosamente",
            data: planificacionActualizada
        });
    } catch (error) {
        console.error("No se pudo actualizar la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function actualizarEstadoPlanificacion(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const planificacionActualizada = await Planificacion.findByIdAndUpdate(id, { estado }, { new: true });

        if (!planificacionActualizada) {
            return res.status(404).send({ message: "No se encontró la planificación" });
        }

        // Si se desactiva la planificación -> cumplio vigencia
        if (estado === false) {
            // Las noticias de esa planificación automáticamente pasan a estado false
            await Noticia.updateMany({ idPlanificacion: id, estado: true }, { estado: false });
            // Object id porque de params viene como string y no se puede comparar asi nomas
        }

        res.status(200).send({
            message: "Estado de la planificación actualizado exitosamente",
            data: planificacionActualizada
        });

    } catch (error) {
        console.error("No se pudo actualizar el estado de la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPlanificacionPorId(req, res) {
    try {
        const { id } = req.params;

        const planificacionEncontrada = await Planificacion.findById(id)
            .populate([
                { path: "subprocesos.actividades.idParticipante", select: "nombre" },
                { path: "subprocesos.actividades.instrumentos.idInstrumento", select: "codigo nombre archivo version" }
            ]);

        if (!planificacionEncontrada) {
            return res.status(404).send({ message: "No se encontró la planificación" });
        }

        res.status(200).send({
            message: "Planificación obtenida exitosamente",
            data: planificacionEncontrada
        });
    } catch (error) {
        console.error("No se pudo obtener la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPlanificacionVigente(req, res) {
    try {
        const planificacionVigente = await Planificacion.findOne({ estado: true })
            .populate([
                { path: "subprocesos.actividades.idParticipante", select: "nombre" },
                { path: "subprocesos.actividades.instrumentos.idInstrumento", select: "codigo nombre archivo version" }
            ]);

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontró una planificación vigente" });
        }

        res.status(200).send({
            message: "Planificación vigente obtenida exitosamente",
            data: planificacionVigente
        });
    } catch (error) {
        console.error("No se pudo obtener la planificación vigente: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

export default {
    registrarPlanificacion,
    obtenerPlanificaciones,
    actualizarPlanificacion,
    actualizarEstadoPlanificacion,
    obtenerPlanificacionPorId,
    obtenerPlanificacionVigente
}