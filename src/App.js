import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Sala from './Sala'
import './index.css';
import './inicio.css';
import {DndProvider, useDrag, useDrop} from 'react-dnd'
import{HTML5Backend} from 'react-dnd-html5-backend'
import imagenes_tutorial from './Assets/imagenes.js'

const fs = require('./server/funcionesServidor.js');

//Connect to server info 
//TODO: After clicking button, set button to NOT CLICK
//TODO: Separar "crear sala" de "unirse a una sala"
//TODO: Codigo para crear random hex para salas de juego

function Tutorial(){
  return(<div>
    <p>Telar es un juego para 2-4 jugadores, donde la meta es combinar fichas según su color o patrón para llegar a la puntuación más alta. Cada jugador tiene su proprio telar. 
    Tras hacer click en el botón de "comenzar", se le otorgan seis piezas al primer jugador, y tres a todos los demás jugadores. </p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion1"]} />
    <p>El primer jugador elige un color o patrón, o una combinación de las dos cosas, y coloca <b>todas</b> las fichas de dicho color/patrón sobre su telar. En el ejemplo que sigue, el jugador seleccionó tres fichas con el mismo patrón. El jugador puede colocar las fichas en las columnas de arriba de su tablero como le de el gusto, siempre y cuando todas las fichas dentro de una columna tengan un color o patrón en común.  </p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion2"]} />
    <p>Después de haber colocado las fichas sobre el telar, el jugador hace click en el botón de "hacer jugada". Se pasan las fichas que no fueron seleccionadas al siguiente jugador. Ahora el siguiente jugador hace lo mismo, colocando fichas del mismo color o patrón sobre su telar (en este caso, el jugador eligió las fichas de color azul).</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion3"]} />
    <p>Se siguen pasando las fichas hasta que se acaben las fichas de los dos jugadores. Cuando un jugador haga click en el botón de "hacer jugada" sin tener más fichas en su canasta, se bajan las fichas de más abajo de todas las columnas completas del telar. De izquierda a derecha, en la primera columna caben tres fichas, en la segunda dos, en la tercera una, en la cuarta dos, y en la quinta tres.</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion4"]} />
    <p>Por cada ficha que concuerde con el color o patrón de otra ficha justo al lado o debajo de ella, se cuentan el numero de fichas sucesivas del mismo color/patrón, incluyendo la que se acaba de bajar, y ese numero se suma a la puntuación del jugador.</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion5"]} />
    <p>Si en cualquier punto no se puede hacer una jugada, siendo cuando no hayan columnas que concuerden con el color o patrón de una ficha en la canasta de un jugador, el jugador debe desechar la ficha, y se resta la cantidad de fichas desechadas de la puntuación del jugador.</p>
    <img style={{width:"50%"}} src = {imagenes_tutorial.imagenes_tutorial["instruccion7"]} />
    <p> El juego acaba cuando un jugador logre llenar una columna de su telar. ¡El jugador con la puntuación más alta es el ganador!</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion6"]} />
    </div>)

}

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
    var pueblo = document.getElementById('pueblo');
    if(input.value && pueblo.value){
      if(1<input.value && 5>input.value){
        var nuevaSala = fs.nuevaSala(0, "Local", pueblo.value, true)
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

  //TODO: Seleccionar pueblo no jala aun en multiplayer a distancia

  const crearSala = () => {
    var skt = socket
    var form = document.getElementById('formulario-sala-nueva');
    var input = document.getElementById('nombre-sala-nueva');
    var pueblo = document.getElementById('pueblo-sala-nueva');

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
        <div class="header"><h1>TELAR</h1></div>
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
                  <select name ="culturas" id = "pueblo-sala-nueva">
                    <option value = "otomi">Otomi </option>
                  </select>
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
                    <p>Tema de las fichas:     
                    <select name ="culturas" id = "pueblo">
                      <option value = "otomi">Otomi </option>
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
                            <li class ="opcion" id ="tutorial">
                <div class = "opcionTexto">
                  <a class ="btnInicio" href="#tutorial">Como jugar</a>
                </div>
                <div class ="submenu">
                  <Tutorial />
                </div>
              </li>
            </div>  
        }
      </div>
  );
}

export default App;