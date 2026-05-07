import crypto from "node:crypto"; // Crypto porque bcrypt genera hash distinto siempre -> no se puede comparar en consulta

export function generarRecoveryToken() {
    // Token a enviar por correo
    const token = crypto.randomBytes(32).toString("hex"); // Genera token aleatorio  de 32 bytes y lo convierte a hexadecimal
    // Toekn hasheado para comparar
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // Se crea hash del token generado con algoritmo sha256 -> devuelve hexadecimal legible

    return {
        token,
        tokenHash
    };
}