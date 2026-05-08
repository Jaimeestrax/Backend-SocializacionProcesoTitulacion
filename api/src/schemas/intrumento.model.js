import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const instrumentoSchema = new mongoose.Schema({
    // Código atado a la actividad de un subproceso
    identificador: {
        type: String,
        required: false,
        trim: true
    },
    codigo: { // Código interno compartido entre historicos de cada instrumento
        type: Number,
        required: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: false
    },
    archivo: {
        type: String,
        required: true,
        unique: true
    },
    // Histórico -> periodo de vigencia
    estado: { // Activo - inactivo
        type: Boolean,
        required: true,
        default: true
    },
    version: {
        type: Number,
        required: true,
        default: 1
    },
    fechaInicio: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaFin: {
        type: Date,
        required: false
    },
    vigente: {
        type: Boolean,
        required: true,
        default: true
    },
    // Datos de auditoría
    fechaActualizacion: {
        type: Date,
        required: false
    },
    idEncargadoGenerar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    idEncargadoActualizar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    }
}, {
    timestamps: false,
    versionKey: false,
    collection: 'instrumentos'
});

// Plugin de paginación
instrumentoSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Instrumento = mongoose.model('Instrumento', instrumentoSchema);

export default Instrumento;