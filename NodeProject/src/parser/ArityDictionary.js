export function ArityDictionary(){

    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) { 
          return self.indexOf(value) === index;
        });
      }

    this.dictionary = {};

    this.addArities = function(arities, lineNumber){
        if(arities){
            for (const predicateName in arities){
                var i = parseInt(lineNumber);
                if(! Object.keys(this.dictionary).some(k => k== predicateName)){
                    this.dictionary[predicateName] = {};
                }
                this.dictionary[predicateName][i] = arities[predicateName];
            }
        }
    }

    this.aritiesAreConsistent = function(){
        var predicatesNotArityConsistent = [];
        for (const predicateName in this.dictionary) {
            var allAritiesByLine = this.dictionary[predicateName];
            var allArities = [];
            for (const lineNumber in allAritiesByLine){
                allArities = allArities.concat(allAritiesByLine[lineNumber]);              
            }
            if(allArities.unique().length > 1){
                predicatesNotArityConsistent.push(predicateName);
            }
          }

        if(predicatesNotArityConsistent.length == 0){
            return {result : true}
        }
        else{
            return {result : false, predicatesNotArityConsistent : predicatesNotArityConsistent }
        }
    }
} 




/*

                for(const arity in allAritiesByLine[lineNumber]){






                    if (allArities.some(a => a != arity)){
                        allArities.push(arity);
                        if(!predicatesNotArityConsistent.some(p => p == predicateName)){
                            predicatesNotArityConsistent.push(predicateName);
                        }
                    }
                }  

agregar un nuevo objeto que sepa responder el mensaje addAlArities(lineNumber, arities)
en caso de que arities sea un objeto vacio no hace nada

este objeto tiene un diccionario interno donde para cada nombre de parametro tiene un diccionario de linea a lista de aridades.

ejemplo:
{
	'r1' : { 
			1 : [1,2],
			2 : [3]		
			
			},
	'r2' : { 
			2 : [4]		
			
			}
}

cada objectAsLine implementa de su manera allArities. algunos devuelven {}, otros devuelven un diccionario donde para cada predicado hay una lista de todas las aridades que aparecen en 
de ese predicado en ese objectAsLine

ejemplo

{
	r1 : [1,2],
	r2 : [4]

}*/