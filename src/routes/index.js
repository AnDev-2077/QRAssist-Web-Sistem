const express = require('express');
const router = express.Router();
const multer = require('multer');
const readXlsxFile = require("read-excel-file/node");
const pool = require('../database');
const storage = require('../multer');
const uploader = multer({ storage });
const ExcelJS = require('exceljs');
const {error} = require('../public/scripts/alertas')


//Controlador cargar
router.get('/cargar', (req, res) => {
    res.render('auth/cargar');
});

//Controlador actualizar

router.post('/upload', uploader.single('file'), async (req, res) => {
    try {
        let rows = await readXlsxFile(req.file.path);
        rows.shift();
        for (let row of rows) {
            let query = 'INSERT INTO alumnos (Codigo_QR, nombre, apellido, edad, seccion, ciclo,carrera_curso,turno) VALUES ?';
            await pool.query(query, [[row]]);
        }
        
        res.send('<script>alert("Datos Cargados Exitosamente"); window.location.href = "/cargar";</script>');

        
    } catch (error) {


        res.send('<script>alert("Error al cargar datos, Revise que este cargando un exel y que el exel tenga el formato correcto"); window.location.href = "/cargar";</script>');
    }
});

//Controlador asistencia
router.get('/verificar', async (req, res) => {
    try {
        const fechaActual = new Date();
        const fechaString = fechaActual.toISOString().slice(0, 10);

        const todosLosAlumnos = await pool.query('SELECT Codigo_QR, turno FROM alumnos');

        const asistencias = await pool.query('SELECT qr_alumno, id_estado, fecha FROM asistencia WHERE DATE(fecha) = ?', [fechaString]);

        for (const alumno of todosLosAlumnos) {
            const asistenciaAlumno = asistencias.find(asistencia => asistencia.qr_alumno === alumno.Codigo_QR);
            
            if (!asistenciaAlumno) {
                // Este alumno faltó, así que marca su falta
                await pool.query('INSERT INTO asistencia (qr_alumno, id_estado, fecha) VALUES (?, 2, ?)', [alumno.Codigo_QR, fechaActual]);
                continue; // Salta al siguiente ciclo del bucle
            }

            // Verificar y actualizar el estado según los criterios de horario y turno
            const estadoActualizado = obtenerEstado(fechaActual, asistenciaAlumno, alumno.turno);

            if (estadoActualizado !== asistenciaAlumno.id_estado && asistenciaAlumno.id_estado !== 4) {
                // No modificar si el estado es 'justificado'
                await pool.query('UPDATE asistencia SET id_estado = ? WHERE qr_alumno = ? AND DATE(fecha) = ?', [estadoActualizado, alumno.Codigo_QR, fechaString]);
            }
        }

        res.redirect('/asistencias');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});

// Función para obtener el estado actualizado según los criterios de horario y turno
function obtenerEstado(fechaActual, asistenciaAlumno, turnoAlumno) {
    const horaLlegada = obtenerHoraLlegada(asistenciaAlumno.fecha);
    const minutosLlegada = obtenerMinutosLlegada(asistenciaAlumno.fecha);
    const { fecha } = asistenciaAlumno;

    if (asistenciaAlumno.id_estado === 2 || asistenciaAlumno.id_estado === 4) {
        // Si el alumno ya tiene falta o está justificado, no realizar más verificaciones
        return asistenciaAlumno.id_estado;
    }

    const limiteTardanza = 10; // Límite de minutos después de la hora para considerar tardanza

    if ((turnoAlumno === 'mañana' && horaLlegada <= 8 && minutosLlegada <= limiteTardanza) ||
        (turnoAlumno === 'tarde' && horaLlegada <= 15 && minutosLlegada <= limiteTardanza) ||
        (turnoAlumno === 'noche' && horaLlegada <= 19 && minutosLlegada <= limiteTardanza)) {
        return 1; // Estado de asistencia
    } else {
        return 3; // Estado de tardanza
    }
}

// Función para obtener la hora de llegada desde la fecha de asistencia almacenada en la base de datos
function obtenerHoraLlegada(fechaAsistencia) {
    const fecha = new Date(fechaAsistencia);
    return fecha.getHours();
}

// Función para obtener los minutos de llegada desde la fecha de asistencia almacenada en la base de datos
function obtenerMinutosLlegada(fechaAsistencia) {
    const fecha = new Date(fechaAsistencia);
    return fecha.getMinutes();
}






router.get('/asistencias', async (req, res) => {
    try {
        const fechaActual = new Date();
        fechaActual.setMinutes(fechaActual.getMinutes() - fechaActual.getTimezoneOffset());
        const fechaActualFormateada = fechaActual.toISOString().slice(0, 10);

        const consul = await pool.query('SELECT a.Codigo_QR, a.nombre, a.apellido, a.edad, a.seccion, a.ciclo,a.carrera_curso,a.turno, e.nombre as estado, asis.fecha FROM alumnos a JOIN asistencia asis ON a.Codigo_QR = asis.qr_alumno JOIN estados e ON asis.id_estado = e.id_estado WHERE DATE(asis.fecha) = ?', [fechaActualFormateada]);

        res.render('auth/vistaasist', { consul: consul });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});


//Controlador asistencia por semana

router.get('/asistencias-semana', async (req, res) => {
    try {
        const fechaActual = new Date();
        const fechaInicioSemana = new Date();
        fechaInicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay() + (fechaActual.getDay() === 0 ? -6 : 1)); // Si es domingo, retrocede 6 días. Si no, retrocede al lunes.
        const fechaFinSemana = new Date();
        fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);
        const consul = await pool.query('SELECT a.Codigo_QR, a.nombre, a.apellido, a.edad, a.seccion, a.ciclo,a.carrera_curso,a.turno, e.nombre as estado, asis.fecha FROM alumnos a JOIN asistencia asis ON a.Codigo_QR = asis.qr_alumno JOIN estados e ON asis.id_estado = e.id_estado WHERE asis.fecha BETWEEN ? AND ? ORDER BY asis.fecha', [fechaInicioSemana.toISOString().slice(0, 10), fechaFinSemana.toISOString().slice(0, 10)]);
        res.render('auth/semana', { alumnos: consul });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});

//Controlador asistencia por mes

router.get('/asistencias-mes', async (req, res) => {
    try {
        const fechaActual = new Date();
        const fechaInicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        const fechaFinMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
        const consul = await pool.query('SELECT a.Codigo_QR, a.nombre, a.apellido, a.edad, a.seccion, a.ciclo,a.carrera_curso,a.turno, e.nombre as estado, asis.fecha FROM alumnos a JOIN asistencia asis ON a.Codigo_QR = asis.qr_alumno JOIN estados e ON asis.id_estado = e.id_estado WHERE asis.fecha BETWEEN ? AND ? ORDER BY asis.fecha', [fechaInicioMes.toISOString().slice(0, 10), fechaFinMes.toISOString().slice(0, 10)]);
        res.render('auth/mensual', { alumnos: consul });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});

//Controlador para modificar asistencias

router.post('/asistencias/modificar', async (req, res) => {
    try {
        const { Codigo_QR, fecha } = req.body;
        
        // Convertir la fecha a formato MySQL
        const fechaObj = new Date(fecha);
        fechaObj.setMinutes(fechaObj.getMinutes() - fechaObj.getTimezoneOffset());
        const fechaMySQL = fechaObj.toISOString().slice(0, 19).replace('T', ' ');
        await pool.query('UPDATE asistencia SET id_estado = 4 WHERE qr_alumno = ? AND fecha = ?',   [Codigo_QR, fechaMySQL]);
        setTimeout(() => {
            res.redirect('back');
        }, 1000);
    } catch (error) {
        console.error(error);
        res.redirect('back');
    }
});

//Controlador exportar a excel - dia

router.get('/exportar/dia', async (req, res) => {
    try {
        const fechaActual = new Date().toISOString().slice(0, 10);

        const consul = await pool.query('SELECT a.Codigo_QR, a.nombre, a.apellido, a.edad,a.seccion, a.ciclo,a.carrera_curso,a.turno, e.nombre as estado, asis.fecha FROM alumnos a JOIN asistencia asis ON a.Codigo_QR = asis.qr_alumno JOIN estados e ON asis.id_estado = e.id_estado WHERE DATE(asis.fecha) = ?', [fechaActual]);

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Asistencias del dia');
        worksheet.columns = [
            { header: 'Codigo_QR', key: 'Codigo_QR' },
            { header: 'Nombre', key: 'nombre' },
            { header: 'Apellido', key: 'apellido' },
            { header: 'Edad', key: 'edad' },
            { header: 'Seccion', key: 'seccion' },
            { header: 'ciclo', key: 'ciclo' },
            { header: 'carrera_curso', key: 'carrera_curso' },
            { header: 'Estado', key: 'estado' },
            { header: 'turno', key: 'turno' },
            { header: 'Fecha', key: 'fecha' },

        ];
        consul.forEach((row) => {
            let newRow = worksheet.addRow(row);
        });
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        await workbook.xlsx.writeFile('Asistencias del dia.xlsx');
        res.download('Asistencias del dia.xlsx');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});

//Controlador exportar a excel - mes

router.get('/exportar/mes', async (req, res) => {
    try {
        const fechaActual = new Date();
        const primerDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().slice(0, 10);
        const ultimoDiaDelMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().slice(0, 10);

        const consul = await pool.query('SELECT a.Codigo_QR, a.nombre, a.apellido, a.edad,a.seccion, a.ciclo,a.carrera_curso,a.turno, e.nombre as estado, asis.fecha FROM alumnos a JOIN asistencia asis ON a.Codigo_QR = asis.qr_alumno JOIN estados e ON asis.id_estado = e.id_estado WHERE DATE(asis.fecha) BETWEEN ? AND ?', [primerDiaDelMes, ultimoDiaDelMes]);

        let datosAgrupados = {};

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Asistencia mensual');

        worksheet.getCell('A1').value = 'ASISTENCIA MENSUAL';

        worksheet.getCell('G1').value = 'FECHA ACTUAL: ' + new Date().toISOString().slice(0, 10);

        let encabezados = ['Codigo_QR', 'Nombre', 'Apellido', 'Edad', 'Seccion', 'ciclo', 'carrera_curso', 'Estado', 'turno'];
        let semanas = Array.from({ length: 5 }, (_, i) => i + 1);
        let dias = ['L', 'M', 'MM', 'J', 'V', 'S', 'D'];

        let encabezadosDeFechas = [];
        semanas.forEach(semana => {
            dias.forEach(dia => {
                encabezadosDeFechas.push(`${dia}${semana}`);
            });
        });

        worksheet.addRow([...encabezados, ...encabezadosDeFechas]);
        consul.forEach((row) => {
            let fecha = new Date(row.fecha);
            let semanaDelMes = Math.ceil(fecha.getDate() / 7);
            let diaDeLaSemana = ['L', 'M', 'MM', 'J', 'V', 'S', 'D'][fecha.getDay()];

            if (!datosAgrupados[row.Codigo_QR]) {
                datosAgrupados[row.Codigo_QR] = {
                    'Codigo_QR': row.Codigo_QR,
                    'Nombre': row.nombre,
                    'Apellido': row.apellido,
                    'Edad': row.edad,
                    'Seccion': row.seccion,
                    'ciclo': row.ciclo,
                    'carrera_curso': row.carrera_curso,
                    'Estado': row.estado,
                    'turno': row.turno,
                };
            }
            datosAgrupados[row.Codigo_QR][`${diaDeLaSemana}${semanaDelMes}`] = row.estado;
        });

        Object.values(datosAgrupados).forEach((row) => {
            let arrayRow = [row.Codigo_QR, row.Nombre, row.Apellido, row.Edad, row.Seccion, row.ciclo, row.carrera_curso, row.Estado, row.turno, ...encabezadosDeFechas.map(header => row[header] || '')];
            worksheet.addRow(arrayRow);
        });

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        await workbook.xlsx.writeFile('Asistencias mensual.xlsx');
        res.download('Asistencias mensual.xlsx');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});


router.get('/exportar/semanal', async (req, res) => {
    try {
        const fechaActual = new Date();
        const primerDiaDeLaSemana = new Date(fechaActual.setDate(fechaActual.getDate() - fechaActual.getDay())).toISOString().slice(0, 10);
        const ultimoDiaDeLaSemana = new Date(fechaActual.setDate(fechaActual.getDate() - fechaActual.getDay() + 6)).toISOString().slice(0, 10);

        const consul = await pool.query('SELECT a.Codigo_QR, a.nombre, a.apellido, a.edad,a.seccion, a.ciclo,a.carrera_curso,a.turno, e.nombre as estado, asis.fecha FROM alumnos a JOIN asistencia asis ON a.Codigo_QR = asis.qr_alumno JOIN estados e ON asis.id_estado = e.id_estado WHERE DATE(asis.fecha) BETWEEN ? AND ?', [primerDiaDeLaSemana, ultimoDiaDeLaSemana]);



        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Asistencias semanal');

        // Agregar el título y la fecha actual
        worksheet.mergeCells('A1:M1');
        worksheet.getCell('A1').value = 'Asistencia semanal';
        worksheet.mergeCells('N1:O1');
        worksheet.getCell('N1').value = 'Fecha Actual: ' + new Date().toISOString().slice(0, 10);

        // Agregar manualmente los encabezados de las columnas en la fila 2
        worksheet.addRow(['Codigo_QR', 'Nombre', 'Apellido', 'Edad', 'Seccion', 'ciclo', 'carrera_curso', 'turno', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']);

        let datosAgrupados = {};

        consul.forEach((row) => {
            if (!datosAgrupados[row.Codigo_QR]) {
                datosAgrupados[row.Codigo_QR] = {
                    'Codigo_QR': row.Codigo_QR,
                    'Nombre': row.nombre,
                    'Apellido': row.apellido,
                    'Edad': row.edad,
                    'Seccion': row.seccion,
                    'ciclo': row.ciclo,
                    'carrera_curso': row.carrera_curso,
                    'turno': row.turno,
                    'Lunes': '',
                    'Martes': '',
                    'Miercoles': '',
                    'Jueves': '',
                    'Viernes': '',
                    'Sabado': '',
                    'Domingo': ''
                };
            }
            let diaDeLaSemana = new Date(row.fecha).getDay();
            let nombreDelDia = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][diaDeLaSemana];
            datosAgrupados[row.Codigo_QR][nombreDelDia] = row.estado;
        });
        Object.values(datosAgrupados).forEach((row) => {
            let arrayRow = Object.values(row);
            let newRow = worksheet.addRow(arrayRow);
        });
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        await workbook.xlsx.writeFile('Asistencias semanal.xlsx');
        res.download('Asistencias semanal.xlsx');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});




router.get('/graficos', async (req, res) => {
    try {
        // Asistencias por semana
        const fechaActual = new Date();
        const diaSemana = fechaActual.getDay();
        const diasParaRestar = (diaSemana === 0) ? 6 : (diaSemana - 1);
        const fechaInicioSemana = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate() - diasParaRestar);
        const fechaFinSemana = new Date(fechaInicioSemana);
        fechaFinSemana.setDate(fechaFinSemana.getDate() + 7);

        let asistenciasPorSemana = await pool.query('SELECT DAY(fecha) as dia, SUM(id_estado = 1) as asistencias, SUM(id_estado = 2) as faltas, SUM(id_estado = 4) as justificaciones, SUM(id_estado = 3) as tardanzas FROM asistencia WHERE fecha BETWEEN ? AND ? GROUP BY DAY(fecha)', [fechaInicioSemana, fechaFinSemana]);

        asistenciasPorSemana = asistenciasPorSemana.map(item => ({
            dia: item.dia,
            asistencias: Number(item.asistencias),
            faltas: Number(item.faltas),
            justificaciones: Number(item.justificaciones),
            tardanzas: Number(item.tardanzas)
        }));


        // Asistencias por mes
        const fechaInicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
        const fechaFinMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0);
        let asistenciasPorMes = await pool.query('SELECT DAY(fecha) as dia, SUM(id_estado = 1) as asistencias, SUM(id_estado = 2) as faltas, SUM(id_estado = 4) as justificaciones, SUM(id_estado = 3) as tardanzas FROM asistencia WHERE fecha BETWEEN ? AND ? GROUP BY DAY(fecha)', [fechaInicioMes, fechaFinMes]);
        asistenciasPorMes = asistenciasPorMes.map(item => ({
            dia: item.dia,
            asistencias: Number(item.asistencias),
            faltas: Number(item.faltas),
            justificaciones: Number(item.justificaciones),
            tardanzas: Number(item.tardanzas)
        }));

        // Asistencias por año
        const fechaInicioAno = new Date(fechaActual.getFullYear(), 0, 1);
        const fechaFinAno = new Date(fechaActual.getFullYear(), 11, 31);
        let asistenciasPorAno = await pool.query('SELECT MONTH(fecha) as mes, SUM(id_estado = 1) as asistencias, SUM(id_estado = 2) as faltas, SUM(id_estado = 4) as justificaciones, SUM(id_estado = 3) as tardanzas FROM asistencia WHERE fecha BETWEEN ? AND ? GROUP BY MONTH(fecha)', [fechaInicioAno, fechaFinAno]);
        asistenciasPorAno = asistenciasPorAno.map(item => ({
            mes: item.mes,
            asistencias: Number(item.asistencias),
            faltas: Number(item.faltas),
            justificaciones: Number(item.justificaciones),
            tardanzas: Number(item.tardanzas)
        }));
        res.render('auth/graficos', {
            asistenciasPorSemana: JSON.stringify(asistenciasPorSemana),
            asistenciasPorMes: JSON.stringify(asistenciasPorMes),
            asistenciasPorAno: JSON.stringify(asistenciasPorAno)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});


router.get('/lista', async (req, res) => {
    try {
        const alumnos = await pool.query('SELECT * FROM alumnos');
        res.render('auth/lista', { alumnos: alumnos });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los datos');
    }
});


router.get('/dropbd', async (req, res) => {
    await pool.query('SET SQL_SAFE_UPDATES=0');
    await pool.query('DELETE FROM asistencia');
    await pool.query('DELETE FROM alumnos');
    await pool.query('SET SQL_SAFE_UPDATES=1');
    res.status(200).json({ message: '¡Las tablas han sido borradas correctamente!' });
});



router.post('/add', async (req, res) => {
    const {nombre, apellido, Codigo_QR , carrera_curso,turno  , seccion, ciclo } = req.body;
    const nwalumno = {
        nombre,
        apellido,
        Codigo_QR,
        carrera_curso,
        turno,
        seccion,
        ciclo
        
    };
    console.log(nwalumno);
    try {
        await pool.query('INSERT INTO alumnos set ?', [nwalumno]);
        res.redirect('/lista');
    }catch (err) {
            console.error(err);
    }
});


router.get('/delete/:Codigo_QR', async (req, res) => {
    const {Codigo_QR }= req.params;
    await pool.query('DELETE FROM alumnos WHERE Codigo_QR = ?', [Codigo_QR]);
    res.redirect('/lista');
});



router.get('/editar/:Codigo_QR', async (req, res) => {
    const {Codigo_QR}= req.params;
    const alumnos = await pool.query('SELECT * FROM alumnos WHERE Codigo_QR = ?', [Codigo_QR]);
    res.render('auth/editar', { alumnos: alumnos });
});



router.post('/editar/:Codigo_QR', async (req, res) => {
    const {Codigo_QR}= req.params;
    const {nombre,apellido, carrera_curso,turno, seccion,ciclo } = req.body
    const alumno ={
        nombre,
        apellido,
        carrera_curso,
        turno,
        seccion,
        ciclo
    }
    await pool.query('UPDATE alumnos set ? WHERE  Codigo_QR = ?', [alumno, Codigo_QR]);
    res.redirect('/lista');
});




module.exports = router;