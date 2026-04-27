import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const subprocesoSchema = new mongoose.Schema({
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
        required: true
    },
    estado: {
        type: Boolean,
        required: true
    },
    fecha_inicio: {
        type: Date,
        required: true
    },
    fecha_fin: {
        type: Date,
        required: true
    },
    actividades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actividad',
        required: true
    }],
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    fecha_actualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    collection: 'subprocesos'
});

// Plugin de paginación
subprocesoSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Subproceso = mongoose.model('Subproceso', subprocesoSchema);

export default Subproceso;