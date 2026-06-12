import Faq from "../schemas/faq.model.js";

async function registrarFaq(req, res) {
    try {
        const { pregunta, respuesta } = req.body;

        if (!pregunta || !respuesta) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información de la FAQ' });
        }

        const nuevaFaq = new Faq({
            pregunta,
            respuesta
        });

        await nuevaFaq.save();

        res.status(201).send({ message: 'Pregunta frecuente registrada exitosamente' });
    } catch (error) {
        console.error('No se pudo registrar la pregunta frecuente', error.name);
        if (error.code === 11000) {
            const campo = Object.keys(error.keyPattern)[0];
            if (campo === 'pregunta') {
                return res.status(409).send({ message: 'La pregunta ya se encuentra registrada.' });
            }
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerFaqs(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10
        };

        // Filtro de busqueda
        let filtro = {};

        if (req.body.palabra && req.body.palabra.trim() !== "") {
            filtro.pregunta = { $regex: req.body.palabra.trim(), $options: "i" }
        }

        const faqsEncontradas = await Faq.paginate(filtro, options);

        if (faqsEncontradas.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron preguntas frecuentes' });
        }

        res.status(200).send({
            message: 'Preguntas frecuentes obtenidas exitosamente',
            data: faqsEncontradas
        });
    } catch (error) {
        console.log('No se pudo obtener las preguntas frecuentes', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function obtenerFaqPorId(req, res) {
    try {
        const { id } = req.params;
        const faqEncontrada = await Faq.findById(id);
        if (!faqEncontrada) {
            return res.status(404).send({ message: 'No se encontró la pregunta frecuente' });
        }
        res.status(200).send({
            message: 'Pregunta frecuente obtenida exitosamente',
            data: faqEncontrada
        });
    } catch (error) {
        console.error('No se pudo obtener la pregunta frecuente', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function actualizarFaq(req, res) {
    try {
        const { id } = req.params;
        const { pregunta, respuesta } = req.body;

        if (!id || !pregunta || !respuesta) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información de la pregunta frecuente' });
        }

        const faqActualizada = await Faq.findByIdAndUpdate(id, { pregunta, respuesta }, { new: true });

        if (faqActualizada) {
            res.status(200).send({ message: 'Pregunta frecuente actualizada exitosamente' });
        } else {
            res.status(404).send({ message: 'No se ha podido actualizar la pregunta frecuente' });
        }
    } catch (error) {
        console.error('No se pudo actualizar la pregunta frecuente', error.name);
        if (error.code === 11000) {
            const campo = Object.keys(error.keyPattern)[0];
            if (campo === 'pregunta') {
                return res.status(409).send({ message: 'La pregunta ya se encuentra registrada.' });
            }
        }
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

async function eliminarFaq(req, res) {
    try {
        const { id } = req.params;
        const faqEliminada = await Faq.findByIdAndDelete(id);
        if (!faqEliminada) {
            return res.status(404).send({ message: 'No se encontró la pregunta frecuente' });
        }
        res.status(200).send({ message: 'Pregunta frecuente eliminada exitosamente' });
    } catch (error) {
        console.error('No se pudo eliminar la pregunta frecuente', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const FaqController = {
    registrarFaq,
    obtenerFaqs,
    obtenerFaqPorId,
    actualizarFaq,
    eliminarFaq
}

export default FaqController;