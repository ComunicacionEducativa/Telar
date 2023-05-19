import React from 'react';
import Tablero from './Tablero'
import Ficha from './Ficha'
import imagenes_fichas from './Assets/imagenes.js'


//si VERBOSE=true, se imprimen los logs 
var VERBOSE = false;

//JSX/HTML de la Canasta
function Canasta(props){
  return(
    <div className="canasta"> 
      <div className="fichas">
        {props.fichas}
        </div>
    </div>
  )
}


//JSX/HTML de la Basura
function Basura(props){
  return(
    <div className="basura" onClick = {() => props.tirarFicha(props.ficha)}>
      <div className="fichas">
        {props.fichas}
      </div>
    </div>
  )
}

//////////////////
/// EL JUGADOR //
/////////////////
class Jugador extends React.Component{
  constructor(props) {
    if(VERBOSE){
      console.log("Construyendo el jugador ...")
    }
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

    //Informacion acerca de las opacities de las fichas (para la interfaz de usuario)
    const ops = Array(5)
    ops[0] = Array(3).fill(false)
    ops[1] = Array(2).fill(false)
    ops[2] = Array(1).fill(false)
    ops[3] = Array(2).fill(false)
    ops[4] = Array(3).fill(false)

    this.state = {
      fichaElegida: null,
      fichasEnCanasta: enCanasta,
      tablero: Array(25).fill(null),
      basura: [],
      cols: columnas,
      opacities: ops,
      error: "",
      subset: [], 
    }

  }

