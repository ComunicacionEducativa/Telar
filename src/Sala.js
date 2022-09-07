import { io } from 'socket.io-client';
import Jugador from './Jugador';
import ItemTypes from './ItemTypes'
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import'./sala.css';
import'./informacion.css';
import {DndProvider, useDrag, useDrop} from 'react-dnd'
import{HTML5Backend} from 'react-dnd-html5-backend'
import imagenes_informacion from './Assets/imagenes.js'

const fs = require('./server/funcionesServidor.js');
const puntuacion = require('./server/puntuacion.js');

const esconderInformacion = () =>{
    document.getElementById("informacion-fondo").style.display = "none";
  }

const TelarInfo = () => {
  return (
    <div>
      <p>El telar de cintura es una tecnología prehispánica que es indispensable para la creación de los textiles típicos de una gran parte 
      de los grupos originarios de México y América central. Un extremo del telar se amarra a la cintura, y el otro se ata a un punto seguro. 
      Entonces, el artista va formando el tejido, pasando la trama por la urdimbre. Las varas de madera sirven diversas funciones, entre 
      ellas el separar los hilos de la urdimbre, el apretar los hilos, y el manejo de colores diferentes. Así se pueden crear diseños en 
      multicolor o en tela doble. </p>
      <p>El telar de cintura es el instrumento que fue representado en este juego, pero se debe mencionar las varias tradiciones de bordado 
      y brocado, de las cuales también surgen muchos de los diseños típicos de los pueblos de México. </p>
      <img src = {imagenes_informacion.imagenes_informacion["telar"]} />
      <ol>
        <li>1. El extremo de la cuerda que se usa para sujetar el telar.</li>
        <li>2. El enjulio superior define el ancho del tejido.</li>
        <li>3. La vara de paso controla los hilos pares</li>
        <li>4. El machete aprieta los hilos para crear un tejido uniforme.</li>
        <li>5. La vara de liso controla los hilos impares</li>
        <li>6. El tejido. </li>
        <li>7. El enjulio inferior define un extremo del tejido.</li>
        <li>8. La bobina sirve para pasar el hilo entre la urdimbre.</li>
        <li>9. El mecapal sujeta el tejido a la cintura del trabajador/a.</li>
      </ol>
      <p></p>
    </div>
    )
}

const Informacion = ({pueblo}) =>{
  if(pueblo == "otomi"){
    return(
        <div id = "informacion">
          <h1>Otomi </h1>
          <p>El pueblo otomí, también conocido como el pueblo hñähñu, ñathño, o ñ'yühü, es un pueblo originario del centro de México. Existen diversas comunidades de habla otomí, cada una con sus diseños propios y artes tradicionales. Los diseños suelen representar la vegetación y los animales de la región. Estos se pueden realizar sobre telar de cintura o con bordados pepenados. </p>
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p3"]} />
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p2"]} />
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p1"]} />
          <h1> Que es el telar de cintura </h1>
          <TelarInfo />
          <button onClick={esconderInformacion}> x </button>
        </div>
    )
  }
}


