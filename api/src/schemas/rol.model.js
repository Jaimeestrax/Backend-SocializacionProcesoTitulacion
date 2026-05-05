import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const rolSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        //unique: true
    },
    estado: {
        type: Number,
        required: true
    }
}, {
    timestamps: false,
    versionKey: false,
    collection: 'roles'
});

// Plugin de paginación
rolSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Rol = mongoose.model('Rol', rolSchema);

export default Rol;