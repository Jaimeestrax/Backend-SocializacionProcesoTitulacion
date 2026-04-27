import Cargo from "../schemas/cargo.model.js";

// Listar cargos
async function listarCargos(req, res) {
    try {
        const cargos = await Cargo.find();
        res.status(200).send({
            message: "Cargos obtenidos exitosamente",
            data: cargos
        });
    } catch (error) {
        console.error('No se pudo obtener los cargos', error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

// Exportar los controladores
const CargoController = {
    listarCargos
}

export default CargoController;

