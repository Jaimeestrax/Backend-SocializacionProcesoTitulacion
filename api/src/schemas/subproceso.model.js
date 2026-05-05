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
    orden: {
        type: Number,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: false
    },
    fechaFin: {
        type: Date,
        required: false
    },
    actividades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actividad',
        required: true
    }],
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
    collection: 'subprocesos'
});

// Plugin de paginación
subprocesoSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Subproceso = mongoose.model('Subproceso', subprocesoSchema);

export default Subproceso;