const parser = function(program){
	
	this.tgds = [];
	this.queries = [];
	this.facts = [];
	
	this.removeFirstAndLastCharacter = function(regEx){
	
		return new RegExp(regEx.source.slice(0,-1).substring(1));	
	}
	
	this.repeatAndSeparateByComma = function(regEx){

		return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) 
	}
	
	this.variableOrStringReEx = /(\?[a-z]|'\w+')/
	this.commaSeparatedVariableOrStringRegEx = this.repeatAndSeparateByComma(this.variableOrStringReEx);
	this.predicateRegEx = new RegExp('^' + '(\\w+)\\(' + this.commaSeparatedVariableOrStringRegEx.source  + '\\)$')
	this.withinPredicateRegEx = this.removeFirstAndLastCharacter(this.predicateRegEx);
	this.tgdRegEx = new RegExp('^' + this.withinPredicateRegEx.source + "\\s*:-\\s*" + this.repeatAndSeparateByComma(this.withinPredicateRegEx).source + "\\.$")

	this.buildPredicate = function(predicateText){
		var parameters = this.arrayOfMatches(this.variableOrStringReEx, predicateText);	
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
			hasVariable: function(v) {return this.parameters.some(p => p.name == v)}
		}
	}
	
	
	this.buildTgdBody = function(bodyText){
		var predicates = this.arrayOfMatches(this.withinPredicateRegEx, bodyText);
		var predicatesAsObjects = [];
		for (var i = 0; i < predicates.length; i++) {
			predicatesAsObjects.push(this.buildPredicate(predicates[i]));
		}
		
		return { predicates: predicatesAsObjects, hasVariable : function(v){ return this.predicates.some(p => p.hasVariable(v))} };		
	}	
	
	this.buildTgdHeadPredicate = function(predicateText, tgdBody){		
		var parameters = this.arrayOfMatches(this.variableOrStringReEx, predicateText);	
		var parametersAsObjets = [];		
		var type;
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i].startsWith("?")){
				var name = parameters[i].substring(1);
				if (tgdBody.hasVariable(name)){					
					type = 'variable';
				}
				else{
					type = 'null';
				}
				parametersAsObjets.push({type: type, name : name, index : i})
			}
			if (parameters[i].startsWith("'")){
				parametersAsObjets.push({type: 'constant', value : parameters[i], index : i});
			}
		}
		
		return {
			name : predicateText.split("(")[0],
			parameters: parametersAsObjets,
			nulls: parametersAsObjets.filter(p => p.type == 'null')
		}	
	}
	
	this.buildTgdHead = function(headText, tgdBody){
		return {predicate: this.buildTgdHeadPredicate(headText, tgdBody)};		
	}
	
	this.buildTgd = function(line){
		var result = {};
		var split = line.split(":-");		
		result.body = this.buildTgdBody(split[1]);			
		result.head = this.buildTgdHead(split[0], result.body);
		return result;
	}
	
	this.arrayOfMatches = function(regEx, _text){
		regEx = new RegExp(regEx.source, 'g');
		var result = []
		do {
			match = regEx.exec(_text);
			if (match) {
				result.push(match[0]);
			}
			
		} while (match);
		return result;
	}	
	
	var lines = program.split('\n');

	for(var i = 0;i < lines.length;i++){
		if(this.tgdRegEx.test(lines[i])) this.tgds.push(this.buildTgd(lines[i]));
	}
}

//module.exports = parser;