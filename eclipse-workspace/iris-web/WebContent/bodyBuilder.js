function bodyBuilder(bodyText){
	
	var build = function(bodyText){
		var predicates = regExService().arrayOfMatches(regExService().withinPredicateRegEx, bodyText);
		var predicatesAsObjects = [];
		for (var i = 0; i < predicates.length; i++) {
			predicatesAsObjects.push(predicateBuilder().build(predicates[i]));
		}		
		return { predicates: predicatesAsObjects, hasVariable : function(v){ return predicatesAsObjects.some(p => p.hasVariable(v))} };		
	}
	
	return {
		build : build
	}
}