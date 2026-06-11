import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const faqSchema = new mongoose.Schema({
    pregunta: {
        type: String,
        required: true
    },
    respuesta: {
        type: String,
        required: true
    }
}, {
    timestamps: false,
    versionKey: false,
    collection: 'faqs'
});

// Plugin de paginación
faqSchema.plugin(mongoosePaginate);

// Exportación del modelo
const Faq = mongoose.model('Faq', faqSchema);

export default Faq;