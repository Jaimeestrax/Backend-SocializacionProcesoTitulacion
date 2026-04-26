import Usuario from "../schemas/usuario.model.js";
import Cargo from "../schemas/cargo.model.js";
import { hashear } from "../utils/bcrypt.js";

// Creación del primer usuario administrador
export async function crearAdminSiNoExiste() {
    const existeUsuario = await Usuario.exists({}); // Exists es mas eficiente que countDocuments

    // Validación de info en variable de entorno
    if (!process.env.ADMIN_PASS || !process.env.ADMIN_USER) {
        throw new Error("Faltan variables de entorno para el administrador");
    }

    if (!existeUsuario) {
        // Busca el cargo de presidente
        const cargoAdmin = await Cargo.findOne({ nombre_cargo: 'Presidente' });
        if (!cargoAdmin) {
            throw new Error("No existe el cargo Presidente en la base de datos");
        }

        const contrasenaHasheada = await hashear(process.env.ADMIN_PASS, 12);

        // Creación del primer usuario del sistema
        await Usuario.create({
            nombres: 'Admin',
            apellidos: 'Prueba',
            correo: process.env.ADMIN_EMAIL,
            usuario: process.env.ADMIN_USER,
            contrasena: contrasenaHasheada,
            cargo: cargoAdmin._id,
            fecha_inicio: new Date(),
            estado: 1
        });
        console.log('Administrador creado exitosamente');
    } else {
        console.log('Ya existe un usuario administrador creado');
    }
}