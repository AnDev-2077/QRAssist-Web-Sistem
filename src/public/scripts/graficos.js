var asistenciasPorSemana = window.asistenciasPorSemana;
var asistenciasPorMes = window.asistenciasPorMes;
var asistenciasPorAno = window.asistenciasPorAno;

var ctxSemana = document.getElementById('chartSemana').getContext('2d');
var ctxMes = document.getElementById('chartMes').getContext('2d');
var ctxAno = document.getElementById('chartAno').getContext('2d');

const getDataColors = opacity => {
    const colors = ['#7DBD5F', '#BD5F5F', '#4481A2', '#BDAE5F']
    return colors.map(color => opacity ? `${color + opacity}` : color)
}

function calcularPorcentaje(cantidad, total) {
    return Math.round((cantidad / total) * 100);
}

let totalAsistencias = 0, totalFaltas = 0, totalJustificaciones = 0, totalTardanzas = 0;

asistenciasPorSemana.forEach(a => {
    totalAsistencias += a.asistencias;
    totalFaltas += a.faltas;
    totalJustificaciones += a.justificaciones;
    totalTardanzas += a.tardanzas;
});

let totalGeneral = totalAsistencias + totalFaltas + totalJustificaciones + totalTardanzas;

var chartSemana = new Chart(ctxSemana, {
    type: 'doughnut',
    data: {
        labels: ['Asistencias', 'Faltas', 'Justificaciones', 'Tardanzas'],
        datasets: [{
            data: [
                calcularPorcentaje(totalAsistencias, totalGeneral),
                calcularPorcentaje(totalFaltas, totalGeneral),
                calcularPorcentaje(totalJustificaciones, totalGeneral),
                calcularPorcentaje(totalTardanzas, totalGeneral)
            ],
            backgroundColor: getDataColors(20),
            borderColor: getDataColors(),
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.formattedValue || '';
                        return `${value}%`;
                    }
                }
            }
        },
    },
});


let totalAsistenciasMes = 0, totalFaltasMes = 0, totalJustificacionesMes = 0, totalTardanzasMes = 0;

asistenciasPorMes.forEach(a => {
    totalAsistenciasMes += a.asistencias;
    totalFaltasMes += a.faltas;
    totalJustificacionesMes += a.justificaciones;
    totalTardanzasMes += a.tardanzas;
});

let totalGeneralMes = totalAsistenciasMes + totalFaltasMes + totalJustificacionesMes + totalTardanzasMes;

var ctxMes = document.getElementById('chartMes').getContext('2d');

var chartMes = new Chart(ctxMes, {
    type: 'doughnut',
    data: {
        labels: ['Asistencias', 'Faltas', 'Justificaciones', 'Tardanzas'],
        datasets: [{
            data: [
                calcularPorcentaje(totalAsistenciasMes, totalGeneralMes),
                calcularPorcentaje(totalFaltasMes, totalGeneralMes),
                calcularPorcentaje(totalJustificacionesMes, totalGeneralMes),
                calcularPorcentaje(totalTardanzasMes, totalGeneralMes)
            ],
            backgroundColor: getDataColors(20),
            borderColor: getDataColors(),
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.formattedValue || '';
                        return `${value}%`;
                    }
                }
            }
        },
    },
});

let totalAsistenciasAno = 0, totalFaltasAno = 0, totalJustificacionesAno = 0, totalTardanzasAno = 0;

asistenciasPorAno.forEach(a => {
    totalAsistenciasAno += a.asistencias;
    totalFaltasAno += a.faltas;
    totalJustificacionesAno += a.justificaciones;
    totalTardanzasAno += a.tardanzas;
});

let totalGeneralAno = totalAsistenciasAno + totalFaltasAno + totalJustificacionesAno + totalTardanzasAno;

var ctxAno = document.getElementById('chartAno').getContext('2d');

var chartAno = new Chart(ctxAno, {
    type: 'doughnut',
    data: {
        labels: ['Asistencias', 'Faltas', 'Justificaciones', 'Tardanzas'],
        datasets: [{
            data: [
                calcularPorcentaje(totalAsistenciasAno, totalGeneralAno),
                calcularPorcentaje(totalFaltasAno, totalGeneralAno),
                calcularPorcentaje(totalJustificacionesAno, totalGeneralAno),
                calcularPorcentaje(totalTardanzasAno, totalGeneralAno)
            ],
            backgroundColor: getDataColors(20),
            borderColor: getDataColors(),
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.formattedValue || '';
                        return `${value}%`;
                    }
                }
            }
        },
    },
});