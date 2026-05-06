import Rol from "../schemas/rol.model.js";

async function registrarRol(req, res) {
    try {
        const { nombre } = req.body;

        // Validación de campos obligatorios
        if (!nombre) {
            return res.status(400).send({ message: 'No se ha proporcionado el nombre del rol' });
        }

        // Obtención de último código para identificador
        const ultimoCodigo = await Rol.findOne().sort({ codigo: -1 }); // Ordena de mayor a menor
        const nuevoCodigo = ultimoCodigo ? ultimoCodigo.codigo + 1 : 1;

        // Creación del nuevo rol
        const nuevoRol = new Rol({
            nombre,
            codigo: nuevoCodigo,
            estado: 1
        });

        // Guardar nuevo rol en la base de datos
        await nuevoRol.save();

        res.status(201).send({ message: 'Rol registrado exitosamente' });

    } catch (error) {
        console.log('No se pudo registrar el rol', error.name);
        // Mensaje para cuando el tipo de error es campo duplicado
        if (error.code === 11000) {
            return res.status(409).send({ message: 'El rol ya existe' });
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerRoles(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10
        };

        const rolesEncontrados = await Rol.paginate({ estado: { $ne: 2 } }, options); // Activos e inactivos - no eliminados (estado 2)
        if (rolesEncontrados.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron roles' });
        }
        res.status(200).send({
            message: 'Roles obtenidos exitosamente',
            data: rolesEncontrados
        });
    } catch (error) {
        console.log('No se pudo obtener los roles', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoRol(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Validación de campos obligatorios
        if (!id || estado == null) {
            return res.status(400).send({ message: 'No se ha proporcionado la información del rol' });
        }

        // Actualización del rol
        const rolActualizado = await Rol.findByIdAndUpdate(id, { estado }, { new: true });

        if (rolActualizado) {
            res.status(200).send({ message: 'Rol actualizado exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el estado del rol' });
        }
    } catch (error) {
        console.log('No se pudo actualizar el estado del rol', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarRol(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        // Validación de campos obligatorios
        if (!id || !nombre) {
            return res.status(400).send({ message: 'No se ha proporcionado la información del rol' });
        }

        // Actualización del rol
        const rolActualizado = await Rol.findByIdAndUpdate(id, { nombre }, { new: true });

        if (rolActualizado) {
            res.status(200).send({ message: 'Rol actualizado exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el rol' });
        }
    } catch (error) {
        console.log('No se pudo actualizar el rol', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerRolPorId(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: 'No se ha proporcionado el id del rol' });
        }

        const rolEncontrado = await Rol.findById(id);
        if (!rolEncontrado) {
            return res.status(404).send({ message: 'No se encontró el rol especificado' });
        }
        res.status(200).send({
            message: 'Rol obtenido exitosamente',
            data: rolEncontrado
        });
    } catch (error) {
        console.log('No se pudo obtener el rol', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function contarRolesActivos(req, res) {
    try {
        const rolesEncontrados = await Rol.countDocuments({ estado: 1 });

        res.status(200).send({
            message: 'Total de roles obtenidos exitosamente',
            data: rolesEncontrados
        });
    } catch (error) {
        console.log('No se pudo obtener el total de roles activos', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function listarRoles(req, res) {
    try {
        const rolesEncontrados = await Rol.find({ estado: 1 });
        res.status(200).send({
            message: 'Roles obtenidos exitosamente',
            data: rolesEncontrados
        });
    } catch (error) {
        console.log('No se pudo obtener los roles', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const RolController = {
    registrarRol,
    obtenerRoles,
    actualizarEstadoRol,
    actualizarRol,
    obtenerRolPorId,
    contarRolesActivos,
    listarRoles
}

export default RolController;