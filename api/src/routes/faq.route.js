import express from 'express';
import FaqController from '../controllers/faq.controller.js';
import { ensureAuth } from '../middlewares/auth.js';

const faqRouter = express.Router();

faqRouter.post('/registrar-faq', ensureAuth, FaqController.registrarFaq);
faqRouter.post('/obtener-faqs', ensureAuth, FaqController.obtenerFaqs);
faqRouter.get('/obtener-faq-por-id/:id', ensureAuth, FaqController.obtenerFaqPorId);
faqRouter.put('/actualizar-faq/:id', ensureAuth, FaqController.actualizarFaq);
faqRouter.delete('/eliminar-faq/:id', ensureAuth, FaqController.eliminarFaq);

export default faqRouter;