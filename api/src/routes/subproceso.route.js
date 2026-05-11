import express from "express";
import SubprocesoController from "../controllers/subproceso.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const subprocesoRouter = express.Router();

subprocesoRouter.post('/registrar-subproceso', ensureAuth, SubprocesoController.registrarSubproceso);
subprocesoRouter.post('/obtener-subprocesos', ensureAuth, SubprocesoController.obtenerSubprocesos);
subprocesoRouter.put('/actualizar-subproceso/:id', ensureAuth, SubprocesoController.actualizarSubproceso);
subprocesoRouter.patch('/actualizar-estado-subproceso/:id', ensureAuth, SubprocesoController.actualizarEstadoSubproceso);
subprocesoRouter.get('/obtener-subproceso-por-id/:id', ensureAuth, SubprocesoController.obtenerSubprocesoPorId);
subprocesoRouter.get('/contar-subprocesos-activos', ensureAuth, SubprocesoController.contarSubprocesosActivos);

export default subprocesoRouter;