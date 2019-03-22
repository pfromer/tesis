
input := todos los facts de la ABox
maximalesConsistentes := vacio
actuales := todos los subsets de la ABOx que se pueden formar sacando un elemento
mientras actuales no es vacio:
   noAgregar := vacio
   consistentes := todos los actuales que son consistentes
   inconsistentes := todos los actuales que no son consistentes
   actuales := vacio
   por cada s en consistentes:
      pongo en noAgregar todos los subset de s que se pueden formar sacando un elemento
      agrego s a maximalesConsistentes  
   por cada s en inconsistentes
      agrego a actuales todos los subconjuntos que se pueden formar sacar un elemento de s, sin repetidos y que no esten en noAgregar 
retorno interseccion de todos los maximalesConsistentes


