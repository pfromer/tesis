function arrayOfMatches(regEx, word){
	regEx = new RegExp(variableOrStringReEx.source, 'g');
	var result = []
	do {
		match = regEx.exec(pred);
		if (match) {
			result.push(match[0]);
		}
		
	} while (match);
	return result;
}


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

var tgdRegEx = new RegExp('^' + withinPredicateRegEx.source + "\\s*:-\\s*" + repeatAndSeparateByComma(withinPredicateRegEx).source + "\\.$")
tgdRegEx.test("r1(?z,  ?x) :- r1(?x, ?y), r2(?y).")



var s = "r1(?z,  ?x) :- r1(?x, ?y), r2(?y)"
var match;

withinPredicateRegEx = new RegExp(withinPredicateRegEx.source, 'g');

do {
    match = withinPredicateRegEx.exec(s);
    if (match) {
        console.log(match[0]);
    }
	
} while (match);

variableOrStringReEx = new RegExp(variableOrStringReEx.source, 'g');

var pred = "r1(?a,?b,?c,'dsfdsf')";

do {
    match = variableOrStringReEx.exec(pred);
    if (match) {
        console.log(match[0]);
    }
	
} while (match);








predicateRegEx.test("r1(?a)")

---------
tiene que quedar asi la RegEx de predicados:
var predicateRegEx3 = /^(\w+)\(((\?[a-z]|'\w+'),\s*)*(\?[a-z]|'\w+')\)$/
-----------



/^(\w+)\(((\?[a-z]|'\w+'),\s*)*(\?[a-z]|'\w+')\)$/

/^(\w+)\(((\?[a-z]|'\w+'),s*)*\?[a-z]$|^'\w+'\)$/