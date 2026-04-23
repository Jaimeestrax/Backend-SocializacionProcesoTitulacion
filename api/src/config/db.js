import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Protección contra NoSQL Injection
        mongoose.set('sanitizeFilter', true); // Evita operadores peligrosos como $gt, $ne, etc.
        // Conexión a la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión exitosa a la base de datos');
    } catch (e) {
        console.log('Error al conectar a la base de datos', e.name); // .name devuelve solo el tipo de error -> evita exponer info sensible
        process.exit(1); // Finaliza ejecución (1 = código de salida -> terminación anormal)
    }
}