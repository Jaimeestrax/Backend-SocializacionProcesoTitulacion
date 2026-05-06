import Usuario from "../schemas/usuario.model.js";
import { compararHash } from "../utils/bcrypt.js";
import { generarToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";

async function login(req, res) {
    try {
        const { usuario, contrasena } = req.body;

        if (!usuario || !contrasena) {
            return res.status(400).send({ message: 'Credenciales inválidas' });
        }

        // Buscar usuario
        const usuarioEncontrado = await Usuario.findOne({ usuario })
            .select('+contrasena') // Para acceder a la contraseña
            .populate('idRol', 'codigo estado'); // Union con el código del rol

        // Verificar que el usuario exista
        if (!usuarioEncontrado) {
            return res.status(401).send({ message: 'Credenciales inválidas' });
        }

        // Verificar que el usuario este activo
        if (usuarioEncontrado.estado !== 1) {
            // 403 Forbidden -> El usuario no tiene permisos para realizar la acción
            return res.status(403).send({ message: 'Su usuario se encuentra desactivado' });
        }

        // Verificar que el rol del usuario este activo
        if (usuarioEncontrado.idRol.estado !== 1) {
            return res.status(403).send({ message: 'Usted no tiene permisos para acceder' });
        }

        // Comparación de contraseñas
        const contrasenaValida = await compararHash(contrasena, usuarioEncontrado.contrasena);

        if (!contrasenaValida) {
            return res.status(401).send({ message: 'Credenciales inválidas' });
        }

        // Generación de token
        const token = generarToken(usuarioEncontrado);

        // Cookie de sesión
        setAuthCookie(res, token);

        // Si queremos eliminar un campo de la respuesta -> key: _
        const { contrasena: _, ...publicUser } = usuarioEncontrado.toObject();

        // 200 OK
        res.status(200).send({
            message: 'Inicio de sesión exitoso',
            data: publicUser
        });

    } catch (error) {
        console.error('No se pudo iniciar sesión: ', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function logout(req, res) {
    try {
        clearAuthCookie(res);
        res.status(200).send({ message: 'Cierre de sesión exitoso' });
    } catch (error) {
        console.error('No se pudo cerrar sesión: ', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

// Exporta una unica entidad principal
const AuthController = {
    login,
    logout
};

export default AuthController;