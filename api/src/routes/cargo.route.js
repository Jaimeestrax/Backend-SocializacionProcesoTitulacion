import express from "express";
import CargoController from "../controllers/cargo.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const cargoRouter = express.Router();

cargoRouter.post('/registrar-cargo', ensureAuth, CargoController.registrarCargo);
cargoRouter.patch('/actualizar-estado-cargo/:id', ensureAuth, CargoController.actualizarEstadoCargo);
cargoRouter.post('/obtener-cargos', ensureAuth, CargoController.obtenerCargos);
cargoRouter.get('/listar-cargos', ensureAuth, CargoController.listarCargos);
cargoRouter.get('/obtener-cargo-por-id/:id', ensureAuth, CargoController.obtenerCargoPorId);
cargoRouter.put('/actualizar-cargo/:id', ensureAuth, CargoController.actualizarCargo);
cargoRouter.get('/obtener-cargos-activos', ensureAuth, CargoController.obtenerCargosActivos);

export default cargoRouter;