import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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

// Plugin de paginación
actividadSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Actividad = mongoose.model('Actividad', actividadSchema);

export default Actividad;