import Jugador from './Jugador';
import Tutorial from './Tutorial'
import React from 'react';
import './index.css';
import'./sala.css';
import'./informacion.css';
import imagenes_informacion from './Assets/imagenes.js'
import iconos_menu from './Assets/imagenes.js'

const fs = require('./server/funcionesServidor.js');
const puntuacion = require('./server/puntuacion.js');

//Codigo para 
var VERBOSE = false;

///////////////////////////////
/* FUNCIONES PARA MANEJAR LA */
/* INFORMACION               */
///////////////////////////////
const esconderInformacion = () =>{
    document.getElementById("informacion-fondo").style.display = "none";
  }

const mostrarInformacion = () =>{
  let inputs = document.getElementById('ver-menu');
  inputs.checked = false;
  document.getElementById("informacion-fondo").style.display = "block";
}

const esconderInstrucciones = () =>{
    document.getElementById("instrucciones-fondo").style.display = "none";
  }

const mostrarInstrucciones = () =>{
    let inputs = document.getElementById('ver-menu');
    inputs.checked = false;
    document.getElementById("instrucciones-fondo").style.display = "block";
  }

const regresarAlMenu = () =>{
  window.location.reload(true);
}


/////////////////////////////////
/* FUNCIONES DE LA INFORMACION */
/* (TEXTO Y VISUAL)            */
/////////////////////////////////

//Funcion para mostrar el texto de la informacion del telar de cintura
const TelarInfo = () => {
  return (
    <div>
      <p>El telar de cintura es una tecnología prehispánica que es indispensable para la creación de los textiles típicos de una gran parte 
      de los grupos originarios de México y América central. Un extremo del telar se amarra a la cintura, y el otro se ata a un punto seguro. 
      Entonces, el artista va formando el tejido, pasando la trama (los hilos horizontales) por la urdimbre (los hilos verticales). Las varas de madera sirven para diversas funciones, entre 
      ellas el separar los hilos de la urdimbre, el apretar los hilos, y el manejo de colores diferentes. Así se pueden crear diseños en 
      multicolor o en tela doble. </p>
      <p>El telar de cintura es el instrumento que fue representado en este juego, pero se debe mencionar las varias tradiciones de bordado 
      y brocado, de las cuales también surgen muchos de los diseños típicos de los pueblos de México. </p>
      <img src = {imagenes_informacion.imagenes_informacion["telar"]} alt = "Una imagen de un telar de cintura"/>
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


//Esta funcion muestra las imagenes adecuadas segun la cultura que fue 
//seleccionada por el jugador en los botones de menu 
const DisenoMenu = (pueblo, numero) =>{
  if(pueblo === "nahua"){
    return(
      <div class = "menu-content">
              <img src = {iconos_menu.iconos_menu["nahua"][0]} alt ="" />
              <img src = {iconos_menu.iconos_menu["nahua"][1]}  alt ="" />
              <img src = {iconos_menu.iconos_menu["nahua"][2]} alt ="" />
            </div>
    )
  } else if(pueblo === "otomi" && (numero === 1 || numero === 3)){
    return(
      <div class = "menu-content">
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt ="" />
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt ="" style = {{transform: 'scaleX(-1)'}}/>
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt ="" />
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt ="" style = {{transform: 'scaleX(-1)'}}/>
                  </div>
    )
  } else {
    return(
      <div class = "menu-content">
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt =""/>
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt ="" />
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]} alt =""/>
                    <img src = {iconos_menu.iconos_menu[pueblo][numero]}  alt ="" />
                  </div>
    )
  }
}

//Esta funcion muestra las instrucciones 
const Instrucciones = () => {
  return(<div class = "informacion">
    {Tutorial()}
    <button onClick={esconderInstrucciones}> x </button>
  </div>)
}

