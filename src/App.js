import {useState, useRef } from 'react';
import imagenes_tutorial from './Assets/imagenes.js'
import pdf_nahua from './Assets/Nahua.pdf'
import pdf_tz from './Assets/Tzotzil.pdf'
import pdf_otomi from './Assets/Otomi.pdf'
import pdf_raramuri from './Assets/Raramuri.pdf'
import Tutorial from './Tutorial'
import React from 'react';
import Sala from './Sala'

///// ARCHIVOS DE CSS //////
//index.css especifica el layout para el sitio web en general
import './index.css';
//el layout de la pagina de inicio en particular 
import './inicio.css';


//Las funciones necesarias para la puntuacion, para comenzar un juego, etc. 
const fs = require('./server/funcionesServidor.js');
const VERBOSE = false; //poner en true para generar logs en la consola. 

function App() {
  const [sala, setSala] = useState('');
  const[turno, setTurno] = useState(-1) //Para multiplayer local
  const[ronda, setRonda] = useState(-1) //Para multiplayer local
  const[error, setError] = useState('')
  var client = useRef();

  //Para multiplayer local, esta funcion crea una nueva sala con el 
  //numero de jugadores y con las fichas que fueron elegidas
  const toggleSala = () =>{
    if(VERBOSE){
      console.log('Creando sala de multiplayer local ... ')
    }
    var input = document.getElementById('jugadores');
    var pueblo = document.getElementById('pueblo');
    if(input.value && pueblo.value){
      if(1<input.value && 5>input.value){
        var nuevaSala = fs.nuevaSala(0, "Local", pueblo.value, true)
        for(let i = 1; i < input.value; i++){
          nuevaSala["usuarios"].push(fs.nuevoJugador(i))
        }
        setSala(nuevaSala)
      } else {
        setError("El numero de jugadores debe ser entre 2 y 4")
      }
    }
  }

  //El JSX/html para la sala de inicio 
  return (
    <div>
        <div class="header">
        <img src = {imagenes_tutorial.header["header"]} alt= "Telar" onClick = {() => window.location.reload(true)}/></div>

        {sala
          ?
            <div>
              <Sala sala={sala} socket={client} setSala={setSala} setTurno={setTurno} setRonda = {setRonda}/> 
            </div>
          : 
            <div class = "menu">
              <li class = "opcion" id="multiplayer">
                <div class="opcionTexto">
                  <a class="btnInicio" href="#multiplayer"> Crear una sala de juego </a>
                </div>
                  <div class ="submenu">
                    <form id="multiplayer-local" action = "">
                    <p>Tema de las fichas:     
                    <select name ="culturas" id = "pueblo">
                      <option value = "otomi">Otomí/hñähñu </option>
                      <option value = "tzotzil"> Tzotzil </option>
                      <option value = "raramuri"> Rarámuri </option>
                      <option value = "nahua"> Nahua (Hueyapan) </option>
                    </select></p>
                    <p>Numero de jugadores:
                    <input id="jugadores" type="number" min="2" max="4" />
                    </p>
                    <button onClick={() => toggleSala()}>
                      Jugar
                    </button>
                    <p></p>
                    {error}
                    </form>
                </div>
              </li>
              <p></p>
              <li class ="opcion" id ="tutorial">
                <div class = "opcionTexto">
                  <a class ="btnInicio" href="#tutorial">Como jugar</a>
                </div>
                <div class ="submenu">
                  <Tutorial />
                  <a class="boton" href="#multiplayer"> ¡Quiero jugar! </a>
                </div>
              </li>
              <p></p>
              <li class ="opcion" id ="descargar">
                <div class = "opcionTexto">
                  <a class ="btnInicio" href="#descargar">Descargar una versión para imprimir</a>
                </div>
                <div class ="submenu">
                  <a class="boton" href={pdf_nahua} download="Nahua" target='_blank' rel="noreferrer"> Fichas de origen Nahua </a>
                  <a class="boton" href={pdf_tz} download="Tzotzil" target='_blank' rel="noreferrer"> Fichas de origen Tzotzil </a>
                  <a class="boton" href={pdf_otomi} download="Otomi" target='_blank' rel="noreferrer"> Fichas de origen Otomi/hñähñu </a>
                  <a class="boton" href={pdf_raramuri} download="Raramuri" target='_blank' rel="noreferrer"> Fichas de origen Raramuri </a>
                </div>
              </li>
            </div>  
        }
        <div class="footer">
        <p>Desarrollado por C. S. García Martínez, 2023. Ilustración de C. S. García Martínez, con base en diseños de origen nahua, tzotzil, hñähñu, y rarámuri. Propuesta original y validación del contenido por el Museo Nacional de Antropología.</p>
        <img src = {imagenes_tutorial.header["footer_INAH"]} alt= "Logo del INAH"/>
        <img src = {imagenes_tutorial.header["footer_MNA"]} alt= "Logo del Museo Nacional de Antropología"/>
        </div>
      </div>

  );
}

export default App;