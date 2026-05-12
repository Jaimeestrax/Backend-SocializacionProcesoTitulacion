import express from 'express';
import NoticiaController from '../controllers/noticia.controller.js';
import { ensureAuth } from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';

const noticiaRouter = express.Router();

noticiaRouter.post('/registrar-noticia', ensureAuth, upload('imagenes_noticias').single('imagen'), NoticiaController.registrarNoticia);
noticiaRouter.put('/actualizar-noticia/:id', ensureAuth, upload('imagenes_noticias').single('imagen'), NoticiaController.actualizarNoticia);
noticiaRouter.post('/obtener-noticias', ensureAuth, NoticiaController.obtenerNoticias);
noticiaRouter.patch('/actualizar-estado-noticia/:id', ensureAuth, NoticiaController.actualizarEstadoNoticia);
noticiaRouter.delete('/eliminar-noticia/:id', ensureAuth, NoticiaController.eliminarNoticia);
noticiaRouter.get('/obtener-noticia-por-id/:id', ensureAuth, NoticiaController.obtenerNoticiaPorId);

export default noticiaRouter;