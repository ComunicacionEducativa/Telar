import {useState, useRef } from 'react';
import imagenes_tutorial from './Assets/imagenes.js'
import Tutorial from './Tutorial'
import { io } from 'socket.io-client';
import React from 'react';
import Sala from './Sala'
import './index.css';
import './inicio.css';


const fs = require('./server/funcionesServidor.js');



function App() {
  // const [socket, setSocket] = useState(io('http://localhost:5000'));
  const [sala, setSala] = useState('');
  const[turno, setTurno] = useState(-1) //Para multiplayer local
  const[ronda, setRonda] = useState(-1) //Para multiplayer local
  const[error, setError] = useState('')
  // const [salaLlena, setSalaLlena] = useState('');
  var client = useRef();

  //Para multiplayer local
  const toggleSala = () =>{
    console.log('Creando sala de multiplayer local ... ')
    var form = document.getElementById('multiplayer-local');
    var input = document.getElementById('jugadores');
    var pueblo = document.getElementById('pueblo');
    if(input.value && pueblo.value){
      if(1<input.value && 5>input.value){
        var nuevaSala = fs.nuevaSala(0, "Local", pueblo.value, true)
        for(let i = 1; i < input.value; i++){
          nuevaSala["usuarios"].push(fs.nuevoJugador(i))
        }
        // socket.close()
        setSala(nuevaSala)
      } else {
        setError("El numero de jugadores debe ser entre 2 y 4")
      }
    }
  }

  // //TODO: Seleccionar pueblo no jala aun en multiplayer a distancia

  // const crearSala = () => {
  //   var skt = socket
  //   var form = document.getElementById('formulario-sala-nueva');
  //   var input = document.getElementById('nombre-sala-nueva');
  //   var pueblo = document.getElementById('pueblo-sala-nueva');

  //   form.addEventListener('submit', function(e) {
  //     e.preventDefault();
  //     if (input.value) {
  //       skt.emit('nueva-sala', input.value);
  //     }
  //   });

  //   console.log(`Tratando de crear la sala: ${input.value}`)
  // }

  // const unirSala = () => {
  //   var skt = socket
  //   var form = document.getElementById('formulario-unirse-a-sala');
  //   var input = document.getElementById('nombre-sala');

  //   form.addEventListener('submit', function(e) {
  //     e.preventDefault();
  //     if (input.value) {
  //       skt.emit('nueva-sala', input.value);
  //     }
  //   });

  //   console.log(`Tratando de unirse a la sala: ${input.value}`)
  // }

  // //Aqui vienen basicamente todas las funciones del socket/networking
  // useEffect(() => {
  //   if(socket){
  //     socket.on('connect', () => console.log(`Se conecto el usuario: ${socket.id}`));

  //     socket.on('disconnect', (reason) =>
  //       console.log(`Se desconecto el usuario: ${reason}`)
  //     );

  //     socket.on('connect_error', (reason) =>
  //       console.log(`Error de coneccion: ${reason}`)
  //     );

  //     socket.on('sala-inicializada', (msg) => setSala(msg));

  //     socket.on('sala-llena', () => setSalaLlena(true));

  //     socket.on('nuevo-usuario', (msg) => setSala(msg));

  //     socket.on('juego-inicializado', (msg) => {
  //       console.log("Comenzo el juego");
  //       setSala(msg)});

  //     socket.on('hacer-jugada', (msg) => {
  //       console.log("Se hizo una jugada");
  //       setSala(msg)});

  //     socket.on('siguiente-ronda', (msg) =>{
  //       console.log("Bajando las fichas y sacando puntuacion ...")
  //       setSala(msg)});

  //     socket.on('final', (msg) =>{
  //       console.log("Se acabo el juego")
  //       setSala(msg)});

  //     socket.on('en espera', (msg) => {
  //       console.log("Esperando la reconneccion del jugador ... ")
  //       setSala(msg)});

  //     socket.on('Desconeccion de jugador', (msg) => setSala(msg))

  //     client.current = socket;
  //   } 
  // }, []);

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
                      <option value = "otomi">Otomi/hñähñu </option>
                      <option value = "tzotzil"> Tzotzil </option>
                      <option value = "raramuri"> Raramuri </option>
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
            </div>  
        }
      </div>
  );
}

export default App;