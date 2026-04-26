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
    subproceso: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subproceso',
        required: false
    },
    imagen: {
        type: String,
        required: false,
        unique: true
    },
    id_encargado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: false,
    collection: 'noticias'
});

// Plugin de paginación
noticiaSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Noticia = mongoose.model('Noticia', noticiaSchema);

export default Noticia;