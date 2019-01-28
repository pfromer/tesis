function predicateBuilder(tgdText){
	
	var build = function(predicateText){
		var parameters = servicesAndBuilders.regExService.arrayOfMatches(servicesAndBuilders.regExService.variableOrConstantRegEx, predicateText);
		var parametersAsObjets = [];		
		var type;
		for (var i = 0; i < parameters.length; i++) {
			parametersAsObjets.push(servicesAndBuilders.parameterBuilder.build(parameters[i]));
		};
		
	    var hasVariable = function(v) {return parametersAsObjets.some(p => p.name == v)};
		
		return {
			name : predicateText.split("(")[0].trim(),
			parameters: parametersAsObjets,
			hasVariable: hasVariable,
			allVariables: parametersAsObjets.filter(p => p.type == 'variable').map(p => p.name),
			hasAllVariables: function(variables){
				return variables.every(v => hasVariable(v));
			}
		}
	}		
	
	return {
		build : build
	}
}