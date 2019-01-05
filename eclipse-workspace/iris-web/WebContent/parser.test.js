const parser = require('./parser');

var myParser = new parser("");


test("empty program has no tgds", () => {
  expect(myParser.tgds.length).toBe(0)
})

test("empty program has no queries", () => {
  expect(myParser.queries.length).toBe(0)
})

test("empty program has no facts", () => {
  expect(myParser.facts.length).toBe(0)
})