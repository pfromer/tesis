
import * as queryModule from "../src/parser/queryBuilder";
import * as existencialQueryModule from "../src/parser/existencialQueryBuilder";

var chai = require('chai');


var assert = chai.assert;

describe('#areEqualQueryTest()', function() {
    it('case 1', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?x)");
        assert.equal(query1.isEqualTo(query2), true);
    })
    it('case 2', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?y)");
        var query2 = existencialQueryModule.builder.build("() :- p(?x)");
        assert.equal(query1.isEqualTo(query2), true);
    })
    it('case 3', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?y, ?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?x, ?y)");
        assert.equal(query1.isEqualTo(query2), true);
    })
    it('case 4', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?x, ?y)");
        assert.equal(query1.isEqualTo(query2), false);
    })
    it('case 5', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, 'a')");
        var query2 = existencialQueryModule.builder.build("() :- p(?y, 'a')");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case 6', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?z, ?h), r(?z)");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case 7', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x)");
        var query2 = existencialQueryModule.builder.build("() :- r(?z), p(?z, ?h)");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case 8', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a')");
        var query2 = existencialQueryModule.builder.build("() :- r('a'), p(?z, ?h)");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case 9', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('b')");
        var query2 = existencialQueryModule.builder.build("() :- r('a'), p(?z, ?h)");
        assert.equal(query1.isEqualTo(query2), false);
    })

    it('case 10', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a')");
        var query2 = existencialQueryModule.builder.build("() :- p('a'), p(?z, ?h)");
        assert.equal(query1.isEqualTo(query2), false);
    })

    it('case11', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("() :- q('b', ?z), r('a'), p(?z, ?h)");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case12', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("() :- q('b', ?z2), r('a'), p(?z, ?h)");
        assert.equal(query1.isEqualTo(query2), false);
    })

    it('case13', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?z, ?h), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), false);
    })

    it('case14', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?z2, ?h), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case15', function() {
        var query1 = existencialQueryModule.builder.build("() :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("() :- p(?z2, 'a'), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), false);
    })
})