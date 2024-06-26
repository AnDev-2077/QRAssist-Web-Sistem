$('.btn-modals').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); 
    var codigoQR = button.data('Codigo_QR'); 

    var row = document.getElementById('row' + codigoQR);

    document.getElementById('inputNumerodni' + codigoQR).value = row.querySelector('td:nth-child(1)').textContent;
    document.getElementById('inputApellido' + codigoQR).value = row.querySelector('td:nth-child(2)').textContent;
    document.getElementById('inputNombre' + codigoQR).value = row.querySelector('td:nth-child(3)').textContent;
    document.getElementById('inputCarrera' + codigoQR).value = row.querySelector('td:nth-child(4)').textContent;
    document.getElementById('inputSeccion' + codigoQR).value = row.querySelector('td:nth-child(5)').textContent;
    document.getElementById('inputCiclo' + codigoQR).value = row.querySelector('td:nth-child(6)').textContent;

});