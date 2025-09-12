import React from 'react';
import ReactDOM from 'react-dom/client';
import './componentes/Styles.css';
import App from './componentes/App';
import reportWebVitals from './reportWebVitals';
import ListaDeTareas from './tareasLista'
import TareasForm from './componentes/tareasForm'
import {tareasIniciales as data} from './componentes/tareas'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

function App(){
  const[tareas, setTareas ]= useState([])
    useEffect (() =>{setTareas(data)}, [])
}

  <React.StrictMode>
    
    <TareasForm/>
    <ListaDeTareas/>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
