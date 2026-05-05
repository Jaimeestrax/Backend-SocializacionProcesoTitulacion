import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const instrumentoSchema = new mongoose.Schema({
    identificador: {
        type: String,
        required: true,
        trim: true
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
    ruta: {
        type: String,
        required: true,
        unique: true
    },
    // Histórico -> periodo de vigencia
    estado: {
        type: Boolean,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    // Datos de auditoría
    fechaRegistro: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        required: false
    },
    generadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    actualizadoPor: {
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