const fs = require('./funcionesServidor.js');


const fichas =fs.crearFichas();
var VERBOSE= false; //Poner en true para ver los logs

//Regresa la fila con el indice idx, en un solo array
function sacarFila(arr, idx){
	const ret = []
	for(const fil in arr){
		ret.push(arr[fil][idx])
	}
	return ret
}


//Calcula el numero de fichas dentro de una fila/columna 
//que acuerdan con el subconjunto de la ficha que se coloco. 
function lensubconjunto(arr, ficha){
	var subconjunto = fs.clonar(ficha)
	var subconjuntolen = 0 
	for(var i = 0; i < arr.length; i++){
		var fichaComp = fichas[arr[i]]
		if(fichaComp){
			if(subconjunto.includes(fichaComp["color"])){
				subconjuntolen += 1
				if(!subconjunto.includes(fichaComp["patron"])){
					subconjunto = [fichaComp["color"]]
				}
			} else if(subconjunto.includes(fichaComp["patron"])) {
				subconjuntolen += 1
				subconjunto = [fichaComp["patron"]]
			} else {
				//En cuanto nos topemos con una ficha que no acuerda, dejamos de contar 
				break
			}
		} else {
			return [subconjuntolen, subconjunto]
		}
	}
	return [subconjuntolen, subconjunto]
}


//Calcula cuales subconjuntos verticales existen segun las 
//fichas que fueron bajadas (aquellas que se encuentran en
// las "posiciones"). 
function subconjuntosVerticales(tablero, posiciones){
	//Dentro de cada fila en "subconjuntos" se colocara un tuple que representa
	//El indice de inicio y el indice final del subconjunto. 
	var subconjuntos = [[], [], [], [], []]
	for(const idx in posiciones){
		var pos = posiciones[idx]
		// todas las fichas que se han colocado en esta columna, incluyendo la que se acaba de bajar
		var tab = tablero[pos[0]].slice(0, pos[1])
		const ficha = fichas[tablero[pos[0]][pos[1]]]
		// Se pone al reves para que empezemos a contar desde la ficha que se acaba de bajar
		tab.reverse()
		const subconjunto = lensubconjunto(tab, [ficha["color"], ficha["patron"]])[0]
		if(subconjunto){
			subconjuntos[pos[0]] = [pos[1] - subconjunto, pos[1]]
		}
	}
	return subconjuntos
}


