const fs = require('./funcionesServidor.js');
const express = require('express');
const puntuacion = require('./puntuacion.js')
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const port = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname, '../build')));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../build', 'index.html')));

//TODO: Cuando empieze a ser relevante un production environment, voy a tener que ver como mantener 
//La identidad de los jugadores al hacer refresh. Puede ser que no sea gran cosa dependiendo del servidor 
//que decida usar. 

//TODO: Crear nombres aleatorios para las salas de juego

var salas = [];
var desconectados = [];
const USUARIOS_MAX = 4;
const USUARIOS_MIN = 1;
const FICHAS = fs.crearFichas();
const VERBOSE = true;





io.on('connect', (socket) => {
	// Buscar si el socket se desconecto, si si, reconectarlo y sacarlo del array de desconectados
	for(const u in desconectados){
		if(desconectados[u]["usuario"] == socket.id){
			clearTimeout(desconectados[u]["desconectados"])
			console.log(`El cliente ${socket.id} se reconecto al servidor`)
			//Quitar el mensaje de espera de la sala de juego
			salas[desconectados[u]["sala"]]["espera"] = false
		}
		desconectados.splice(u, 1)
	}
  console.log(`El cliente ${socket.id} se conecto al servidor`);

  ////////////////////////////////////////////////////////////////////////////////////////////////
  /// CUANDO SE CREA UNA SALA NUEVA                                                            ///
  ////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on('nueva-sala', (msj) => {
  	console.log(`El cliente ${socket.id} esta tratando a unirse a la sala ${msj}`)
		for (var i = 0; i < salas.length; i++) {
			salaActual = salas[i]
			//Si ya existe la sala, el cliente se une a ella 
		  if (salaActual["sala"] == msj){
		    if(salaActual["usuarios"].length < USUARIOS_MAX && !salaActual["activo"]){
				  for(const u in salaActual["usuarios"]){
				    if(salaActual["usuarios"][u]["usuario"] == socket.id){
				    	console.log(`ERROR: El cliente ${socket.id} ya se encuentra dentro de la sala ${msj}`)
				    	return;
				    }
				  }
				  socket.join(msj);
				  salaActual["usuarios"].push(fs.nuevoJugador(socket.id));
				  console.log(`El cliente ${socket.id} se unio a la sala "${msj}"`);
				  io.to(socket.id).emit('sala-inicializada', salaActual);
				  io.to(msj).emit('nuevo-usuario', salaActual);
				  if(VERBOSE){
				  	console.log(salaActual)
				  }
				  return;
				}
			  console.log(`ERROR: Ya empezo el juego en la sala ${msj}, o esta llena`)
			  io.to(msj).emit('sala-llena');
			  return; 
			}
		} 
  	var nuevaSala = fs.nuevaSala(socket.id, msj);
  	salas.push(nuevaSala);
  	socket.join(msj);
    console.log(`El cliente ${socket.id} creo una nueva sala: "${msj}"`);
    if(VERBOSE){
			console.log(nuevaSala)
		}
    io.to(socket.id).emit('sala-inicializada', salas[salas.length-1]);
  });


  ////////////////////////////////////////////////////////////////////////////////////////////////
  /// CUANDO SE EMPIEZA EL JUEGO                                                               ///
  ////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on('comenzar-juego', (sala) =>{
  	console.log(`El cliente ${socket.id} intento comenzar el juego en la sala ${sala}.`)

  	//Buscar la sala
  	var i = 0;
  	while(i < salas.length && salas[i]["sala"] != sala){
  		i++;
  	} 

  	if(i != salas.length){
  		salaActual = fs.comenzarJuego(salas[i])
  		console.log(`El cliente ${socket.id} comenzo el juego en la sala ${sala}.`)
	  	io.to(salaActual["sala"]).emit('juego-inicializado', salaActual);
	 } else {
	 	console.log(`ERROR: No existe la sala ${sala}.`)
	 	if(VERBOSE){
	 		console.log(`SALAS ACTUALES: ${salas}`)
	 	}
	 } 
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////
  /// CUANDO SE HACE UNA JUGADA                                                                ///
  ////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on('jugada', (sala, state) =>{
  	console.log(`El jugador ${socket.id} intento hacer una jugada en la sala ${sala}`)
  	if(VERBOSE){
  		console.log(state)
  	}
  	var i = 0;

  	// Buscar la sala 
  	while(i < salas.length && salas[i]["sala"] != sala){
  		i++;
  	} 
  	if(i != salas.length){
  		var salaActual = salas[i]
  		//Buscar el jugador
  		var u = 0
  		while(u < salaActual["usuarios"].length && salaActual["usuarios"][u]["usuario"] != socket.id){
  			u++
  		}
  		if(u != salaActual["usuarios"].length){
  			usuarioActual = salaActual["usuarios"][u]
  			salaActual["primerTurno"] = false //Para prevenir requests multiples
  			if(salaActual["turno"] == usuarioActual["usuario"]){
		  		usuarioActual["canasta"] = []
		  		usuarioActual["columnas"] = state["cols"]
		  		usuarioActual["basura"] = state["basura"] 

		  		var siguiente = u + 1 //El siguiente jugador
		  		if(u == salaActual["usuarios"].length-1){
		  			siguiente = 0
		  		} 

		  		//Se pasan las fichas que estan en la canasta
		  		for(const f in state["fichasEnCanasta"]){
		  			salaActual["usuarios"][siguiente]["canasta"].push(state["fichasEnCanasta"][f])
		  		}
		  		salaActual["turno"] = salaActual["usuarios"][siguiente]["usuario"]
		  		console.log(`El jugador ${socket.id} logro hacer una jugada en la sala ${sala}`)
		  		if(VERBOSE){
		  			console.log(usuarioActual["tablero"])
		  			console.log(salaActual)
		  		}
			  	io.to(sala).emit('hacer-jugada', salaActual)
			  } else {
			  	console.log(`ERROR: No es el turno del jugador ${socket.id} en cuarto ${sala} - es el turno de ${usuarioActual}`)
			  }
	  	} else{
	  		console.log(`ERROR: No se encontro el jugador ${socket.id} en cuarto ${sala}`)
	  	}
	 } else {
	 	console.log(`ERROR: No existe la sala ${sala}`)
	 } 
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////
  /// CUANDO SE ACABA LA RONDA                                                                 ///
  ////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on('ronda', (sala, state) =>{
  	console.log(`Jugador ${socket.id} intento acabar la ronda en cuarto ${sala}`)
  	var i = 0;
  	finalDelJuego = false

  	//Buscar la sala 
  	while(i < salas.length && salas[i]["sala"] != sala){
  		i++;
  	} 
  	if(i != salas.length){
  		salaActual = salas[i]
  		salaActual = puntuacion.bajarFichasYSacarPuntuacion(salaActual, state, socket)

	  	if(!salaActual["activo"]){
	  			console.log(`Jugador ${socket.id} acabo el juego en cuarto ${sala}`)
	  			io.to(sala).emit('final', salaActual)
	  	} else {
	  			console.log(`Jugador ${socket.id} logro acabar la ronda en cuarto ${sala}`)
			  	io.to(sala).emit('siguiente-ronda', salaActual)
			}
	 } else {
	 	console.log(`ERROR: No existe la sala ${sala}`)
	 } 
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////
  /// CUANDO SE DESCONECTA UN USUARIO                                                          ///
  ////////////////////////////////////////////////////////////////////////////////////////////////
  socket.on('disconnect', (reason) => {
  	console.log(`Se desconecto el usuario ${socket.id}, razon: ${reason}`)
  	//Buscar la sala del jugador 
  	for(const r in salas){
  		var salaActual = salas[r]
  			for(const u in salaActual["usuarios"]){
  				if(salaActual["usuarios"][u]["usuario"] == socket.id){
  					usuarioActual = salaActual["usuarios"][u]
  					console.log(`Desconeccion: ${socket.id} estaba en la sala ${salaActual["nombre"]}`)
  					salaActual["espera"] = true
  					io.to(salaActual["nombre"]).emit('en espera', salaActual)
  					desconectados.push([{sid: socket.id, desconectados: null, sala: salaActual["roomname"]}])

  					//Si pasa el timeout, reorganizar los jugadores
  					desconectados[desconectados.length-1]["desconectados"] = setTimeout(() => {
  						salaActual["espera"] = false;
  						if(salaActual["usuarios"].length > 2 || !salaActual["activo"]){
  							if(salaActual["turno"] == socket.id){
  								if(parseInt(u) >= salaActual["usuarios"].length-1){
  									salaActual["turno"] = salaActual["usuarios"][0]["usuario"]
  								} else {
  									if(VERBOSE){
	  									console.log(`Se desconecto el usuario en posicion ${u} de los jugadores`);
  										console.log(`Sala actual: ${salaActual["usuarios"]}`)
  										console.log(`Turno siguiente: ${parseInt(u)+1}`)
  									}
  									salaActual["turno"] = salaActual["usuarios"][parseInt(u)+1]["usuario"]
  								}
  								console.log(`El siguiente turno es el de: ${salaActual["turno"]}`)
  							}
  							salaActual["usuarios"].splice(u, 1) //quitar el jugador
  							io.to(salaActual["nombre"]).emit('desconeccion de jugador', salaActual)
  							return;
  						} else {
  							salaActual["activo"] = false;
  							io.to(salaActual["nombre"]).emit('desconeccion de jugador', salaActual)
  							return;
  						}
  						return;
  					}, 6000) // El timeout es de 6000 segundos
  					return; 
  				}
  			}	
  		}
  });
});

http.listen(port, () => console.log(`Socket.IO server running at http://localhost:${port}/`));