import express from "express";
import SubprocesoController from "../controllers/subproceso.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const subprocesoRouter = express.Router();

subprocesoRouter.post('/registrar-subproceso', ensureAuth, SubprocesoController.registrarSubproceso);
subprocesoRouter.post('/obtener-subprocesos', ensureAuth, SubprocesoController.obtenerSubprocesos);
subprocesoRouter.put('/actualizar-subproceso/:id', ensureAuth, SubprocesoController.actualizarSubproceso);
subprocesoRouter.patch('/actualizar-estado-subproceso/:id', ensureAuth, SubprocesoController.actualizarEstadoSubproceso);
// Rutas publicas
subprocesoRouter.get('/obtener-subproceso-por-id/:id', SubprocesoController.obtenerSubprocesoPorId);
subprocesoRouter.get('/obtener-subprocesos-proximos', SubprocesoController.obtenerSubprocesosProximos);
subprocesoRouter.get('/obtener-subproceso-actual', SubprocesoController.obtenerSubprocesoActual);
subprocesoRouter.get('/obtener-porcentaje-avance', SubprocesoController.obtenerPorcentajeAvance);

export default subprocesoRouter;