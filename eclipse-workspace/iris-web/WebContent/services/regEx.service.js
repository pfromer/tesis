function regExService(){

	var variableOrStringReEx = /(\?[a-z]|'\w+')/;
	function removeFirstAndLastCharacter(regEx){return new RegExp(regEx.source.slice(0,-1).substring(1))};
	function repeatAndSeparateByComma (regEx){ return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) };
	var predicateRegEx = new RegExp('^' + '(\\w+)\\(' + repeatAndSeparateByComma(variableOrStringReEx).source  + '\\)$');
	var withinPredicateRegEx = removeFirstAndLastCharacter(predicateRegEx);
	
	return{
	
		variableOrStringReEx : variableOrStringReEx,
		commaSeparatedVariableOrStringRegEx : repeatAndSeparateByComma(variableOrStringReEx),
		predicateRegEx : predicateRegEx,
		withinPredicateRegEx : withinPredicateRegEx,
		tgdRegEx : new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$")
	}
}