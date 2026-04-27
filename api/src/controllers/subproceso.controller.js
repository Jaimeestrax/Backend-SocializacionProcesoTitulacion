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
        const { nombre, descripcion, actividades } = req.body;

        const datosActualizar = {};
        // Metadata subproceso
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

const SubprocesoController = {
    registrarSubproceso,
    obtenerSubprocesos,
    actualizarSubproceso,
    actualizarEstadoSubproceso,
    obtenerSubprocesoPorId
}

export default SubprocesoController;