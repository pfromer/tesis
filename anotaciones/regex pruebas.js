var re = /^(\w+)\(\)$/


r1(?z, ?x) :- r1(?x, ?y), r2(?y).



/^ (\?[a-z],)*(\?[a-z])  $/



var re3 = /^(\w+)\((\?[a-z],)*(\?[a-z])\)$/
undefined
re3.test("asds123a()")
false
re3.test("asds123a(?a)")
true
re3.test("asds123a(?a,?b)")
true
re3.test("asds123a(?a,?b,3)")
false
re3.test("asds123a(?a,?b,?3)")
false
re3.test("asds123a(?a,?b,?d)")
true


var predicateRegEx = /(\w+)\((\?[a-z],\s*)*(\?[a-z])\)/

var tgdRegEx = new RegExp('^' + predicateRegEx + '\s*:-\s*'   + '$');  

var re6 = /^(\w+)\((\?[a-z],\s*)*(\?[a-z])\)\s*:-\s*((\w+)\((\?[a-z],\s*)*(\?[a-z])\),\s*)*(\w+)\((\?[a-z],)*(\?[a-z])\)$/

var re7 = /^(\w+)\(((\?[a-z]),\s*)*(\?[a-z])\)\s*:-\s*((\w+)\((\?[a-z],\s*)*(\?[a-z])\),\s*)*(\w+)\((\?[a-z],)*(\?[a-z])\)$/


predicateRegEx2 = new RegExp("^(" + predicateRegEx.source + ",)*$") 


function repeatAndSeparateByComma(regEx){

	return new RegExp("^(" + regEx.source + ",\s*)*"+ regEx.source + "$") 
}


var variableOrStringReEx = /^\?[a-z]|'\w+'$/

var commaSeparatedVariableOrStringRegEx = repeatAndSeparateByComma(variableOrStringReEx);

var predicateRegEx = new RegExp('^' + '(\w+)\(' + commaSeparatedVariableOrStringRegEx.source  + '\)$')