//Calcula cuales subconjuntos horizontales existen segun las 
//fichas que fueron bajadas (aquellas que se encuentran en
// las "posiciones"). 
function subconjuntosHorizontales(tablero, posiciones){
	// Dentro de cada fila en "subconjuntos" se colocaran varios tuples, cada uno 
	// consiste en la posicion de inicio y la posicion final de cada subconjunto en esa fila
	// que incluya una ficha que se acaba de bajar. Por ejemplo, 
	// si la segunda fila del tablero contiene fichas asi: 
	// Rojo, rojo, azul, azul, azul 
	// subconjuntos[1] = [[0, 1], [2, 4]]
	var subconjuntos = [[], [], [], [], []]
	for(const idx in posiciones){
		var pos = posiciones[idx] 
		const fila = sacarFila(tablero, pos[1])
		var visitado = false
		for(const sc in subconjuntos[pos[1]]){
			if(subconjuntos[pos[1]][sc][0] <= pos[0]
				&& subconjuntos[pos[1]][sc][1] >= pos[0]){
				// Si la ficha en esta posicion forma parte de 
				// un subconjunto que ya calculamos, no hay porque
				// volver a calcularlo 
				visitado = true
				break
			}
		}
		const ficha = fichas[tablero[pos[0]][pos[1]]]
		var lenSubconjIzq = [0, []]
		if(!visitado){
			//Calculamos cuantas fichas a la izquierda acuerdan con la ficha que se acaba de bajar
			const tableroIzq = fila.slice(0, pos[0])
			tableroIzq.reverse()
			lenSubconjIzq = lensubconjunto(tableroIzq, [ficha["color"], ficha["patron"]])
			if(lenSubconjIzq[0]){
				subconjuntos[pos[1]].push([pos[0] - lenSubconjIzq[0], pos[0]])
			}
		} 
			//Calculamos cuantas fichas a la derecha acuerdan con la ficha que se acaba de bajar
			var derecho = []
			const tableroDer = fila.slice(pos[0]+1, fila.length)
			if(pos[0] !== tablero[0].length - 1){ //Si no es la ultima ficha en la fila
				var adjacent = fichas[tablero[pos[0]+1][pos[1]]]
				if (adjacent){
					if(lenSubconjIzq[1].includes(adjacent["color"]) || lenSubconjIzq[1].includes(adjacent["patron"])) {
						//En este caso, las fichas del lado izquierdo y del lado derecho de la ficha que se acaba de
						//colocar forman parte del mismo subconjunto 
						derecho = lenSubconjIzq[1]
						var subconjuntoDer = lensubconjunto(tableroDer, derecho)[0]
						if(subconjuntoDer){
							if(subconjuntos[pos[1]].length > 0 ){
								subconjuntos[pos[1]][subconjuntos[pos[1]].length - 1][1] += subconjuntoDer
							} else {
								subconjuntos[pos[1]].push([pos[0], pos[0] + subconjuntoDer])
							}
						}
					} else {
						//En este caso, las fichas del lado izquierdo y del lado derecho de la ficha que se acaba de
						//colocar no forman parte del mismo subconjunto 
						derecho = [ficha["color"], ficha["patron"]]
						if(derecho.includes(adjacent["color"]) || derecho.includes(adjacent["patron"])) {
							subconjuntoDer = lensubconjunto(tableroDer, derecho)[0]
							if(subconjuntoDer){
								subconjuntos[pos[1]].push([pos[0], pos[0] + lensubconjunto(tableroDer, derecho)[0]])
							}
						}
					}
				}
			}
	}
	return subconjuntos
}



//Funcion para bajar filas al finar de una ronda
function bajarFichas(tablero, posiciones){
	var newTablero = fs.clonar(tablero)
	for(const pos in posiciones){
		for(const col in newTablero[pos]){
			if(newTablero[pos][col] === null){
				newTablero[pos][col] = posiciones[pos]
				break
			}
		}
	}
	return newTablero
}



//Calcula los puntos si se bajan las fichas segun los indices en "posiciones"
function calcularPuntos(jugador, posiciones, basura){
	var subconjuntos = [[], []]
	var puntuacionV = 0
	var puntuacionH = 0
	subconjuntos[0] = subconjuntosVerticales(jugador["tablero"], posiciones)
	for(var sc in subconjuntos[0]){
		if(subconjuntos[0][sc].length){
			puntuacionV += 1 + subconjuntos[0][sc][1] - subconjuntos[0][sc][0]
		}
	}
	subconjuntos[1] = subconjuntosHorizontales(jugador["tablero"], posiciones)
	for(var sco in subconjuntos[1]){
		for(var ssc in subconjuntos[1][sco]){
			if(subconjuntos[1][sco][ssc].length){
				puntuacionH += 1 + subconjuntos[1][sco][ssc][1] - subconjuntos[1][sco][ssc][0]
			}
		}
	}

	return [puntuacionH+puntuacionV-basura, subconjuntos]
}



