import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cargoSchema = new mongoose.Schema({
    // El codigo permite identificar el cargo de manera clara -> incremental de 1...n
    codigo: {
        type: Number,
        required: true,
        unique: true,
        index: true // Mejora rendimiento en consultas
    },
    nombre: {
        type: String,
        trim: true,
        required: true,
        //unique: true
    },
    estado: {
        type: Number,
        required: true
    }
}, {
    timestamps: false,
    versionKey: false,
    collection: 'cargos'
});

// Plugin de paginación
cargoSchema.plugin(mongoosePaginate);

const Cargo = mongoose.model('Cargo', cargoSchema);

export default Cargo;