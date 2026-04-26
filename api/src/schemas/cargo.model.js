import mongoose from "mongoose";

const cargoSchema = new mongoose.Schema({
    nombre_cargo: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
}, {
    timestamps: false,
    collection: 'cargos'
});

const Cargo = mongoose.model('Cargo', cargoSchema);

export default Cargo;