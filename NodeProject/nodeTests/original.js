import * as ncModule from "../src/parser/ncBuilder";


var chai = require('chai');


var assert = chai.assert,
    expect = chai.expect,
    should = chai.should(); // Note that should has to be executed

var foobar = {
  sayHello: function() {
    return 'funky chicken!';
  }
};

describe('Foobar', function() {
  describe('#sayHello()', function() {
    it('should work with assert', function() {
      assert.equal(foobar.sayHello(), 'funky chicken!');
    })

    it('should work with expect', function() {
      expect(foobar.sayHello()).to.equal('funky chicken!');
    })

    it('should work with should', function() {
      foobar.sayHello().should.equal('funky chicken!');
    })
  })
})


describe('Nc builder', function() {
  describe('#build', function() {
  

    it('nc builder is building correct string', function() {
      ncModule.builder.build("bottom :- p('a').").toString().should.equal("⊥ :- p('a').");
    })
  })
})