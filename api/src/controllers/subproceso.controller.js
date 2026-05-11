import Subproceso from "../schemas/subproceso.model.js";

async function registrarSubproceso(req, res) {
    try {
        const { identificador, nombre, descripcion, orden, actividades, idEncargadoGenerar } = req.body;

        // Información general del subproceso
        if (!identificador || !nombre || !descripcion || !orden || !actividades || actividades.length === 0 || !idEncargadoGenerar) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del subproceso' });
        }

        // Validar actividades relacionadas al subproceso
        for (const actividad of actividades) {
            const { nombre, descripcion, idParticipante } = actividad;

            if (!nombre || !descripcion || !idParticipante) {
                return res.status(400).send({ message: `La actividad "${nombre || 'sin nombre'}" tiene datos incompletos` });
            }
        }

        // Desplazar ordenes en caso de que se haya enviado un orden que ya estaba
        await Subproceso.updateMany({ orden: { $gte: orden }, estado: { $ne: 2 } }, { $inc: { orden: 1 } }); // inc -> incrementa 1 al valor

        // Creación de subproceso con actividades embebidas
        const nuevoSubproceso = new Subproceso({
            identificador,
            nombre,
            descripcion,
            orden,
            actividades,
            idEncargadoGenerar
        });

        await nuevoSubproceso.save();

        res.status(201).send({ message: 'Subproceso registrado exitosamente' });

    } catch (error) {
        console.error('No se pudo registrar el subproceso', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerSubprocesos(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 20,
            sort: { orden: 1 }, // Orden ascendente
            populate: [
                { path: 'actividades.idParticipante', select: 'nombre' },
                { path: 'actividades.instrumentos', select: 'codigo nombre archivo version' }
            ]
        };

        const subprocesosEncontrados = await Subproceso.paginate({ estado: { $ne: 2 } }, options);

        if (subprocesosEncontrados.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron subprocesos' });
        }

        res.status(200).send({
            message: 'Subprocesos obtenidos exitosamente',
            data: subprocesosEncontrados
        });

    } catch (error) {
        console.error('No se pudo obtener los subprocesos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarSubproceso(req, res) {
    try {
        const { id } = req.params;
        const datosActualizar = { ...req.body };

        // Validación básica
        if (
            !datosActualizar.identificador ||
            !datosActualizar.nombre ||
            !datosActualizar.descripcion ||
            !datosActualizar.orden ||
            !datosActualizar.actividades ||
            datosActualizar.actividades.length === 0 ||
            !datosActualizar.idEncargadoActualizar
        ) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del subproceso' });
        }

        // Validar actividades
        for (const actividad of datosActualizar.actividades) {
            const { nombre, descripcion, idParticipante } = actividad;

            if (!nombre || !descripcion || !idParticipante) {
                return res.status(400).send({ message: `La actividad "${nombre || 'sin nombre'}" tiene datos incompletos` });
            }
        }

        // Actualización de orden
        const subprocesoActual = await Subproceso.findById(id);

        if (!subprocesoActual) {
            return res.status(404).send({ message: 'No se encontró el subproceso' });
        }

        const ordenAnterior = subprocesoActual.orden;
        const nuevoOrden = datosActualizar.orden;

        // Verificamos si cambio el orden
        if (ordenAnterior !== nuevoOrden) {
            // Caso 1: Bajo de orden -> los demás deben subir
            if (nuevoOrden < ordenAnterior) {
                await Subproceso.updateMany(
                    {
                        _id: { $ne: id }, // No se incluye el subproceso actual
                        // Orden mayor o igual al nuevo orden y menor al anterior -> establece rango de elementos a mover
                        orden: {
                            $gte: nuevoOrden,
                            $lt: ordenAnterior
                        },
                        estado: { $ne: 2 }
                    }, { $inc: { orden: 1 } }
                );
            }
            // Caso 2: Subió de orden -> los demás deben bajar
            else {
                await Subproceso.updateMany(
                    {
                        _id: { $ne: id },
                        orden: {
                            $gt: ordenAnterior,
                            $lte: nuevoOrden
                        },
                        estado: { $ne: 2 }
                    },
                    {
                        $inc: { orden: -1 } // Decrementa en 1 al orden de los elementos
                    }
                );
            }
        }

        datosActualizar.fechaActualizacion = new Date(); // Actualiza la fecha de modificación
        const subprocesoActualizado = await Subproceso.findByIdAndUpdate(id, datosActualizar, { new: true });

        res.status(200).send({
            message: 'Subproceso actualizado exitosamente',
            data: subprocesoActualizado
        });

    } catch (error) {
        console.error('No se pudo actualizar el subproceso', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoSubproceso(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Actualiza estado y fecha de modificación
        const datosActualizar = {
            estado,
            fechaActualizacion: new Date()
        };
        const subprocesoActualizado = await Subproceso.findByIdAndUpdate(id, datosActualizar, { new: true });

        res.status(200).send({
            message: 'Estado del subproceso actualizado exitosamente',
            data: subprocesoActualizado
        });

    } catch (error) {
        console.error('No se pudo actualizar el estado del subproceso', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerSubprocesoPorId(req, res) {
    try {
        const { id } = req.params;
        const subprocesoEncontrado = await Subproceso.findById(id).populate([
            { path: 'actividades.idParticipante', select: 'nombre' },
            { path: 'actividades.instrumentos', select: 'codigo nombre archivo version' }
        ]);

        if (!subprocesoEncontrado) {
            return res.status(404).send({ message: 'No se encontro el subproceso' });
        }

        res.status(200).send({
            message: 'Subproceso obtenido exitosamente',
            data: subprocesoEncontrado
        });
    } catch (error) {
        console.error('No se pudo obtener el subproceso', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function contarSubprocesosActivos(req, res) {
    try {
        const subprocesosActivos = await Subproceso.countDocuments({ estado: 1 });
        res.status(200).send({
            message: 'Subprocesos activos obtenidos exitosamente',
            data: subprocesosActivos
        });
    } catch (error) {
        console.error('No se pudo contar los subprocesos activos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const SubprocesoController = {
    registrarSubproceso,
    obtenerSubprocesos,
    actualizarSubproceso,
    actualizarEstadoSubproceso,
    obtenerSubprocesoPorId,
    contarSubprocesosActivos
}

export default SubprocesoController;