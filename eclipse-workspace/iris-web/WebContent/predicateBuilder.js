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
				parametersAsObjets.push({type: 'constant', value : parameters[i], index : i});
			}
		}
		
		return {
			name : predicateText.split("(")[0],
			parameters: parametersAsObjets,
			hasVariable: function(v) {return parametersAsObjets.some(p => p.name == v)}
		}
	}
	
	return {
		build : build
	}
}