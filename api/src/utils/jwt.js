'use strict';

import jwt from "jsonwebtoken";

// Genera un token de acceso
export function generarToken(usuario) {
    const payload = {
        _id: usuario._id,
        rol: usuario.idRol.codigo // La cookie se generara con un código de rol
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12 h' });
}

// Verifica que el token sea valido
export function verificarToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

// Cookie de sesión
export function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true, // Solo accesible por el servidor
        secure: false, // (true) Solo se puede acceder a la cookie por https
        sameSite: 'lax', // Permite enviar cookie en peticiones cross-site
        maxAge: 12 * 60 * 60 * 1000 // 12 horas en milisegundos
    });
}

// Elimina la cookie de sesión
export function clearAuthCookie(res) {
    res.clearCookie('token');
}