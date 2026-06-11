import express from 'express';
import ChatbotController from '../controllers/chatbot.controller.js';

const chatbotRouter = express.Router();

chatbotRouter.post('/procesar-mensaje-usuario', ChatbotController.procesarMensajeUsuario);

export default chatbotRouter;