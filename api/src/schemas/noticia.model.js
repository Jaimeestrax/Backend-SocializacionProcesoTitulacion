import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const noticiaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    prioridad: {
        type: String,
        required: true
    },
    idPlanificacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planificacion',
        required: true
    },
    estado: {
        type: Boolean,
        required: true,
        default: true
    },
    imagen: {
        type: String,
        required: false,
        unique: true
    },
    idEncargadoGenerar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: false,
    versionKey: false,
    collection: 'noticias'
});

// Plugin de paginación
noticiaSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Noticia = mongoose.model('Noticia', noticiaSchema);

export default Noticia;