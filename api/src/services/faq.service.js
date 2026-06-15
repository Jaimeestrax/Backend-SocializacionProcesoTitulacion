import Faq from "../schemas/faq.model.js";

async function obtenerPreguntasFrecuentes() {
    const faqsEncontradas = await Faq.find().sort({ _id: -1 }).limit(5);

    if (faqsEncontradas.length === 0) {
        throw new Error("No se encontraron preguntas frecuentes");
    }

    return faqsEncontradas;
}

async function obtenerPreguntaEspecifica(idFaq) {
    const faqEncontrada = await Faq.findById(idFaq);

    if (!faqEncontrada) {
        throw new Error("No se encontró la pregunta frecuente indicada");
    }

    return faqEncontrada;
}

const FaqService = {
    obtenerPreguntasFrecuentes,
    obtenerPreguntaEspecifica
};

export default FaqService;