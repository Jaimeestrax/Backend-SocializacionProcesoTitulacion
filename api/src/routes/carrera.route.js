import express from "express";
import CarreraController from "../controllers/carrera.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const carreraRouter = express.Router();

carreraRouter.post('/registrar-carrera', ensureAuth, CarreraController.registrarCarrera);
carreraRouter.patch('/actualizar-estado-carrera/:id', ensureAuth, CarreraController.actualizarEstadoCarrera);
carreraRouter.post('/obtener-carreras', ensureAuth, CarreraController.obtenerCarreras);
carreraRouter.get('/obtener-carrera-por-id/:id', ensureAuth, CarreraController.obtenerCarreraPorId);
carreraRouter.put('/actualizar-carrera/:id', ensureAuth, CarreraController.actualizarCarrera);
carreraRouter.get('/obtener-carreras-activas', ensureAuth, CarreraController.obtenerCarrerasActivas);
carreraRouter.get('/listar-carreras', ensureAuth, CarreraController.listarCarreras);

export default carreraRouter;