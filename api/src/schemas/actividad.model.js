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
        required: true
    },
    idEncargado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cargo',
        required: false
    },
    orden: {
        type: Number,
        required: true
    },
    instrumentos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instrumento',
        required: false
    }],
    fechaRegistro: {
        type: Date,
        required: true
    },
    fechaActualizacion: {
        type: Date,
        required: true
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
    collection: 'actividades'
});

// Plugin de paginación
actividadSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Actividad = mongoose.model('Actividad', actividadSchema);

export default Actividad;