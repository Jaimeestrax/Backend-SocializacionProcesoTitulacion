import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const rolSchema = new mongoose.Schema({
    // El codigo permite identificar el rol de manera clara -> incremental de 1...n
    codigo: {
        type: Number,
        required: true,
        unique: true,
        index: true // Mejora rendimiento en consultas
    },
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