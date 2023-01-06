import imagenes_tutorial from './Assets/imagenes.js'

function Tutorial(){
  return(<div>
    <p>Telar es un juego para 2-4 jugadores, donde la meta es combinar fichas según su color o diseño para llegar a la puntuación más alta. Cada jugador tiene su proprio telar. </p>
    <p><b>Ejemplo 1:</b> Tras hacer click en el botón de "comenzar", se le otorgan seis piezas al primer jugador, y tres a todos los demás jugadores. </p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion1"]} alt = "Imagen del juego, mostrando como se dan las fichas"/>
    <p><b>Ejemplo 2:</b> El jugador 1 elige un color o diseño, y coloca <b>todas</b> las fichas del color o diseño que eligió en la parte superior de su telar. En el ejemplo 2, el jugador 1 seleccionó tres fichas con el mismo diseño.  </p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion2"]}  alt = "Imagen mostrando una seleccion de tres fichas del mismo diseño"/>
    <p>En el ejempo 2, el jugador pudo colocar las fichas en cualquier columna. Sin embargo, en turnos más avanzados, solo se pueden colocar las fichas si tienen o el mismo color o el mismo diseño al de las fichas ya colocadas en la columna. La siguiente ilustración ejemplifica las reglas para colocar fichas. En la primera columna, las dos fichas tienen el mismo color. En la segunda, tienen el mismo diseño. En la cuarta fila, las fichas fueron mal colocadas - no tienen ni el mismo color ni el mismo diseño. En la quinta, también fueron mal colocadas - a pesar de que dos fichas tienen el mismo diseño, y dos el mismo color, no se cumple el requisito de que <b>todas</b> las fichas de la columna tengan el mismo color o diseño. En otras palabras, todas las fichas deben compartir <b>un solo</b> diseño o color. </p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion22"]} alt = "Imagen mostrando como colocar las fichas."/>
    <p><b>Ejemplo 3:</b> Después de haber colocado las fichas sobre el telar, el jugador 1 hace click en el botón de "hacer jugada". Se pasan las fichas que no fueron seleccionadas al siguiente jugador. Ahora el siguiente jugador hace lo mismo, colocando fichas de un solo color o diseño sobre su telar (en este caso, el jugador 2 eligió las fichas de color azul).</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion3"]} alt = "Imagen del juego tras hacer click en el boton de hacer jugada"/>
    <p><b>Ejemplo 4:</b> Se siguen pasando las fichas hasta que se acaben las fichas de los dos jugadores. Cuando un jugador haga click en el botón de "hacer jugada" sin tener más fichas en su canasta, se bajan las fichas de <b>más abajo</b> de todas las <b>columnas completas</b> del telar. De izquierda a derecha, en la primera columna caben tres fichas, en la segunda dos, en la tercera una, en la cuarta dos, y en la quinta tres.</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion4"]} alt = "Imagen mostrando cuales fichas se bajaran al final de la ronda"/>
    <p><b>Ejemplo 5:</b> Por cada ficha que se bajó que concuerde con el color o diseño de otra ficha justo al lado o debajo de ella, se cuentan el numero de fichas sucesivas del mismo color/diseño, incluyendo la que se acaba de bajar, y ese numero se suma a la puntuación del jugador.</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion5"]} alt="Imagen mostrando la puntuacion"/>
    <p>Si en cualquier punto no se puede hacer una jugada, siendo cuando no hayan columnas que concuerden con el color o diseño de una ficha en la canasta de un jugador, el jugador debe desechar la ficha, y se resta la cantidad de fichas desechadas de la puntuación del jugador.</p>
    <img style={{width:"50%"}} src = {imagenes_tutorial.imagenes_tutorial["instruccion7"]} alt ="Imagen mostrando una ficha que no queda en las columnas siendo desechada"/>
    <p>Para mejor entender el sistema de puntuación, observe la siguiente imagén, mostrando un solo jugador tras tres rondas sucesivas del juego. No es necesario calcular los puntos uno mismo, ya que el programa lo hace automaticamente: </p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion52"]} alt="Imagen mostrando la puntuacion a mas detalle."/>
    <p><b>Ejemplo 6:</b> El juego acaba cuando un jugador logre llenar una columna de su telar. ¡El jugador con la puntuación más alta es el ganador!</p>
    <img src = {imagenes_tutorial.imagenes_tutorial["instruccion6"]} alt="Una imagen mostrando el final del juego" />
    <p></p>


    </div>)

}

export default Tutorial;