//TODO: Fix everything related to "espera", incl the fact you can play during it
const Sala = ({sala, socket, setSala, setTurno, setRonda}) => {
  var jugadores = [];


  const client = socket;
  var espera = ""
  var usr_id = 0 //La posicion del jugador en la sala

  const mostrarInformacion = () =>{
    document.getElementById("informacion-fondo").style.display = "block";
  }

  //FUNCIONES PARA MULTIPLAYER LOCAL. EN TAL CASO SALA.JS TIENE LAS FUNCIONES DEL SERVIDOR. 
  const comenzar = () =>{
    if(!sala["local"]){
      console.log(`Se mando un request para comenzar el juego`);
      socket.current.emit('comenzar-juego', sala["sala"]);
    } else {
      console.log("Se comenzo el juego")
      sala = fs.comenzarJuego(sala)
      console.log("Sala tras comenzar el juego:")
      console.log(sala)
      setSala(sala)
      setTurno(0)
      setRonda(0)
    }
  }

  const hacerJugada = (state) => {
    if(!sala["local"]){
      socket.current.emit('jugada', sala["sala"], state)
    } else {
      sala["usuarios"][sala["turno"]]["columnas"] = state["cols"]
      sala["usuarios"][sala["turno"]]["basura"] = state["basura"]
      sala["usuarios"][sala["turno"]]["canasta"] = []
      var siguiente = sala["turno"] + 1 //El siguiente jugador
      if(sala["turno"] == sala["usuarios"].length-1){
        siguiente = 0
      }
      for(const f in state["fichasEnCanasta"]){
        sala["usuarios"][siguiente]["canasta"].push(state["fichasEnCanasta"][f])
      }
      sala["turno"] = sala["usuarios"][siguiente]["usuario"] 
      sala["sala"] = sala["turno"];
      console.log("Se hizo una jugada. Sala tras la jugada: ")
      console.log(sala)
      setSala(sala)
      setTurno(sala["turno"])
    }
  }

  const acabarRonda = (state) => {
    if(!sala["local"]){
      socket.current.emit('ronda', sala["sala"], state)
    } else {
      
      var newSala = JSON.parse(JSON.stringify(puntuacion.bajarFichasYSacarPuntuacion(sala, state))) //deep copy 
      console.log("Se acabo la ronda. Sala tras el final de la ronda: ")
      console.log(newSala)
      setSala(newSala);
      setTurno(newSala["turno"])
      setRonda(newSala["ronda"])
      sala = newSala
    }
  }

  //Si es el final del juego, se encuentra el ganador
  if(sala["status"] == "final"){
    var puntuacion_maxima = -1
    //Sacar la puntuacion maxima
    for(const usr in sala["usuarios"]){
      if(sala["usuarios"][usr]["puntuacion"][0] > puntuacion_maxima){
        puntuacion_maxima = sala["usuarios"][usr]["puntuacion"][0]
      }
    }
    for(const usr in sala["usuarios"]){
      if(puntuacion_maxima == sala["usuarios"][usr]["puntuacion"][0]){
        jugadores.push(<Jugador jugador = {usr}
                              status = "final"
                              ganador = {true}
                              sala = {sala}
                              socket = {client}
                              key = {sala["usuarios"][usr]["usuario"]}/>)
      } else {
        jugadores.push(<Jugador jugador = {usr}
                              status = "final"
                              sala = {sala}
                              ganador = {false}
                              socket = {client}
                              key = {sala["usuarios"][usr]["usuario"]}/>)
      }
    }
  }

  //CREAR LOS JUGADORES
  else if(sala["status"] == "activo"){
    for(const usr in sala["usuarios"]){
      if(sala["usuarios"][usr]["usuario"] == client.current.id || (sala["local"] && sala["turno"] == usr)){
        jugadores.push(<Jugador jugador = {usr}
                              status = "activo"
                              sala = {sala}
                              socket = {client}
                              hacerJugada = {hacerJugada}
                              acabarRonda = {acabarRonda}
                              key = {sala["usuarios"][usr]["usuario"]}/>)
      } else {
        jugadores.push(<Jugador jugador = {usr}
                              status = "inactivo"
                              sala = {sala}
                              socket = {client}
                              key = {sala["usuarios"][usr]["usuario"]}/>)
      }
    }
  } else {
    for(const usr in sala["usuarios"]){
      jugadores.push(<Jugador jugador = {usr}
                              sala = {sala} 
                              key={sala["usuarios"][usr]["usuario"]}/>);
    }
  }
  if(sala["espera"]){
    espera = "espera"
  }

  return(
    <DndProvider backend={HTML5Backend}>
    <div> 
      <div class = "menu-informacion">
        <input type="checkbox" id="ver-informacion" />
        <label for="ver-informacion">Esta jugando con fichas de origen <b>{sala["pueblo"]}</b></label>
        <div id = "elegir-cultura">
          <ul>
            <li>
              <form>
                <p> Cambiar el tema:
                  <select name="culturas" id = "culturas">
                    <option value = "otomi">Otomi </option>
                  </select>
                <button onClick ={mostrarInformacion}>Conoce a la comunidad que creó estos diseños.</button>
                </p>
              </form>
            </li>
          </ul>
        </div>
      </div>
    </div>  
      {!sala["local"] ? <h1>Sala de juego "{sala["sala"]}"</h1>  : ""}   
      <div id = "informacion-fondo">
        <Informacion pueblo = {sala["pueblo"]} />
      </div>
      <div id = {espera}> </div>
      <div class ="sala">
        {sala["status"] == "activo" || sala["status"] == "final"
          ? 
            <div class="jugadores" key="boards1">{jugadores}</div>
            :
            <div>
            <div class="jugadores" key="boards2"> 
            {jugadores}
            </div>
            <div id="comenzarBtn">
              <button onClick={comenzar}>
                Comenzar
              </button>
            </div>
          </div>
        }
    </div>
    </DndProvider>
  )
}

export default Sala;