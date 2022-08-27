import { io } from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './jugador.css';
import{HTML5Backend} from 'react-dnd-html5-backend'
import Tablero from './Tablero'
import Ficha from './Ficha'

//todo (less urgent) lots of refactoring, see if I can eliminate a lot of the
// "mirroring" going on in componentdidupdate, why dont i just use props 
// from the source? 

//TODO WHEN REFACTORING: Instead of having a text field that users can input anything into,
// have the game generate a random hex code you can send to your friends, and limit
// number of characters they can enter into the enter nbox 

//TODO (extreeeeemely low priority): spectator mode


function Canasta(props){
  return(
    <div className="canasta"> 
      <div className="fichas">
        {props.fichas}
        </div>
    </div>
  )
}

function Basura(props){
  return(
    <div className="basura" onClick = {() => props.tirarFicha(props.ficha)}>
      <div className="fichas">
        {props.fichas}
      </div>
    </div>
  )
}


// Will store information on currently selected subset, eventually 
// also player order

class Jugador extends React.Component{
  constructor(props) {
    console.log("Construyendo el jugador ...")
    super(props);

    //Canasta 
    const enCanasta = []
    const jugador = this.props.sala["usuarios"][this.props.jugador]
    for(const ficha in jugador["canasta"]){
      enCanasta.push(jugador["canasta"][ficha])
    }
    //Columnas 
    const columnas = Array(5)
    columnas[0] = Array(3).fill(null)
    columnas[1] = Array(2).fill(null)
    columnas[2] = Array(1).fill(null)
    columnas[3] = Array(2).fill(null)
    columnas[4] = Array(3).fill(null)

    this.state = {
      fichaElegida: null,
      fichasEnCanasta: enCanasta,
      tablero: Array(25).fill(null),
      basura: [],
      cols: columnas,
      error: "",
      subset: [], // Si concuerda con cualquier cosa en el subconjunto
    }

  }

  //TODO: REALLY WORRIED ABOUT WHAT HAPPENS SI UN JUGADOR ACABA CON LAS FICHAS
  //EN SU CANASTA EN LA PRIMERA RONDA, PERO AUN HAY FICHAS EN OTRAS CANASTAS!
  //PROBABLEMENTE SE SOLUCIONE CON UN "PLAYER TURN" 
  hacerJugada(){
    const usuario = this.props.sala["usuarios"][this.props.jugador]["usuario"]
    if(this.state.fichasEnCanasta.length){
      console.log("Jugador haciendo jugada ...")
      this.props.hacerJugada(this.state)
    } else { // Si no quedan fichas en canasta pero el otro si tiene 
      for(const u in this.props.sala["usuarios"]){
        if(this.props.sala["usuarios"][u]["usuario"] != usuario && this.props.sala["usuarios"][u]["canasta"].length){
          console.log("Jugador haciendo jugada ...")
          this.props.hacerJugada(this.state)
          return 
        }
      }
      this.props.acabarRonda(this.state)
      console.log("Se acabo la ronda ... ")
    }
  }

