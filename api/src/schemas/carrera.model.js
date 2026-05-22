import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const carreraSchema = new mongoose.Schema({
    codigo: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    estado: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: false,
    versionKey: false,
    collection: 'carreras'
});

carreraSchema.plugin(mongoosePaginate);

const Carrera = mongoose.model('Carrera', carreraSchema);

export default Carrera;
