function predicateBuilder(tgdText){
	
	var build = function(predicateText){
		var parameters = regExService().arrayOfMatches(regExService().variableOrStringReEx, predicateText);	
		var parametersAsObjets = [];		
		var type;
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i].startsWith("?")){
				var name = parameters[i].substring(1);				
				parametersAsObjets.push({type: 'variable', name : name, index : i})
			}
			if (parameters[i].startsWith("'")){
				parametersAsObjets.push({type: 'constant', value : parameters[i].slice(0,-1).substring(1), index : i});
			}
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