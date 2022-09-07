import otomi_azul1 from './otomi/azul1.png';
import otomi_azul2 from './otomi/azul2.png';
import otomi_azul3 from './otomi/azul3.png';
import otomi_azul4 from './otomi/azul4.png';
import otomi_azul5 from './otomi/azul5.png';
import otomi_blanco1 from './otomi/blanco1.png';
import otomi_blanco2 from './otomi/blanco2.png';
import otomi_blanco3 from './otomi/blanco3.png';
import otomi_blanco4 from './otomi/blanco4.png';
import otomi_blanco5 from './otomi/blanco5.png';
import otomi_negro1 from './otomi/negro1.png';
import otomi_negro2 from './otomi/negro2.png';
import otomi_negro3 from './otomi/negro3.png';
import otomi_negro4 from './otomi/negro4.png';
import otomi_negro5 from './otomi/negro5.png';
import otomi_rojo1 from './otomi/rojo1.png';
import otomi_rojo2 from './otomi/rojo2.png';
import otomi_rojo3 from './otomi/rojo3.png';
import otomi_rojo4 from './otomi/rojo4.png';
import otomi_rojo5 from './otomi/rojo5.png';
import otomi_verde1 from './otomi/verde1.png';
import otomi_verde2 from './otomi/verde2.png';
import otomi_verde3 from './otomi/verde3.png';
import otomi_verde4 from './otomi/verde4.png';
import otomi_verde5 from './otomi/verde5.png';
import personaje1 from './otomi/personaje1.png'
import personaje2 from './otomi/personaje2.png'
import personaje3 from './otomi/personaje3.png'
import telar_de_cintura from './telar de cintura.png'
import ins1 from './instrucciones_digital1.png'
import ins2 from './instrucciones_digital2.png'
import ins3 from './instrucciones_digital3.png'
import ins4 from './instrucciones_digital4.png'
import ins5 from './instrucciones_digital5.png'
import ins6 from './instrucciones_digital6.png'
import ins7 from './instrucciones_digital7.png'


const imagenes_fichas = {
  otomi: {
    azul: [otomi_azul1, otomi_azul2, otomi_azul3, otomi_azul4, otomi_azul5],
    blanco: [otomi_blanco1, otomi_blanco2, otomi_blanco3, otomi_blanco4, otomi_blanco5],
    negro: [otomi_negro1, otomi_negro2, otomi_negro3, otomi_negro4, otomi_negro5],
    rojo: [otomi_rojo1, otomi_rojo2, otomi_rojo3, otomi_rojo4, otomi_rojo5],
    verde: [otomi_verde1, otomi_verde2, otomi_verde3, otomi_verde4, otomi_verde5],
  }
}

const imagenes_informacion = {
  telar: telar_de_cintura,
  otomi: {
    p1: personaje1,
    p2: personaje2,
    p3: personaje3 
  }
}

const imagenes_tutorial = {
  instruccion1: ins1,
  instruccion2: ins2,
  instruccion3: ins3,
  instruccion4: ins4,
  instruccion5: ins5,
  instruccion6: ins6,
  instruccion7: ins7,
}

export default {
  imagenes_fichas, 
  imagenes_informacion, 
  imagenes_tutorial
};