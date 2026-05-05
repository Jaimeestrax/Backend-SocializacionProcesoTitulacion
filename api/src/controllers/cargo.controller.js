import Cargo from "../schemas/cargo.model.js";

async function registrarCargo(req, res) {
    try {
        const { nombre } = req.body;

        // Validación de campos obligatorios
        if (!nombre) {
            return res.status(400).send({ message: 'No se ha proporcionado el nombre del cargo' });
        }

        // Creación del nuevo cargo
        const nuevoCargo = new Cargo({
            nombre,
            estado: 1
        });

        // Guardar nuevo cargo en la base de datos
        await nuevoCargo.save();

        res.status(201).send({ message: 'Cargo registrado exitosamente' });

    } catch (error) {
        console.log('No se pudo registrar el cargo', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoCargo(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validación de campos obligatorios
        if (!id || estado == null) {
            return res.status(400).send({ message: 'No se ha proporcionado la información del cargo' });
        }

        // Actualización del cargo
        const cargoActualizado = await Cargo.findByIdAndUpdate(id, { estado }, { new: true });

        if (cargoActualizado) {
            res.status(200).send({ message: 'Cargo actualizado exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el estado del cargo' });
        }
    } catch (error) {
        console.log('No se pudo actualizar el estado del cargo', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerCargos(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10
        };

        const cargosEncontrados = await Cargo.paginate({ estado: { $ne: 2 } }, options);

        if (cargosEncontrados.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron cargos' });
        }

        res.status(200).send({
            message: 'Cargos obtenidos exitosamente',
            data: cargosEncontrados
        });
    } catch (error) {
        console.log('No se pudo obtener los cargos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function listarCargos(req, res) {
    try {
        const cargos = await Cargo.find();
        res.status(200).send({
            message: "Cargos obtenidos exitosamente",
            data: cargos
        });
    } catch (error) {
        console.error('No se pudo obtener los cargos', error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerCargoPorId(req, res) {
    try {
        const { id } = req.params;
        const cargoEncontrado = await Cargo.findById(id);
        if (!cargoEncontrado) {
            return res.status(404).send({ message: 'No se encontró el cargo' });
        }
        res.status(200).send({
            message: 'Cargo obtenido exitosamente',
            data: cargoEncontrado
        });
    } catch (error) {
        console.error('No se pudo obtener el cargo', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarCargo(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        if (!id || !nombre) {
            return res.status(400).send({ message: 'No se ha proporcionado la información del cargo' });
        }
        const cargoActualizado = await Cargo.findByIdAndUpdate(id, { nombre }, { new: true });
        if (cargoActualizado) {
            res.status(200).send({ message: 'Cargo actualizado exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el cargo' });
        }
    } catch (error) {
        console.log('No se pudo actualizar el cargo', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerCargosActivos(req, res) {
    try {
        const cargosEncontrados = await Cargo.countDocuments({ estado: 1 });

        res.status(200).send({
            message: 'Total cargos activos obtenidos exitosamente',
            data: cargosEncontrados
        });
    } catch (error) {
        console.log('No se pudo obtener el total de cargos activos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

// Exportar los controladores
const CargoController = {
    registrarCargo,
    actualizarEstadoCargo,
    obtenerCargos,
    listarCargos,
    obtenerCargoPorId,
    actualizarCargo,
    obtenerCargosActivos
}

export default CargoController;

