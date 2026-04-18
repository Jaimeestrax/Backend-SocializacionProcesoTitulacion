// Aplicación Express
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Importación de rutas base


// Conexión a la base de datos


// Instancia de express
const app = express();

// Middlewares
app.use(helmet()); // Seguridad base

// Ensamble de rutas a exponer


// Manejo de rutas no encontradas


// Exportación de la instancia de express
export default app;