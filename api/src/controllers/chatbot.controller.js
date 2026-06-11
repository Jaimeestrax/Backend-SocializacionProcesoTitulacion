import FaqService from "../services/faq.service.js";
import PlanificacionService from "../services/planificacion.service.js";

async function procesarMensajeUsuario(req, res) {
    try {
        const { contexto, opcion } = req.body;

        // Contexto del chatbot -> mantiene el sentido de la conversación
        switch (contexto) {
            // Opciones para consulta inicial
            case "inicio":
                switch (opcion) {
                    case "faqs":
                        const faqsEncontradas = await FaqService.obtenerPreguntasFrecuentes();

                        return res.status(200).send({
                            message: "Seleccione una de las preguntas disponibles:",
                            data: {
                                contexto: "faqs",
                                faqsEncontradas
                            }
                        });
                    case "subprocesos":
                        const subprocesos = await PlanificacionService.obtenerSubprocesos();

                        return res.status(200).send({
                            message: "Seleccione uno de los subprocesos disponibles:",
                            data: {
                                contexto: "subprocesos",
                                subprocesos
                            }
                        });
                    default:
                        return res.status(400).send({ message: "Opción de chatbot no válida" });
                }
            // Opciones especificas por contexto
            case "faqs":
                const faq = await FaqService.obtenerPreguntaEspecifica(opcion);

                return res.status(200).send({
                    message: faq.respuesta,
                    data: {
                        contexto: "inicio"
                    }
                });

            case "subprocesos":
                const actividades = await PlanificacionService.obtenerActividades(opcion);

                return res.status(200).send({
                    message: "Seleccione una de las actividades disponibles:",
                    data: {
                        contexto: "actividades",
                        actividades
                    }
                });

            case "actividades":
                const actividad = await PlanificacionService.obtenerActividad(opcion);

                return res.status(200).send({
                    message: "¿Que desea conocer de la actividad?",
                    data: {
                        contexto: `actividad_${actividad._id}`,
                        actividad
                    }
                });

            default:
                // Opciones de una actividad especifica
                if (contexto.startsWith("actividad_")) {
                    const idActividad = contexto.split("_")[1];

                    switch (opcion) {
                        case "fechas":
                            const fecha = await PlanificacionService.obtenerFechasActividad(idActividad);

                            return res.status(200).send({
                                message: fecha,
                                data: {
                                    contexto: "inicio"
                                }
                            });
                        case "participante":
                            const participante = await PlanificacionService.obtenerParticipanteActividad(idActividad);

                            return res.status(200).send({
                                message: participante,
                                data: {
                                    contexto: "inicio"
                                }
                            });
                        case "instrumentos":
                            const instrumentos = await PlanificacionService.obtenerInstrumentosActividad(idActividad);

                            if (instrumentos.length === 0 || !instrumentos) {
                                return res.status(200).send({
                                    message: "La actividad no cuenta con documentos relacionados.",
                                    data: {
                                        contexto: "inicio"
                                    }
                                });
                            }

                            return res.status(200).send({
                                message: "Instrumentos disponibles:",
                                data: {
                                    contexto: "inicio",
                                    instrumentos
                                }
                            });
                        default:
                            return res.status(400).send({ message: "Opción de chatbot no válida" });
                    }
                }
                return res.status(400).send({ message: "Opción de chatbot no válida" });
        }
    } catch (error) {
        console.error('No se pudo procesar el mensaje', error.name);
        res.status(500).send({ message: 'Error interno del servidor' });
    }
}

const ChatbotController = {
    procesarMensajeUsuario
}

export default ChatbotController;