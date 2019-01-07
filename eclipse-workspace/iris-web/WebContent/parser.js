const parser = function(program){
	
	this.removeFirstAndLastCharacter = function(regEx){
	
		return new RegExp(regEx.source.slice(0,-1).substring(1));	
	}
	
	this.repeatAndSeparateByComma = function(regEx){

		return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) 
	}
	
	this.variableOrStringReEx = /(\?[a-z]|'\w+')/
	this.commaSeparatedVariableOrStringRegEx = repeatAndSeparateByComma(variableOrStringReEx);
	this.predicateRegEx = new RegExp('^' + '(\\w+)\\(' + commaSeparatedVariableOrStringRegEx.source  + '\\)$')
	this.withinPredicateRegEx = removeFirstAndLastCharacter(predicateRegEx);
	this.tgdRegEx = new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$")

	this.
	
	
	
	var lines = program.split('\n');

	for(var i = 0;i < lines.length;i++){
		if(tgdRegEx.test(lines[i]))	this.tgds.add(this.buildTgd(lines[i]));
		
		
	}
	
	
	this.buildTgd = function(line){
		var result = {};
		var split = lines.split(":-");
		result.head = this.buildTgdHead(split[0]);
		result.body = this.buildTgdBody(split[1]);			
		return result;
	}

	this.buildTgdHead = function(headText){
		return {predicate: this.buildPredicate(headText)};		
	}
	
	this.buildPredicate = function(predicateText){
		
	
	}
	
	this.tgds = [];
	this.queries = [];
	this.facts = [];
}

module.exports = parser;