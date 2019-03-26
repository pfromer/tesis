export async function intersectionRepairs(program){
   var aBox = program.facts;
   var repairs = [];
   var bigSubSets = allSubSetsWithOneLess(aBox);
   var smallSubSets = oneArrayByElement(aBox);
   var doNotAdd = [];
   var bigPromiseResult;
   var smallPromiseResult;
   while(bigSubSets.length != 0){
      doNotAdd = [];
      const [bigPromise, smallPromise] = 
         await Promise.all([separateOntoConsitentAndUnconsistent(bigSubSets, program), 
            separateOntoConsitentAndUnconsistent(smallSubSets, program)]);
      bigSubSets = [];
      debugger
      

      bigPromise.consistents.forEach(s =>{
         repairs.push(s);
         allSubSetsWithOneLess(s).forEach(x =>{
            doNotAdd.push(x);
         })
      })

      doNotAdd = doNotAdd.unique();
      repairs = repairs.unique();

      bigPromise.inconsistents.forEach(s =>{
         allSubSetsWithOneLess(s).forEach(x =>{
            if(!doNotAdd.includes(x)){
               var substracted = substractAllFrom(x, smallPromise.inconsistents);
               if (substracted.length > 0){
                  bigSubSets.push(substracted) //agregar esto al prototype               
               }
               bigSubSets = bigSubSets.unique();
            }
         })
      })
      smallSubSets = addOneToEach(smallPromise.inconsistents, aBox);
   }
   return intersection(repairs); 
}

function addOneToEach(setOfSets, anotherSet){
   var result = [];
   setOfSets.forEach(s => {
      anotherSet.forEach(v =>{
         if(!s.includes(v)){
            var a = [...s];
            a.push(v);
            result.push(a);
         }
      })    
   })
   return result.unique();
}

function intersection(setOfSets){
   var result = [];

   setOfSets.forEach(s => {
      s.forEach(v => {
         if(setOfSets.all(set => set.includes(v))){
            result.add(v);
         }
      })
   })
   return result.unique();
}

function substractAllFrom(x, setOfSets){
   setOfSets.forEach(s => {
      x = x.filter(v => !s.includes(v));
   })
   return x;
}

function allSubSetsWithOneLess(set){
   var result = [];
   for(var i = 0; i<set.length; i++){
      result.push(allBut(set, i)); 
   }
   return result;
}

function allBut(set, i){
   return set.filter((val, index)=> index != i);
}

function oneArrayByElement(set){
   return set.map(v => [v]);
}

async function separateOntoConsitentAndUnconsistent(bigSubSets, program){
   var result = {};
   var promises = [];
   bigSubSets.forEach(s => {
      var subProgram = Object.assign({}, program);
      subProgram.facts = s;
      promises.push(subProgram.getInconsistencies);
   })
   await Promise.all(promises).then(inconsistencies => {
      result.consistents = bigSubSets.filter((value, index) => inconsistencies[index].inconsistencies.length == 0);
      result.inconsistents = bigSubSets.filter((value, index) => inconsistencies[index].inconsistencies.length > 0);    
   })

   return result;
}

/*
var p1 = Promise.resolve(3);
var p2 = 1337;
var p3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "foo");
}); 

Promise.all([p1, p2, p3]).then(values => { 
  console.log(values); // [3, 1337, "foo"] 
});*/















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