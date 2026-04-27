import express from "express";
import { ensureAuth } from "../middlewares/auth.js"; // Protege la ruta
import InstrumentoController from "../controllers/instrumento.controller.js";
import { upload } from "../middlewares/multer.js";

const instrumentoRouter = express.Router();

instrumentoRouter.post('/registrar-instrumento', ensureAuth, upload('instrumentos').single('archivo'), InstrumentoController.registrarInstrumento);
instrumentoRouter.post('/obtener-instrumentos', ensureAuth, InstrumentoController.obtenerInstrumentos);
instrumentoRouter.get('/obtener-instrumento-por-id/:id', ensureAuth, InstrumentoController.obtenerInstrumentoPorId);
instrumentoRouter.put('/actualizar-instrumento/:id', ensureAuth, upload('instrumentos').single('archivo'), InstrumentoController.actualizarInstrumento);
instrumentoRouter.patch('/actualizar-estado-instrumento/:id', ensureAuth, InstrumentoController.actualizarEstadoInstrumento);

export default instrumentoRouter;