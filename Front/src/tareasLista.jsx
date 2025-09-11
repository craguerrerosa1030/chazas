import {tareasIniciales as data} from './componentes/tareas'
import {useState, useEffect} from 'react'
;

function ListaDeTareas(){

    const[tareas, setTareas ]= useState([])
    useEffect (() =>{setTareas(data)}, [])

    if (tareas.length === 0){
        return(<div>No hay tareas</div>)
    }

    return(
        <div>
            {tareas.map((tarea) =>(
                <div key = {tarea.id}>
                    <h1>{tarea.titulo}</h1>
                    <p>{tarea.descripcion}</p>
                </div>
            ))}
        </div>
    );
}

export default ListaDeTareas