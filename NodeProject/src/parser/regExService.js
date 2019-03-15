function _service(){
	
	var variableRegEx = /\?[a-z][0-9]*/;
	var constantRegEx = /'\w+'/;
	var whiteSpacesRegEx = /^ *$/;
	var variableOrConstantRegEx = new RegExp('(' + variableRegEx.source + '|' + constantRegEx.source + ')');
	var bottomRegEx = /(⊥|bottom)/;
	function removeFirstAndLastCharacter(regEx){return new RegExp(regEx.source.slice(0,-1).substring(1))};
	function repeatAndSeparateByComma (regEx){ return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) };
	var predicateRegEx = new RegExp('^' + '(\\w+)\\(' + repeatAndSeparateByComma(variableOrConstantRegEx).source  + '\\)$');
	var factRegEx = new RegExp('^' + '(\\w+)\\(' + repeatAndSeparateByComma(constantRegEx).source  + '\\).$');
	var withinPredicateRegEx = removeFirstAndLastCharacter(predicateRegEx);
	var queryRegEx = new RegExp('^' + "\\?-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$");
	
	
	return{
		variableOrConstantRegEx : variableOrConstantRegEx,
		whiteSpacesRegEx : whiteSpacesRegEx,
		commaSeparatedVariableOrStringRegEx : repeatAndSeparateByComma(variableOrConstantRegEx),
		predicateRegEx : predicateRegEx,
		keyRegEx : new RegExp('^' + "key\\(\\w+,\\[" + repeatAndSeparateByComma(new RegExp("[0-9]")).source + "]\\)\\.$"),
		withinPredicateRegEx : withinPredicateRegEx,
		tgdRegEx : new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$"),
		ncRegEx : new RegExp('^' + bottomRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$"),
		egdRegEx : new RegExp('^' + repeatAndSeparateByComma(new RegExp(variableRegEx.source + "\\s*=\\s*" + variableRegEx.source)).source  + "\\s*:-\\s*" + withinPredicateRegEx.source + "\\s*,\\s*" +  withinPredicateRegEx.source + "\\.$"),
		factRegEx : factRegEx,
		queryRegEx : queryRegEx,
		arrayOfMatches : function(regEx, _text){
			regEx = new RegExp(regEx.source, 'g');
			var result = []
			do {
				var match = regEx.exec(_text);
				if (match) {
					result.push(match[0]);
				}			
			} while (match);
			return result;
		}	
	}
}

export const service = _service();