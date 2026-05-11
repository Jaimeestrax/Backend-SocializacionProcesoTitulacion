import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const subprocesoSchema = new mongoose.Schema({
    identificador: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true
    },
    actividades: [{
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            required: true
        },
        // Cargo de negocio responsable
        idParticipante: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cargo',
            required: true
        },
        // Instrumentos asociados a la actividad
        instrumentos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Instrumento',
            required: false
        }]
    }],
    estado: {
        type: Number,
        required: true,
        default: 1
    },
    fechaRegistro: {
        type: Date,
        required: true,
        default: Date.now
    },
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
    collection: 'subprocesos'
});

// Plugin de paginación
subprocesoSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Subproceso = mongoose.model('Subproceso', subprocesoSchema);

export default Subproceso;