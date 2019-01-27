function regExService(){
	
	var variableRegEx = /(\?[a-z][0-9]*)/;
	var constantRegEx = /'\w+'/;
	//var variableOrStringReEx = new RegExp(variableRegEx.source + '|' + constantRegEx.source);
	var variableOrStringReEx = /(\?[a-z][0-9]*|'\w+')/;
	var bottomRegEx = /(⊥|bottom)/;
	function removeFirstAndLastCharacter(regEx){return new RegExp(regEx.source.slice(0,-1).substring(1))};
	function repeatAndSeparateByComma (regEx){ return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) };
	var predicateRegEx = new RegExp('^' + '(\\w+)\\(' + repeatAndSeparateByComma(variableOrStringReEx).source  + '\\)$');
	var withinPredicateRegEx = removeFirstAndLastCharacter(predicateRegEx);
	
	return{
		variableOrStringReEx : variableOrStringReEx,
		commaSeparatedVariableOrStringRegEx : repeatAndSeparateByComma(variableOrStringReEx),
		predicateRegEx : predicateRegEx,
		withinPredicateRegEx : withinPredicateRegEx,
		tgdRegEx : new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$"),
		ncRegEx : new RegExp('^' + bottomRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$"),
		egdRegEx : new RegExp('^' + variableOrStringReEx.source + "\\s*=\\s*" + variableOrStringReEx.source  + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$"),
		
		arrayOfMatches : function(regEx, _text){
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
	}
}