function _service(){
	
	var variableRegEx = /\?[a-z][0-9]*/;
	var constantRegEx = /'\w+'/;
	var whiteSpacesRegEx = /^ *$/;
	var variableOrConstantRegEx = new RegExp('(' + variableRegEx.source + '|' + constantRegEx.source + ')');
	var equalRegex = new RegExp(variableOrConstantRegEx.source + "\\s*=\\s*" +  variableOrConstantRegEx.source);
	var notEqualRegex = new RegExp(variableOrConstantRegEx.source + "\\s*!=\\s*" +  variableOrConstantRegEx.source);
	var predicateRegEx = new RegExp('^' + '(\\w+)\\(' + repeatAndSeparateByComma(variableOrConstantRegEx).source  + '\\)$');
	var withinPredicateRegEx = removeFirstAndLastCharacter(predicateRegEx);
	var negatedPredicateRegEx = new RegExp("!\\s*" + withinPredicateRegEx.source);
	var queryPredicateRegEx = new RegExp("(((" + equalRegex.source + "|" + notEqualRegex.source + ")|" + withinPredicateRegEx.source + ")|" + negatedPredicateRegEx.source +")");




	var bottomRegEx = /(⊥|bottom)/;
	function removeFirstAndLastCharacter(regEx){return new RegExp(regEx.source.slice(0,-1).substring(1))};
	function repeatAndSeparateByComma (regEx){ return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) };
	
	var factRegEx = new RegExp('^' + '(\\w+)\\(' + repeatAndSeparateByComma(constantRegEx).source  + '\\).$');
	
	var queryRegEx = new RegExp('^' + "\\?-\\s*" + repeatAndSeparateByComma(queryPredicateRegEx).source + "\\.$");
	var tgdRegEx = new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$");
	var ncRegEx = new RegExp('^' + bottomRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$");
	function repeatAndSeparateNElementsByComma (regEx, n){ 		
		var arr = [];
		var i = n;
		while(i > 0){
			arr.push(regEx.source);
			i--;
		}

		return new RegExp(arr.join(",\\s*"));
	};
	
	function arrayOfMatchesTemplate(regEx, _text, f){
		regEx = new RegExp(regEx.source, 'g');
		var result = []
		do {
			var match = regEx.exec(_text);
			if (match) {
				result.push(f(match));
			}			
		} while (match);
		return result;

	}



	return{
		equalRegex: equalRegex,
		notEqualRegex: notEqualRegex,
		variableOrConstantRegEx : variableOrConstantRegEx,
		negatedPredicateRegEx: negatedPredicateRegEx,
		whiteSpacesRegEx : whiteSpacesRegEx,
		commaSeparatedVariableOrStringRegEx : repeatAndSeparateByComma(variableOrConstantRegEx),
		predicateRegEx : predicateRegEx,
		keyRegEx : new RegExp('^' + "key\\(\\w+,\\[" + repeatAndSeparateByComma(new RegExp("[0-9]")).source + "]\\)\\.$"),
		withinPredicateRegEx : withinPredicateRegEx,
		queryPredicateRegEx: queryPredicateRegEx,
		tgdRegEx : tgdRegEx,
		ncRegEx : ncRegEx,
		factRegEx : factRegEx,
		queryRegEx : queryRegEx,
		arrayOfMatches : function(regEx, _text){
			var f = match => { return match[0]};
			return arrayOfMatchesTemplate(regEx, _text, f);
		},
		predicateRegExByNameAndArity : function(predicateName, arity){
			return new RegExp(predicateName + '\\(' + repeatAndSeparateNElementsByComma(variableOrConstantRegEx, arity).source  + '\\)');
		},
		arrayOfIndexes : function(regEx, _text){
			var f = match => { return {start: match.index, end : match.index + match[0].length } };
			return arrayOfMatchesTemplate(regEx, _text, f);
		}
	}
}

export const service = _service();