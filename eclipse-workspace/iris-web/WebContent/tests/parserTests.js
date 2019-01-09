var program = parse("r1(?z, ?x) :- r1(?x, ?y), r2(?y).");

var tests = [
	// Testeamos las propiedades de nil y las propiedades resultantes de la lista nil.cons(2)
	testObject("program.tgds.length", "1"),
	testObject("program.tgds[0].head.predicate.name","'r1'"),
	testObject("program.tgds[0].head.predicate.nulls.length","1"),
	testObject("program.tgds[0].head.predicate.nulls[0].name","'z'"),
	testObject("program.tgds[0].head.predicate.parameters.length","2"),
	testObject("program.tgds[0].head.predicate.parameters[1].name","'x'"),	  
	testObject("program.tgds[0].body.predicates.length","2"),
	testObject("program.tgds[0].body.predicates[0].name","'r1'"),
	testObject("program.tgds[0].body.predicates[0].parameters.length","2"),
	testObject("program.tgds[0].body.predicates[0].parameters[0].name","'x'"),
	testObject("program.tgds[0].body.predicates[0].parameters[1].name","'y'"),
	testObject("program.tgds[0].body.predicates[1].name","'r2'"),
	testObject("program.tgds[0].body.predicates[1].parameters.length","1"),
	testObject("program.tgds[0].body.predicates[1].parameters[0].name","'y'"),
	testObject("program.queries.length","0"),	  
	testObject("program.facts.length","0")
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