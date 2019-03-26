export async function intersectionRepairs(program){
   var aBox = program.facts;
   var repairs = [];
   var bigSubSets = allSubSetsWithOneLess(aBox);
   var smallSubSets = listOfList(aBox);
   var doNotAdd;
   var bigSubSetsConsistentAndUnconsitent;
   var smallSubsetsConsistentAndAndUnconsistent;
   while(bigSubSets.length != 0){
      doNotAdd = [];
      [bigSubSetsConsistentAndUnconsitent, smallSubsetsConsistentAndAndUnconsistent] = 
         await Promise.all([separateOntoConsitentAndUnconsistent(bigSubSets), separateOntoConsitentAndUnconsistent(smallSubSets)]);
         bigSubSets = [];
         bigSubSetsConsistentAndUnconsitent.consistents.forEach(s =>{
            allSubSetsWithOneLess(s).forEach(x =>{
               doNotAdd.push(x);
               repairs.push(x);
            })
         })
         bigSubSetsConsistentAndUnconsitent.inconsistents.forEach(s =>{
            allSubSetsWithOneLess(s).forEach(x =>{
               if(!doNotAdd.includes(x)){
                  var substracted = x.substractAllFrom(smallSubsetsConsistentAndAndUnconsistent.inconsistents);
                  if (substracted.length > 0){
                     bigSubSets.push(x.substractAllFrom(smallSubsetsConsistentAndAndUnconsistent.inconsistents)) //agregar esto al prototype               
                  }
                  bigSubSets = bigSubSets.unique();
               }
            })
         })
         smallSubSets = addOneToEach(smallSubsetsConsistentAndAndUnconsistent.inconsistents, aBox);
      }
      return intersection(repairs); 
}

/*
input := todos los facts de la ABox
maximalesConsistentes := vacio
actualesGrandes := todos los subsets de la ABOx que se pueden formar sacando un elemento
actualesChicos := todos los subsets de la ABox de un solo elemento
mientras actualesGrandes no es vacio:
   noAgregar := vacio
   consistentesGrandes := todos los actualesGrandes que son consistentes
   inconsistentesGrandes := todos los actualesGrandes que no son consistentes
   actualesGrandes := vacio
   actualesChicosConsistentes := actualesChicos que no sean consistentes
   actualesChicosInConsistentes := actualesChicos que no son consistentes

   por cada s en consistentesGrandes:
      pongo en noAgregar todos los subset de s que se pueden formar sacando un elemento
      agrego s a maximalesConsistentes  
   por cada s en inconsistentesGrandes
      para cada subconjunto x que se puede formar sacndo un elemento de s, y que no este en noAgregar, le aplico la resta 
      de todos los actualesChicosIncosistentes y despues lo agrego a actualesGrandes
   
   actualesChicos := todos los conjuntos que se pueden generar agregando un elemento diferente de la ABox a cada conjunto
                  de actaulesChicosConsistentes 


retorno interseccion de todos los maximalesConsistentes
*/