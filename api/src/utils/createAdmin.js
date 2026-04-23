import { hashear } from "../utils/bcrypt.js";
import Usuario from "../schemas/usuario.model.js";

// Creación del primer usuario administrador
export async function crearAdminSiNoExiste() {
    const contadorUsuarios = await Usuario.countDocuments();
    if (contadorUsuarios === 0) {
        const contrasenaHasheada = await hashear(process.env.ADMIN_PASS, 12);
        await Usuario.create({
            usuario: process.env.ADMIN_USER,
            contrasena: contrasenaHasheada,
            estado: 1 // 0: Desactivo, 1: Activo, 2: Eliminado
        });
        console.log('Administrador creado exitosamente');
    } else {
        console.log('Ya existe un usuario administrador creado');
    }
}