function filtrarAlumnos() {
  var filtro = document.getElementById('filtro').value.toUpperCase();
  var filas = document.querySelectorAll("tbody tr");

filas.forEach(function (fila) {
  var dni = fila.querySelector("td:nth-child(1)").textContent;
  var apellido = fila.querySelector("td:nth-child(2)").textContent.toUpperCase();
  var nombre = fila.querySelector("td:nth-child(3)").textContent.toUpperCase();
  var seccion = fila.querySelector("td:nth-child(5)").textContent.toUpperCase();
  var ciclo = fila.querySelector("td:nth-child(6)").textContent.toUpperCase();

  if (dni.includes(filtro) || nombre.includes(filtro) || apellido.includes(filtro) || seccion.includes(filtro) || ciclo.includes(filtro)) {
      fila.style.display = "";
  } else {
      fila.style.display = "none";
  }
});
}

