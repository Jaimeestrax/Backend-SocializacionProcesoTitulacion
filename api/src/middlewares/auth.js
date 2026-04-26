'use strict';

import Usuario from "../schemas/usuario.model.js";
import { verificarToken } from "../utils/jwt.js";

export async function ensureAuth(req, res, next) {
    let token;

    // 1. Intenta obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        // Auth: Bearer <token>  -> [Bearer, <token>]
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        // 401 Unauthorized
        return res.status(401).send({ message: "La petición no tiene la cabecera de autenticación" });
    }

    try {
        // 2. Decodifica el token
        const payload = verificarToken(token);

        // 3. Busca el usuario
        req.user = await Usuario.findById(payload._id);

        if (!req.user) {
            return res.status(401).send({
                message: "Acceso denegado. Usuario no encontrado."
            });
        }

        // 4. Continúa con la petición
        next();

    } catch (error) {
        console.error("Acceso denegado: ", error.name);
        return res.status(401).send({ message: "Token inválido. Tu sesión ha caducado" });
    }
}