  //TODO: Refactor this, get it out of here
  //TODO: REALLY WORRIED ABOUT WHAT HAPPENS SI UN JUGADOR ACABA CON LAS FICHAS
  //EN SU CANASTA EN LA PRIMERA RONDA, PERO AUN HAY FICHAS EN OTRAS CANASTAS!
  //PROBABLEMENTE SE SOLUCIONE CON UN "PLAYER TURN" 
  //TODO: RERENDERING TABLERO EVEN WHEN I DON'T HAVE TO,
  //TODO: make this respond to GAME TURN not to FICHAS CHANGE 
  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
      console.log(`Se detecto un cambio en la sala para el jugador ${this.props.jugador}. Sala anterior:`)
      console.log(prevProps.sala)
      console.log("Sala nueva:")
      console.log(this.props.sala)
      const jugador = this.props.sala["usuarios"][this.props.jugador]
      const enCanasta = []
      for(const ficha in jugador["canasta"]){
        enCanasta.push(jugador["canasta"][ficha])
      }
      if(jugador["columnas"]){
        this.setState({fichasEnCanasta: enCanasta, subset: [], cols: this.clonar(jugador["columnas"])})
      } else {
        const columnas = Array(5)
        columnas[0] = Array(3).fill(null)
        columnas[1] = Array(2).fill(null)
        columnas[2] = Array(1).fill(null)
        columnas[3] = Array(2).fill(null)
        columnas[4] = Array(3).fill(null)
        this.setState({fichasEnCanasta: enCanasta, subset: [], cols: columnas})
      }
      if(jugador["tablero"]){
        this.setState({tablero: jugador["tablero"].flat()})
      }
      if(jugador["basura"]){
        this.setState({basura: jugador["basura"]})
      }
    }
  }

  acuerda(ficha, subset = this.state.subset){
    return(subset.includes(ficha["patron"]) || subset.includes(ficha["color"]));
  }

  //Para clonar las columnas
  clonar(arr){
    return arr.map(x => Array.isArray(x) ? this.clonar(x) : x)
  }

  //Sacar el subconjunto de una columna
  getSubset(col){
    var fichasKey = this.props.sala["fichas"]
    if(col[0]){
      var subset = [fichasKey[col[0]]["color"], fichasKey[col[0]]["patron"]]
      for(const f in col){
        if(col[f]){
          if(subset.includes(fichasKey[col[f]]["color"])){
            if(subset.length > 1 && !subset.includes(fichasKey[col[f]]["patron"])){
              subset = [fichasKey[col[f]]["color"]]
              console.log(`${subset}`)
            }
          } else if (subset.includes(fichasKey[col[f]]["patron"] )) { 
            subset = [fichasKey[col[f]]["patron"]]
            console.log(`${subset}`)
          } else { // No deberia occurrir
            console.error(`Columna ${col} no fue construida bien`)
            return []
          }
        } else {
          return subset
        }
      }
      return [] //Esta llena la columna 
    } else {
      return []
    }
  }

  ponerFicha(col, ficha){
    if (ficha){
      //Probablemente seria mejor tener un state con el subconjunto actual
      // de cada columna pero va ser dificil manejarlo por >1 ronda y los subconjuntos 
      //son peque~nos asi que mejor calcularlo cada vez
      if(!this.state.cols[col][0] || this.acuerda(ficha, this.getSubset(this.state.cols[col]))){
        const len = this.state.cols[col].length
        const newCol = this.clonar(this.state.cols)
        const newCanasta = this.state.fichasEnCanasta.slice()
        let fil = 0
        while(fil < len && this.state.cols[col][fil]){
          fil++
        }
        if(fil == len){ // Esta llena la columna
          console.log("Esta llena la columna, no se pudo colocar la ficha")
          this.setState({error:<p>Esta llena la columna, no se pudo colocar la ficha</p>})
        } else {
          const idx = this.props.sala["fichas"].findIndex(x => x === ficha)
          newCol[col][fil] = idx
          newCanasta.splice(this.state.fichasEnCanasta.findIndex(x => x == idx), 1)
        }
        this.setState({
          fichaElegida: null,
          cols: newCol,
          fichasEnCanasta: newCanasta,
          error: ""
        })
      } else {
        console.log("Ficha no acuerda con columna o columna esta llena")
        this.setState({error:<div class = "error"><p>No se pudo colocar la ficha - la ficha debe acordar con el patron o color del resto de las fichas en la columna, y la columna no puede estar llena.</p></div>})
      }
    } else {
      console.log("No se selecciono una ficha")
    }
  }


  // TODO: Test a ver si se puede tirar una ficha si aun existen jugadas posibles 
  // TODO: Supongamos que tenemos dos subconjuntos, cada uno de tres fichas identicas,
  // y solo tenemos dos espacios libres. Creo que entonces, el jugador se quedaria
  // atascado, a pesar de no tener jugadas posibles! 
  // TODO: 
  tirarFicha(ficha){
    if(ficha){ //Comparar con state.cols, no props.cols 
      for(const f in this.state.fichasEnCanasta){
        var fichaActual = this.props.sala["fichas"][this.state.fichasEnCanasta[f]]
        for (const col in this.state.cols){
          if(this.state.cols[col][0] == null ||
            this.acuerda(fichaActual, this.getSubset(this.state.cols[col]))) {
              this.setState({error: <div class = "error"> <p>Aun se pueden colocar fichas en alguna columna - solo se pueden tirar fichas si no hay otras jugadas posibles</p></div>})
              console.log(`Aun se puede colocar ${fichaActual["color"]} ${fichaActual["patron"]} en columna ${col}`)
              return 
          }
        }
      }

      var newBasura = this.clonar(this.state.basura);
      const idx = this.props.sala["fichas"].findIndex(x => x === ficha)
      newBasura.push(idx)
      var newCanasta = this.state.fichasEnCanasta.slice()
      newCanasta.splice(this.state.fichasEnCanasta.findIndex(x => x == idx), 1)

      this.setState({basura: newBasura, fichasEnCanasta: newCanasta, error: ''})
    } else {
      console.log("No se selecciono una ficha")
    }
  }

  // TODO (not urgent) solo bajar las que no acuerden 
  // con el subset
  // TODO: Que ocurre si en otro turno, el jugador logro poner algo en la 
  // basura, y luego le pica a este boton? Siquiera es posible?
  borrarColumnas(){
    console.log("Borrando ....")
    const enCanasta = []
    const misFichas = this.props.sala["usuarios"][this.props.jugador]["canasta"]
    for(const ficha in misFichas){
      enCanasta.push(misFichas[ficha])
    }
    //Columnas 
    const columnas = this.clonar(this.state.cols)
    for(const col in this.state.cols){
      for(const f in this.state.cols[col]){
        if(misFichas.includes(this.state.cols[col][f])){
          //Solo borrar las fichas que se bajaron en este turno
          columnas[col][f] = null   
        }
      }
    }

    const newBasura = []
    for (const f in this.state.basura){
      if(!misFichas.includes(this.state.basura[f])){
        //Solo borrar las fichas que se tiraron en este turno
        newBasura.push(this.state.basura[f])
      }
    }

    this.setState({cols: columnas, basura: newBasura, fichasEnCanasta: enCanasta, error: ""})

  }

