import express from "express";
import RolController from "../controllers/rol.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const rolRouter = express.Router();

rolRouter.post('/registrar-rol', ensureAuth, RolController.registrarRol);
rolRouter.patch('/actualizar-estado-rol/:id', ensureAuth, RolController.actualizarEstadoRol);
rolRouter.post('/obtener-roles', ensureAuth, RolController.obtenerRoles);
rolRouter.put('/actualizar-rol/:id', ensureAuth, RolController.actualizarRol);
rolRouter.get('/obtener-rol-por-id/:id', ensureAuth, RolController.obtenerRolPorId);
rolRouter.get('/contar-roles-activos', ensureAuth, RolController.contarRolesActivos);
rolRouter.get('/listar-roles', ensureAuth, RolController.listarRoles);

export default rolRouter;