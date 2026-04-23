import mongoose from "mongoose";

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
    }]
}, {
    timestamps: false,
    collection: 'subprocesos'
});

// Exportación del modelo
export const Subproceso = mongoose.model('Subproceso', subprocesoSchema);