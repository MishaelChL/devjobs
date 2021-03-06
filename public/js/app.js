import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
    const skills = document.querySelector(".lista-conocimientos");//ojo .lista-conocimiento viene de la vista nueva-vacante, la class de ul

    //Limpiar las alertas
    let alertas = document.querySelector(".alertas");

    if(alertas){
        limpiarAlertas();
    }

    if(skills){
        skills.addEventListener("click", agregarSkills);

        //una vez que estamos en editar, llamar la funcion
        skillsSeleccionados();
    }

    const vacantesListado = document.querySelector(".panel-administracion");
    
    if(vacantesListado){
        vacantesListado.addEventListener("click", accionesListado);
    }
})

const skills = new Set();
const agregarSkills = (e) => {
    //Para saber a que elemento estoy dando click
    // console.log(e.target);
    if(e.target.tagName === "LI"){
        // console.log(e.target.textContent);
        if(e.target.classList.contains("activo")){
            //quitarlo del set y quitar de la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove("activo");//desactivando o quitando el color de los botones que seleccionaste
        }else{
            //agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add("activo");//activando o cambiando el color de los botones que seleccionaste
        }
    }
    // console.log(skills);
    const skillsArray = [...skills];//object literal, creamos una copia y convertirlo en un arreglo
    document.querySelector("#skills").value = skillsArray;
}

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll(".lista-conocimientos .activo"));
    // console.log(seleccionadas);

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    });

    //inyectar en el hidden
    const skillsArray = [...skills];
    document.querySelector("#skills").value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector(".alertas");
    const interval = setInterval(() => {
        // console.log("2 segundos...");
        if(alertas.children.length > 0){
            alertas.removeChild(alertas.children[0]);
        }else if(alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
}

//eliminar vacantes
const accionesListado = (e) => {
    e.preventDefault(); //no hace funcionar las acciones de los botones
    // console.log(e.target);

    if(e.target.dataset.eliminar){
        //eliminar por axios
        Swal.fire({
            title: 'Confirmar Eliminacion?',
            text: "Una vez eliminado, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: "No, Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {

                //enviar la peticion con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                // console.log(url);

                //axios para eliminar el registro
                axios.delete(url, { params: {url} })
                    .then(function(respuesta){
                        // console.log(respuesta);
                        if(respuesta.status===200){
                            Swal.fire(
                                'Eliminado',
                                respuesta.data,
                                'success'
                            );

                            //TO DO: Eliminar del DOM
                            // console.log(e.target.parentElement.parentElement);
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            type: "error",
                            tittle: "Hubo un error",
                            text: "No se pudo eliminar"
                        });
                    });

              
            }
        })
    }else if(e.target.tagName === "A"){
        // console.log(e.target.tagName);
        window.location.href = e.target.href;
    }
}