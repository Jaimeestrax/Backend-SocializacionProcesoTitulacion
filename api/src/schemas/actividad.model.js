import mongoose from "mongoose";

const actividadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: false
    },
    encargado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Encargado',
        required: false
    },
    fecha_inicio: {
        type: Date,
        required: true
    },
    fecha_fin: {
        type: Date,
        required: true
    },
    intrumento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instrumento',
        required: false
    }
}, {
    timestamps: false,
    collection: 'actividades'
});

// Exportación del modelo
export const Actividad = mongoose.model('Actividad', actividadSchema);