import Usuario from "../schemas/usuario.model.js";
import { hashear, compararHash } from "../utils/bcrypt.js";
import { generarToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import { generarRecoveryToken } from "../utils/recoveryToken.js";
import { transporter } from "../config/mail.js";
import crypto from "node:crypto";

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

async function forgotPassword(req, res) {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).send({ message: 'El correo es requerido' });
        }

        // Buscar usuario incluyendo campos ocultos
        const usuarioEncontrado = await Usuario.findOne({ correo }).select('+resetPasswordToken +resetPasswordExpires');

        if (!usuarioEncontrado) {
            return res.status(200).send({ message: 'No se ha podido validar su correo' });
        }

        // Generar token de recuperación
        const { token, tokenHash } = generarRecoveryToken();

        // Establece hash del token
        usuarioEncontrado.resetPasswordToken = tokenHash;
        // Expiración en 15 minutos
        usuarioEncontrado.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await usuarioEncontrado.save(); // Guarda en BD

        // Link de recuperación
        const recoveryLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

        // Enviar correo
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: usuarioEncontrado.correo,
            subject: 'Recuperación de contraseña',
            html: `
                <h2>Se ha solicitado la recuperación de su contraseña</h2>

                <p>Haga clic en el siguiente enlace para recuperarla:</p>

                <a href="${recoveryLink}">
                    Recuperar contraseña
                </a>

                <p>Este enlace expirará en 15 minutos.</p>
                <p>Si usted no solicitó la recuperación de su contraseña, por favor ignore este correo.</p>
                <p>Porfavor, continue el proceso desde este enlace y cierra las demás ventanas.</p>
            `
        });

        res.status(200).send({
            message: 'El correo de recuperación ha sido enviado exitosamente'
        });

    } catch (error) {
        console.error('No se pudo enviar el correo de recuperación:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function resetPassword(req, res) {
    try {
        const { token, contrasena } = req.body; // Recibe el token de validación y la nueva contraseña

        if (!token || !contrasena) {
            return res.status(400).send({ message: 'El token y la contraseña son requeridos' });
        }

        // Validación de contraseña segura
        if (contrasena.length < 14) {
            return res.status(400).send({ message: 'La contraseña debe tener al menos 14 caracteres' });
        }

        // Hashear token recibido -> de la misma manera que se creó para guardar en db
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // Busca si existe el usuario
        const usuarioEncontrado = await Usuario.findOne({
            resetPasswordToken: tokenHash, // Compara el token
            resetPasswordExpires: { // Verifica que no haya expirado
                $gt: Date.now() // Mayor que fecha actual -> no expirado
            }
        }).select('+resetPasswordToken +resetPasswordExpires +contrasena');

        // Token inválido o expirado
        if (!usuarioEncontrado) {
            return res.status(400).send({ message: 'Token inválido o expirado' });
        }

        // Hashear nueva contraseña
        const contrasenaHasheada = await hashear(contrasena);

        // Actualizar contraseña
        usuarioEncontrado.contrasena = contrasenaHasheada;

        // Invalidar recovery token
        usuarioEncontrado.resetPasswordToken = undefined;
        usuarioEncontrado.resetPasswordExpires = undefined;

        await usuarioEncontrado.save();

        res.status(200).send({
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('No se pudo resetear la contraseña:', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

// Exporta una unica entidad principal
const AuthController = {
    login,
    logout,
    forgotPassword,
    resetPassword
};

export default AuthController;