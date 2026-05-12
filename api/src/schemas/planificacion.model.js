import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const planificacionSchema = new mongoose.Schema({
    periodo: {
        type: String,
        required: true,
        unique: true
    },
    // Inicio del periodo
    fechaInicio: {
        type: Date,
        required: true
    },
    // Fin del periodo
    fechaFin: {
        type: Date,
        required: true
    },
    // Activa / finalizada
    estado: {
        type: Boolean,
        required: true,
        default: true
    },
    // Snapshot operativo
    subprocesos: [{
        identificador: {
            type: String,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
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
        actividades: [{
            nombre: {
                type: String,
                required: true
            },
            descripcion: {
                type: String,
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
            idParticipante: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Cargo',
                required: true
            },
            instrumentos: [{
                idInstrumento: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Instrumento',
                    required: true
                },
                // Identificador contextual generado
                identificador: {
                    type: String,
                    required: true
                }
            }]
        }]
    }],

    // Auditoría
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
    collection: 'planificaciones'
});

// Plugin de paginación
planificacionSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Planificacion = mongoose.model('Planificacion', planificacionSchema);

export default Planificacion;