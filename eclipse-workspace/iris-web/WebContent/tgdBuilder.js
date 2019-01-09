function tgdBuilder(tgdText){
	
	buildTgdBody = function(bodyText){
		var predicates = regExService().arrayOfMatches(regExService().withinPredicateRegEx, bodyText);
		var predicatesAsObjects = [];
		for (var i = 0; i < predicates.length; i++) {
			predicatesAsObjects.push(predicateBuilder().build(predicates[i]));
		}		
		return { predicates: predicatesAsObjects, hasVariable : function(v){ return predicatesAsObjects.some(p => p.hasVariable(v))} };		
	}
	
	buildTgdHeadPredicate = function(predicateText, tgdBody){
		var predicate = predicateBuilder().build(predicateText);
		var parameters = predicate.parameters.filter(p => p.type == 'variable');
		
		//check if variable is actually a null (not present in tgd's body)
		for (var i = 0; i < parameters.length; i++) {
			if (!tgdBody.hasVariable(parameters[i].name)){
				parameters[i].type = 'null'
			}
		}
		
		return {
			name : predicate.name,
			parameters : predicate.parameters,
			nulls: predicate.parameters.filter(p => p.type == 'null')			
		}
	}
	
	buildTgdHead = function(headText, tgdBody){
		return {predicate: buildTgdHeadPredicate(headText, tgdBody)};		
	}
	
	return {		
			buildTgd : function(line){
				var result = {};
				var split = line.split(":-");		
				result.body = buildTgdBody(split[1]);			
				result.head = buildTgdHead(split[0], result.body);
				return result;
		}
	}
}