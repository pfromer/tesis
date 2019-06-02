import * as tgdModule from "../src/parser/tgdBuilder";
import * as predicateModule from "../src/parser/predicateBuilder";
import * as parameterModule from "../src/parser/parameterBuilder";
import * as queryModule from "../src/parser/queryBuilder";
import * as existencialQueryModule from "../src/parser/existencialQueryBuilder";
import {getMguFor}  from "../src/rewrite/mguBuilder";
import {rewrite}  from "../src/rewrite/rewrite";

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

describe('#queryAllVariableNamesTest()', function() {
    it('case 1', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x)");
        var allVariableNames = query.allVariableNames();
        assert.equal(allVariableNames.length, 1);
        assert.equal(allVariableNames.some(x => x == 'x'), true);
    })

    it('case 2', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y)");
        var allVariableNames = query.allVariableNames();
        assert.equal(allVariableNames.length, 2);
        assert.equal(allVariableNames.some(x => x == 'x'), true);
        assert.equal(allVariableNames.some(x => x == 'y'), true);
    })

    it('case 3', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), q(?z)");
        var allVariableNames = query.allVariableNames();
        assert.equal(allVariableNames.length, 3);
        assert.equal(allVariableNames.some(x => x == 'x'), true);
        assert.equal(allVariableNames.some(x => x == 'y'), true);
        assert.equal(allVariableNames.some(x => x == 'z'), true);
    })
})

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

    it('case16', function() {
        var query1 = existencialQueryModule.builder.build("(?x) :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("(?z2) :- p(?z2, 'a'), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), false);
    })

    it('case17', function() {
        var query1 = existencialQueryModule.builder.build("(?x, ?y) :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("(?z2, ?h) :- p(?z2, ?h), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), true);
    })

    it('case18', function() {
        var query1 = existencialQueryModule.builder.build("(?x, ?y) :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("(?z2) :- p(?z2, ?h), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), false);
    })

    it('case19', function() {
        var query1 = existencialQueryModule.builder.build("(?x, ?y) :- p(?x, ?y), r('a'), q('b', ?x)");
        var query2 = existencialQueryModule.builder.build("(?h, ?z2) :- p(?z2, ?h), r('a'), q('b', ?z2)");
        assert.equal(query1.isEqualTo(query2), false);
    })
})

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

    it('should unify p(b, ?x) with p(?x, ?x) to p(b, b)', function() {
        var atom1 = predicateModule.builder.build("p('b', ?x)");
        var atom2 = predicateModule.builder.build("p(?x, ?x)");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.unifies, true);
        assert.equal(result.mgu(atom1).toString(), predicateModule.builder.build("p('b', 'b')").toString());
        assert.equal(result.mgu(atom1).toString(), result.mgu(atom2).toString());
        assert.equal(result.mgu(atom2.parameters[0]).toString(), atom1.parameters[0].toString());
        assert.equal(result.unifies, true);
    })

    it('should not unify p(b, ?x, ?x) with p(?x, ?x, ?x) and p(?x, a, ?x)', function() {
        var atom1 = predicateModule.builder.build("p('b', ?x, ?x)");
        var atom2 = predicateModule.builder.build("p(?x, ?x, ?x)");
        var atom3 = predicateModule.builder.build("p(?x, 'a', ?x)");
        var result = getMguFor([atom1, atom2, atom3]);
        assert.equal(result.unifies, false);
    })

    it('should unify p(?x, ?y) with p(?z, ?z) to p(?x, ?x)', function() {
        var atom1 = predicateModule.builder.build("p(?x, ?y)");
        var atom2 = predicateModule.builder.build("p(?z, ?z)");
        var result = getMguFor([atom1, atom2]);
        assert.equal(result.mgu(atom1).toString(), predicateModule.builder.build("p(?x, ?x)").toString());
        assert.equal(result.mgu(atom2).toString(), predicateModule.builder.build("p(?x, ?x)").toString());
        assert.equal(result.unifies, true);
    })

})

describe('#queryReplace()', function() {
    it('should replace correctly case 1', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x)");
        var atom1 = predicateModule.builder.build("q(?x)");
        var query2 = query.replace([1], [atom1]);
        var query3 = existencialQueryModule.builder.build("() :- p(?x, ?y), q(?z)");
        assert.equal(query2.isEqualTo(query3), true);
    })

    it('should replace correctly case 2', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x)");
        var atom1 = predicateModule.builder.build("q(?x)");
        var query2 = query.replace([0], [atom1]);
        var query3 = existencialQueryModule.builder.build("() :- q(?y), r(?z)");
        assert.equal(query2.isEqualTo(query3), true);
    })

    it('should replace correctly case 3', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x)");
        var atom1 = predicateModule.builder.build("q(?x)");
        var query2 = query.replace([0,1], [atom1]);
        var query3 = existencialQueryModule.builder.build("() :- q(?y)");
        assert.equal(query2.isEqualTo(query3), true);
    })

    it('should replace correctly case 4', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x), q(?x)");
        var atom1 = predicateModule.builder.build("t1(?z)");
        var atom2 = predicateModule.builder.build("t2(?z)");
        var query2 = query.replace([1,2], [atom1, atom2]);
        var query3 = existencialQueryModule.builder.build("() :- p(?x, ?y), t1(?z), t2(?z)");
        assert.equal(query2.isEqualTo(query3), true);
    })
})

describe('#query rename variables', function() {
    it('should rename correctly case 1', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x)");
        var equations = [{original : 'x', renameTo: 'x2'}, {original : 'y', renameTo: 'y3'}];
        var renamedQuery = query.renameVariables(equations);
        assert.equal(renamedQuery.toString(), "() :- p(?x2, ?y3), r(?x2).");
    })

    it('should rename correctly case 2', function() {
        var query = existencialQueryModule.builder.build("() :- p(?x, ?y), r(?x), q(?z)");
        var equations = [{original : 'x', renameTo: 'x2'}, {original : 'y', renameTo: 'y3'}];
        var renamedQuery = query.renameVariables(equations);
        assert.equal(renamedQuery.toString(), "() :- p(?x2, ?y3), r(?x2), q(?z).");
    })
})

describe('#rewrite', function() {
    it('should rewrite correctly case 1', function() {
        var query = existencialQueryModule.builder.build("() :- t(?a, ?b, ?c), r(?b, ?c)");
        var tgd1 = tgdModule.builder.build("t(?x, ?x, ?z) :- s(?x)");
        var tgd2 = tgdModule.builder.build("r(?y, ?z) :- t(?x, ?y, ?z)");
        var rewritenQuery = rewrite(query, [tgd1, tgd2]);
        var query2 = existencialQueryModule.builder.build("() :- t(?a, ?b, ?c), r(?b, ?c), t(?a, ?b, ?c), t(?v1, ?b, ?c),  s(?a).");
        assert.equal(query2.isEqualTo(rewritenQuery), true);
    })
})

describe('#rewrite', function() {
    it('should rewrite correctly case 2', function() {
        var query = existencialQueryModule.builder.build("() :- t(?x, ?y, ?z), r(?y, ?z)");
        var tgd1 = tgdModule.builder.build("t(?a, ?a, ?c) :- s(?a)");
        var tgd2 = tgdModule.builder.build("r(?b, ?c) :- t(?a, ?b, ?c)");
        var rewritenQuery = rewrite(query, [tgd1, tgd2]);
        var query2 = existencialQueryModule.builder.build("() :- t(?x, ?y, ?z), r(?y, ?z), t(?x, ?y, ?z), t(?v1, ?y, ?z),  s(?x).");
        assert.equal(query2.isEqualTo(rewritenQuery), true);
    })
})