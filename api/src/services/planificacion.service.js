import Planificacion from "../schemas/planificacion.model.js";

async function obtenerSubprocesos() {
    const planificacionEncontrada = await Planificacion.findOne({ estado: true });

    if (!planificacionEncontrada) {
        throw new Error("No se encontró ninguna planificación vigente");
    }

    const subprocesos = planificacionEncontrada.subprocesos;

    if (!subprocesos || subprocesos.length === 0) {
        throw new Error("No se encontraron subprocesos en la planificación vigente");
    }

    return subprocesos;
}

async function obtenerActividades(idSubproceso) {

    // Busca el subproceso que coincida con el id proporcionado y que su planificacion esté vigente
    const planificacionVigente = await Planificacion.findOne({ estado: true }).select("subprocesos");

    if (!planificacionVigente) {
        throw new Error("No se encontraron subprocesos en la planificación vigente");
    }

    const subproceso = planificacionVigente.subprocesos.find((sp) => sp._id.toString() === idSubproceso.toString());

    if (!subproceso || !subproceso.actividades || subproceso.actividades.length === 0) {
        throw new Error("No se encontraron actividades en el subproceso indicado");
    }

    return subproceso.actividades;
}

async function obtenerActividad(idActividad) {
    const planificacionVigente = await Planificacion.findOne({ estado: true });

    if (!planificacionVigente) {
        throw new Error("No se encontró una planificación vigente");
    }

    let actividadEncontrada = null;

    // Recorrer subprocesos
    for (const subproceso of planificacionVigente.subprocesos) {
        // Buscar actividad dentro del subproceso
        const actividad = subproceso.actividades.id(idActividad);
        if (actividad) {
            actividadEncontrada = actividad;
            break;
        }
    }

    if (!actividadEncontrada) {
        throw new Error("No se encontró la actividad indicada");
    }

    return actividadEncontrada;
}

async function obtenerFechasActividad(idActividad) {
    const planificacionVigente = await Planificacion.findOne({ estado: true });

    if (!planificacionVigente) {
        throw new Error("No se encontró una planificación vigente");
    }

    let actividadEncontrada = null;

    // Recorrer subprocesos
    for (const subproceso of planificacionVigente.subprocesos) {
        // Buscar actividad dentro del subproceso
        const actividad = subproceso.actividades.id(idActividad);
        if (actividad) {
            actividadEncontrada = actividad;
            break;
        }
    }

    if (!actividadEncontrada) {
        throw new Error("No se encontró la actividad indicada");
    }

    const fechaInicio = new Date(actividadEncontrada.fechaInicio).toISOString().split('T')[0];
    const fechaFin = new Date(actividadEncontrada.fechaFin).toISOString().split('T')[0];

    return `La actividad inicia el: ${fechaInicio} y finaliza el: ${fechaFin}`;
}

async function obtenerParticipanteActividad(idActividad) {
    const planificacionVigente = await Planificacion.findOne({ estado: true })
        .populate([
            { path: "subprocesos.actividades.idParticipante", select: "nombre" }
        ]);

    if (!planificacionVigente) {
        throw new Error("No se encontró una planificación vigente");
    }

    let actividadEncontrada = null;

    // Recorrer subprocesos
    for (const subproceso of planificacionVigente.subprocesos) {
        // Buscar actividad dentro del subproceso
        const actividad = subproceso.actividades.id(idActividad);
        if (actividad) {
            actividadEncontrada = actividad;
            break;
        }
    }

    if (!actividadEncontrada) {
        throw new Error("No se encontró la actividad indicada");
    }

    return actividadEncontrada.idParticipante.nombre;
}

async function obtenerInstrumentosActividad(idActividad) {
    const planificacionVigente = await Planificacion.findOne({ estado: true })
        .populate([
            { path: "subprocesos.actividades.instrumentos.idInstrumento", select: "nombre archivo" }
        ]);

    if (!planificacionVigente) {
        throw new Error("No se encontró una planificación vigente");
    }

    let actividadEncontrada = null;

    // Recorrer subprocesos
    for (const subproceso of planificacionVigente.subprocesos) {
        // Buscar actividad dentro del subproceso
        const actividad = subproceso.actividades.id(idActividad);
        if (actividad) {
            actividadEncontrada = actividad;
            break;
        }
    }

    if (!actividadEncontrada) {
        throw new Error("No se encontró la actividad indicada");
    }

    return actividadEncontrada.instrumentos;
}

const PlanificacionService = {
    obtenerSubprocesos,
    obtenerActividades,
    obtenerActividad,
    obtenerFechasActividad,
    obtenerParticipanteActividad,
    obtenerInstrumentosActividad
};

export default PlanificacionService;