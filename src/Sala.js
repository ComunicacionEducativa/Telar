import { io } from 'socket.io-client';
import Jugador from './Jugador';
import ItemTypes from './ItemTypes'
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import'./sala.css';
import {DndProvider, useDrag, useDrop} from 'react-dnd'
import{HTML5Backend} from 'react-dnd-html5-backend'

const fs = require('./server/funcionesServidor.js');
const puntuacion = require('./server/puntuacion.js');


//TODO: Fix everything related to "espera", incl the fact you can play during it
const Sala = ({sala, socket, setSala, setTurno, setRonda}) => {
  var jugadores = [];

  const client = socket;
  var espera = ""
  var usr_id = 0 //La posicion del jugador en la sala

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
        jugadores.push(<div><Jugador jugador = {usr}
                              status = "final"
                              sala = {sala}
                              ganador = {false}
                              socket = {client}
                              key = {sala["usuarios"][usr]["usuario"]}/></div>)
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
      {!sala["local"] ? <h1>Sala de juego "{sala["sala"]}"</h1>  : ""}      
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
    </div>
    </DndProvider>
  )
}

export default Sala;