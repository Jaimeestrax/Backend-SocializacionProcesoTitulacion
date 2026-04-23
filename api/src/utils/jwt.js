'use strict';

import jwt from "jsonwebtoken";

// Genera un token de acceso
export function generarToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 min' });
}

// Verifica que el token sea valido
export function verificarToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}
