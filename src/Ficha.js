import {DndProvider, useDrag, useDrop} from 'react-dnd'
import imagenes_fichas from './Assets/imagenes.js'

const ItemTypes = {
  FICHA: 'Ficha'
}

function sacarImagen(color, simbolo){
  return imagenes_fichas.imagenes_fichas["otomi"][color][simbolo]
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
      <img src={sacarImagen(props.color, props.simbolo)} />
    </div>
  )
}

export default Ficha;