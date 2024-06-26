function ftnConfirmación(){
  swal({
    title: "Cambio Realizado",
    text: "Asistencia modificada",
    icon: "success",
    button: "OK!",
  });
}

function error(){
  swal({
    icon: "error",
    title: "Oops...",
    text: "Something went wrong!",
    footer: '<a href="#">Why do I have this issue?</a>'
  });
}

async function confirmarBorrado() {
  const temp = window.location.href;
  const borrar = await swal({
      title: "Borrar datos",
      text: "¿Estas seguro que deseas borrar los datos?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
      });
  if (borrar) {
      try {
          await fetch('/dropbd');
          swal("¡Los datos han sido borrados correctamente!", {
              icon: "success",
          });
          setTimeout(() => {
            window.location.href = temp;
          }, 1000);
      } catch (error) {
          console.error(error);
          swal("¡Error al borrar los datos!", {
              icon: "error",
          });
      }
  } else {
      swal("Ningún dato ha sido borrado.");
      setTimeout(() => {
        window.location.href = temp;
      }, 1000);
  }
}

function ftnExcel(){
  swal({
    title: "Excel exportado",
    text: "Asistencia de estudiantes",
    icon: "success",
    button: "OK!",
  });
}

async function EliminarAlumno(Codigo_QR) {
  const temp = window.location.href;
  const eliminar = await swal({
      title: "Eliminar alumno",
      text: "¿Estás seguro que deseas eliminar este alumno?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
  });

  if (eliminar) {
      try {
          await fetch(`/delete/${Codigo_QR}`);
          swal("¡El alumno ha sido eliminado correctamente!", {
              icon: "success",
          });
          setTimeout(() => {
              window.location.href = '/lista';
          }, 1000);
      } catch (error) {
          console.error(error);
          swal("¡Error al eliminar el alumno!", {
              icon: "error",
          });
      }
  } else {
      swal("Ningún alumno ha sido eliminado.");
      setTimeout(() => {
          window.location.href = temp;
      }, 1000);
  }
}

async function confirmarVerificacion() {
  const temp = window.location.href;
  const verificar = await swal({
      title: "¿Estás seguro que deseas verificar la asistencia?",
      text: "Recuerda que si no ha terminado de llamar asistencia, se colocará falta a los alumnos restantes.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
  });
  
  if (verificar) {
      try {
        await fetch('/verificar');
          swal("¡La asistencia ha sido verificada correctamente!", {
              icon: "success",
          });
          setTimeout(() => {
            window.location.href = '/asistencias';
        }, 1000);
      } catch (error) {
          console.error(error);
          swal("¡Error al verificar la asistencia!", {
              icon: "error",
          });
      }
  } else {
      swal("La verificación de asistencia ha sido cancelada.");
      setTimeout(() => {
        window.location.href = temp;
      }, 1000);
  }
}