//Esta funcion contiene la informacion que corresponde a cada pueblo originario
const Informacion = ({pueblo}) =>{
  if(pueblo === "otomi"){
    return(
        <div class = "informacion">
          <h1>Otomi </h1>
          <p>El pueblo otomí, también conocido como el pueblo hñähñu, ñathño, o ñ'yühü, es un pueblo originario del centro de México. Existen diversas comunidades de habla otomí, cada una con sus diseños propios y artes tradicionales. Los diseños suelen representar la vegetación y los animales de la región. Estos se pueden realizar sobre telar de cintura o con bordados pepenados. </p>
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p3"]} />
                  <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p2"]} />
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p1"]} />
          <p>Para crear estos diseños, se tomó como referencia el libro <a href="https://contigoenladistancia.cultura.gob.mx/detalle/geometrias-de-la-imaginacion-hidalgo">Geometrías de la Imaginación: Hidalgo</a>, coordinado por Carmen Lorenzo Monterrubio. También se tomaron como referencia las artesanías del colectivo <a href="https://www.savinarte.com/2019/06/11/artesanas-de-hidalgo-colectivos-para-dignificar-el-trabajo-artesanal-del-tenango/">Mëxandähi</a>, ubicado en San Francisco La Laguna, Hidalgo, el colectivo <a href="https://folkartcollective.com/rosalina/">Tierra Yuhmu</a>, ubicado en San Juan Ixtenco, Tlaxcala, y el colectivo <a href="https://cooperacioncomunitaria.org/hidalgo/">Wäda</a>, ubicado en El Decá, Hidalgo. </p>

          <h1>¿Qué es el telar de cintura? </h1>
          <TelarInfo />
          <button onClick={esconderInformacion}> x </button>
        </div>
    )
  } else if(pueblo === "tzotzil"){
    return(
      <div class = "informacion">
          <h1>Tzotzil </h1>
          <p>El pueblo tzotzil es un pueblo maya, originario del sur de México, que radica principalmente en el norte del estado de Chiapas. Los tejidos tzotziles suelen representar narrativas, personajes, e ideas importantes de las creencias de la comunidad, creados sobre telar de cintura o bordados.  </p>
          <img src = {imagenes_informacion.imagenes_informacion["tzotzil"]["p1"]} />
          <img src = {imagenes_informacion.imagenes_informacion["tzotzil"]["p2"]} />
          <img src = {imagenes_informacion.imagenes_informacion["tzotzil"]["p3"]} />
          <p>Para crear estos diseños, se tomó como referencia el libro <a href = "https://contigoenladistancia.cultura.gob.mx/detalle/geometrias-de-la-imaginacion-chiapas">Geometrías de la Imaginación: Chiapas</a>, coordinado por Walter S. Morris, Jr. También se tomaron como referencia las artesanías del colectivo <a href="https://www.instagram.com/sna_jolobil/">Sna Jolobil</a>, con sede principal en San Cristóbal de las Casas, y la línea de prensas <a href="https://www.kuxulpok.mx/">K’uxul’ Pok’</a>, también ubicada en San Cristóbal de las Casas. </p>
          <h1> ¿Qué es el telar de cintura? </h1>
          <TelarInfo />
          <button onClick={esconderInformacion}> x </button>
        </div>
    ) 
  } else if(pueblo === "raramuri"){
    return(
      <div class = "informacion">
          <h1>Rarámuri </h1>
          <p>El pueblo rarámuri, también conocido como el pueblo tarahumara, es un pueblo originario del norte de México. La palabra “rarámuri” significa literalmente “pies ligeros”, lo cual refleja la fuerte tradición de correr a pie. Los tejidos rarámuri que fueron destacados en este juego son aquellos que son tejidos en las fajas con las cuales se sujetan los atuendos tradicionales. Los significados de estos símbolos son diversos y a menudo abstractos, reflejando la naturaleza de la región además de importantes conocimientos y relatos rarámuri. </p>
                    <img src = {imagenes_informacion.imagenes_informacion["raramuri"]["p1"]} />
          <img src = {imagenes_informacion.imagenes_informacion["raramuri"]["p2"]} />
          <p>Estos diseños se crearon en base a escritos de Aguilera Madrigal, Alejandro Gonzalez Villarruel, y Norbert Diaz de Arce. Se tomó como referencia también las obras de la artesana Catalina Batista Parra, diseños del grupo <a href="https://original.cultura.gob.mx/participantes/maria-del-refugio-bustillos-garcia">Umuki Suami</a> de Delicias, Chihuahua, y artesanías de la municipalidad de Coyachique. </p>
          <h1>¿Qué es el telar de cintura? </h1>
          <TelarInfo />
          <button onClick={esconderInformacion}> x </button>
        </div>
    ) 
  } else if(pueblo === "nahua"){
    return(
      <div class = "informacion">
          <h1>Nahua </h1>
          <p>El pueblo nahua es un pueblo originario de México. Es uno de los más diversos y numerosos en el país, con comunidades en el oeste y el centro de México. Existen una gran variedad de artes textiles que se practican en comunidades de habla náhuatl, mas en este juego se destacan principalmente los diseños del árbol de la vida, en particular los diseños de la comunidad de Hueyapan, en el estado de Puebla. El árbol de la vida es un diseño, a veces bordado y a veces tejido, del oeste de país, que representa un árbol mítico que originó a todo el universo. El árbol de la vida también se encuentra en diseños de comunidades totonacas, otomíes, y tepehuas. </p>
          <img src = {imagenes_informacion.imagenes_informacion["nahua"]["p1"]} />
          <img src = {imagenes_informacion.imagenes_informacion["nahua"]["p2"]} />
          <p>Para crear estos diseños, se tomó como referencia el libro <a href="https://contigoenladistancia.cultura.gob.mx/detalle/geometrias-de-la-imaginacion-puebla">Geometrías de la Imaginación: Puebla</a>, coordinado por Carmen Lorenzo Monterrubio. También se tomaron como referencia las artesanías del colectivo <a href="https://www.tayol.mx/">Tayol</a> y del colectivo <a href ="https://www.instagram.com/sohuame_tlatzonkime">Sohuame Tlatzonkime</a>, ambos ubicados en Hueyapán, Puebla.</p>
          <h1> ¿Qué es el telar de cintura? </h1>
          <TelarInfo />
          <button onClick={esconderInformacion}> x </button>
        </div>
    ) 
  } else {
    <div class = "informacion">
          <h1>Otomi </h1>
          <p>El pueblo otomí, también conocido como el pueblo hñähñu, ñathño, o ñ'yühü, es un pueblo originario del centro de México. Existen diversas comunidades de habla otomí, cada una con sus diseños propios y artes tradicionales. Los diseños suelen representar la vegetación y los animales de la región. Estos se pueden realizar sobre telar de cintura o con bordados pepenados. </p>
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p3"]} />
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p2"]} />
          <img src = {imagenes_informacion.imagenes_informacion["otomi"]["p1"]} />
          <h1> Que es el telar de cintura </h1>
          <TelarInfo />
          <button onClick={esconderInformacion}> x </button>
        </div>
  }
}


