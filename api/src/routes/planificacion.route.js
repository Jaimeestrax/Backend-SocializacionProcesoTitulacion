import express from "express";
import PlanificacionController from "../controllers/planificacion.controller.js";
import { ensureAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";

const planificacionRouter = express.Router();

planificacionRouter.post('/registrar-planificacion', ensureAuth, upload('badges_proceso').single('imagenProceso'), PlanificacionController.registrarPlanificacion);
planificacionRouter.post('/obtener-planificaciones', ensureAuth, PlanificacionController.obtenerPlanificaciones);
planificacionRouter.put('/actualizar-planificacion/:id', ensureAuth, upload('badges_proceso').single('imagenProceso'), PlanificacionController.actualizarPlanificacion);
planificacionRouter.patch('/actualizar-estado-planificacion/:id', ensureAuth, PlanificacionController.actualizarEstadoPlanificacion);
planificacionRouter.get('/obtener-planificacion-por-id/:id', ensureAuth, PlanificacionController.obtenerPlanificacionPorId);
planificacionRouter.get('/contar-planificaciones-totales', ensureAuth, PlanificacionController.contarPlanificacionesTotales);

// Rutas públicas -> sin token
planificacionRouter.get('/obtener-planificacion-vigente', PlanificacionController.obtenerPlanificacionVigente);
planificacionRouter.get('/obtener-periodo-actual', PlanificacionController.obtenerPeriodoActual);
planificacionRouter.get('/obtener-porcentaje-avance', PlanificacionController.obtenerPorcentajeAvance);
planificacionRouter.get('/obtener-proximas-actividades', PlanificacionController.obtenerProximasActividades);
planificacionRouter.get('/obtener-subproceso-actual', PlanificacionController.obtenerSubprocesoActual);
planificacionRouter.get('/obtener-actividad-por-id/:id', PlanificacionController.obtenerActividadPorId);
planificacionRouter.get('/obtener-subprocesos-planificacion-vigente', PlanificacionController.obtenerSubprocesosPlanificacionVigente);
planificacionRouter.get('/obtener-codigo-pao', PlanificacionController.obtenerCodigoPAO);
planificacionRouter.get('/obtener-subproceso-especifico-planificacion/:id', PlanificacionController.obtenerSubprocesoEspecificoPlanificacion);

export default planificacionRouter;