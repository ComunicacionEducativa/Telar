import React from 'react';
import ItemTypes from './ItemTypes'

//TODO: FIND A WAY TO MAKE THESE IMPORTS BETTER
import v2_i from './Assets/vara1_izq.png';
import v02 from './Assets/vara1_5.png';
import v12 from './Assets/vara1_4.png';
import v22 from './Assets/vara1_3.png';
import v32 from './Assets/vara1_2.png';
import v42 from './Assets/vara1_1.png';
import v2_d from './Assets/vara1_der.png';

import v01 from './Assets/vara2_izq.png';
import v11 from './Assets/vara2_3.png';
import v21 from './Assets/vara2_2.png';
import v31 from './Assets/vara2_1.png';
import v41 from './Assets/vara2_der.png';

import v0_i from './Assets/enjulio_sup_izq.png';
import v00 from './Assets/enjulio_sup_5.png';
import v10 from './Assets/enjulio_sup_4.png';
import v20 from './Assets/enjulio_sup_3.png';
import v30 from './Assets/enjulio_sup_2.png';
import v40 from './Assets/enjulio_sup_1.png';
import v0_d from './Assets/enjulio_sup_der.png';

import e_i from './Assets/enjulio_bajo_izq.png';
import e from './Assets/enjulio_bajo.png';
import e_d from './Assets/enjulio_bajo_der.png';

const TAMANO_SQUARE = 40;


function Square(props) {
  return (
    <div className="square telarsquare" style = {props.style}>
      {props.subconjunto}
      {props.value}
    </div>
  );
}


function ColSquare(props) {
  var classname = props.valido ? "square col-square valido" :"square col-square" 
  return (
    <div style={{backgroundImage: `url(${props.image})`}} className={classname} onClick = {props.onclick}>
      {props.value}
    </div>
  )
};


function Subconjunto(props){
  return(
    <div className="subconjunto" style={{width:props.width, height:props.height, left:props.left, bottom:props.bottom}}></div>
  );
}

//Boards for each individual player 
class Tablero extends React.Component {
  constructor(props) {
    super(props);
  }

  renderSquare(i) {
    if(this.props.tableroFichas){
      return (
          <Square
            value={this.props.tableroFichas[i]}
          />
        );
    } else {
      return (
        <Square
          value={null}
        />
      );
    }
  }

  renderColSquare(col, fil, img) {
    return (
      <ColSquare
        value={this.props.cols[col][fil]}
        valido = {this.props.opacities[col][fil]}
        onclick = {() => this.fichaEnColumna(col, this.props.ficha)}
        ondrop = {(f) => this.dndFichaEnColumna(col, f)}
        image = {img}
      />
    );
  }

  fichaEnColumna(col, ficha){
    this.props.ponerFicha(col, ficha)
  }

  dndFichaEnColumna(col, ficha){
    this.props.dndFicha(col, ficha)
  }

  sacarPuntuacion(){
    var puntos = Array()
    if(this.props.puntuacion){
      for(const sc in this.props.puntuacion[0]){
        puntos.push(<Subconjunto 
                        width={TAMANO_SQUARE}
                        height={(parseInt(this.props.puntuacion[0][sc][1]) + 1 -parseInt(this.props.puntuacion[0][sc][0])) * TAMANO_SQUARE}
                        left = {TAMANO_SQUARE+(sc * TAMANO_SQUARE)}
                        bottom = {TAMANO_SQUARE+(parseInt(this.props.puntuacion[0][sc][0])* TAMANO_SQUARE)} />)
      }
      for(const fila in this.props.puntuacion[1]){
        for(const sc in this.props.puntuacion[1][fila]){
          puntos.push(<Subconjunto 
                        width={(parseInt(this.props.puntuacion[1][fila][sc][1]) + 1 -parseInt(this.props.puntuacion[1][fila][sc][0])) * TAMANO_SQUARE}
                        height={TAMANO_SQUARE}
                        left = {TAMANO_SQUARE + (parseInt(this.props.puntuacion[1][fila][sc][0]) * TAMANO_SQUARE)}
                        bottom = {TAMANO_SQUARE + (TAMANO_SQUARE*fila)} />)
        }
      }
    }
    return puntos
  }

  render() {
    //todo: there's gotta be a better way than this 
    return (
      <div className="tablero">
        {this.sacarPuntuacion()}
        <div className="board-row">
          <div class="square" style={{backgroundImage: `url(${v2_i})`}}></div>
          {this.renderColSquare(0, 2, v02)}
          <div class="square" style={{backgroundImage: `url(${v12})`}}></div>
          <div class="square" style={{backgroundImage: `url(${v22})`}}></div>
          <div class="square" style={{backgroundImage: `url(${v32})`}}></div>
          {this.renderColSquare(4, 2, v42)}
          <div class="square" style={{backgroundImage: `url(${v2_d})`}}></div>
        </div>
        <div className="board-row">
          <div class="square"> </div>
          {this.renderColSquare(0, 1, v01)}
          {this.renderColSquare(1, 1, v11)}
          <div class="square" style={{backgroundImage: `url(${v21})`}}></div>
          {this.renderColSquare(3, 1, v31)}
          {this.renderColSquare(4, 1, v41)}
        </div>
        <div className="board-row">
          <div class="square" style={{backgroundImage: `url(${v0_i})`}}></div>
          {this.renderColSquare(0, 0, v00)}
          {this.renderColSquare(1, 0, v10)}
          {this.renderColSquare(2, 0, v20)}
          {this.renderColSquare(3, 0, v30)}
          {this.renderColSquare(4, 0, v40)}
          <div class="square" style={{backgroundImage: `url(${v0_d})`}}></div>
        </div>
        <div className="board-row">
          <div class="square"> </div>
          {this.renderSquare(4)}
          {this.renderSquare(9)}
          {this.renderSquare(14)}
          {this.renderSquare(19)}
          {this.renderSquare(24)}
        </div>
        <div className="board-row">
          <div class="square"> </div>
          {this.renderSquare(3)}
          {this.renderSquare(8)}
          {this.renderSquare(13)}
          {this.renderSquare(18)}
          {this.renderSquare(23)}
        </div>
        <div className="board-row">
          <div class="square"> </div>
          {this.renderSquare(2)}
          {this.renderSquare(7)}
          {this.renderSquare(12)}
          {this.renderSquare(17)}
          {this.renderSquare(22)}
        </div>
        <div className="board-row">
          <div class="square"> </div>
          {this.renderSquare(1)}
          {this.renderSquare(6)}
          {this.renderSquare(11)}
          {this.renderSquare(16)}
          {this.renderSquare(21)}
        </div>
        <div className="board-row">
          <div class="square"> </div>
          {this.renderSquare(0)}
          {this.renderSquare(5)}
          {this.renderSquare(10)}
          {this.renderSquare(15)}
          {this.renderSquare(20)}
        </div>
        <div className="board-row">
          <div class="square"></div>
          <div class="square" style={{backgroundImage: `url(${e_i})`}}></div>
          <div class="square" style={{backgroundImage: `url(${e})`}}></div>
          <div class="square" style={{backgroundImage: `url(${e})`}}></div>
          <div class="square" style={{backgroundImage: `url(${e})`}}></div>
          <div class="square" style={{backgroundImage: `url(${e_d})`}}></div>
          <div class="square"></div>
        </div>
      </div>
    );
  }
}


export default Tablero;