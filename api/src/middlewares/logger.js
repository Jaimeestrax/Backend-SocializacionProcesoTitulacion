// Registra las peticiones que recibe la API
export default async function logger(req, res, next) {
    //Fecha hora metodo y url de la peticion
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // Da paso a que continue la peticion
    next();
}