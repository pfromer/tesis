export function rewrite(query, tgds){
    var qRew = [{query : query, include : 1}];
    var keepGrowing = true;
    while(keepGrowing){
        keepGrowing = false;
        var qTemp = qRew;//CLONE
        qTemp.forEach(tuple => {
            tgds.forEach(tgd => {
                var q = factorize(tuple.query, tgd);
                if (notExists(q, qRew, [0,1])){
                    qRew.push({query : q, include : 0});
                    keepGrowing = true;
                }
            })
            query.allSubsets.forEach(A => {
               if(tgd.isApplicable(query, A)){
                   var mgu = getMguForTgdHeadWithAtoms(A, tgd);
                   var q = mgu(query.replace(A, tgd.body));
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