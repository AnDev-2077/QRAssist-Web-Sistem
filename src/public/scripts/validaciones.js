function validarNombre() {
    var nombre = document.getElementById("nombre").value;
    var regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/; // Expresión regular para validar nombres
    
    if (regexNombre.test(nombre)) {
        alert("Nombre válido");
    } else {
        alert("Por favor, ingresa un nombre válido");
    }
}

function validarNumeros() {
    var numero = document.getElementById("numero").value;
    var regexNumeros = /^[0-9]+$/; // Expresión regular para validar números
    
    if (regexNumeros.test(numero)) {
        alert("Número válido");
    } else {
        alert("Por favor, ingresa solo números");
    }
}