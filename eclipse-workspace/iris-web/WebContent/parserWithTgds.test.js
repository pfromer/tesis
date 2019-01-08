const parser = require('./parser');

var myParser = new parser("r1(?z, ?x) :- r1(?x, ?y), r2(?y).");


test("check only one tgd in the program", () => {
  expect(myParser.tgds.length).toBe(1)
})

test("check tgd head is parsed correctly", () => {
  expect(myParser.tgds[0].head.predicate.name).toBe("r1");
  expect(myParser.tgds[0].head.predicate.nulls.length).toBe(1);
  expect(myParser.tgds[0].head.predicate.nulls[0].name).toBe("z");
  expect(myParser.tgds[0].head.predicate.parameters.length).toBe(2);
  expect(myParser.tgds[0].head.predicate.parameters[1].name).toBe("x");
})

test("check tgd body is parsed correctly", () => {
  expect(myParser.tgds[0].body.predicates.length).toBe(2);
})


test("check tgd body first predicate is parsed correctly", () => {
  expect(myParser.tgds[0].body.predicates[0].name).toBe("r1");
  expect(myParser.tgds[0].body.predicates[0].parameters.length).toBe(2);
  expect(myParser.tgds[0].body.predicates[0].parameters[0].name).toBe("x");
  expect(myParser.tgds[0].body.predicates[0].parameters[1].name).toBe("y");
  
})

test("check tgd body second predicate is parsed correctly", () => {
  expect(myParser.tgds[0].body.predicates[0].name).toBe("r2");
  expect(myParser.tgds[0].body.predicates[0].parameters.length).toBe(1);
  expect(myParser.tgds[0].body.predicates[0].parameters[0].name).toBe("y");s
})

test("program with just one tgd has no queries", () => {
  expect(myParser.queries.length).toBe(0)
})

test("program with just one tgd has no facts", () => {
  expect(myParser.facts.length).toBe(0)
})