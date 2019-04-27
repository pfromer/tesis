function _builder(){


	var variableProto = {
		type: 'variable',
		isPredicate : false,
		isVariable: true,
		isConstant: false,
		toString : function() { return "?" + this.name },
	}

		
	return {		
			build : function(parameter){
				if (parameter.startsWith("?")){
					var result = {};
					result.type = 'variable';
					result.isPredicate = false;
					result.isVariable = true;
					result.isConstant = false;
					result.toString = function() { return "'" + this.value + "'"};
					var name = parameter.substring(1);
					result.name = name;
					result.applyMgu = function(equations){

						var mathchesByConstant = equations.filter(e => e.oneIsVariableAndOneIsConstant && e.getVariable().name == this.name);
						if(mathchesByConstant.length == 1){
							return mathchesByConstant[0].getConstant();
						}
						else{
							var matchesByVariable =  equations.filter(e => e.areBothVariables() && e.lastLexicographically().name == this.name);
							if(matchesByVariable.length == 1){
								return matchesByVariable[0].firstLexicographically();
							}
							else{
								return this;
							}
						}
					}
					return result;
				}
				if (parameter.startsWith("'")){
					var result = {};
					result.type = 'constant';
					result.isPredicate = false;
					result.isVariable = false;
					result.isConstant = true;
					result.toString = function() { return "?" + this.name };
					result.value = parameter.slice(0,-1).substring(1);
					result.applyMgu = function(equations){
						return this;
					}
					return result;
				}
		}
	}
}

export const builder = _builder();