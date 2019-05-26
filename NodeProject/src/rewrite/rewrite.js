import {UpdateArrayPrototype} from "../parser/ArrayUtils";

export function rewrite(query, tgds){
    UpdateArrayPrototype();
    var qRew = [{query : query, include : 1}];
    var keepGrowing = true;
    while(keepGrowing){
        keepGrowing = false;
        var qTemp = [...qRew];
        qTemp.forEach(tuple => {
            tgds.forEach(tgd => {
                var q = tgd.factorize(tuple.query);
                if (notExists(q, qRew, [0,1])){
                    qRew.push({query : q, include : 0});
                    keepGrowing = true;
                }
            })
            query.predicates.length.createArrayOfNElements().allSubsets().forEach(A => {
               if(tgd.isApplicableTo(query, A)){
                   var mgu = getMguForTgdHeadWithAtoms(query.getAtoms(A), tgd);
                   var q = mgu(query.replace(A, tgd.body.predicates));
                   if(notExists(q, qRew, [1])){
                       qRew.push({query : q, include : 1});
                       keepGrowing = true;
                   }
               } 
            })
        })
    }
    return qRew.filter(tuple => tuple.include == 1).map(tuple => tuple.query);
}

function notExists(query, qRew, flags){
    return !qRew.some(tuple => tuple.query.isEqualTo(query) && flags.some(f => f == tuple.include));
}