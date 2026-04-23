import bcrypt from "bcrypt";
// Las funciones devuelven una promesa

// Hashea un valor especifico
export async function hashear(value, saltRounds = 12) {
    // Verifica que el valor a hashear sea válido
    if (!value) throw new Error('El valor es requerido');
    if (typeof value !== 'string') throw new Error('El valor debe ser una cadena de texto');
    // Genera un valor de salt -> por defecto usa 12 rondas
    const salt = await bcrypt.genSalt(saltRounds);
    // Hashea el valor
    return bcrypt.hash(value, salt);
}

// Compara un valor hasheado con un valor plano
export async function compararHash(plainText, hash) {
    // Verifica que los valores sean válidos
    if (!plainText) throw new Error('El valor es requerido');
    if (!hash) throw new Error('El hash es requerido');
    if (typeof plainText !== 'string') throw new Error('El valor debe ser una cadena de texto');
    if (typeof hash !== 'string') throw new Error('El hash debe ser una cadena de texto');
    // Compara los valores
    return bcrypt.compare(plainText, hash);
}