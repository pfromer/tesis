function tgdBuilder(tgdText){
	
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
			parameters : predicate.parameters		
		}
	}
	
	buildTgdHead = function(headText, tgdBody){
		return {predicate: buildTgdHeadPredicate(headText, tgdBody)};
	};
	
	return {		
			buildTgd : function(line){
				var result = {};
				var split = line.split(":-");		
				result.body = bodyBuilder().build(split[1]);			
				result.head = buildTgdHead(split[0], result.body);
				var allVariables = [];
				result.body.predicates.forEach(function (predicate){
					predicate.allVariables.forEach(function(variable){
						allVariables.push(variable);
					});
				});
				result.isGuarded = result.body.predicates.some(p => p.hasAllVariables(allVariables));
				return result;
		}
	}
}