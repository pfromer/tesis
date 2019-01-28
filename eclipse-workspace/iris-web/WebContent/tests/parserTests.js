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

var program2 = parse("r2(?z, ?x) :- r1(?x, ?y)." + "\n"
				+    "r3('b') :-r2('a', ?x).");
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


var program3 = parse("bottom :- r1(?x, ?y).");
var tests3 = [
	testObject("program3.tgds.length", "0"),
	testObject("program3.ncs.length", "1"),
	testObject("program3.ncs[0].body.predicates.length", "1"),
	testObject("program3.ncs[0].body.predicates[0].name", "'r1'")
]


var egdProgram = parse("?z = ?z1 :- p(?x, ?z), p(?x, ?z1).");
var testsEgd = [
	testObject("egdProgram.tgds.length", "0"),
	testObject("egdProgram.ncs.length", "0"),
	testObject("egdProgram.egds.length", "1"),
	testObject("egdProgram.egds[0].head.left.type", "'variable'"),
	testObject("egdProgram.egds[0].head.left.name", "'z'"),
	testObject("egdProgram.egds[0].head.right.type", "'variable'"),
	testObject("egdProgram.egds[0].head.right.name", "'z1'"),
	testObject("egdProgram.egds[0].body.predicates.length", "2")
]

var factProgram = parse("p('a', 'b').");
var testsFact = [
	testObject("factProgram.tgds.length", "0"),
	testObject("factProgram.ncs.length", "0"),
	testObject("factProgram.egds.length", "0"),
	testObject("factProgram.facts.length", "1"),
	testObject("factProgram.facts[0].name", "'p'"),
	testObject("factProgram.facts[0].parameters.length", "2"),
	testObject("factProgram.facts[0].parameters[0].value", "'a'"),
	testObject("factProgram.facts[0].parameters[1].value", "'b'"),
	testObject("factProgram.facts[0].parameters[0].type", "'constant'"),
	testObject("factProgram.facts[0].parameters[1].type", "'constant'"),
]

var queryProgram = parse("?- r1(?x, ?y), r2(?z, ?z).");
var testsQuery = [
	testObject("queryProgram.tgds.length", "0"),
	testObject("queryProgram.ncs.length", "0"),
	testObject("queryProgram.egds.length", "0"),
	testObject("queryProgram.facts.length", "0"),
	testObject("queryProgram.queries.length", "1"),
	testObject("queryProgram.queries[0].predicates.length", "2"),
	testObject("queryProgram.queries[0].predicates[1].parameters[0].name", "'z'")
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
runTests(tests3, "parsing: bottom :- r1(?x, ?y).");
runTests(testsEgd, "parsing: ?z = ?y :- p(?x, ?z), p(?x, ?y).");
runTests(testsFact, "parsing: p('a', 'b').");
runTests(testsQuery, "parsing: ?- r1(?x, ?y), r2(?z, ?z).");