function removeFirstAndLastCharacter(regEx){
	
	return new RegExp(regEx.source.slice(0,-1).substring(1));
	
}

function repeatAndSeparateByComma(regEx){

	return new RegExp("(" + regEx.source + ",\\s*)*"+ regEx.source) 
}
var variableOrStringReEx = /(\?[a-z]|'\w+')/
var commaSeparatedVariableOrStringRegEx = repeatAndSeparateByComma(variableOrStringReEx);
var predicateRegEx = new RegExp('^' + '(\\w+)\\(' + commaSeparatedVariableOrStringRegEx.source  + '\\)$')

var withinPredicateRegEx = removeFirstAndLastCharacter(predicateRegEx);

var tgdRegEx = new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "$")
tgdRegEx.test("r1(?z,  ?x) :- r1(?x, ?y), r2(?y)")





predicateRegEx.test("r1(?a)")

---------
tiene que quedar asi la RegEx de predicados:
var predicateRegEx3 = /^(\w+)\(((\?[a-z]|'\w+'),\s*)*(\?[a-z]|'\w+')\)$/
-----------



/^(\w+)\(((\?[a-z]|'\w+'),\s*)*(\?[a-z]|'\w+')\)$/

/^(\w+)\(((\?[a-z]|'\w+'),s*)*\?[a-z]$|^'\w+'\)$/