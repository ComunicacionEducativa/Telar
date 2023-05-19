import imagenes_fichas from './Assets/imagenes.js'


//Function para sacar la imagen de ./Assets/ que corresponde a 
//cada ficha
function sacarImagen(color, simbolo, pueblo){
  return imagenes_fichas.imagenes_fichas[pueblo][color][simbolo]
}

//Una ficha
function Ficha(props){
  return(
    <div
      className="ficha"
      style={props.style}
      onClick = {props.onclick}>
      <img src={sacarImagen(props.color, props.simbolo, props.pueblo)} alt={props.simbolo +", " +props.color}/>
    </div>
  )
}

export default Ficha;