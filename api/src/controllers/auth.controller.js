import Usuario from "../schemas/usuario.model.js";
import { compararHash } from "../utils/bcrypt.js";
import { generarToken } from "../utils/jwt.js";

async function login(req, res) {
    try {
        const { usuario, contrasena } = req.body;

        if (!usuario || !contrasena) {
            return res.status(400).send({ message: 'Credenciales inválidas' });
        }

        // Buscar usuario
        const usuarioEncontrado = await Usuario.findOne({ usuario }).select('+contrasena'); // Para acceder a la contraseña

        if (!usuarioEncontrado) {
            return res.status(401).send({ message: 'Credenciales inválidas' });
        }

        // Comparación de contraseñas
        const contrasenaValida = await compararHash(contrasena, usuarioEncontrado.contrasena);

        if (!contrasenaValida) {
            return res.status(401).send({ message: 'Credenciales inválidas' });
        }

        // Generación de token
        const token = generarToken(usuarioEncontrado);

        const { contrasena: _, ...publicUser } = usuarioEncontrado.toObject();

        // 200 OK
        res.status(200).send({
            message: 'Inicio de sesión exitoso',
            data: {
                publicUser,
                token
            }
        });

    } catch (error) {
        console.error('No se pudo iniciar sesión: ', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

// Exporta una unica entidad principal
const AuthController = {
    login
};

export default AuthController;