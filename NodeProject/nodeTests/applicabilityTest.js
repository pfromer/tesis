import * as tgdModule from "../src/parser/tgdBuilder";
import * as predicateModule from "../src/parser/predicateBuilder";

var chai = require('chai');


var assert = chai.assert;

describe('#applicabilityTests()', function() {
    it('should ', function() {
        var tgd = tgdModule.builder.build("p(?x, ?y, ?z) :- q(?x, ?y)");
        var query = predicateModule.builder.build("?- p('a', ?x, ?z), r('a', ?z)");
        var result = tgd.isApplicableTo(query, [0]);


        //en la posicion 3 no puede haber shared variables ni constantes. en este caso hay una shared variable


    })


})