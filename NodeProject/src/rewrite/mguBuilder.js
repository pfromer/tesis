export function getMguFor(arrayOfAtoms){
    var result = undefined;
    var equations = allAgainstAll(arrayOfAtoms);    
    var goOn = true;
    var deleted;
    var eliminated;
    var doesNotUnifyResult = {unifies: false};
    var atomEquations = equations.filter(e => e.left.isPredicate && e.right.isPredicate);
    if(atomEquations.some(e => e.left.name != e.right.name)){
        return doesNotUnifyResult;
    }
    else{//elimiante all atom equations and transform to variable/variable or variable/constant equations
        atomEquations.forEach(e => {
            var index = equations.indexOf(e);
            equations.splice( index, 1 );

            if(e.right.parameters.length != e.left.parameters.length){
                result = doesNotUnifyResult;
            }
            
            for(var i = 0; i < e.left.parameters.length; i++){
                var leftParameter = e.left.parameters[i];
                var rightParameter = e.right.parameters[i];
                if(leftParameter.isConstant && rightParameter.isConstant && leftParameter.value != rightParameter.value ){
                    result = doesNotUnifyResult;
                }else{
                    equations.push(new variableConstantEquation(leftParameter, rightParameter));
                }
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
       return result;
   }



    return {unifies: true, mgu : function(a){
        return a.applyMgu(equations);
    }}
}

function allAgainstAll(arrayOfAtoms){
    var result = [];

    for(var i = 0; i < arrayOfAtoms.length - 1; i++){
        for(var j = i + 1; j < arrayOfAtoms.length; j++){
            result.push({left: arrayOfAtoms[i], right: arrayOfAtoms[j]})
        }
    }

    return result;
}

function variableConstantEquation(left, right){
    this.left = left;
    this.right = right;

    this.unify = function(){

        if(left.isVariable || right.isVariable){
            return true;
        }

        if(left.isConstant){
            return right.value == left.value;
        }
    }

    this.areBothVariables = function(){
        return left.isVariable && right.isVariable;
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
        var compare = this.right.name.localeCompare(this.left.name);
        if(compare == 0 || compare == -1){
            return this.left;
        }
        else{
            return this.right;
        }
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