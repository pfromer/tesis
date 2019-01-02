const parser = require('./parser');

var myParser = new parser("");


test("empty program has no tgds", () => {
  expect(myParser.tgds.length).toBe(0)
})