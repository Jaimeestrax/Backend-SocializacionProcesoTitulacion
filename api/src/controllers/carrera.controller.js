import Carrera from "../schemas/carrera.model.js";

async function registrarCarrera(req, res) {
    try {
        const { codigo, nombre } = req.body;

        if (!codigo || !nombre) {
            return res.status(400).send({ message: 'No se ha proporcionado la información de la carrera' });
        }

        const nuevaCarrera = new Carrera({
            codigo,
            nombre
        });

        await nuevaCarrera.save();

        res.status(201).send({ message: 'Carrera registrada exitosamente' });
    } catch (error) {
        console.log('No se pudo registrar la carrera', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoCarrera(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!id || estado == null) {
            return res.status(400).send({ message: 'No se ha proporcionado la información de la carrera' });
        }

        const carreraActualizada = await Carrera.findByIdAndUpdate(id, { estado }, { new: true });

        if (carreraActualizada) {
            res.status(200).send({ message: 'Carrera actualizada exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el estado de la carrera' });
        }
    } catch (error) {
        console.log('No se pudo actualizar el estado de la carrera', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerCarreras(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10
        };

        const filtro = { estado: { $ne: 2 } };

        if (req.body.palabra && req.body.palabra.trim() !== "") {
            filtro.$or = [
                { codigo: { $regex: req.body.palabra.trim(), $options: "i" } },
                { nombre: { $regex: req.body.palabra.trim(), $options: "i" } }
            ];
        }

        const carrerasEncontradas = await Carrera.paginate(filtro, options);

        if (carrerasEncontradas.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron carreras' });
        }

        res.status(200).send({
            message: 'Carreras obtenidas exitosamente',
            data: carrerasEncontradas
        });
    } catch (error) {
        console.log('No se pudo obtener las carreras', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerCarreraPorId(req, res) {
    try {
        const { id } = req.params;
        const carreraEncontrada = await Carrera.findById(id);

        if (!carreraEncontrada) {
            return res.status(404).send({ message: 'No se encontró la carrera' });
        }

        res.status(200).send({
            message: 'Carrera obtenida exitosamente',
            data: carreraEncontrada
        });
    } catch (error) {
        console.log('No se pudo obtener la carrera', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarCarrera(req, res) {
    try {
        const { id } = req.params;
        const { codigo, nombre } = req.body;

        if (!id || !codigo || !nombre) {
            return res.status(400).send({ message: 'No se ha proporcionado la información de la carrera' });
        }

        const carreraActualizada = await Carrera.findByIdAndUpdate(id, { codigo, nombre }, { new: true });

        if (carreraActualizada) {
            res.status(200).send({ message: 'Carrera actualizada exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar la carrera' });
        }
    } catch (error) {
        console.log('No se pudo actualizar la carrera', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerCarrerasActivas(req, res) {
    try {
        const carrerasEncontradas = await Carrera.countDocuments({ estado: 1 });
        res.status(200).send({
            message: 'Total carreras activas obtenidas exitosamente',
            data: carrerasEncontradas
        });
    } catch (error) {
        console.log('No se pudo obtener el total de carreras activas', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function listarCarreras(req, res) {
    try {
        const carrerasEncontradas = await Carrera.find({ estado: 1 });
        res.status(200).send({
            message: 'Carreras obtenidas exitosamente',
            data: carrerasEncontradas
        });
    } catch (error) {
        console.log('No se pudo obtener las carreras', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const CarreraController = {
    registrarCarrera,
    actualizarEstadoCarrera,
    obtenerCarreras,
    obtenerCarreraPorId,
    actualizarCarrera,
    obtenerCarrerasActivas,
    listarCarreras
}

export default CarreraController;