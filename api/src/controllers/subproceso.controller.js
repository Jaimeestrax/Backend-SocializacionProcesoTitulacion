import Subproceso from "../schemas/subproceso.model.js";
import Actividad from "../schemas/actividad.model.js";

async function registrarSubproceso(req, res) {
    try {
        const { identificador, nombre, descripcion, actividades } = req.body;

        if (!identificador || !nombre || !actividades || actividades.length === 0) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del subproceso' });
        }

        // Crear las actividades y guardarlas
        const actividadesGuardadas = [];
        for (const act of actividades) {
            const { nombre, descripcion, id_cargo, fecha_inicio, fecha_fin, instrumentos } = act;

            if (!nombre || !descripcion || !fecha_inicio || !fecha_fin) {
                return res.status(400).send({ message: `La actividad "${nombre || 'sin nombre'}" tiene datos incompletos` });
            }

            const nuevaActividad = new Actividad({
                nombre,
                descripcion,
                id_cargo: id_cargo || null,
                fecha_inicio: new Date(fecha_inicio),
                fecha_fin: new Date(fecha_fin),
                instrumentos: instrumentos || []
            });

            const actividadGuardada = await nuevaActividad.save();
            actividadesGuardadas.push(actividadGuardada);
        }

        // Calcular fecha_inicio y fecha_fin del subproceso
        const fechasInicio = actividadesGuardadas.map(a => new Date(a.fecha_inicio));
        const fechasFin = actividadesGuardadas.map(a => new Date(a.fecha_fin));
        // En base a las fechas de las actividades toma la menor fecha de inicio y la mayor de fin
        const fechaInicioSubproceso = new Date(Math.min(...fechasInicio));
        const fechaFinSubproceso = new Date(Math.max(...fechasFin));

        const nuevoSubproceso = new Subproceso({
            identificador,
            nombre,
            descripcion,
            estado: true,
            fecha_inicio: fechaInicioSubproceso,
            fecha_fin: fechaFinSubproceso,
            actividades: actividadesGuardadas.map(a => a._id)
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
            limit: req.body.limite || 10,
            populate: {
                path: 'actividades',
                populate: [
                    { path: 'id_cargo', select: 'nombre' },
                    { path: 'instrumentos', select: 'identificador nombre ruta' }
                ]
            }
        };

        const subprocesosEncontrados = await Subproceso.paginate({ estado: true }, options);

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
        const { identificador, nombre, descripcion, actividades } = req.body;

        const datosActualizar = {};
        // Metadata subproceso
        if (identificador) datosActualizar.identificador = identificador;
        if (nombre) datosActualizar.nombre = nombre;
        if (descripcion) datosActualizar.descripcion = descripcion;

        // Si vienen actividades se actualizan
        if (actividades && actividades.length > 0) {
            for (const act of actividades) {
                const { _id, nombre, descripcion, id_cargo, fecha_inicio, fecha_fin, instrumentos } = act;

                // Agregamos al objeto solo los datos que vengan
                const datosActividad = {
                    // Si es vacio el spread no agrega nada
                    ...(nombre && { nombre }), // Evalua que exista nombre
                    ...(descripcion && { descripcion }), // Evalua que exista descripcion
                    ...(id_cargo && { id_cargo }), // Evalua que exista id_cargo
                    ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }), // Evalua que exista fecha_inicio
                    ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }), // Evalua que exista fecha_fin
                    ...(instrumentos && { instrumentos: instrumentos }) // Evalua que exista instrumentos
                };

                await Actividad.findByIdAndUpdate(_id, datosActividad, { new: true });
            }

            // Recalcular fechas del subproceso con los datos actualizados
            const actividadesActualizadas = await Actividad.find({
                _id: { $in: actividades.map(a => a._id) }
            });

            // Calculo de fechas para el subproceso
            const fechasInicio = actividadesActualizadas.map(a => new Date(a.fecha_inicio));
            const fechasFin = actividadesActualizadas.map(a => new Date(a.fecha_fin));
            datosActualizar.fecha_inicio = new Date(Math.min(...fechasInicio));
            datosActualizar.fecha_fin = new Date(Math.max(...fechasFin));
        }

        datosActualizar.fecha_actualizacion = new Date(); // Actualiza la fecha de modificación
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
            fecha_actualizacion: new Date()
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
        const subprocesoEncontrado = await Subproceso.findById(id).populate({
            path: 'actividades',
            populate: [
                { path: 'id_cargo', select: 'nombre' },
                { path: 'instrumentos', select: 'identificador nombre ruta' }
            ]
        });

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