// Se~nalar el subconjunto segun la ficha seleccionada 
//La funcion que se llama cuando se selecciona una ficha en la canasta
  elegirSubconjunto(ficha){
    this.setState({fichaElegida: ficha})
    var subsetlen = this.state.subset.length
    // Si no se ha eligido una ficha o si la ficha no acuerda
    if(subsetlen == 0 || !this.acuerda(ficha)){
      console.log(`O no se eligio una ficha, o no acuerda!`)
      if(!this.acuerda(ficha)){ //Hate calculating this twice but whatever
        console.log("Borrando columnas ...")
        this.borrarColumnas()
        console.log("Se borro!")
      } 
      this.setState({subset: [ficha["color"], ficha["patron"]]})
    } else {
      if(subsetlen == 2){ // Solo se ha elegido una ficha
        if(this.state.subset.includes(ficha["patron"])){
          if(!this.state.subset.includes(ficha["color"])){ //Si NO son identicas
              this.setState({subset: [ficha["patron"]]})
          }
        } else { //Como concuerdan, no se tiene que checar si tienen el mismo color
          this.setState({subset: [ficha["color"]]})
        } 
      } else if (subsetlen == 1){ // Ya se han elegido >1 fichas no identicas, y la nueva elegida concuerda
        return; //no hay nada mas que hacer
      } else {
        console.log(`ERROR App.js 184 - The maximum length of subset is 2. Current subset: ${this.state.subset}`);
      }
    }
    return ficha
  }

  //Cuando se esta usando el drag and drop 
  dragAndDropFicha(col, ficha){
    this.elegirSubconjunto(ficha)
    this.ponerFicha(col, ficha)
  }

  renderFicha(ficha, op = true){
    if(ficha){
      var funcionOnclick = () => void 0
      if(this.props.status == "activo"){
        var funcionOnclick = () => this.elegirSubconjunto(ficha)
      }
      let color = ficha["color"]
      let style = {}
      if(op){
        if(this.state.fichaElegida == ficha){
          style = {border: '2px solid black'}
        }
      } else {
        style = {opacity: "50%"}
      }
      let simbolo = ficha["patron"]
      return(<Ficha fichaItem = {ficha}
                    style = {style}
                    color = {ficha["color"]}
                    key = {ficha["id"]}
                    simbolo = {simbolo}
                    onclick= {funcionOnclick}  />)
    } else {
      return null
    }
  }

  goButtonOnClickFunction(){
    let onClick = () => alert("No es tu turno")
    let style = {opacity: "50%"}
    var quedanFichas = []
    for(const s in this.state.subset){
      var subs = [this.state.subset[s]]
      quedanFichas.push(true)
      for(const f in this.state.fichasEnCanasta){
        if(this.acuerda(this.props.sala["fichas"][this.state.fichasEnCanasta[f]], subs)) {
          quedanFichas[s] = false
          break
        }
      }
    }
    onClick = () => {this.setState({error:<div class = "error"><p>No se selecciono un subconjunto completo</p></div>})}
    if(quedanFichas.length > 0 ){
      if(quedanFichas.reduce((x, y) => x || y)){
        style = {}
        onClick= ()=>this.hacerJugada()
      }
    } else {
      onClick= ()=>this.hacerJugada()
    }

    return(<button style = {style} onClick={onClick}>Hacer jugada</button>)
  }

  renderGoButton(){
    if(this.props.socket && !this.props.sala["local"]){
      if(this.props.socket.current.id == this.props.sala["turno"]){
        return this.goButtonOnClickFunction()
      }
    } else if (this.props.sala["local"]){
      if (this.props.sala["usuarios"][this.props.jugador]["usuario"] == this.props.sala["turno"]){
        return this.goButtonOnClickFunction()
      }
    }
    return(<button style = {{opacity: "50%"}} onClick={() => alert("No es tu turno")}>Hacer jugada</button>)
  }

  renderUndoButton(){
    return(<button onClick = {() => this.borrarColumnas()}> Deshacer </button>)
  }

  //Mostrar la canasta, tambien el boton para hacer jugada
  renderCanasta(){
    const fich = []
    for (const ficha in this.state.fichasEnCanasta){
      var fichaActual = this.state.fichasEnCanasta[ficha]
      if (this.state.subset.length == 0 || this.acuerda(this.props.sala["fichas"][fichaActual])) { 
        fich.push(this.renderFicha(this.props.sala["fichas"][fichaActual]))
      } else {
        fich.push(this.renderFicha(this.props.sala["fichas"][fichaActual], false))
      }
    }
    return(<Canasta fichas = {fich} />)
  }

  //Mostrar tablero
  renderTablero(){
    var columnas
    columnas = (arr) => arr.map(x => Array.isArray(x) ? columnas(x) : this.renderFicha(this.props.sala["fichas"][x]))
    if(this.props.sala["status"] == "activo"){
      return(<Tablero 
                      ficha = {this.state.fichaElegida} 
                      puntuacion = {this.props.sala["usuarios"][this.props.jugador].puntuacion[1]}
                      cols = {columnas(this.state.cols)} dndFicha = {(c, f) => this.dragAndDropFicha(c, f)} ponerFicha = {(c, f) => this.ponerFicha(c, f)} 
                      tableroFichas = {columnas(this.state.tablero)}/>)
    } else {
      return(<Tablero ficha = {this.state.fichaElegida} cols = {this.state.cols} tableroFichas = {null}/>)
    }
  }

  renderJugador(){
    var renderBasura = (arr) => arr.map(x => this.renderFicha(this.props.sala["fichas"][x]))
    return(
      <div class="jugador">
          <div class="elementos">
            <div class="tablero">{this.renderTablero()}</div>
            <div class ="basura-y-canasta">
                {this.renderCanasta()}
                <Basura fichas = {renderBasura(this.state.basura)} 
                        ficha = {this.state.fichaElegida}
                        tirarFicha = {(f) => this.tirarFicha(f)}/>
            </div>
          </div>
          <div class="puntuacion">
              <p>PUNTUACION: {this.props.sala["usuarios"][this.props.jugador].puntuacion[0]}</p>
            </div>
        </div>
      )
  }

  render(){
    console.log(this.props.sala["status"])
    var cls = "botones-y-jugador"
    if(!this.props.sala["local"]){
      var mostrarBotones = (this.props.sala["status"] == "activo") && (this.props.socket.current.id == this.props.sala["usuarios"][this.props.jugador]["usuario"])  && (this.props.socket.current.id == this.props.sala["turno"])
    } else { //multiplayer local
      var mostrarBotones = (this.props.sala["status"] == "activo") && (this.props.sala["usuarios"][this.props.jugador]["usuario"] == this.props.sala["turno"])
    }
    var botones = [this.renderGoButton(), this.renderUndoButton()]
    if(this.props.sala["usuarios"][this.props.jugador]["usuario"] == this.props.sala["turno"]){
      cls = "botones-y-jugador jugador-actual"
    }
    if(mostrarBotones && this.props.sala["status"] != "final"){
      return(
        <div class = {cls}>
            <div class = "botones">
              {botones}
            </div>
            {this.state.error}
            {this.renderJugador()}
          </div>
      )
    } else {
      if(this.props.sala["status"] == "final"){
        if(this.props.ganador){
          return(<div class = {"ganador " + cls}>{this.renderJugador()}<h2>¡Ganador!</h2></div>)
        }
        
      } 
      return(<div class = {cls}> {this.renderJugador()}</div>)
    }
  }
}

export default Jugador;