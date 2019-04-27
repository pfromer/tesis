import {getMguFor}  from "../src/rewrite/mguBuilder";
import * as predicateModule from "../src/parser/predicateBuilder";

var chai = require('chai');


var assert = chai.assert;

describe('#getMguFor()', function() {
    it('should return identity function for single atom', function() {
    var atom = predicateModule.builder.build("p(?x, ?y)");
    var result = getMguFor([atom]);
    assert.equal(result.unifies, true);
    assert.equal(result.mgu(atom.parameters[0]).toString(), atom.parameters[0].toString());
    assert.equal(result.mgu(atom.parameters[1]).toString(), atom.parameters[1].toString());
    })

    it('should not unify for atoms with different predicate name', function() {
        var atom1 = predicateModule.builder.build("p(?x, ?y)");
        var atom2 = predicateModule.builder.build("q(?x, ?y)");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.unifies, false);
        assert.equal(result.mgu, undefined);
    })


    it('should not unify for atoms when different constant in same position', function() {
        var atom1 = predicateModule.builder.build("p('a')");
        var atom2 = predicateModule.builder.build("p('b')");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.unifies, false);
        assert.equal(result.mgu, undefined);
    })

    it('should unify variable with constant in same position', function() {
        var atom1 = predicateModule.builder.build("p(?x)");
        var atom2 = predicateModule.builder.build("p('b')");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.unifies, true);
        assert.equal(result.mgu(atom1.parameters[0]).toString(), atom2.parameters[0].toString());
    })

    it('should not unify p(?x, ?x) with p(b, a)', function() {
        var atom1 = predicateModule.builder.build("p(?x, ?x)");
        var atom2 = predicateModule.builder.build("p('b', 'a')");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.unifies, false);
    })

    it('should not unify p(b, ?x) with p(?x, a)', function() {
        var atom1 = predicateModule.builder.build("p('b', ?x)");
        var atom2 = predicateModule.builder.build("p(?x, 'a')");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.unifies, false);
    })

})