function _builder(){

		
	return {		
			build : function(parameter){
				if (parameter.startsWith("?")){
					var result = {};
					result.type = 'variable';
					result.isPredicate = false;
					result.isVariable = true;
					result.isConstant = false;
					result.toString = function() { return "?" + this.name }
					var name = parameter.substring(1);
					result.name = name;
					result.isEqualTo = function(variable){
						return this.type == variable.type && this.name == variable.name;
					}
					result.applyMgu = function(equations){
						var mathchesByConstant = equations.filter(e => e.oneIsVariableAndOneIsConstant() && e.getVariable().name == this.name);
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
					result.renameIfPresentInAtoms = function(setOfAtoms){
						if(setOfAtoms.some(a => a.hasVariable(this.name))){
							var renamedVar = Object.assign({}, this);
							renamedVar.name = "_renamed_" + this.name;
							return renamedVar;
						}
						return this;
					}					
					result.preprendPrefix = function(prefix){
						var renamedVar = Object.assign({}, this);
						renamedVar.name = prefix + this.name;
						return renamedVar;
					}
					result.renameFromEquations = function(equations){
						var match = equations.find(x => x.original == this.name);
						if(match){
							var renamedVariable = Object.assign({}, this);
							renamedVariable.name = match.renameTo;
							return renamedVariable;		
						}
						return this;
					}

					return result;
				}
				if (parameter.startsWith("'")){
					var result = {};
					result.type = 'constant';
					result.isPredicate = false;
					result.isVariable = false;
					result.isConstant = true;
					result.toString = function() { return "'" + this.value + "'"};
					result.value = parameter.slice(0,-1).substring(1);
					result.isEqualTo = function(anotherConstant){
						return this.type == anotherConstant.type && this.value == anotherConstant.value;
					}
					result.applyMgu = function(equations){
						return this;
					}
					return result;
				}
		}
	}
}

export const builder = _builder();