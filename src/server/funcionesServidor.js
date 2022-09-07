

var colores = ["rojo", "verde", "azul", "blanco", "negro"]
var simbolos = [0, 1, 2, 3, 4];
const USUARIOS_MAX = 4;
const USUARIOS_MIN = 1;
const FICHAS = crearFichas();
const VERBOSE = true;


function crearFichas(){
	var fichaId = 0;
	var fichas = [];
  	//Instanciar el centro de fichas 
  	for(let x = 0; x< 5; x++) {
	  	for(const clr in colores){
	  		for(const sim in simbolos){
	  			fichas.push({
	  				color: colores[clr],
	  				patron: simbolos[sim],
	  				id: fichaId
	  			})
	  			fichaId++;
	  		}
	  	}
	 }
	return fichas;
}

function clonar(arr){
    return arr.map(x => Array.isArray(x) ? clonar(x) : x)
  }


function nuevoTablero(tamano = 5){
	var tablero = []
  for(var i = 0; i < tamano; i++){ 
  	tablero.push(Array(tamano).fill(null))
  }
  return tablero
}

  // Un nuevo jugador se ha unido a la sala 
  function nuevoJugador(usuarioId){
  	return {usuario:usuarioId, 
				  	canasta: [], 
				  	columnas: null, 
				  	desconexion: null, 
				  	tablero: nuevoTablero(), 
				  	basura: [], 
				  	puntuacion: [0, []]}
  }

function nuevaSala(usuarioId, nombre, pueblo = "otomi", esLocal = false){
  	return {
  		usuarios: [nuevoJugador(usuarioId)], 
  		pueblo: pueblo,
  		local : esLocal,
  		sala: nombre,
  		fichas: [], //Diccionario de fichas
  		fichasCentro: [], // Fichas que se pueden jugar
  		ronda: 0,
  		turno: usuarioId,
  		status: "comienzo",
  		primerTurno: true, //Para manejar requests multiples para terminar una ronda 
  		espera: false //Para manejar desconecciones 
  	}
  }

function indexesToFichas(arr, fichasDict){
	var newArr = []
	for (const f in arr){
		newArr.push(fichasDict[arr[f]])
	}
	return newArr
}

function distribuirFichas(salaActual, primerJugador){
	var idx = 0;
	for(var y = 0; y < salaActual["usuarios"].length; y++){
		if(y == primerJugador){
			for(let x = 0; x < 6; x++){
				idx = Math.floor(Math.random() * salaActual["fichasCentro"].length)
				salaActual["usuarios"][primerJugador]["canasta"].push(salaActual["fichasCentro"].splice(idx, 1)[0]);
			}
		} else {
			for (let x = 0; x < 3; x++) {
	  		idx = Math.floor(Math.random() * salaActual["fichasCentro"].length);
	  		salaActual["usuarios"][y]["canasta"].push(salaActual["fichasCentro"].splice(idx, 1)[0]);
			}
		}
	}
}


function comenzarJuego(salaActual){
	console.log(salaActual)
  salaActual["fichas"] = FICHAS
  if(salaActual["usuarios"].length < USUARIOS_MIN){ 
  	console.log(`La sala ${salaActual[`sala`]} requiere de un minimo de dos jugadores para poder iniciar un juego.`)
  	return; 
  }
  if(salaActual["status"] == "activo"){
  	console.log(`Ya se encuentra un juego en curso en la sala ${salaActual["sala"]}`)
  	return;
  }

  salaActual["status"] = "activo"
  //Instanciar las fichas al centro 
  for (const fich in FICHAS){
  	salaActual["fichasCentro"].push(parseInt(fich))
  }

  		//Distribuir las fechas
  distribuirFichas(salaActual, 0)

	 if(VERBOSE){
	  console.log(salaActual)
	}
	return salaActual
	  	
}


module.exports = {crearFichas, nuevaSala, nuevoJugador, comenzarJuego, clonar, indexesToFichas, distribuirFichas};