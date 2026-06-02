import express from "express";
import { ensureAuth } from "../middlewares/auth.js";
import UsuarioController from "../controllers/usuario.controller.js";
import { upload } from "../middlewares/multer.js";

const usuarioRouter = express.Router();

usuarioRouter.post('/registrar-usuario', ensureAuth, UsuarioController.registrarUsuario);
usuarioRouter.get('/obtener-usuario-autenticado', ensureAuth, UsuarioController.obtenerUsuarioAutenticado);
usuarioRouter.post('/obtener-usuarios', ensureAuth, UsuarioController.obtenerUsuarios);
usuarioRouter.get('/obtener-usuario-por-id/:id', ensureAuth, UsuarioController.obtenerUsuarioPorId);
usuarioRouter.put('/actualizar-usuario/:id', ensureAuth, upload('fotos_perfil').single('foto'), UsuarioController.actualizarUsuario);
usuarioRouter.patch('/actualizar-estado-usuario/:id', ensureAuth, UsuarioController.actualizarEstadoUsuario);
usuarioRouter.get('/contar-usuarios-activos', ensureAuth, UsuarioController.contarUsuariosActivos);

export default usuarioRouter;