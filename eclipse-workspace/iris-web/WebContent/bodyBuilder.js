function bodyBuilder(bodyText){
	
	var build = function(bodyText){
		var predicates = servicesAndBuilders.regExService.arrayOfMatches(servicesAndBuilders.regExService.withinPredicateRegEx, bodyText);
		var predicatesAsObjects = [];
		for (var i = 0; i < predicates.length; i++) {
			predicatesAsObjects.push(servicesAndBuilders.predicateBuilder.build(predicates[i]));
		}		
		return { predicates: predicatesAsObjects, hasVariable : function(v){ return predicatesAsObjects.some(p => p.hasVariable(v))} };		
	}
	
	return {
		build : build
	}
}