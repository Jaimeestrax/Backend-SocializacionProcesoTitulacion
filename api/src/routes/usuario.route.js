import express from "express";
import { ensureAuth } from "../middlewares/auth.js";
import UsuarioController from "../controllers/usuario.controller.js";

const usuarioRouter = express.Router();

usuarioRouter.post('/registrar-usuario', ensureAuth, UsuarioController.registrarUsuario);
usuarioRouter.get('/obtener-usuario-autenticado', ensureAuth, UsuarioController.obtenerUsuarioAutenticado);
usuarioRouter.post('/obtener-usuarios', ensureAuth, UsuarioController.obtenerUsuarios);

export default usuarioRouter;