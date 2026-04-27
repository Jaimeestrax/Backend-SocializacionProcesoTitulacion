import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const instrumentoSchema = new mongoose.Schema({
    identificador: {
        type: String,
        required: true,
        trim: true
    },
    ruta: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: false
    },
    id_encargado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    estado: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: false,
    collection: 'instrumentos'
});

// Plugin de paginación
instrumentoSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Instrumento = mongoose.model('Instrumento', instrumentoSchema);

export default Instrumento;