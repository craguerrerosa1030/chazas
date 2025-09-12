import {useState} from 'react'

function TareasForm(){

    const[titulo, setTitulo] =useState("")
    const activaSubmit  = (e) => {
        e.preventDefault();
        console.log(titulo);
    }


    return(
        <form onSubmit={activaSubmit}>
                <input placeholder="Escribe tu tarea" onChange={(e)=>setTitulo(e.target.value)}/>
            <button>
                Guardar
            </button>
        </form>
        
    )
}

export default TareasForm