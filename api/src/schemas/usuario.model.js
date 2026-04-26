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
    cargo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cargo',
        required: true
    },
    descripcion: {
        type: String,
        required: false
    },
    fecha_inicio: {
        type: Date,
        required: true
    },
    fecha_fin: {
        type: Date,
        required: false
    },
    estado: {
        type: Number, // 0: Desactivo, 1: Activo, 2: Eliminado
        required: true
    }
}, {
    timestamps: false,
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