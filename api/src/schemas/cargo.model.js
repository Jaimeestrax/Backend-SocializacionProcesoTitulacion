import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const cargoSchema = new mongoose.Schema({
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