import * as tgdModule from "../src/parser/tgdBuilder";
import * as predicateModule from "../src/parser/predicateBuilder";
import * as parameterModule from "../src/parser/parameterBuilder";
import * as queryModule from "../src/parser/queryBuilder";
import * as existencialQueryModule from "../src/parser/existencialQueryBuilder";
import {getMguFor}  from "../src/rewrite/mguBuilder";

var chai = require('chai');


var assert = chai.assert;

describe('#factorizableTests()', function() {
    it('tgd should be factorizable in correct cases', function() {
        var tgd = tgdModule.builder.build("t(?x, ?y, ?z) :- r(?x, ?y), s(?x)");
        var query = existencialQueryModule.builder.build("() :- t(?a,?b,?c), t(?a,?e,?c)");
        assert.equal(tgd.isFactorizableFor(query, [0,1]), true);
    })

    it('tgd should be factorizable in correct cases example 2', function() {
        var tgd = tgdModule.builder.build("t(?x, ?y, ?z) :- r(?x, ?y), s(?x)");
        var query = existencialQueryModule.builder.build("() :- s(?c), t(?a,?b,?c), t(?a,?e,?c)");
        assert.equal(tgd.isFactorizableFor(query, [1,2]), false);
    })

    it('tgd should be factorizable in correct cases exmaple 3', function() {
        var tgd = tgdModule.builder.build("t(?x, ?y, ?z) :- r(?x, ?y), s(?x)");
        var query = existencialQueryModule.builder.build("() :- t(?a,?b,?c), t(?a,?c,?c)");
        assert.equal(tgd.isFactorizableFor(query, [0,1]), false);
    })

    it('tgd should be factorizable in correct cases exmaple 3', function() {
        var tgd = tgdModule.builder.build("t(?x, ?y, ?z) :- r(?x, ?y), s(?x)");
        var query = existencialQueryModule.builder.build("() :- t(?a,?b,?c), t(?a,?c,?c)");
        assert.equal(tgd.isFactorizableFor(query, [0,1]), false);
    })

    it('factorize function test 1', function() {
        var tgd = tgdModule.builder.build("t(?x, ?y, ?z) :- r(?x, ?y), s(?x)");
        var factorizedQuery = tgd.factorize(existencialQueryModule.builder.build("() :- t(?a,?b,?c), t(?a,?e,?c)"));
        var query2 = existencialQueryModule.builder.build("() :- t(?a,?b,?c)")
        assert.equal(factorizedQuery.isEqualTo(query2) , true);
    })

    it('factorize function test 2, factorize function should return same query when not factorizable', function() {
        var tgd = tgdModule.builder.build("t(?x, ?y, ?z) :- r(?x, ?y), s(?x)");
        var factorizedQuery = tgd.factorize(existencialQueryModule.builder.build("() :- s(?c), t(?a,?b,?c), t(?a,?e,?c)"));
        var query2 = existencialQueryModule.builder.build("() :- s(?c), t(?a,?b,?c), t(?a,?e,?c)");
        assert.equal(factorizedQuery.isEqualTo(query2) , true);
    })

})