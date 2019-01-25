var program = parse("r1(?z, ?x) :- r1(?x, ?y), r2(?y).");

var tests = [
	testObject("program.tgds.length", "1"),
	testObject("program.tgds[0].head.predicate.name","'r1'"),
	testObject("program.tgds[0].head.predicate.parameters.length","2"),
	testObject("program.tgds[0].head.predicate.parameters[0].name","'z'"),
	testObject("program.tgds[0].head.predicate.parameters[0].type","'null'"),
	testObject("program.tgds[0].head.predicate.parameters[1].name","'x'"),
	testObject("program.tgds[0].head.predicate.parameters[1].type","'variable'"),		
	testObject("program.tgds[0].body.predicates.length","2"),
	testObject("program.tgds[0].body.predicates[0].name","'r1'"),
	testObject("program.tgds[0].body.predicates[0].parameters.length","2"),
	testObject("program.tgds[0].body.predicates[0].parameters[0].name","'x'"),
	testObject("program.tgds[0].body.predicates[0].parameters[0].type","'variable'"),
	testObject("program.tgds[0].body.predicates[0].parameters[1].name","'y'"),
	testObject("program.tgds[0].body.predicates[0].parameters[1].type","'variable'"),	
	testObject("program.tgds[0].body.predicates[1].name","'r2'"),
	testObject("program.tgds[0].body.predicates[1].parameters.length","1"),
	testObject("program.tgds[0].body.predicates[1].parameters[0].name","'y'"),
	testObject("program.tgds[0].body.predicates[1].parameters[0].type","'variable'"),
	testObject("program.tgds[0].isGuarded","true"),
	testObject("program.queries.length","0"),	  
	testObject("program.facts.length","0")
]

var program2 = parse("r2(?z, ?x) :- r1(?x, ?y).\n r3('b') :-r2('a', ?x).");
var tests2 = [
	testObject("program2.tgds.length", "2"),
	testObject("program2.tgds[0].head.predicate.name", "'r2'"),
	testObject("program2.tgds[1].head.predicate.name", "'r3'"),
	testObject("program2.tgds[1].head.predicate.parameters.length", "1"),
	testObject("program2.tgds[1].head.predicate.parameters[0].type", "'constant'"),
	testObject("program2.tgds[1].head.predicate.parameters[0].value", "'b'"),
	testObject("program2.tgds[1].body.predicates.length", "1"),
	testObject("program2.tgds[1].body.predicates[0].name", "'r2'"),
	testObject("program2.tgds[1].body.predicates[0].parameters.length", "2"),
	testObject("program2.tgds[1].body.predicates[0].parameters[0].value","'a'"),
	testObject("program2.tgds[1].body.predicates[0].parameters[0].type","'constant'"),
	testObject("program2.tgds[1].body.predicates[0].parameters[1].name","'x'"),
	testObject("program2.tgds[1].body.predicates[0].parameters[1].type","'variable'"),
	testObject("program2.isGuarded","true"),	
]





function testObject(a, b, okMessage, errorMessage){
	return {
	a: eval(a),
	b: eval(b),
	okMessage: a + " == " + b,
	errorMessage: a + " != " + b,
}
}
function testEquality(aTestObject){
	if(aTestObject.a == aTestObject.b){
			console.log("Passed: " + aTestObject.okMessage);
}
else{
		console.warn("Failed: " + aTestObject.errorMessage);
	}
}
function runTests(tests, testName){
	console.log("Corriendo Test:" + testName);
	tests.map(testEquality);
}

runTests(tests, "parsing: r1(?z, ?x) :- r1(?x, ?y), r2(?y).");
runTests(tests2, "parsing: r2(?z, ?x) :- r1(?x, ?y).\nr3('b') :-r2('a', ?x).");