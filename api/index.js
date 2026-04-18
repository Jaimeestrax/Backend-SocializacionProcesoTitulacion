// Levanta el servidor
import app from "./app.js";

const port = process.env.PORT || 5000;

// Ruta de prueba
// app.get('/', (req, res) => {
//     res.json({ message: 'Api working' });
// });

app.listen(port, () => {
    console.log(`Server listening on http://localhost${port}`);
});