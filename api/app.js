'use strict'; // Fuerza sintaxis rigurosa y segura

// Aplicación Express
import express from 'express';
import 'dotenv/config'; // Manejo de variables de entorno
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import logger from './src/middlewares/logger.js';
import { connectDB } from './src/config/db.js';
import { crearAdminSiNoExiste } from './src/utils/createAdmin.js';

// Importación de rutas base
import authRouter from './src/routes/auth.route.js';
import instrumentoRouter from './src/routes/intrumento.route.js';
import usuarioRouter from './src/routes/usuario.route.js';
import subprocesoRouter from './src/routes/subproceso.route.js';
import cargoRouter from './src/routes/cargo.route.js';

// Conexión a la base de datos
await connectDB();

// Crear admin si no existe
await crearAdminSiNoExiste();

// Instancia de express
const app = express();

// Middlewares
app.use(logger); // Registra las peticiones que recibe la API
app.use(helmet()); // Seguridad base -> Setea headers http para vulnerabilidades web comunes
app.use(express.json()); // Convierte el cuerpo de las peticiones a json -> content-type: application/json
app.use(express.urlencoded({ extended: true }));  // Parsea datos codificados en la URL -> content-type: application/x-www-form-urlencoded
// Configuracion de CORS
app.use(
    cors({
        origin: ["http://localhost:3000"]
    })
);

// Ensamble de rutas a exponer
app.use('/api', authRouter);
app.use('/api', instrumentoRouter);
app.use('/api', usuarioRouter);
app.use('/api', subprocesoRouter);
app.use('/api', cargoRouter);

// Servir archivos estaticos
app.use('/uploads', express.static(path.resolve('uploads')));

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).send({ message: 'Ruta no encontrada' });
});

// Exportación de la instancia de express
export default app;