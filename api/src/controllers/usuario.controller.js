import Usuario from "../schemas/usuario.model.js";
import { hashear } from "../utils/bcrypt.js";

async function registrarUsuario(req, res) {
    try {
        const { nombres, apellidos, correo, usuario, contrasena, rol, descripcion, fecha_inicio } = req.body;

        // Validación de campos obligatorios
        if (!nombres || !apellidos || !rol || !fecha_inicio) {
            // 400 Bad Request
            return res.status(400).send({ message: 'No se ha proporcionado toda la información del usuario' });
        }

        // Validación de los datos de la cuenta a crear
        if (!correo || !usuario || !contrasena) {
            return res.status(400).send({ message: 'No se ha proporcionado la información de la cuenta' });
        }

        // Validación de contraseña segura
        if (contrasena.length < 14) {
            // Según NIST 2024 debe ser al menos de 14 caracteres
            return res.status(400).send({ message: 'La contraseña debe tener al menos 14 caracteres' });
        }

        // Cifrado de contraseña
        const contrasenaHasheada = await hashear(contrasena);

        // Creación del nuevo usuario
        const nuevoUsuario = new Usuario({
            nombres,
            apellidos,
            correo,
            usuario,
            contrasena: contrasenaHasheada,
            rol,
            descripcion,
            fecha_inicio
        });

        // Guardar nuevo usuario en la base de datos
        await nuevoUsuario.save();

        // 201 Created
        res.status(201).send({ message: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error('No se pudo registrar el usuario: ', error.name); // Evita exponer información sensible
        if (error.name === 'ValidationError') {
            const errores = error.errors;
            // Validación del match del correo
            if (errores.correo && errores.correo.kind === 'match') {
                return res.status(400).send({ message: 'El correo no cumple con el formato institucional' })
            }
            // Validación de usuario único
            if (errores.usuario && errores.usuario.kind === 'unique') {
                return res.status(400).send({ message: 'El usuario ya existe' })
            }
            // Validación de correo único
            if (errores.correo && errores.correo.kind === 'unique') {
                return res.status(400).send({ message: 'El correo ya existe' })
            }
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerUsuarios(req, res) {
    try {

    } catch (error) {

    }
}

const UsuarioController = {
    registrarUsuario,
    obtenerUsuarios
}

export default UsuarioController;