  //Cada vez que hay un cambio en la sala, es decir cada vez que se hace una jugada, se requiere
  //esta funcion para que TODOS los jugadores se actualizen al estado actual del juego. 
  componentDidUpdate(prevProps){
    if(this.props !== prevProps){
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


  /////////////////////////////////////////////
  //////////// FUNCIONES BASICAS //////////////
  // Estas funciones sirven para apoyar las ///
  // demas funciones, y no representan en si///
  // las acciones del jugador.               //
  /////////////////////////////////////////////

  //Esta funcion basicamente solo regresa o True o False dependiendo si la 
  //ficha cabe dentro de un subconjunto 
  acuerda(ficha, subset = this.state.subset){
    return(subset.includes(ficha["patron"]) || subset.includes(ficha["color"]));
  }

  //Para clonar las columnas
  clonar(arr){
    return arr.map(x => Array.isArray(x) ? this.clonar(x) : x)
  }

  // Regresa todas las fichas en la canasta que acuerdan con un subconjunto (se llama
  // dentro del codigo para tirar fichas)
  fichasEnSubconjunto(sj){
    var ctr =[]
    for(const f in this.state.fichasEnCanasta){
      if(this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["patron"]=== sj || this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["color"]=== sj){
        ctr.push(this.state.fichasEnCanasta[f])
      }
    }
    return ctr
  }

  //Sacar el subconjunto de una columna, o sea cuales fichas posiblemente podrian
  //caber dentro de ella. Regresa una array vacia si no caben mas fichas, o si
  //la columna esta vacia
  getSubset(col){
    //Cada ficha tiene un indice, "fichasKey[indice]" regresa una representacion
    //de la ficha que tiene tal indice
    var fichasKey = this.props.sala["fichas"] 
    if(col[0]!==null){
      var subset = [fichasKey[col[0]]["color"], fichasKey[col[0]]["patron"]]
      for(const f in col){
        if(col[f]!==null){
          if(subset.includes(fichasKey[col[f]]["color"])){
            if(subset.length > 1 && !subset.includes(fichasKey[col[f]]["patron"])){
              subset = [fichasKey[col[f]]["color"]]
            }
          } else if (subset.includes(fichasKey[col[f]]["patron"] )) { 
            subset = [fichasKey[col[f]]["patron"]]
          } else { // No deberia occurrir
            if(VERBOSE){
              console.error(`Columna ${col} no fue construida bien`)
            }
            return []
          }
        } else {
          return subset
        }
      }
      return [] //Esta llena la columna 
    } else {
      return [] //Esta completamente vacia la columna
    }
  }

  //Esta funcion quita las fichas ya colocadas sobre las columnas. Se 
  //llama principalmente cuando el jugador hace clic en "deshacer" o 
  //cuando selecciona un subconjunto diferente
  borrarColumnas(){
    if(VERBOSE){
      console.log("Borrando las columnas ...")
    }
    const enCanasta = []
    //La canasta regresa a su posicion de inicio 
    const misFichas = this.props.sala["usuarios"][this.props.jugador]["canasta"]
    for(const ficha in misFichas){
      enCanasta.push(misFichas[ficha])
    }
    //Columnas 
    const columnas = new Array(5)
    for(const col in this.state.cols){
      columnas[col] = Array(this.state.cols[col].length).fill(null)
      for(const f in this.state.cols[col]){
        if(!misFichas.includes(this.state.cols[col][f])){
          //Solo borrar las fichas que se bajaron en este turno
          columnas[col][f] = this.state.cols[col][f]
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

    this.setState({cols: columnas, basura: newBasura, subset: [], fichasEnCanasta: enCanasta, error: ""})
    this.mostrarColumnasPosibles(this.state.fichaElegida, columnas)
    return columnas
  }


  //////////////////////////////////////////////
  //////////// FUNCIONES DEL JUEGO /////////////
  // Estas funciones representan las acciones //
  // del jugador, en general se llaman cuando //
  // el jugador hace clic sobre un boton, etc //
  //////////////////////////////////////////////

  //Esta funcion se llama cada vez que el jugador elige una ficha dentro de su canasta
  elegirSubconjunto(ficha){
    this.setState({fichaElegida: ficha})
    var subsetlen = this.state.subset.length
    var columnas = null
    if(VERBOSE){
      console.log(`ficha seleccionada: ${ficha["color"]}, ${ficha["patron"]},  indice: ${ficha["id"]}`)
    }
    // Si no se ha eligido una ficha o si la ficha no acuerda con el subconjunto actual
    if(subsetlen === 0 || !this.acuerda(ficha)){
      if(VERBOSE){
        console.log(`O no se eligio una ficha, o no acuerda!`)
      }
      if(!this.acuerda(ficha)){ 
        columnas = this.borrarColumnas() // Si es que no acuerda, se quitan las fichas la colocadas
      } 
      this.setState({subset: [ficha["color"], ficha["patron"]]})
    } else {
      if(subsetlen === 2){ 
        if(this.state.subset.includes(ficha["patron"])){
          if(!this.state.subset.includes(ficha["color"])){ //Si NO son identicas
              this.setState({subset: [ficha["patron"]]})
          }
        } else { //Como concuerdan, no se tiene que checar si tienen el mismo color
          this.setState({subset: [ficha["color"]]})
        } 
      } else if (subsetlen === 1){
        this.mostrarColumnasPosibles(ficha, columnas);
        return; //no hay nada mas que hacer
      } else {
        if(VERBOSE){
          console.error(`ERROR App.js 184 - Un subconjunto debe tener maximo dos caracteristicas (un color, un patron). El subconjunto actual: ${this.state.subset}`);
        }
      }
    }
    this.mostrarColumnasPosibles(ficha, columnas);
    return ficha
  }

  //Esta funcion es llamada cada vez que un jugador intenta colocar una ficha dentro de una columna. 
  ponerFicha(col, ficha){
    if (ficha){
      //Si esta vacia la columna O si la ficha cabe dentro del subconjunto actual de la columna
      if(this.state.cols[col][0] == null || this.acuerda(ficha, this.getSubset(this.state.cols[col]))){
        const len = this.state.cols[col].length
        const newCol = this.clonar(this.state.cols)
        const newCanasta = this.state.fichasEnCanasta.slice()
        let fil = 0
        //Buscamos la posicion de la ficha
        while(fil < len && this.state.cols[col][fil]!==null){
          fil++
        }
        const idx = this.props.sala["fichas"].findIndex(x => x === ficha)
        if(VERBOSE){
          console.log(`Colocando en columna ${col} en posicion ${fil}, columna actual: ${this.state.cols[col]} `)
        }
        newCol[col][fil] = idx //Se coloca la ficha en la columna
        this.borrarOps() //Se borra la interfaz de usuario
        newCanasta.splice(this.state.fichasEnCanasta.findIndex(x => x === idx), 1) //Se quita la ficha de la canasta
        this.setState({
          fichaElegida: null,
          cols: newCol,
          fichasEnCanasta: newCanasta,
          error: ""
        })
      } else {
        this.setState({error:<div class = "error"><p>No se pudo colocar la ficha - la ficha debe acordar con el patron o color del resto de las fichas en la columna, y la columna no puede estar llena.</p></div>})
      }
    } else {
      if(VERBOSE){
        console.error("No se selecciono una ficha")
      }
    }
  }

  // La funcion recursiva que sirve para ver si es posible
  // desechar una ficha. Si existe una jugada posible, 
  // la funcion regresa una lista de las columnas donde 
  // se deberian colocar fichas para hacer completar jugada. 
  tirarFichaRecurs(canasta, columnas){
    var jugada
    if(canasta.length === 0){ 
      return []
    } else {
      for(const f in canasta){
        for(const col in columnas){
          // Basicamente lo que esta ocurriendo aqui es que se esta intentando colocar 
          // cualquier ficha posible dentro de las columnas, y luego se intenta de hacer una 
          // jugada partiendo desde ahi. Si existe una jugada posible, entonces no es 
          // posible desechar fichas. 
          if(columnas[col][0] == null || this.acuerda(this.props.sala["fichas"][canasta[f]], this.getSubset(columnas[col]))) {
            const len = columnas[col].length
            const newCol = this.clonar(columnas)
            const newCanasta = canasta.slice()
            let fil = 0
            while(fil < len && columnas[col][fil]!==null){
              fil++
            }
            if(fil !== len){ 
              newCol[col][fil] = canasta[f]
              newCanasta.splice(f, 1)
            }
            jugada = this.tirarFichaRecurs(newCanasta, newCol)
            if(jugada.length > 0){
              if(jugada[0] !== -1){
                jugada.push(col)
                return jugada
              }
            } else {
              //Este es el caso mas basico - la canasta contiene solo una 
              //ficha, y esta ficha cabe dentro de la columna [col]
              return [col]
            }
          }
        }
      }
    }
    return [-1]
  }

  // Cuando se intenta desechar una ficha 
  tirarFicha(ficha){
    if(ficha){
      //Intentamos hacer una jugada con cada ficha que aun queda en la canasta 
      for(const f in this.state.fichasEnCanasta){
        // Un subconjunto de fichas del mismo color
        var subconj1 = this.fichasEnSubconjunto(this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["color"])
        var jugada1 = this.tirarFichaRecurs(subconj1, this.state.cols)
        var fichaImg = imagenes_fichas.imagenes_fichas[this.props.sala["pueblo"]][this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["color"]][this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["patron"]]
        var color = this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["color"]
        if(jugada1[0] !== -1){
          this.setState({error: <div class = "error"> <p>Aun existe una jugada posible.</p><p>Intenta colocar las fichas de este color: <img src={fichaImg} alt={"Una ficha de color " + color}/></p></div>})
          return 
        } else {
          // Un subconjunto de fichas del mismo patron - si no se puede hacer una jugada partiendo de un subconjunto de fichas 
          // del mismo color
          var subconj2 = this.fichasEnSubconjunto(this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["patron"])
          var jugada2 = this.tirarFichaRecurs(subconj2, this.state.cols)
          var patron = this.props.sala["fichas"][this.state.fichasEnCanasta[f]]["patron"]
          if(jugada2[0] !== -1){
             this.setState({error: <div class = "error"> <p>Aun existe una jugada posible.</p><p>Intenta colocar las fichas de este diseño: <img src={fichaImg} alt ={"Una ficha de patron " + patron}/></p></div>})
            return 
          }
        }
      }

      //Si llegamos a este punto, ya no existen mas jugadas posibles, y se tira la ficha a la basura
      var newBasura = this.clonar(this.state.basura);
      const idx = this.props.sala["fichas"].findIndex(x => x === ficha)
      newBasura.push(idx)
      var newCanasta = this.state.fichasEnCanasta.slice()
      newCanasta.splice(this.state.fichasEnCanasta.findIndex(x => x === idx), 1)
      this.setState({basura: newBasura, fichasEnCanasta: newCanasta, error: '', fichaElegida: null})
    } else {
      if(VERBOSE){
        console.error("No se pudo tirar: no se selecciono una ficha")
      }
    }
  }


  //Esta funcion se llama si se hizo clic en "hacer jugada" y 
  //se hizo una jugada legal. Calcula si se ha acabado una ronda o no. Si no, 
  //llama la funcion de "hacerJugada" que se encuentra en Sala.js. Si si,
  //llama la funcion de "acabarRonda", que tambien se encuentra en Sala.js
  hacerJugada(){
    const usuario = this.props.sala["usuarios"][this.props.jugador]["usuario"]
    this.borrarOps() //Reset la interfaz del usuario

    if(this.state.fichasEnCanasta.length){ 
      if(VERBOSE){
        console.log("Jugador haciendo jugada ...")
      }
      this.props.hacerJugada(this.state)
    } else { // Si no quedan fichas en canasta pero el otro si tiene 
      for(const u in this.props.sala["usuarios"]){
        if(this.props.sala["usuarios"][u]["usuario"] !== usuario && this.props.sala["usuarios"][u]["canasta"].length){
          if(VERBOSE){
            console.log("Jugador haciendo jugada ...")
          }
          this.props.hacerJugada(this.state)
          return 
        }
      }
      //Si no quedan fichas en ni una canasta, se acaba la ronda 
      this.props.acabarRonda(this.state)
      if(VERBOSE){
        console.log("Se acabo la ronda ... ")
      }
    }
  }


  //////////////////////////////////////////////
  //// FUNCIONES DE LA INTERFAZ DE USUARIO /////
  // Estas funciones sirven para cambiar la   //
  // aparencia del juego.                     //
  //////////////////////////////////////////////

  //Borra la informacion de las opacities 
  //en las columnas que se~nalan donde aun 
  //caben fichas 
  borrarOps(){
    const ops = Array(5)
    ops[0] = Array(3).fill(false)
    ops[1] = Array(2).fill(false)
    ops[2] = Array(1).fill(false)
    ops[3] = Array(2).fill(false)
    ops[4] = Array(3).fill(false)
    this.setState({opacities: ops})
  }

  // Se~nala dentro de cuales columnas se puede 
  // colocar la ficha que fue seleccionada 
  mostrarColumnasPosibles(ficha, columnas){
    var cols 
    if(columnas !== null){
       cols = this.clonar(columnas)
    } else {
       cols = this.clonar(this.state.cols)
    }
    var currCol
    const nuevasOps = Array(5);
    for(const col in cols){
      currCol = cols[col]
      nuevasOps[col] = Array(cols[col].length).fill(false)
      if(ficha!==null){
        if(currCol[0] == null ||
          (this.acuerda(ficha, this.getSubset(currCol)))) {
          for(const f in cols[col]){
            if(cols[col][f] == null){
              nuevasOps[col][f] = true // Caben fichas dentro de esta columna 
              break
            }
          }
        } 
      } 
    }
    this.setState({opacities: nuevasOps})
  }


  //Esta funcion crea el boton de "hacer jugada"
  //Determina si es posible hacer una jugada 
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

    //Si la jugada es posible .... 
    if(this.state.subset.length > 0 ){ 
      if(quedanFichas.length > 0 ){
        if(quedanFichas.reduce((x, y) => x || y)){
          style = {};
          onClick= ()=>this.hacerJugada()
        }
      } else {
        onClick= ()=>this.hacerJugada()
      }
    }

    return(<button style = {style} onClick={onClick}>Hacer jugada</button>)
  }

  //El JSX/HTML para las fichas 
  renderFicha(ficha, op = true){
    if(ficha){
      var funcionOnclick = () => void 0
      if(this.state.fichasEnCanasta.includes(ficha["id"]) && this.props.status === "activo"){
        //Solo se pueden hacer clic en las fichas que estan en la canasta del jugador actual
        funcionOnclick = () => this.elegirSubconjunto(ficha)
      }
      let style = {}
      if(op){
        if(this.state.fichaElegida === ficha){
          style = {border: '2px solid black'}
        }
      } else {
        //Las fichas que no caben dentro del subconjunto actual
        style = {opacity: "50%"}
      }
      let simbolo = ficha["patron"]
      return(<Ficha fichaItem = {ficha}
                    style = {style}
                    color = {ficha["color"]}
                    pueblo = {this.props.sala["pueblo"]}
                    key = {ficha["id"]}
                    simbolo = {simbolo}
                    onclick= {funcionOnclick}  />)
    } else {
      return null
    }
  }


  //El JSX/HTML para el boton de "hacer jugada"
  renderGoButton(){
    if (this.props.sala["usuarios"][this.props.jugador]["usuario"] === this.props.sala["turno"]){
        return this.goButtonOnClickFunction()
      }
    return(<button style = {{opacity: "50%"}} onClick={() => alert("No es tu turno")}>Hacer jugada</button>)
  }

  //El JSX/HTML para el boton de "deshacer"
  renderUndoButton(){
    return(<button onClick = {() => this.borrarColumnas()}> Deshacer </button>)
  }

  //El JSX/HTML para la canasta
  renderCanasta(){
    const fich = []
    for (const ficha in this.state.fichasEnCanasta){
      var fichaActual = this.state.fichasEnCanasta[ficha]
      if (this.state.subset.length === 0 || this.acuerda(this.props.sala["fichas"][fichaActual])) { 
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
    if(this.props.sala["status"] === "activo" || this.props.sala["status"] === "final"){
      return(<Tablero 
                      ficha = {this.state.fichaElegida} 
                      puntuacion = {this.props.sala["usuarios"][this.props.jugador].puntuacion[1]}
                      cols = {columnas(this.state.cols)} ponerFicha = {(c, f) => this.ponerFicha(c, f)} 
                      opacities = {this.state.opacities}
                      tableroFichas = {columnas(this.state.tablero)}/>)
    } else {
      return(<Tablero ficha = {this.state.fichaElegida} cols = {this.state.cols} opacities = {this.state.opacities} tableroFichas = {null}/>)
    }
  }

  //JSX/HTML del jugador (tablero, basura, y canasta)
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

  //El JSX/HTML del jugador y los botones de deshacer/hacer jugada
  render(){
    var cls = "botones-y-jugador"
    var mostrarBotones = (this.props.sala["usuarios"][this.props.jugador]["usuario"] === this.props.sala["turno"])
    var botones = [this.renderGoButton(), this.renderUndoButton()]
    if(this.props.sala["usuarios"][this.props.jugador]["usuario"] === this.props.sala["turno"] && this.props.sala["status"] !== "final"){
      cls = "botones-y-jugador jugador-actual"
    }
    if(mostrarBotones && (this.props.sala["status"] === "activo")){
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
      if(this.props.sala["status"] === "final"){
        if(this.props.ganador){
          return(<div class = {"ganador " + cls}>{this.renderJugador()}<h2>¡Ganador!</h2></div>)
        }
        
      } 
      return(<div class = {cls}> {this.renderJugador()}</div>)
    }
  }
}

export default Jugador;