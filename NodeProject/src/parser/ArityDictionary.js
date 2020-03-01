export function ArityDictionary() {

    this.dictionary = {};

    var self = this;
    var consistentResult = undefined;

    this.addArities = function (arities, lineNumber) {
        if (arities) {
            for (const predicateName in arities) {
                var i = parseInt(lineNumber);
                if (!Object.keys(this.dictionary).some(k => k == predicateName)) {
                    this.dictionary[predicateName] = {};
                }
                this.dictionary[predicateName][i] = arities[predicateName];
            }
        }
    }

    this.aritiesAreConsistent = function () {
        if (!self.consistentResult) {
            var predicatesNotArityConsistent = [];
            for (const predicateName in this.dictionary) {
                var allAritiesByLine = this.dictionary[predicateName];
                var allArities = [];
                for (const lineNumber in allAritiesByLine) {
                    allArities = allArities.concat(allAritiesByLine[lineNumber]);
                }
                if (allArities.unique().length > 1) {
                    predicatesNotArityConsistent.push(predicateName);
                }
            }

            if (predicatesNotArityConsistent.length == 0) {
                self.consistentResult = {
                    result: true
                }
            } else {
                self.consistentResult = {
                    result: false,
                    predicatesNotArityConsistent: predicatesNotArityConsistent
                }
            }
        }
        return self.consistentResult;
    }

    this.getLessCommonArityLinesForPredicate = function (predicateName) {

        var aritiesByLine = this.dictionary[predicateName];
        var aritiesCounts = {};
        for (const lineNumber in aritiesByLine) {
            aritiesByLine[lineNumber].forEach(arity => {
                if (aritiesCounts[arity]) {
                    aritiesCounts[arity]++
                } else {
                    aritiesCounts[arity] = 1
                }
            })
        }

        var mostCommon = Math.max.apply(null, Object.values(aritiesCounts));
        var mostCommonArity = Object.keys(aritiesCounts).find(k => aritiesCounts[k] == mostCommon);
        var lessCommonArities = Object.keys(aritiesCounts).filter(k => k != mostCommonArity);

        var result = [];

        lessCommonArities.forEach(a => {
            for (const lineNumber in aritiesByLine) {
                if (aritiesByLine[lineNumber].some(arity => arity == a)) {
                    result.push({
                        lineNumber: lineNumber,
                        arity: a
                    })
                }
            }
        })
        return result;
    }
}




/*


necesito: una funcion que dado un nombre de predicado y una aridad me arme una expresion regular
necesito: marcar en rojo solo los menos comunes. si hay empate marco todos.
necesito: una funcion que dado un nombre de predicado me diga en que lineas estan los menos comunes 
          y la aridad  de cada uno
necesito: buscar esas lineas y encontrar la posicion donde arranca y donde termina

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