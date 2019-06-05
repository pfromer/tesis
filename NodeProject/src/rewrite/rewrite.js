import {UpdateArrayPrototype} from "../parser/ArrayUtils";
import mguModule from "./mguBuilder";

export function rewrite(query, tgds){
    //TODO tratar de mejorar esto. la razon es que necesito que en el MGU ganen siempre las variabels de la query
    //por eso hago que arranquen con "a" (el algoritmo de mgu prioriza por orden alfabetico)
    //var query = query.prependPrefixToAllVariables("a");
    //var tgds = tgds.map(tgd => tgd.prependPrefixToAllVariables("b"));
    UpdateArrayPrototype();
    var qRew = [{query : query, include : 1, checked : false}];
    var keepGrowing = true;
    while(keepGrowing){
        keepGrowing = false;
        var qTemp = [...qRew];
        qTemp.filter(t => !t.checked).forEach(tuple => {
            tuple.checked = true;
            tgds.forEach(tgd => {
                var q = tgd.factorize(tuple.query);
                if (notExists(q, qRew, [0,1])){
                    qRew.push({query : q, include : 0, checked : false});
                    keepGrowing = true;
                }
            })
            tuple.query.predicates.length.createArrayOfNElements().allSubSets().filter(s => s.length > 0).forEach(A => {
                tgds.forEach(tgd => {
                    if(tgd.isApplicableTo(tuple.query, A)){
                        var mguResult = mguModule.getMguForTgdHeadWithAtoms(tuple.query.getAtoms(A), tgd);
                        var q = mguResult.mgu(tuple.query.replace(A, tgd.body.predicates));
                        if(notExists(q, qRew, [1])){
                            qRew.push({query : q, include : 1, checked : false});
                            keepGrowing = true;
                        }
                    }
                }) 
            })
        })
    }

    //saco primer caracter para que quede igual que la query original
    var queriesToInclude = qRew.filter(tuple => tuple.include == 1).map(tuple => tuple.query);
    

    return queriesToInclude;//.map(p => p.removeFirstCharacterFromAllVars());
    /*var queriesWithVariablesRenamed = renameNonOriginalVariables(queriesToInclude, query);
    var result = Object.assign({}, query);
    result.predicates = queriesWithVariablesRenamed.reduce(
        (allPredicates, value) => allPredicates.concat(value.predicates),
        []
    )
    return result.removeFirstCharacterFromAllVars();*/
}

function notExists(query, qRew, flags){
    return !qRew.some(tuple => tuple.query.isEqualTo(query) && flags.some(f => f == tuple.include));
}

/*function renameNonOriginalVariables(qRew, originalQuery){
    var originalVariableNames = originalQuery.allVariableNames();
    var result = [];
    var count = 0;
    for(var i = 0; i <qRew.length; i++){
        var variables = qRew[i].allVariableNames();
        var newVariables = variables.filter(v => !originalVariableNames.some(v2 => v2 == v));
        var equations = [];
        for(var j = 0; j<newVariables.length; j++){
            equations.push({ original : newVariables[j], renameTo : "_newVar" + count.toString() })
            count++;
        }        
        result.push(qRew[i].renameVariables(equations));
    }
    return result;
}*/