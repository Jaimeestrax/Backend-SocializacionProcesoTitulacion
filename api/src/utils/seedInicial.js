import Rol from "../schemas/rol.model.js";
import Cargo from "../schemas/cargo.model.js";
import Usuario from "../schemas/usuario.model.js";
import Carrera from "../schemas/carrera.model.js";
import { hashear } from "./bcrypt.js";

// Inicialización de la base de datos
export async function seedInicial() {
    // 1. Creación de rol administrador
    const existeRolAdmin = await Rol.exists({});
    if (!existeRolAdmin) {
        await Rol.create({ nombre: "Administrador", codigo: 1, estado: 1 }); // El primer rol tiene código 1
        console.log("Rol administrador creado");
    }

    // 2. Creación del cargo presidente comisión de titulación
    const existeCargoPresidente = await Cargo.exists({});
    if (!existeCargoPresidente) {
        await Cargo.create({ nombre: "Presidente Comisión de Titulación", estado: 1 });
        console.log("Cargo Presidente Comisión de Titulación creado");
    }

    // 3. Creación de una carrera por defecto
    const existeCarrera = await Carrera.exists({});
    if (!existeCarrera) {
        await Carrera.create({ nombre: "Software", codigo: 'SOFT', estado: 1 });
        console.log("Carrera de Software creada");
    }

    // 4. Creación del usuario administrador
    const existeUsuario = await Usuario.exists({}); // Exists es mas eficiente que countDocuments

    // Validación de info en variable de entorno
    if (!process.env.ADMIN_PASS || !process.env.ADMIN_USER) {
        throw new Error("Faltan variables de entorno para el administrador");
    }

    if (!existeUsuario) {
        // Busca el cargo que desempeña
        const cargoAdmin = await Cargo.findOne({ nombre: 'Presidente Comisión de Titulación' });
        if (!cargoAdmin) {
            throw new Error("No existe el cargo especificado para el usuario administrador en la base de datos");
        }

        // Busca el rol que desempeña
        const rolAdmin = await Rol.findOne({ nombre: 'Administrador' });
        if (!rolAdmin) {
            throw new Error("No existe el rol especificado para el usuario administrador en la base de datos");
        }

        // Busca la carrera a la que pertenece
        const carreraAdmin = await Carrera.findOne({ nombre: 'Software' });
        if (!carreraAdmin) {
            throw new Error("No existe la carrera especificada para el usuario administrador en la base de datos");
        }

        const contrasenaHasheada = await hashear(process.env.ADMIN_PASS, 12);

        // Creación del primer usuario del sistema
        await Usuario.create({
            nombres: 'Jaime',
            apellidos: 'Estrada',
            correo: process.env.ADMIN_EMAIL,
            usuario: process.env.ADMIN_USER,
            contrasena: contrasenaHasheada,
            idRol: rolAdmin._id,
            idCargo: cargoAdmin._id,
            idCarrera: carreraAdmin._id,
            estado: 1
        });
        console.log('Administrador creado exitosamente');
    } else {
        console.log('Ya existe un usuario administrador creado');
    }
}