//Esta mega-funcion basicamente solo baja las fichas, calcula segun cuales 
//fueron bajadas cuales subconjuntos se crearon, y saca la puntuacion de 
//la jugada 
function bajarFichasYSacarPuntuacion(salaActual, state, socket = ""){
	if(VERBOSE){
		console.log("Bajando las fichas en la sala. Usuarios en la sala:")
		for(const u in salaActual["usuarios"]){
			console.log(`${u}`)
			console.log(`COLUMNAS: ${salaActual["usuarios"][u]["canasta"]}`)
			console.log(`CANASTA: ${salaActual["usuarios"][u]["canasta"]}`)
		}
	}
	//"primerTurno" es una variable que usaba cuando existia la posibilidad de un juego multiplayer, 
	//se puede ignorar.
	if(!salaActual["primerTurno"] || salaActual["local"]){ //como primerTurno solo es para prevenir requests multiples, siempre es falso en salas locales
  			salaActual["primerTurno"] = false;

  			//Manejo de cada usuario en la sala 
	  		for(const u in salaActual["usuarios"]){
	  			var usuarioActual = salaActual["usuarios"][u]
	  			//Si es el turno de este usuario, se tiene que manualmente actualizar su estado
	  			if(usuarioActual["usuario"] === socket.id || (usuarioActual["usuario"] === salaActual["turno"] && salaActual["local"])){
			  		usuarioActual["canasta"] = []
			  		usuarioActual["columnas"] = state["cols"]
			  		usuarioActual["basura"] = state["basura"]
	  			}

	  			var fichasBajadas = []
	  			var nuevoTablero = fs.clonar(usuarioActual["tablero"])
	  			//Bajamos las fichas
	  			for(const c in usuarioActual["columnas"]){
	  				var colActual = usuarioActual["columnas"][c]
	  				if(colActual[colActual.length - 1] != null){ //si esta llena la columna
	  					usuarioActual["columnas"][c] = Array(colActual.length).fill(null) // Se borra la columna 
	  					if(colActual.length > 1){ //Se regresan las fichas de mas
			  				salaActual["fichasCentro"] = salaActual["fichasCentro"].concat(colActual.slice(1))
			  			}
		  				for(const f in nuevoTablero[c]){ // Se bajan las fichas 
		  					if(nuevoTablero[c][f] === null){
									nuevoTablero[c][f] = colActual[0]
									fichasBajadas.push([parseInt(c), parseInt(f)])
									if(f == nuevoTablero[c].length-1){
		  								salaActual["status"] = "final" // Es el final del juego
									}
									break
								}
		  				}
		  			} 
	  			}
	  			//Sacamos la puntuacion 
	  			usuarioActual["tablero"] = nuevoTablero
	  			const puntos = calcularPuntos(usuarioActual, fichasBajadas, usuarioActual["basura"].length)
	  			usuarioActual["puntuacion"][0] += puntos[0]
	  			usuarioActual["puntuacion"][1] = puntos[1]
	  			salaActual["fichasCentro"] = salaActual["fichasCentro"].concat(usuarioActual["basura"])
	  			usuarioActual["basura"] = []
	  		}

	  		//Vamos a la siguiente ronda, si es que no es el final del juego
		  		salaActual["ronda"] += 1
		  		var primerJugador = salaActual["ronda"]%salaActual["usuarios"].length
			  	salaActual["turno"] = salaActual["usuarios"][primerJugador]["usuario"]
			  	//Distribuimos las fichas 
			  	if(salaActual["status"] !== "final"){
			  		if(VERBOSE){
			  			console.log("Distribuyendo fichas. Canastas antes de distribuir:")
			  			for(const u in salaActual["usuarios"]){
							console.log(`${salaActual["usuarios"][u]["canasta"]}`)
						}
			  		}
			  		fs.distribuirFichas(salaActual, primerJugador)
			  		if(VERBOSE){
			  			console.log("Se distrubyeron las fichas. Canastas despues de distribuir:")
			  			for(const u in salaActual["usuarios"]){
							console.log(`${salaActual["usuarios"][u]["canasta"]}`)
						}
						console.log("Fichas al centro al final de la ronda:")
						console.log(`${salaActual["fichasCentro"]}`)
			  		}
			  	}
	  		return salaActual
	  	} else {
	  		console.log(`ERROR: Ya empezo la siguiente ronda en la sala ${salaActual["sala"]}`)
	  	}
}

module.exports = {calcularPuntos, bajarFichas, bajarFichasYSacarPuntuacion};