import Usuario from "../schemas/usuario.model.js";
import { hashear } from "../utils/bcrypt.js";
import eliminarArchivoFisico from "../utils/eliminarArchivo.js";

async function registrarUsuario(req, res) {
    try {
        const { nombres, apellidos, correo, usuario, contrasena, idRol, idCargo, idCarrera } = req.body;

        // Validación de campos obligatorios
        if (!nombres || !apellidos || !idRol || !idCargo || !idCarrera) {
            // 400 Bad Request
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del usuario' });
        }

        // Validación de los datos de la cuenta a crear
        if (!correo || !usuario || !contrasena) {
            return res.status(400).send({ message: 'No se ha proporcionado la información de la cuenta' });
        }

        // Validación de contraseña segura
        // if (contrasena.length < 14) {
        //     // Según NIST 2024 debe ser al menos de 14 caracteres
        //     return res.status(400).send({ message: 'La contraseña debe tener al menos 14 caracteres' });
        // }

        // Cifrado de contraseña
        const contrasenaHasheada = await hashear(contrasena);

        // Creación del nuevo usuario
        const nuevoUsuario = new Usuario({
            nombres,
            apellidos,
            correo,
            usuario,
            contrasena: contrasenaHasheada,
            idRol,
            idCargo,
            idCarrera
        });

        // Guardar nuevo usuario en la base de datos
        await nuevoUsuario.save();

        // 201 Created
        res.status(201).send({ message: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error('No se pudo registrar el usuario: ', error.name); // Evita exponer información sensible
        // Errores de clave duplicada
        if (error.code === 11000) {
            const campo = Object.keys(error.keyPattern)[0];
            if (campo === 'usuario') {
                return res.status(409).send({ message: 'El usuario ya existe' });
            }
            if (campo === 'correo') {
                return res.status(409).send({ message: 'El correo ya existe' });
            }
            return res.status(409).send({ message: 'Existe un campo duplicado' });
        }
        // Errores de validación del esquema
        if (error.name === 'ValidationError') {
            const errores = error.errors;
            // Validación del match del correo
            if (errores.correo && errores.correo.kind === 'match') {
                return res.status(400).send({ message: 'El correo no cumple con el formato institucional' });
            }
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerUsuarioAutenticado(req, res) {
    try {
        // Usuario obtenido mediante middleware de auth
        res.status(200).send({
            message: 'Usuario obtenido exitosamente',
            data: req.user
        });
    } catch (error) {
        console.log('No se pudo obtener el usuario:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerUsuarios(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10,
            sort: { _id: -1 },
            populate: [
                { path: 'idRol', select: 'nombre estado' },
                { path: 'idCargo', select: 'nombre estado' },
                { path: 'idCarrera', select: 'nombre estado' }
            ]
        };

        let filtro = { estado: { $ne: 2 } };

        if (req.body.palabra && req.body.palabra.trim() !== "") {
            filtro.$or = [
                { nombres: { $regex: req.body.palabra.trim(), $options: "i" } },
                { apellidos: { $regex: req.body.palabra.trim(), $options: "i" } },
                { correo: { $regex: req.body.palabra.trim(), $options: "i" } },
                { usuario: { $regex: req.body.palabra.trim(), $options: "i" } }
            ];
        }

        // Filtro por carrera
        if (req.body.idCarrera) {
            filtro.idCarrera = req.body.idCarrera;
        }

        const usuariosEncontrados = await Usuario.paginate(filtro, options);

        if (usuariosEncontrados.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron usuarios' });
        }

        res.status(200).send({
            message: 'Usuarios obtenidos exitosamente',
            data: usuariosEncontrados
        });
    } catch (error) {
        console.log('No se pudo obtener el usuario:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarUsuario(req, res) {
    try {
        const { id } = req.params;
        const datosActualizar = { ...req.body };

        // Solo se actualiza la contraseña si se recibe una nueva contraseña
        if (datosActualizar.contrasena) {
            if (datosActualizar.contrasena.length < 14) {
                return res.status(400).send({ message: 'La contraseña debe tener al menos 14 caracteres' });
            }
            const contrasenaHasheada = await hashear(datosActualizar.contrasena);
            datosActualizar.contrasena = contrasenaHasheada;
        }

        if (req.file) {
            // Ruta multiplataforma
            datosActualizar.foto = req.file.path.replace(/\\/g, '/');
        }

        // Buscar el usuario a actualizar para eliminar foto vieja si se sube una nueva
        const usuarioAnterior = req.file ? await Usuario.findById(id).select('foto') : null;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, datosActualizar, { new: true });

        if (usuarioActualizado) {
            // Borra foto vieja si se actualizo correctamente
            if (req.file && usuarioAnterior && usuarioAnterior.foto) {
                await eliminarArchivoFisico(usuarioAnterior.foto);
            }
            res.status(200).send({ message: 'Usuario actualizado exitosamente' });
        } else {
            if (req.file) {
                eliminarArchivoFisico(req.file.path);
            }
            res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
        }
    } catch (error) {
        console.error('No se pudo actualizar el usuario:', error.name);
        if (req.file) {
            eliminarArchivoFisico(req.file.path);
        }
        // Errores de clave duplicada
        if (error.code === 11000) {
            const campo = Object.keys(error.keyPattern)[0];
            if (campo === 'usuario') {
                return res.status(409).send({ message: 'El usuario ya existe' });
            }
            if (campo === 'correo') {
                return res.status(409).send({ message: 'El correo ya existe' });
            }
            return res.status(409).send({ message: 'Existe un campo duplicado' });
        }
        // Errores de validación del esquema
        if (error.name === 'ValidationError') {
            const errores = error.errors;
            // Validación del match del correo
            if (errores.correo && errores.correo.kind === 'match') {
                return res.status(400).send({ message: 'El correo no cumple con el formato institucional' });
            }
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarEstadoUsuario(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!id || estado == null) {
            return res.status(400).send({ message: 'No se ha proporcionado el estado' });
        }

        // Si el usuario es eliminado (2), se establece la fecha de finalización
        let fechaFin = null;
        if (estado === 2) {
            fechaFin = new Date();
        }

        // Actualizar estado del usuario
        const usuarioActualizado = await Usuario.findByIdAndUpdate(id, { estado, fechaFin }, { new: true });

        if (usuarioActualizado) {
            res.status(200).send({ message: 'Estado del usuario actualizado exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar el estado del usuario' });
        }
    } catch (error) {
        console.error('No se pudo actualizar el estado del usuario:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerUsuarioPorId(req, res) {
    try {
        const { id } = req.params;
        const usuarioEncontrado = await Usuario.findById(id);
        if (usuarioEncontrado) {
            res.status(200).send({ message: 'Usuario obtenido exitosamente', data: usuarioEncontrado });
        } else {
            res.status(404).send({ message: 'No se ha podido obtener el usuario' });
        }
    } catch (error) {
        console.error('No se pudo obtener el usuario:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function contarUsuariosActivos(req, res) {
    try {
        const usuariosEncontrados = await Usuario.countDocuments({ estado: 1 });

        res.status(200).send({
            message: 'Total de usuarios obtenidos exitosamente',
            data: usuariosEncontrados
        });
    } catch (error) {
        console.error('No se pudo obtener el total de usuarios:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function listarUsuariosActivos(req, res) {
    try {
        const usuariosEncontrados = await Usuario
            .find({ estado: 1 })
            .populate('idCarrera', 'nombre');

        if (usuariosEncontrados.length === 0) {
            return res.status(404).send({ message: 'No se encontraron usuarios activos' });
        }

        res.status(200).send({
            message: 'Usuarios activos obtenidos exitosamente',
            data: usuariosEncontrados
        });
    } catch (error) {
        console.error('No se pudo obtener el listado de usuarios activos:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const UsuarioController = {
    registrarUsuario,
    obtenerUsuarioAutenticado,
    obtenerUsuarios,
    actualizarUsuario,
    actualizarEstadoUsuario,
    obtenerUsuarioPorId,
    contarUsuariosActivos,
    listarUsuariosActivos
}

export default UsuarioController;