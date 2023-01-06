import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {DndProvider, useDrag, useDrop} from 'react-dnd'
import{HTML5Backend} from 'react-dnd-html5-backend'



const ItemTypes = {
  FICHA: 'Ficha'
}

function Square(props) {
  return (
    <button className="square" style = {props.style}>
      {props.value}
    </button>
  );
}

function alertfx(){
  alert("drop")
  return undefined
}

function ColSquare(props) {
  const[{isOver}, drop] = useDrop(() => ({
    accept: ItemTypes.FICHA,
    drop: (item, monitor) => props.ondrop(monitor.getItem()),
    collect: mon => ({
      isOver:!!mon.isOver(),
    }),
  }))
  return (
    <div 
      ref={drop}
      style={{
        position: 'relative',
        width: '100%', 
        height: '100%',
      }}
    >
    <button className="square col-square" onClick = {props.onclick}>
      {props.value}
    </button>
    {isOver && (
      <div 
        style = {{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          zIndex: 1,
          opacity: 0.5,
          backgroundColor: 'yellow',
        }}
        />
      )}
    </div>
  )
};

//Boards for each individual player 
class Tablero extends React.Component {
  constructor(props) {
    super(props);
  }

  highlight(i){
    const col = Math.floor(i/5)
    const fila = i%5
    var style = ""
    if(this.props.puntuacion[0][col].length){
      if((this.props.puntuacion[0][col][0] <= fila) && (this.props.puntuacion[0][col][1] >= fila)){
        style = "red"
      }
    }
    for(const sc in this.props.puntuacion[1][fila]){
      if(this.props.puntuacion[1][fila][sc].length){
        if((this.props.puntuacion[1][fila][sc][0] <= col) && (this.props.puntuacion[1][fila][sc][1] >= col)){
          if(style == "red"){
            style = "purple"
          } else {
            style = "blue"
          }
        }
      }
    }
    return {backgroundColor: style}
  }

  renderSquare(i) {
    if(this.props.tableroFichas){
      if(this.props.puntuacion.length){
        return (
          <Square
            value={this.props.tableroFichas[i]}
            style={this.highlight(i)}
          />
        );
      } else {
        return (
          <Square
            value={this.props.tableroFichas[i]}
            style={null}
          />
        );
      }
    } else {
      return (
        <Square
          value={null}
          style = {null}
        />
      );
    }
  }

  renderColSquare(col, fil) {
    return (
      <ColSquare
        value={this.props.cols[col][fil]}
        onclick = {() => this.fichaEnColumna(col, this.props.ficha)}
        ondrop = {(f) => this.dndFichaEnColumna(col, f)}
      />
    );
  }

  fichaEnColumna(col, ficha){
    this.props.ponerFicha(col, ficha)
  }

  dndFichaEnColumna(col, ficha){
    this.props.dndFicha(col, ficha)
  }

  render() {
    return (
      <div>
        <div className="board-row">
          <button className="empty-square"/ >
          <button className="empty-square"/ >
          {this.renderColSquare(2, 2)}
          <button className="empty-square"/ >
          <button className="empty-square"/ >
        </div>
        <div className="board-row">
          <button className="empty-square"/ >
          {this.renderColSquare(1, 1)}
          {this.renderColSquare(2, 1)}
          {this.renderColSquare(3, 1)}
          <button className="empty-square"/ >
        </div>
        <div className="board-row">
          {this.renderColSquare(0, 0)}
          {this.renderColSquare(1, 0)}
          {this.renderColSquare(2, 0)}
          {this.renderColSquare(3, 0)}
          {this.renderColSquare(4, 0)}
        </div>
        <div className="board-row">
          {this.renderSquare(4)}
          {this.renderSquare(9)}
          {this.renderSquare(14)}
          {this.renderSquare(19)}
          {this.renderSquare(24)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(8)}
          {this.renderSquare(13)}
          {this.renderSquare(18)}
          {this.renderSquare(23)}
        </div>
        <div className="board-row">
          {this.renderSquare(2)}
          {this.renderSquare(7)}
          {this.renderSquare(12)}
          {this.renderSquare(17)}
          {this.renderSquare(22)}
        </div>
        <div className="board-row">
          {this.renderSquare(1)}
          {this.renderSquare(6)}
          {this.renderSquare(11)}
          {this.renderSquare(16)}
          {this.renderSquare(21)}
        </div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(5)}
          {this.renderSquare(10)}
          {this.renderSquare(15)}
          {this.renderSquare(20)}
        </div>
      </div>
    );
  }
}

