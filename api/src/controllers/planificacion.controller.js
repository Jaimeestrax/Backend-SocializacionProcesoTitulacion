import Planificacion from "../schemas/planificacion.model.js";
import Noticia from "../schemas/noticia.model.js";

async function registrarPlanificacion(req, res) {
    try {
        const { periodo, fechaInicio, fechaFin, subprocesos, idEncargadoGenerar } = req.body;

        // Información general de la planificación
        if (!periodo || !fechaInicio || !fechaFin || !subprocesos || subprocesos.length === 0 || !idEncargadoGenerar) {
            return res.status(400).send({ message: 'No se ha proporcionado toda la información de la planificación' });
        }

        // Validar subprocesos relacionados a la planificación
        for (const subproceso of subprocesos) {
            const { identificador, nombre, descripcion, fechaInicio, fechaFin } = subproceso;

            if (!identificador || !nombre || !descripcion || !fechaInicio || !fechaFin) {
                return res.status(400).send({ message: `El subproceso "${nombre || 'sin nombre'}" tiene datos incompletos` });
            }

            for (const actividad of subproceso.actividades) {
                const { nombre, descripcion, fechaInicio, fechaFin, idParticipante } = actividad;

                if (!nombre || !descripcion || !fechaInicio || !fechaFin || !idParticipante) {
                    return res.status(400).send({ message: `La actividad "${nombre || 'sin nombre'}" tiene datos incompletos` });
                }

                for (const instrumento of actividad.instrumentos) {
                    const { idInstrumento, identificador } = instrumento;

                    if (!idInstrumento || !identificador) {
                        return res.status(400).send({ message: `El instrumento "${idInstrumento || 'sin nombre'}" tiene datos incompletos` });
                    }
                }
            }
        }

        // Creación de planificación con subprocesos embebidos
        const nuevaPlanificacion = new Planificacion({
            periodo,
            fechaInicio,
            fechaFin,
            subprocesos,
            idEncargadoGenerar
        });

        await nuevaPlanificacion.save();

        // Las demás planificaciones se marcan como deshabilitadas -> solo una queda vigente
        await Planificacion.updateMany({ _id: { $ne: nuevaPlanificacion._id } }, { estado: false });
        // Las noticias automáticamente pasan a estado false
        await Noticia.updateMany({ idPlanificacion: { $ne: nuevaPlanificacion._id }, estado: true }, { estado: false });
        // No usa type objectId porque se usa la info de la planificacion creada

        res.status(201).send({ message: 'Planificación registrada exitosamente' });
    } catch (error) {
        console.error("No se pudo registrar la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPlanificaciones(req, res) {
    try {
        const options = {
            page: req.body.pagina || 1,
            limit: req.body.limite || 10,
            populate: [
                { path: 'subprocesos.actividades.idParticipante', select: 'nombre' },
                { path: 'subprocesos.actividades.instrumentos.idInstrumento', select: 'codigo nombre archivo version' }
            ]
        }

        let filtro = {};

        if (req.body.palabra && req.body.palabra.trim() !== "") {
            filtro.periodo = { $regex: req.body.palabra.trim(), $options: "i" };
        }

        const planificacionesEncontradas = await Planificacion.paginate(filtro, options);

        if (planificacionesEncontradas.docs.length === 0) {
            return res.status(404).send({ message: 'No se encontraron planificaciones' });
        }

        res.status(200).send({
            message: "Planificaciones encontradas exitosamente",
            data: planificacionesEncontradas
        });

    } catch (error) {
        console.error("No se pudo obtener las planificaciones: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function actualizarPlanificacion(req, res) {
    try {
        const { id } = req.params;

        const datosActualizar = { ...req.body };

        // Validación general
        if (
            !datosActualizar.periodo ||
            !datosActualizar.fechaInicio ||
            !datosActualizar.fechaFin ||
            !datosActualizar.subprocesos ||
            datosActualizar.subprocesos.length === 0 ||
            !datosActualizar.idEncargadoActualizar
        ) {
            return res.status(400).send({ message: "No se ha proporcionado toda la información de la planificación" });
        }

        // Validación de subprocesos
        for (const subproceso of datosActualizar.subprocesos) {
            if (
                !subproceso.identificador ||
                !subproceso.nombre ||
                !subproceso.descripcion ||
                !subproceso.fechaInicio ||
                !subproceso.fechaFin
            ) {
                return res.status(400).send({ message: `El subproceso "${subproceso.nombre || 'sin nombre'}" tiene datos incompletos` });
            }

            // Validación de actividades
            for (const actividad of subproceso.actividades) {
                if (
                    !actividad.nombre ||
                    !actividad.descripcion ||
                    !actividad.fechaInicio ||
                    !actividad.fechaFin ||
                    !actividad.idParticipante
                ) {
                    return res.status(400).send({ message: `La actividad "${actividad.nombre || 'sin nombre'}" tiene datos incompletos` });
                }

                // Validación instrumentos
                for (const instrumento of actividad.instrumentos) {
                    if (
                        !instrumento.idInstrumento ||
                        !instrumento.identificador
                    ) {
                        return res.status(400).send({ message: `Un instrumento de la actividad "${actividad.nombre}" tiene datos incompletos` });
                    }
                }
            }
        }

        datosActualizar.fechaActualizacion = new Date();

        const planificacionActualizada = await Planificacion.findByIdAndUpdate(id, datosActualizar, { new: true });

        if (!planificacionActualizada) {
            return res.status(404).send({ message: "No se encontró la planificación" });
        }

        res.status(200).send({
            message: "Planificación actualizada exitosamente",
            data: planificacionActualizada
        });
    } catch (error) {
        console.error("No se pudo actualizar la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function actualizarEstadoPlanificacion(req, res) {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const planificacionActualizada = await Planificacion.findByIdAndUpdate(id, { estado }, { new: true });

        if (!planificacionActualizada) {
            return res.status(404).send({ message: "No se encontró la planificación" });
        }

        // Si se desactiva la planificación -> cumplio vigencia
        if (estado === false) {
            // Las noticias de esa planificación automáticamente pasan a estado false
            await Noticia.updateMany({ idPlanificacion: id, estado: true }, { estado: false });
            // Object id porque de params viene como string y no se puede comparar asi nomas
        }

        res.status(200).send({
            message: "Estado de la planificación actualizado exitosamente",
            data: planificacionActualizada
        });

    } catch (error) {
        console.error("No se pudo actualizar el estado de la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPlanificacionPorId(req, res) {
    try {
        const { id } = req.params;

        const planificacionEncontrada = await Planificacion.findById(id)
            .populate([
                { path: "subprocesos.actividades.idParticipante", select: "nombre" },
                { path: "subprocesos.actividades.instrumentos.idInstrumento", select: "codigo nombre archivo version" }
            ]);

        if (!planificacionEncontrada) {
            return res.status(404).send({ message: "No se encontró la planificación" });
        }

        res.status(200).send({
            message: "Planificación obtenida exitosamente",
            data: planificacionEncontrada
        });
    } catch (error) {
        console.error("No se pudo obtener la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPlanificacionVigente(req, res) {
    try {
        const planificacionVigente = await Planificacion.findOne({ estado: true })
            .populate([
                { path: "subprocesos.actividades.idParticipante", select: "nombre" },
                { path: "subprocesos.actividades.instrumentos.idInstrumento", select: "codigo nombre archivo version" }
            ]);

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontró una planificación vigente" });
        }

        res.status(200).send({
            message: "Planificación vigente obtenida exitosamente",
            data: planificacionVigente
        });
    } catch (error) {
        console.error("No se pudo obtener la planificación vigente: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPeriodoActual(req, res) {
    try {
        const planificacionVigente = await Planificacion.findOne({ estado: true });

        let periodoActual;
        // Si no hay planificación vigente no hay periodo actual
        if (!planificacionVigente) {
            periodoActual = "SIN INFORMACIÓN";
        } else {
            // Se obtiene fecha inicio y fecha fin para dar el formato del periodo
            const fechaInicio = planificacionVigente.fechaInicio.toISOString().split('T')[0];
            const fechaFin = planificacionVigente.fechaFin.toISOString().split('T')[0];

            const meses = [
                "ENERO",
                "FEBRERO",
                "MARZO",
                "ABRIL",
                "MAYO",
                "JUNIO",
                "JULIO",
                "AGOSTO",
                "SEPTIEMBRE",
                "OCTUBRE",
                "NOVIEMBRE",
                "DICIEMBRE"
            ];

            // Obtenemos mes-año de inicio y fin
            const [anioInicio, mesInicio] = fechaInicio.split("-");
            const [anioFin, mesFin] = fechaFin.split("-");

            const nombreMesInicio = meses[Number(mesInicio) - 1];
            const nombreMesFin = meses[Number(mesFin) - 1];

            // Mismo año
            if (anioInicio === anioFin) {
                periodoActual = `${nombreMesInicio}-${nombreMesFin} ${anioInicio}`;
            } else {
                // Diferente año
                periodoActual = `${nombreMesInicio} ${anioInicio}-${nombreMesFin} ${anioFin}`;
            }
        }

        res.status(200).send({
            message: "Periodo actual obtenido exitosamente",
            data: periodoActual
        });
    } catch (error) {
        console.error("No se pudo obtener el periodo actual: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerPorcentajeAvance(req, res) {
    try {
        // Obtener fecha actual
        const hoy = new Date().toISOString().split("T")[0];

        // Obtener planificacion vigente
        const planificacionVigente = await Planificacion.findOne({ estado: true });

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No existe una planificacion vigente" });
        }

        // Recorrer subprocesos para extraer actividades
        const actividades = planificacionVigente.subprocesos.flatMap(
            subproceso => subproceso.actividades // flatMap -> extrae elementos y concatena resultados
        );

        // Contar total actividades
        const totalActividades = actividades.length;

        if (totalActividades === 0) {
            return res.status(404).send({ message: "No existen actividades registradas" });
        }

        // Obtener actividades finalizadas (fechaFin < hoy)
        const actividadesCompletadas = actividades.filter(actividad => {
            return (
                actividad.fechaFin.toISOString().split("T")[0] < hoy
            )
        }).length;

        // Calcular porcentaje
        const porcentajeAvance = Number(((actividadesCompletadas / totalActividades) * 100).toFixed(2));

        res.status(200).send({
            message: "Porcentaje de avance obtenido exitosamente",
            data: porcentajeAvance
        });

    } catch (error) {
        console.error("No se pudo obtener el porcentaje de avance: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerProximasActividades(req, res) {
    try {
        // Obtener fecha actual
        const hoy = new Date().toISOString().split("T")[0];

        // Obtener planificacion vigente
        const planificacionVigente = await Planificacion.findOne({ estado: true });

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontro una planificacion vigente" });
        }

        // Obtener subproceso actual
        const subprocesoActual = planificacionVigente.subprocesos.find(sp => {
            return (
                sp.fechaInicio.toISOString().split("T")[0] <= hoy && hoy <= sp.fechaFin.toISOString().split("T")[0]
            )
        });

        if (!subprocesoActual) {
            return res.status(404).send({ message: "No existe un subproceso para la fecha actual" });
        }

        // Filtrar actividades que fecha inicio > hoy
        const proximasActividades = subprocesoActual.actividades.filter(actividad => {
            return (
                actividad.fechaInicio.toISOString().split("T")[0] > hoy
            )
        });

        if (!proximasActividades) {
            return res.status(404).send({ message: "No existen próximas actividades para el subproceso actual" });
        }

        res.status(200).send({
            message: 'Próximas actividades obtenidas exitosamente',
            data: proximasActividades
        });
    } catch (error) {
        console.error("No se pudo obtener las próximas actividades de la planificación: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerSubprocesoActual(req, res) {
    try {
        // Establecer fecha actual
        const hoy = new Date().toISOString().split("T")[0];
        // Buscar planificacion vigente
        const planificacionVigente = await Planificacion.findOne({ estado: true });

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontro una planificacion vigente" });
        }
        // Dentro de los subprocesos buscar -> fechaInicio <= actual <= fechaFin
        const subprocesoActual = planificacionVigente.subprocesos.find(sp => {
            return (
                sp.fechaInicio.toISOString().split("T")[0] <= hoy && hoy <= sp.fechaFin.toISOString().split("T")[0]
            );
        });

        if (!subprocesoActual) {
            return res.status(404).send({ message: "No existe un subproceso para la fecha actual" });
        }

        res.status(200).send({
            message: "Subproceso actual obtenido exitosamente",
            data: subprocesoActual
        });

    } catch (error) {
        console.error("No se pudo obtener el subproceso actual: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerActividadPorId(req, res) {
    try {
        const { id } = req.params; // Object id de la actividad

        // Buscar la planificación vigente con esa actividad
        const planificacionVigente = await Planificacion.findOne({
            estado: true,
            "subprocesos.actividades._id": id
        }).populate([
            { path: "subprocesos.actividades.idParticipante", select: "nombre" },
            { path: "subprocesos.actividades.instrumentos.idInstrumento", select: "codigo nombre archivo version" }
        ]);

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontró la actividad en la planificación vigente" });
        }

        let actividadEncontrada = null;

        // Recorrer subprocesos
        for (const subproceso of planificacionVigente.subprocesos) {
            // Buscar actividad dentro del subproceso
            const actividad = subproceso.actividades.id(id);
            if (actividad) {
                actividadEncontrada = actividad;
                break;
            }
        }

        if (!actividadEncontrada) {
            return res.status(404).send({ message: "No se encontró la actividad especifica" });
        }

        res.status(200).send({
            message: "Actividad obtenida exitosamente",
            data: actividadEncontrada
        });

    } catch (error) {
        console.error("No se pudo obtener la actividad especifica: ", error.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerSubprocesosPlanificacionVigente(req, res) {
    try {
        const planificacionVigente = await Planificacion.findOne({ estado: true })
            .select("subprocesos")
            .populate({
                path: "subprocesos.actividades.idParticipante",
                select: "nombre"
            });

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontró una planificación vigente" });
        }

        // Obtener la fecha de hoy en formato 'YYYY-MM-DD' para comparar cadenas de forma segura
        const hoy = new Date().toISOString().split("T")[0];

        // Mapeamos los subprocesos para añadirles el estado calculado -> ayuda a filtrar en calendarización
        const subprocesosConEstado = planificacionVigente.subprocesos.map(subproceso => {
            // Convertimos el documento de Mongoose a objeto plano para poder manipularlo libremente
            const spObj = subproceso.toObject();

            // Formateamos las fechas del subproceso
            const fechaInicioSP = subproceso.fechaInicio.toISOString().split("T")[0];
            const fechaFinSP = subproceso.fechaFin.toISOString().split("T")[0];

            let estadoCalculado = "proximo";

            // Calculo del estado en base a las fechas
            if (hoy > fechaFinSP) {
                estadoCalculado = "finalizado";
            } else if (hoy >= fechaInicioSP && hoy <= fechaFinSP) {
                estadoCalculado = "en_proceso";
            } else if (hoy < fechaInicioSP) {
                estadoCalculado = "proximo";
            }

            // Cantidad de actividades finalizadas -> hoy > fechaFin de la actividad
            const actividades = spObj.actividades || [];

            const actividadesCompletadas = actividades.filter(actividad => {
                if (!actividad.fechaFin) return false;
                const fechaFinActividad = new Date(actividad.fechaFin).toISOString().split("T")[0];
                return hoy > fechaFinActividad;
            }).length;

            // Total de actividades en este subproceso
            const actividadesTotales = actividades.length;

            // Inyectamos la nueva propiedad al objeto plano del subproceso
            spObj.estadoCalculado = estadoCalculado;
            spObj.actividadesCompletadas = actividadesCompletadas;
            spObj.actividadesTotales = actividadesTotales;

            return spObj;
        });

        res.status(200).send({
            message: "Subprocesos de la planificación vigente obtenidos exitosamente",
            data: subprocesosConEstado
        });
    } catch (e) {
        console.error("No se pudo obtener los subprocesos de la planificación: ", e.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerCodigoPAO(req, res) {
    try {
        const planificacionVigente = await Planificacion.findOne({ estado: true }).select("periodo");

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontró una planificación vigente" });
        }

        res.status(200).send({
            message: "Código PAO obtenido exitosamente",
            data: planificacionVigente.periodo
        });
    } catch (e) {
        console.error("No se pudo obtener el código del PAO actual: ", e.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

async function obtenerSubprocesoEspecificoPlanificacion(req, res) {
    try {
        const { id } = req.params; // Id subproceso
        const planificacionVigente = await Planificacion
            .findOne({ estado: true })
            .populate({
                path: "subprocesos.actividades.idParticipante",
                select: "nombre"
            })
            .populate({
                path: "subprocesos.actividades.instrumentos.idInstrumento",
                select: "codigo nombre archivo version"
            });

        if (!planificacionVigente) {
            return res.status(404).send({ message: "No se encontró una planificación vigente" });
        }

        const subproceso = planificacionVigente.subprocesos.id(id);
        if (!subproceso) {
            return res.status(404).send({ message: "No se encontró el subproceso especificado" });
        }

        // Calculo del estado del subproceso en base a las fechas
        const hoy = new Date().toISOString().split("T")[0];
        const fechaInicioSP = subproceso.fechaInicio.toISOString().split("T")[0];
        const fechaFinSP = subproceso.fechaFin.toISOString().split("T")[0];

        let estadoCalculado = "proximo";

        if (hoy > fechaFinSP) {
            estadoCalculado = "finalizado";
        } else if (hoy >= fechaInicioSP && hoy <= fechaFinSP) {
            estadoCalculado = "en_proceso";
        } else if (hoy < fechaInicioSP) {
            estadoCalculado = "proximo";
        }

        // Cálculo de días restantes para fecha fin
        const fechaHoyDate = new Date(hoy);
        const fechaFinDate = new Date(fechaFinSP);

        // Restamos los milisegundos y convertimos a días
        const diferenciaMilisegundos = fechaFinDate.getTime() - fechaHoyDate.getTime();
        const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

        // Cálculo de estado por actividad
        const actividadesOriginales = subproceso.actividades || [];
        const actividadesTotales = actividadesOriginales.length;
        let actividadesCompletadas = 0;

        const actividadesProcesadas = actividadesOriginales.map(actividad => {
            // Pasamos a objeto plano
            const actData = actividad.toObject();

            if (actData.fechaInicio && actData.fechaFin) {
                // Fechas de la actividad
                const fInicioAct = new Date(actData.fechaInicio).toISOString().split("T")[0];
                const fFinAct = new Date(actData.fechaFin).toISOString().split("T")[0];

                if (hoy > fFinAct) {
                    actData.estadoCalculado = "finalizado";
                    actividadesCompletadas++; // Suma al contador global si ya finalizo
                } else if (hoy >= fInicioAct && hoy <= fFinAct) {
                    actData.estadoCalculado = "en_proceso";
                } else {
                    actData.estadoCalculado = "proximo";
                }
            } else {
                // Fallback por seguridad si alguna actividad no tiene fechas registradas
                actData.estadoCalculado = "proximo";
            }

            return actData;
        });

        // Calculamos el porcentaje de avance del subproceso
        const porcentajeCompletado = actividadesTotales > 0 ? Math.round((actividadesCompletadas / actividadesTotales) * 100) : 0;

        // Convertimos a un objeto plano
        const subprocesoData = subproceso.toObject();

        // Asignamos las propiedades calculadas al nuevo objeto
        subprocesoData.actividades = actividadesProcesadas; // Reemplzamos actividades originales con las procesadas
        subprocesoData.porcentajeCompletado = porcentajeCompletado;
        subprocesoData.estadoCalculado = estadoCalculado;
        subprocesoData.actividadesCompletadas = actividadesCompletadas;
        subprocesoData.actividadesTotales = actividadesTotales;
        subprocesoData.diasRestantes = diasRestantes >= 0 ? diasRestantes : 0;

        res.status(200).send({
            message: "Subproceso específico obtenido exitosamente",
            data: subprocesoData
        });
    } catch (e) {
        console.error("No se pudo obtener el subproceso específico: ", e.name);
        res.status(500).send({ message: "Error interno del servidor" });
    }
}

export default {
    registrarPlanificacion,
    obtenerPlanificaciones,
    actualizarPlanificacion,
    actualizarEstadoPlanificacion,
    obtenerPlanificacionPorId,

    // Consultas públicas
    obtenerPlanificacionVigente,
    obtenerPeriodoActual,
    obtenerPorcentajeAvance,
    obtenerProximasActividades,
    obtenerSubprocesoActual,
    obtenerActividadPorId,
    obtenerSubprocesosPlanificacionVigente,
    obtenerCodigoPAO,
    obtenerSubprocesoEspecificoPlanificacion
}