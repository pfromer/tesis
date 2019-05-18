import * as tgdModule from "../src/parser/tgdBuilder";
import * as predicateModule from "../src/parser/predicateBuilder";
import * as parameterModule from "../src/parser/parameterBuilder";
import * as queryModule from "../src/parser/queryBuilder";
import * as existencialQueryModule from "../src/parser/existencialQueryBuilder";
import {getMguFor}  from "../src/rewrite/mguBuilder";

var chai = require('chai');


var assert = chai.assert;

describe('#applicabilityTests()', function() {

    it('atom should count correct appearances of variable', function() {
        var atom = predicateModule.builder.build("p('a', ?x, ?y, ?x)");
        var variableX = parameterModule.builder.build('?x');
        var variableY = parameterModule.builder.build('?y');
        var variableZ = parameterModule.builder.build('?z');
        assert.equal(atom.countFor(variableX), 2);
        assert.equal(atom.countFor(variableY), 1);
        assert.equal(atom.countFor(variableZ), 0);
    })

    it('should query respond variable is shared if one atom has that variabele more than once', function() {
        var query = queryModule.builder.build("?- p('a', ?x, ?x, ?y)");
        var variableX = parameterModule.builder.build('?x');
        var variableY = parameterModule.builder.build('?y');
        assert.equal(query.isSharedVariable(variableX), true);
        assert.equal(query.isSharedVariable(variableY), true); // it is also shares because it is transformed to (?x, ?y) :- p('a', ?x, ?x, ?y)
        //which means variable Y is is also in the head
    })

    it('should query respond variable is shared if one atom has that variabele more than once - boolean query', function() {
        var query = existencialQueryModule.builder.build("() :- p('a', ?x, ?x, ?y)");
        var variableX = parameterModule.builder.build('?x');
        var variableY = parameterModule.builder.build('?y');
        assert.equal(query.isSharedVariable(variableX), true);
        assert.equal(query.isSharedVariable(variableY), false); // it is also shares because it is transformed to (?x, ?y) :- p('a', ?x, ?x, ?y)
        //which means variable Y is is also in the head
    })

    it('should query respond variable is shared if two atoms have the same variabele in the same query', function() {
        var query = existencialQueryModule.builder.build("() :- p('a', ?x), r(?x, ?y)");
        var variableX = parameterModule.builder.build('?x');
        var variableY = parameterModule.builder.build('?y');
        assert.equal(query.isSharedVariable(variableX), true);
        assert.equal(query.isSharedVariable(variableY), false);
    })

    it('should query respond is not shared for constants', function() {
        var query = queryModule.builder.build("?- p('a', 'a'), r('a', ?y)");
        var constant = parameterModule.builder.build("'a'");
        assert.equal(query.isSharedVariable(constant), false);
    })

    it('tgd should rename its variables correctly', function() {
        var atom1 = predicateModule.builder.build("p(?x, ?y)");
        var atom2 = predicateModule.builder.build("p(?x, ?z)");
        var tgd = tgdModule.builder.build("q(?x, ?y) :- r('a', ?x, ?w)");
        var manuallyRenamedTgd = tgdModule.builder.build("q(?_renamed_x, ?_renamed_y) :- r('a', ?_renamed_x, ?w)");
        var atoms = [atom1, atom2];
        assert.equal(tgd.head.predicate.renameVariablesAndNulls(atoms).toString(), manuallyRenamedTgd.head.predicate.toString());
    })

    it('mgu should rename and then unify', function() {
        var atom1 = predicateModule.builder.build("p('a', 'b')");
        var atom2 = predicateModule.builder.build("p(?y, ?x)");
        var atom3_tgdHead = predicateModule.builder.build("p(?x, ?y)");
        var tgd = tgdModule.builder.build("p(?x, ?y) :- r('a', ?x, ?w)");        
        var result = getMguFor([atom1, atom2], tgd);
        var resultNotRenamed = getMguFor([atom1, atom2, atom3_tgdHead])
        assert.equal(result.unifies, true);
        assert.equal(resultNotRenamed.unifies, false);
    })


    it('tgd should return correct null position', function() {       
        var tgd = tgdModule.builder.build("p(?x, ?y) :- r(?x)");
        var tgd2 = tgdModule.builder.build("p(?x) :- r(?x)");
        var tgd3 = tgdModule.builder.build("p(?x, ?y, ?z) :- r(?x, ?y)");
        
        assert.equal(tgd.nullPosition(), 1);
        assert.equal(tgd2.nullPosition(), undefined);
        assert.equal(tgd3.nullPosition(), 2);
    })


    it("tgd should be applicable in the correct cases", function() {
        var tgd = tgdModule.builder.build("p(?x, ?y, ?z) :- r(?x, ?y)");
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y, 'a'), p(?x, 'b', ?w), p(?v1, ?v2, ?x), p(?x3, ?x4, ?x5)");
        assert.equal(tgd.isApplicableTo(query, [0]), false); //false because 'a' is in the null position
        assert.equal(tgd.isApplicableTo(query, [1]), true); //true because ?w is not a constant and is not a shared variable
        assert.equal(tgd.isApplicableTo(query, [2]), false); //false because ?x is a shared variable
        assert.equal(tgd.isApplicableTo(query, [3]), true); //true because ?x5 is not a constant and is not a shared variable
        assert.equal(tgd.isApplicableTo(query, [0,1]), false); //false because query.predicates[0] does not unify
        assert.equal(tgd.isApplicableTo(query, [1,3]), true); //true because query.predicates[1] and [3] both unify
    })

    it("tgd should be applicable if tgd unifies and there is not null position", function() {
        var tgd = tgdModule.builder.build("p(?x, ?y, ?x) :- r(?x, ?y)");
        var query = queryModule.builder.build("?- p(?x, ?y, 'a'), p(?x, 'b', ?w), p(?v1, ?v2, ?x)");
        assert.equal(tgd.isApplicableTo(query, [0]), true); 
        assert.equal(tgd.isApplicableTo(query, [1]), true);
        assert.equal(tgd.isApplicableTo(query, [2]), true);
        assert.equal(tgd.isApplicableTo(query, [0,1]), true); 
    })


})