//////////////////////////////////////////
/* CODIGO PRINCIPAL DE LA SALA DE JUEGO */
//////////////////////////////////////////
const Sala = ({sala, socket, setSala, setTurno, setRonda}) => {
  var jugadores = [];
  const client = socket;


  //Codigo para reiniciar el juego 
  const reiniciarSala = () =>{
    let inputs = document.getElementById('ver-menu');
    inputs.checked = false;
    var nuevaSala = fs.nuevaSala(0, "Local", sala["pueblo"], true)
    for(let i = 1; i < sala["usuarios"].length; i++){
            nuevaSala["usuarios"].push(fs.nuevoJugador(i))
          }
          // socket.close()
    setSala(nuevaSala)
  }

  /////////////////////////////////////////////////
  /* Funciones para comenzar el juego, hacer una */ 
  /* jugada, etc.                                */
  /////////////////////////////////////////////////
  // Funcion para comenzar el juego
  const comenzar = () =>{
    if(VERBOSE){
        console.log("Se comenzo el juego")
      }
      //Copiar la sala actual
      var newSala = JSON.parse(JSON.stringify(sala))
      sala = fs.comenzarJuego(newSala)
      if(VERBOSE){
        console.log("Sala tras comenzar el juego:")
        console.log(sala)
      }
      setSala(sala)
      setTurno(0)
      setRonda(0)
  }

  //Funcion para hacer una jugada 
  const hacerJugada = (state) => {
    sala["usuarios"][sala["turno"]]["columnas"] = state["cols"]
      sala["usuarios"][sala["turno"]]["basura"] = state["basura"]
      sala["usuarios"][sala["turno"]]["canasta"] = []
      var siguiente = sala["turno"] + 1 //El siguiente jugador
      if(sala["turno"] === sala["usuarios"].length-1){
        siguiente = 0 
      }

      for(const f in state["fichasEnCanasta"]){
        sala["usuarios"][siguiente]["canasta"].push(state["fichasEnCanasta"][f])
      }
      sala["turno"] = sala["usuarios"][siguiente]["usuario"] 
      sala["sala"] = sala["turno"];
      
      if(VERBOSE){
        console.log("Se hizo una jugada. Sala tras la jugada: ")
        console.log(sala)
      }
      setSala(sala)
      setTurno(sala["turno"])
  }

  //Funcion para acabar la ronda 
  const acabarRonda = (state) => {
    if(!sala["local"]){
      socket.current.emit('ronda', sala["sala"], state)
    } else {
      
      var newSala = JSON.parse(JSON.stringify(puntuacion.bajarFichasYSacarPuntuacion(sala, state))) //deep copy 
      if(VERBOSE){
        console.log("Se acabo la ronda. Sala tras el final de la ronda: ")
        console.log(newSala)
      }
      setSala(newSala);
      setTurno(newSala["turno"])
      setRonda(newSala["ronda"])
      sala = newSala
    }
  }


  //////////////////////////////////////////////////
  /* Codigo que siempre va a suceder al crear una */ 
  /* nueva sala de juego                          */
  //////////////////////////////////////////////////

  //Si es el final del juego, se encuentra el ganador
  if(sala["status"] === "final"){
    var puntuacion_maxima = -1
    //Sacar la puntuacion maxima
    for(const usr in sala["usuarios"]){
      if(sala["usuarios"][usr]["puntuacion"][0] > puntuacion_maxima){
        puntuacion_maxima = sala["usuarios"][usr]["puntuacion"][0]
      }
    }
    for(const usr in sala["usuarios"]){
      if(puntuacion_maxima === sala["usuarios"][usr]["puntuacion"][0]){
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

  //Crear los jugadores segun la sala actual
  else if(sala["status"] === "activo"){

    for(const usr in sala["usuarios"]){
      if(sala["turno"] == usr){
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
  } else { //Si no ha comenzado el juego 
    for(const usr in sala["usuarios"]){
      jugadores.push(<Jugador jugador = {usr}
                              sala = {sala} 
                              status= "comienzo"
                              key={sala["usuarios"][usr]["usuario"]}/>);
    }
  }

  return(
    <div>
        <input id="ver-menu" type="checkbox" /><label for="ver-menu"><p>Opciones</p></label>
        <div class = "menu-informacion-contenido">
          <div class = "menu-btn" onClick = {regresarAlMenu}> 
            <button>Menu</button>
            {DisenoMenu(sala["pueblo"], 0)}
          </div>
          <div class = "menu-btn" onClick = {mostrarInformacion}> 
            <button>Conoce quien creó estos diseños</button>
                        {DisenoMenu(sala["pueblo"], 1)}
          </div>
          <div class = "menu-btn" onClick = {mostrarInstrucciones}> 
            <button>Ver instrucciones</button>
                        {DisenoMenu(sala["pueblo"], 2)}
          </div>
          <div class = "menu-btn" onClick = {reiniciarSala}> 
            <button>Reiniciar juego</button>
                        {DisenoMenu(sala["pueblo"], 3)}
          </div>
    </div>  
      {!sala["local"] ? <h1>Sala de juego "{sala["sala"]}"</h1>  : ""}   
      <div id = "informacion-fondo" class = "fondo">
        <Informacion pueblo = {sala["pueblo"]} />
      </div>
      <div id = "instrucciones-fondo" class = "fondo">
        <Instrucciones/>
      </div>
      <div class ="sala">
        {sala["status"] === "activo" || sala["status"] === "final"
          ? 
            <div class="jugadores" key="boards1">{jugadores}</div>
            :
            <div>
            <div id="comenzarBtn">
              <button onClick={comenzar}>
                Comenzar
              </button>
            </div>
            <div class="jugadores" key="boards2"> 
            {jugadores}
            </div>
            
          </div>
        }
    </div>
    </div>
  )
}

export default Sala;