function Ficha(props){
  const[{isDragging}, drag] = useDrag(() => ({
    type: ItemTypes.FICHA,
    item: () => props.onclick(),
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return(
    <div
      ref = {drag} 
      className="ficha"
      style={{opacity: isDragging? 0.5: 1}, props.style}
      onClick = {props.onclick}>
    <p> {props.simbolo} </p>
    </div>
  )
}


function Canasta(props){
  return(
    <div className="canasta"> 
      {props.fichas}
    </div>
  )
}

function Basura(props){
  console.log(props.fichas)
  return(
    <div className="basura" onClick = {() => props.tirarFicha(props.ficha)}>
      {props.fichas}
    </div>
  )
}


// Will store information on currently selected subset, eventually 
// also player order

class Player extends React.Component{
  constructor(props) {
    console.log("Constructing player board ...")
    super(props);

    //Canasta 
    const enCanasta = []
    for(const ficha in this.props.fichas){
      enCanasta.push(this.props.fichas[ficha])
    }
    //Columnas 
    const columnas = Array(5)
    columnas[0] = Array(1).fill(null)
    columnas[1] = Array(2).fill(null)
    columnas[2] = Array(3).fill(null)
    columnas[3] = Array(2).fill(null)
    columnas[4] = Array(1).fill(null)


    this.state = {
      fichaElegida: null,
      fichasEnCanasta: enCanasta,
      tablero: Array(25).fill(null),
      basura: [],
      cols: columnas,
      subset: [], // Si concuerda con cualquier cosa en el subconjunto
    }

  }

  //TODO: REALLY WORRIED ABOUT WHAT HAPPENS SI UN JUGADOR ACABA CON LAS FICHAS
  //EN SU CANASTA EN LA PRIMERA RONDA, PERO AUN HAY FICHAS EN OTRAS CANASTAS!
  //PROBABLEMENTE SE SOLUCIONE CON UN "PLAYER TURN" 
  hacerJugada(){
    console.log(this.state.fichasEnCanasta)
    if(this.state.fichasEnCanasta.length){
      console.log("Haciendo jugada ...")
      this.props.socket.current.emit('jugada', this.props.roomname, this.state)
    } else{
      for(const u in this.props.room["users"]){
        if(this.props.room["users"][u]["user"] != this.props.username && this.props.room["users"][u]["canasta"].length){
          console.log("Haciendo jugada ...")
          this.props.socket.current.emit('jugada', this.props.roomname, this.state)
          return;
        }
      }
      console.log("Se acabo la ronda ... ")
      this.props.socket.current.emit('ronda', this.props.roomname, this.state)
    }
  }

  //TODO: REALLY WORRIED ABOUT WHAT HAPPENS SI UN JUGADOR ACABA CON LAS FICHAS
  //EN SU CANASTA EN LA PRIMERA RONDA, PERO AUN HAY FICHAS EN OTRAS CANASTAS!
  //PROBABLEMENTE SE SOLUCIONE CON UN "PLAYER TURN" 
  componentDidUpdate(prevProps){
    if(this.props.fichas !== prevProps.fichas){
      console.log(`Cambio en fichas! `)
      const enCanasta = []
      for(const ficha in this.props.fichas){
        enCanasta.push(this.props.fichas[ficha])
      }
      if(this.props.columnas){
        this.setState({fichasEnCanasta: enCanasta, subset: [], cols: this.clonar(this.props.columnas)})
      } else {
        const columnas = Array(5)
        columnas[0] = Array(1).fill(null)
        columnas[1] = Array(2).fill(null)
        columnas[2] = Array(3).fill(null)
        columnas[3] = Array(2).fill(null)
        columnas[4] = Array(1).fill(null)
        this.setState({fichasEnCanasta: enCanasta, subset: [], cols: columnas})
      }
      if(this.props.tablero){
        this.setState({tablero: this.props.tablero})
      }
      if(this.props.basura){
        this.setState({basura: this.props.basura})
      }
    }
  }

  acuerda(ficha, subset = this.state.subset){
    // console.log(`Comparando ficha ${ficha["patron"]} ${ficha["color"]}`)
    // console.log(`Comparando con subconjunto ${subset}`)
    return(subset.includes(ficha["patron"]) || subset.includes(ficha["color"]));
  }

  //Para clonar las columnas
  clonar(arr){
    return arr.map(x => Array.isArray(x) ? this.clonar(x) : x)
  }

  //Sacar el subconjunto de una columna
  getSubset(col){
    var fichasKey = this.props.fichasEnCuarto
    console.log(col)
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
        console.log(`Trying to place ${ficha["patron"]}, ${ficha["color"]}`)  
        const len = this.state.cols[col].length
        const newCol = this.clonar(this.state.cols)
        const newCanasta = this.state.fichasEnCanasta.slice()
        let fil = 0
        while(fil < len && this.state.cols[col][fil]){
          fil++Telar
        }
        console.log(`Poniendo en columna ${col}, fila ${fil}`)
        if(fil == len){ // Esta llena la columna
          console.log("Can't place here!")
          //TODO actually show to player
        } else {
          const idx = this.props.fichasEnCuarto.findIndex(x => x === ficha)
          newCol[col][fil] = idx
          console.log(`${newCanasta}`)
          console.log(`${idx}`)
          newCanasta.splice(this.state.fichasEnCanasta.findIndex(x => x == idx), 1)
          console.log(`${newCanasta}`)
        }
        this.setState({
          fichaElegida: null,
          cols: newCol,
          fichasEnCanasta: newCanasta
        })
      } else {
        console.log("Ficha no acuerda con columna o columna esta llena")
      }
    } else {
      console.log("No se selecciono una ficha")
    }
  }


  // TODO: Test a ver si se puede tirar una ficha si aun existen jugadas posibles 
  // TODO: Supongamos que tenemos dos subconjuntos, cada uno de tres fichas identicas,
  // y solo tenemos dos espacios libres. Creo que entonces, el jugador se quedaria
  // atascado, a pesar de no tener jugadas posibles! 
  tirarFicha(ficha){
    if(ficha){ //Comparar con state.cols, no props.cols 
      for(const f in this.state.fichasEnCanasta){
        var fichaActual = this.props.fichasEnCuarto[this.state.fichasEnCanasta[f]]
        console.log(fichaActual)
        for (const col in this.state.cols){
          if(this.state.cols[col][0] == null ||
            this.acuerda(fichaActual, this.getSubset(this.state.cols[col]))) {
              console.log(`Aun se puede colocar ${fichaActual["color"]} ${fichaActual["patron"]} en columna ${col}`)
              return 
          }
        }
      }

      var newBasura = this.clonar(this.state.basura);
      const idx = this.props.fichasEnCuarto.findIndex(x => x === ficha)
      newBasura.push(idx)
      var newCanasta = this.state.fichasEnCanasta.slice()
      newCanasta.splice(this.state.fichasEnCanasta.findIndex(x => x == idx), 1)

      this.setState({basura: newBasura, fichasEnCanasta: newCanasta})
      console.log(this.state.basura)
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
    const myFichas = []
    for(const ficha in this.props.fichas){
      enCanasta.push(this.props.fichas[ficha])
    }
    //Columnas 
    const columnas = this.clonar(this.state.cols)
    for(const col in this.state.cols){
      for(const f in this.state.cols[col]){
        if(this.props.fichas.includes(this.state.cols[col][f])){
          //Solo borrar las fichas que se bajaron en este turno
          columnas[col][f] = null   
        }
      }
    }

    const newBasura = []
    for (const f in this.state.basura){
      if(!this.props.fichas.includes(this.state.basura[f])){
        //Solo borrar las fichas que se tiraron en este turno
        newBasura.push(this.state.basura[f])
      }
    }

    this.setState({cols: columnas, basura: newBasura, fichasEnCanasta: enCanasta})

  }

// Se~nalar el subconjunto segun la ficha seleccionada 
  elegirSubconjunto(ficha){
    console.log(`Eligiendo el subconjunto en base de ${ficha["color"]}, ${ficha["patron"]}`)
    console.log(`Subconjunto actual: ${this.state.subset}`)
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
      let color = ficha["color"]
      let style = {}
      if(op){
        if(this.state.fichaElegida == ficha){
          style = {backgroundColor: color, border: '1px solid black'}
        } else {
          style = {backgroundColor: color}
        }
      } else {
        style = {backgroundColor: color, opacity: "50%"}
      }
      let simbolo = ficha["patron"]
      return(<Ficha fichaItem = {ficha}
                    style = {style}
                    color = {ficha["color"]}
                    key = {ficha["id"]}
                    simbolo = {simbolo}
                    onclick= {() => this.elegirSubconjunto(ficha)}  />)
    } else {
      return null
    }
  }

  renderGoButton(){
    let onClick = () => alert("No es tu turno")
    let style = {opacity: "50%"}
    if(this.props.socket){
      if(this.props.socket.current.id == this.props.turno){
        var quedanFichas = []
        for(const s in this.state.subset){
          var subs = [this.state.subset[s]]
          quedanFichas.push(true)
          for(const f in this.state.fichasEnCanasta){
            if(this.acuerda(this.props.fichasEnCuarto[this.state.fichasEnCanasta[f]], subs)) {
              console.log(`Aun quedan fichas en subconjunto ${subs}`)
              quedanFichas[s] = false
              break
            }
          }
        }
        // }
        onClick = () => alert("Favor de seleccionar un subconjunto completo")
        if(quedanFichas.length > 0 ){
          if(quedanFichas.reduce((x, y) => x || y)){
            style = {}
            onClick= ()=>this.hacerJugada()
          }
        } else {
          onClick= ()=>this.hacerJugada()
        }
      }
    }
    return(<button style = {style} onClick={onClick}>Hacer jugada</button>)
  }

  renderUndoButton(){
    return(<button onClick = {() => this.borrarColumnas()}> Deshacer </button>)
  }

  renderCanasta(){
    const fich = []
    for (const ficha in this.state.fichasEnCanasta){
      var fichaActual = this.state.fichasEnCanasta[ficha]
      if (this.state.subset.length == 0 || this.acuerda(this.props.fichasEnCuarto[fichaActual])) { 
        fich.push(this.renderFicha(this.props.fichasEnCuarto[fichaActual]))
      } else {
        fich.push(this.renderFicha(this.props.fichasEnCuarto[fichaActual], false))
      }
    }
    if(this.props.activo ){ ////Si ya empezo el juego //TODO ON REFACTOR: A BETTER WAY TO DO THIS IS POSSIBLE
      if(this.props.socket.current.id == this.props.username){
        return(<div>
              <Canasta fichas = {fich} />
              {this.renderGoButton()}
              {this.renderUndoButton()}
              </div>)
      }
    }
    return(<Canasta fichas = {fich} />)
  }

  renderTablero(){
    var columnas
    columnas = (arr) => arr.map(x => Array.isArray(x) ? columnas(x) : this.renderFicha(this.props.fichasEnCuarto[x]))
    var renderBasura = (arr) => arr.map(x => this.renderFicha(this.props.fichasEnCuarto[x]))
    if(this.props.fichasEnCuarto){
      return(<div style={{display: "inline-flex"}}><Tablero 
                      style = {{display: "flex", float:"left", paddingRight: "20px"}}
                      ficha = {this.state.fichaElegida} 
                      puntuacion = {this.props.puntuacion[1]}
                      cols = {columnas(this.state.cols)} dndFicha = {(c, f) => this.dragAndDropFicha(c, f)} ponerFicha = {(c, f) => this.ponerFicha(c, f)} 
                      tableroFichas = {columnas(this.state.tablero)}/>

                      <Basura fichas = {renderBasura(this.state.basura)} 
                        ficha = {this.state.fichaElegida}
                        tirarFicha = {(f) => this.tirarFicha(f)}/>
                      </div>)
    } else {
      return(<Tablero ficha = {this.state.fichaElegida} cols = {this.state.cols} tableroFichas = {null}/>)
    }
  }

  render(){
    return(
      <div>
        <p>JUGADOR: {this.props.username}</p>
        {this.renderTablero()}
        <p>{this.state.subset}</p>
        <p>PUNTUACION: {this.props.puntuacion[0]}</p>
        {this.renderCanasta()}
      </div>
    )
  }
}


//Called from GameRoom to start the game. Probably not in the right place
function startGame(skt, roomname){
  console.log(`Sent request to start game`);
  skt.current.emit('comenzar-juego', roomname);
};

function doTests(skt, roomname){
  console.log(`Haciendo pruebas ...`)
  skt.current.emit('jugada-test')
}

//Gameroom. Props inclused room and socket info
function GameRoom(props){
  //TODO: You can still play even if "espera" is on. Will fix during the refactor, when
  // I just pass in props.room[users][usr] instead of mirroring 
  var boards = [];

  const client = props.socket;
  const roomname = props.room["sala"]
    console.log(roomname)
  const fichas = props.room["fichas"];
  var espera = ""
  
  console.log(`Game room has updated, client: ${client.current.id}`)
  console.log(`En el turno del jugador ${props.room["turno"]}`)

  if(props.room["activo"]){
    var idx = 0;
    for(const usr in props.room["usuarios"]){
      var columnas = "0"
      if(props.room["usuarios"][usr]["canasta"]){
        var columnas = props.room["usuarios"][usr]["canasta"].toString()
      }

      //TODO: Why do i not just pass in props.room[users][usr] instead of pulling basically everything 
      //out of it here?
      boards.push(<Player fichas={props.room["usuarios"][usr]["canasta"]}
                          activo = {props.room["activo"]}
                          columnas={props.room["usuarios"][usr]["columnas"]}
                          socket={client} 
                          roomname={roomname}
                          username = {props.room["usuarios"][usr]["usuario"]}
                          puntuacion={props.room["usuarios"][usr]["puntuacion"]}
                          fichasEnCuarto={props.room["fichas"]}
                          tablero={props.room["usuarios"][usr]["tablero"].flat()}
                          turno = {props.room["turno"]}
                          room = {props.room}
                          ronda = {props.room["ronda"]}
                          basura = {props.room["usuarios"][usr]["basura"]}
                          key = {props.room["usuarios"][usr]["usuario"]}/>)
    }
  } else {
    for(const usr in props.room["usuarios"]){
      boards.push(<Player key={usr} puntuacion ={props.room["usuarios"][usr]["puntuacion"]}/>);
    }
  }
  console.log(props.room["espera"])
  if(props.room["espera"]){
    console.log("626 EN ESPERA .... ")
    espera = "espera"
  }

  //TODO: I think you can still play with the "espera"??? lol
  return(
    <DndProvider backend={HTML5Backend}>
    <div> 
      <div id = {espera}> <p> PLEASE WAIT FOR RECONNECT </p> </div>
      {fichas.length
        ? 
        <div style={{display:"inline-flex"}} key="boards1">{boards}</div>
        :
        <div style={{display:"inline-flex"}} key="boards2"> 
        {boards}
        <button onClick={() => startGame(client, roomname)}>
          Start game
        </button>
        <button onClick = {() => doTests(client, roomname)}> 
          Pruebas
        </button>
        </div>
      }
    </div>
    </DndProvider>
  )
}

export default GameRoom;