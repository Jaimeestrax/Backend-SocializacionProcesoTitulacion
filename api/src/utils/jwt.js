'use strict';

import jwt from "jsonwebtoken";

// Genera un token de acceso
export function generarToken(usuario) {
    const payload = {
        _id: usuario._id,
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12 h' });
}

// Verifica que el token sea valido
export function verificarToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}
