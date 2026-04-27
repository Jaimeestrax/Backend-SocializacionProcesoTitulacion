import express from "express";
import CargoController from "../controllers/cargo.controller.js";
import { ensureAuth } from "../middlewares/auth.js";

const cargoRouter = express.Router();

cargoRouter.get('/listar-cargos', ensureAuth, CargoController.listarCargos);

export default cargoRouter;