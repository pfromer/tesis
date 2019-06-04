import {UpdateArrayPrototype} from "../parser/ArrayUtils";

var mguModule = {
    getMguFor : function getMguFor(arrayOfAtoms){
        var result = undefined;
        var equations = allAgainstAll(arrayOfAtoms);    
        var goOn = true;
        var deleted;
        var eliminated;
        var doesNotUnifyResult = {unifies: false};
        var atomEquations = equations.slice(0);//this makes a copy of an array
        UpdateArrayPrototype();
        if(atomEquations.some(e => !e.haveSameArity() || !e.predicatesAreTheSame())){
            return doesNotUnifyResult;
        }
        else{//elimiante all atom equations and transform to variable/variable or variable/constant equations
            atomEquations.forEach(e => {
                removeElement(equations, e);
                if (!e.parametersMightUnify()){
                    result = doesNotUnifyResult;
                }
                else{
                    Array.prototype.push.apply(equations,e.getAllVariableConstantEquations());
                }
            })
        }
    
        while(goOn){
            deleted = false;
            eliminated = false;
    
            var l1 = equations.length;
            equations = equations.filter(e => !e.isTrivial());
            var l2 = equations.length;
            if(l1 != l2){
                deleted = true;
            }
    
            for(var i = 0; i<equations.length; i++){            
                var eq = equations[i];
                var stays = eq.stays();
                var leaves = eq.leaves();
    
                if(stays && leaves){
                    for(var j = 0; j<equations.length; j++){                    
                        if(j!=i){
                            var eq2 = equations[j];
                            if(eq2.leftIsEqualToVariable(leaves)){
                                eliminated = true;
                                eq2.left = stays;
                            }                        
                            if(eq2.rightIsEqualToVariable(leaves)){
                                eliminated = true;
                                eq2.right = stays;
                            }
                            if(eq2.doesNotUnify()){
                                return doesNotUnifyResult;
                            }
                        }
                    }
                }
            }
    
            if(equations.some(e => e.doesNotUnify())){
                result = doesNotUnifyResult;
            }
    
            goOn = (deleted || eliminated)  && result == undefined;
        }
        if(result){
            return result;//comentario de prueba para commit
        }
        return {unifies: true, mgu : function(a){
            return a.applyMgu(equations);
        }}
    },
    getMguForTgdHeadWithAtoms: function (arrayOfAtoms, tgd){
        arrayOfAtoms.push(tgd.head.predicate.renameVariablesAndNulls(arrayOfAtoms));
        return this.getMguFor(arrayOfAtoms);
    }
}

function removeElement(equations, e){    
    var index = equations.indexOf(e);
    equations.splice( index, 1 );
}

function allAgainstAll(arrayOfAtoms){
    var result = [];

    for(var i = 0; i < arrayOfAtoms.length - 1; i++){
        for(var j = i + 1; j < arrayOfAtoms.length; j++){
            result.push(new atomEquation(arrayOfAtoms[i], arrayOfAtoms[j]));
        }
    }

    return result;
}

function atomEquation(left, right){
    this.right = right;
    this.left = left;

    this.haveSameArity = function(){
        return this.right.parameters.length == this.left.parameters.length;
    }

    this.predicatesAreTheSame = function(){
        return this.right.name == this.left.name;
    }

    this.parametersMightUnify = function(){
        if(!this.haveSameArity()) return false;
        if(!this.predicatesAreTheSame()) return false;

        return !this.left.parameters.length.createArrayOfNElements().some(i =>{
            return this.left.parameters[i].isConstant && this.right.parameters[i].isConstant && this.left.parameters[i].value != this.right.parameters[i].value;
            }
        )
    }

    this.getAllVariableConstantEquations = function(){
        return this.left.parameters.length.createArrayOfNElements().map(i => new variableConstantEquation(this.left.parameters[i], this.right.parameters[i]));
    }
}

function variableConstantEquation(left, right){
    this.left = left;
    this.right = right;

    this.unify = function(){

        if(this.left.isVariable || this.right.isVariable){
            return true;
        }

        if(this.left.isConstant){
            return this.right.value == this.left.value;
        }
    }

    this.areBothVariables = function(){
        return this.left.isVariable && this.right.isVariable;
    }

    //should only be invoked when both are variables
    this.firstLexicographically = function(){
        var compare = this.left.name.localeCompare(this.right.name);
        if(compare == 0 || compare == -1){
            return this.left;
        }
        else{
            return this.right;
        }
    }

    //should only be invoked when both are variables
    this.lastLexicographically = function(){
        return (this.firstLexicographically() == this.left) ? this.right : this.left;
    }

    this.oneIsVariable = function(){
        return this.left.isVariable || this.right.isVariable;
    }

    this.oneIsConstant = function(){
        return this.left.isConstant || this.right.isConstant;
    }

    this.oneIsVariableAndOneIsConstant = function(){
        return this.oneIsConstant() && this.oneIsVariable();
    }

    this.getVariable = function(){
        if(this.left.isVariable){
            return this.left;
        }
        if(this.right.isVariable){
            return this.right;
        }
    }

    this.getConstant = function(){
        if(this.left.isConstant){
            return this.left;
        }
        if(this.right.isConstant){
            return this.right;
        }
    }

    this.stays = function() {
        if(this.areBothVariables()){
            return this.firstLexicographically();
        }
        if(this.oneIsVariable() && this.oneIsConstant()){
            return this.getConstant();
        }
    }

    this.leaves = function() {
        if(this.areBothVariables()){
            return this.lastLexicographically();
        }
        if(this.oneIsVariableAndOneIsConstant()){
            return this.getVariable();
        }
    }

    this.doesNotUnify = function(){
        return this.left.isConstant && this.right.isConstant && this.left.value != this.right.value;
    }

    this.isTrivial = function(){
        return this.left.toString() == this.right.toString();
    }

    this.leftIsEqualToVariable = function(variable){
        return this.left.isVariable && this.left.name == variable.name
    }

    this.rightIsEqualToVariable = function(variable){
        return this.right.isVariable && this.right.name == variable.name
    }

}

export default mguModule;