async function obtenerSubprocesoActual(req, res) {
    try {
        // En base a la fecha actual
        const hoy = new Date();

        // Normalizamos la fecha para que sea el inicio del dia
        hoy.setHours(0, 0, 0, 0);

        // Buscar subprocesos donde la fecha actual este dentro de su rango
        const subprocesoActual = await Subproceso.findOne({
            estado: true,
            fecha_inicio: { $lte: hoy }, // lte -> lower than or equal
            fecha_fin: { $gte: hoy } // gte -> greater than or equal
        })
            .sort({ fecha_inicio: -1 }) // Ordena de mayor a menor -> mas reciente al inicio
            .populate({
                path: 'actividades',
                populate: [
                    { path: 'id_cargo', select: 'nombre' },
                    { path: 'instrumentos', select: 'identificador nombre ruta' }
                ]
            });

        if (!subprocesoActual) {
            return res.status(404).send({ message: 'No hay subproceso activo para la fecha actual' });
        }

        res.status(200).send({
            message: 'Subproceso actual obtenido exitosamente',
            data: subprocesoActual
        });

    } catch (error) {
        console.error('No se pudo obtener el subproceso actual', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerSubprocesosProximos(req, res) {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // normalizar

        const subProcesosEncontrados = await Subproceso.find({
            estado: true,
            fecha_inicio: { $gt: hoy } // fecha inicio > hoy
        })
            .sort({ fecha_inicio: 1 }) //Ordenamos del más próximo al más lejano
            .populate({
                path: 'actividades',
                populate: [
                    { path: 'id_cargo', select: 'nombre' },
                    { path: 'instrumentos', select: 'identificador nombre ruta' }
                ]
            });

        if (!subProcesosEncontrados || subProcesosEncontrados.length === 0) {
            return res.status(404).send({ message: 'No hay subprocesos próximos' });
        }

        res.status(200).send({
            message: 'Subprocesos próximos obtenidos exitosamente',
            data: subProcesosEncontrados
        });

    } catch (error) {
        console.error('Error al obtener subprocesos próximos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerPorcentajeAvance(req, res) {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        let porcentaje = 0;

        // Obtenemos los subprocesos activos
        const subprocesos = await Subproceso.find(
            { estado: true },
            { _id: 1 }
        );

        if (!subprocesos || subprocesos.length === 0) {
            return res.status(200).send({
                message: 'No hay subprocesos activos',
                data: porcentaje
            });
        }

        // Mapeamos los ids
        const subprocesosIds = subprocesos.map(sp => sp._id);

        // Obtenemos total de actividades de esos subprocesos
        const totalActividades = await Actividad.countDocuments({
            _id: { $in: subprocesosIds.length ? await Subproceso.distinct("actividades", { _id: { $in: subprocesosIds } }) : [] }
        });

        if (totalActividades === 0) {
            return res.status(200).send({
                message: 'No hay actividades registradas',
                data: porcentaje
            });
        }

        // Obtenemos actividades finalizadas
        const actividadesFinalizadas = await Actividad.countDocuments({
            _id: {
                $in: await Subproceso.distinct("actividades", { _id: { $in: subprocesosIds } })
            },
            fecha_fin: { $lt: hoy }
        });

        porcentaje = (actividadesFinalizadas / totalActividades) * 100;

        res.status(200).send({
            message: 'Progeso del proceso calculado exitosamente',
            data: Number(porcentaje.toFixed(2)) // Redondear a dos decimales
        });

    } catch (error) {
        console.error('Error al calcular avance por actividades', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const SubprocesoController = {
    registrarSubproceso,
    obtenerSubprocesos,
    actualizarSubproceso,
    actualizarEstadoSubproceso,
    obtenerSubprocesoPorId,
    obtenerSubprocesoActual,
    obtenerSubprocesosProximos,
    obtenerPorcentajeAvance
}

export default SubprocesoController;