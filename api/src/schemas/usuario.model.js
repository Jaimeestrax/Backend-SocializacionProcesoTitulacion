import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const usuarioSchema = new mongoose.Schema({
    nombres: {
        type: String,
        required: true,
        trim: true
    },
    apellidos: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        trim: true,
        lowercase: true, // Evita correos duplicados por mayuscula, minuscula
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+\.[a-zA-Z0-9._%+-]+@espoch\.edu\.ec$/]
    },
    usuario: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    contrasena: {
        type: String,
        required: true,
        select: false // No se devuelve en las consultas
    },
    foto: {
        type: String,
        required: false
    },
    idRol: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rol',
        required: true
    },
    idCargo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cargo',
        required: true
    },
    // idCarrera: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Carrera',
    //     required: true
    // },
    fechaInicio: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaFin: {
        type: Date,
        required: false
    },
    estado: {
        type: Number, // 0: Desactivo, 1: Activo, 2: Eliminado
        required: true,
        default: 1
    },
    // Recuperación de contraseña
    resetPasswordToken: {
        type: String,
        required: false,
        select: false
    },
    // Caducidad del token enviado
    resetPasswordExpires: {
        type: Date,
        required: false,
        select: false
    },
}, {
    timestamps: false,
    versionKey: false,
    collection: 'usuarios',
    // Uso de virtuals -> Campos que no se guardan en bd, pero se pueden usar en consultas
    toJSON: { virtuals: true }
});

// Concatenación de nombres y apellidos
usuarioSchema.virtual('nombreCompleto').get(function () {
    return `${this.nombres} ${this.apellidos}`;
});

// Plugin de paginación
usuarioSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;