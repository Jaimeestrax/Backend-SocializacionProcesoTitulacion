import express from "express";
import PlanificacionController from "../controllers/planificacion.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const planificacionRouter = express.Router();

planificacionRouter.post('/registrar-planificacion', ensureAuth, PlanificacionController.registrarPlanificacion);
planificacionRouter.post('/obtener-planificaciones', ensureAuth, PlanificacionController.obtenerPlanificaciones);
planificacionRouter.put('/actualizar-planificacion/:id', ensureAuth, PlanificacionController.actualizarPlanificacion);
planificacionRouter.patch('/actualizar-estado-planificacion/:id', ensureAuth, PlanificacionController.actualizarEstadoPlanificacion);
planificacionRouter.get('/obtener-planificacion-por-id/:id', ensureAuth, PlanificacionController.obtenerPlanificacionPorId);

export default planificacionRouter;