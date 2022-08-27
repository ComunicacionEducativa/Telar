import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Sala from './Sala'
import './index.css';
import './inicio.css';
import {DndProvider, useDrag, useDrop} from 'react-dnd'
import{HTML5Backend} from 'react-dnd-html5-backend'

const fs = require('./server/funcionesServidor.js');

//Connect to server info 
//TODO: After clicking button, set button to NOT CLICK
//TODO: Separar "crear sala" de "unirse a una sala"
//TODO: Codigo para crear random hex para salas de juego

function App() {
  const [socket, setSocket] = useState(io('http://localhost:5000'));
  const [sala, setSala] = useState('');
  const[turno, setTurno] = useState(-1) //Para multiplayer local
  const[ronda, setRonda] = useState(-1) //Para multiplayer local
  const[error, setError] = useState('')
  const [salaLlena, setSalaLlena] = useState('');
  var client = useRef();

  //Para multiplayer local
  const toggleSala = () =>{
    console.log('Creando sala de multiplayer local ... ')
    var form = document.getElementById('multiplayer-local');
    var input = document.getElementById('jugadores');
    if(input.value){
      if(1<input.value && 5>input.value){
        var nuevaSala = fs.nuevaSala(0, "Local", true)
        for(let i = 1; i < input.value; i++){
          nuevaSala["usuarios"].push(fs.nuevoJugador(i))
        }
        socket.close()
        setSala(nuevaSala)
      } else {
        setError("El numero de jugadores debe ser entre 2 y 4")
      }
    }
  }

  const crearSala = () => {
    var skt = socket
    var form = document.getElementById('formulario-sala-nueva');
    var input = document.getElementById('nombre-sala-nueva');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (input.value) {
        skt.emit('nueva-sala', input.value);
      }
    });

    console.log(`Tratando de crear la sala: ${input.value}`)
  }

  const unirSala = () => {
    var skt = socket
    var form = document.getElementById('formulario-unirse-a-sala');
    var input = document.getElementById('nombre-sala');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (input.value) {
        skt.emit('nueva-sala', input.value);
      }
    });

    console.log(`Tratando de unirse a la sala: ${input.value}`)
  }

  //Aqui vienen basicamente todas las funciones del socket/networking
  useEffect(() => {
    if(socket){
      socket.on('connect', () => console.log(`Se conecto el usuario: ${socket.id}`));

      socket.on('disconnect', (reason) =>
        console.log(`Se desconecto el usuario: ${reason}`)
      );

      socket.on('connect_error', (reason) =>
        console.log(`Error de coneccion: ${reason}`)
      );

      socket.on('sala-inicializada', (msg) => setSala(msg));

      socket.on('sala-llena', () => setSalaLlena(true));

      socket.on('nuevo-usuario', (msg) => setSala(msg));

      socket.on('juego-inicializado', (msg) => {
        console.log("Comenzo el juego");
        setSala(msg)});

      socket.on('hacer-jugada', (msg) => {
        console.log("Se hizo una jugada");
        setSala(msg)});

      socket.on('siguiente-ronda', (msg) =>{
        console.log("Bajando las fichas y sacando puntuacion ...")
        setSala(msg)});

      socket.on('final', (msg) =>{
        console.log("Se acabo el juego")
        setSala(msg)});

      socket.on('en espera', (msg) => {
        console.log("Esperando la reconneccion del jugador ... ")
        setSala(msg)});

      socket.on('Desconeccion de jugador', (msg) => setSala(msg))

      client.current = socket;
    } 
  }, []);

  //El JSX/html para la sala de inicio 
  return (
    <div>
        <div class="header"></div>
        {sala
          ?
            <div>
              <Sala sala={sala} socket={client} setSala={setSala} setTurno={setTurno} setRonda = {setRonda}/> 
            </div>
          :
            <div class = "menu">
              <li class="opcion" id ="crearsala">
                <div class = "opcionTexto">
                  <a class="btnInicio" href="#crearsala"> Crear una nueva sala de juego </a>
                </div>
                <div class="submenu">
                  <form id="formulario-sala-nueva" action="">
                  <input id="nombre-sala-nueva" autocomplete="off" />
                    <button onClick={() => crearSala(client)}>
                      Crear
                    </button>
                  </form>
                </div>
              </li>
              <li class="opcion" id ="unirsala">
                <div class = "opcionTexto">
                  <a class="btnInicio" href="#unirsala"> Unir a una sala de juego </a>
               </div>
                <div class="submenu">
                  <form id="formulario-unirse-a-sala" action="">
                  <input id="nombre-sala" autocomplete="off" />
                    <button onClick={() => unirSala(client)}>
                      Unir
                    </button>
                    {salaLlena ? <p> O esta llena la sala o ya empezo el juego, intenta otra. </p> :  <div></div>}
                  </form>
                </div>
              </li>
              <li class = "opcion" id="multiplayer">
                <div class="opcionTexto">
                  <a class="btnInicio" href="#multiplayer"> Sala de multiplayer local </a>
                </div>
                  <div class ="submenu">
                    <form id="multiplayer-local" action = "">
                    <input id="jugadores" type="number" min="2" max="4" />
                    <button onClick={() => toggleSala()}>
                      Jugar
                    </button><p></p>
                    {error}
                    </form>
                </div>
              </li>
            </div>  
        }
      </div>
  );
}

export default App;