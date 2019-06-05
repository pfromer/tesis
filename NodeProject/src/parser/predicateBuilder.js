import * as parameterModule  from "./parameterBuilder";
import * as regExModule from "./regExService";


function _builder(tgdText) {

	return {
		build: function (predicateText) {
			var parameters = regExModule.service.arrayOfMatches(regExModule.service.variableOrConstantRegEx, predicateText);
			var parametersAsObjets = [];
			for (var i = 0; i < parameters.length; i++) {
				parametersAsObjets.push(parameterModule.builder.build(parameters[i]));
			};

			var getName = function(){
				if (regExModule.service.equalRegex.test(predicateText)){
					return "equals";
				}
				if(regExModule.service.notEqualRegex.test(predicateText)){
					return "not_Equals";
				}
				if(regExModule.service.negatedPredicateRegEx.test(predicateText)){
					return predicateText.split("(")[0].trim().substring(1);
				}
				else if(regExModule.service.withinPredicateRegEx.test(predicateText)){
					return predicateText.split("(")[0].trim();
				}
			};

			var isNegated = regExModule.service.negatedPredicateRegEx.test(predicateText);

			return {
				name: getName(),
				parameters: parametersAsObjets,
				hasVariable: function(varName){return this.allVariables().some(v => varName == v)},
				allVariables: function(){return this.parameters.filter(p => p.type == 'variable').map(p => p.name)},
				hasAllVariables: function (variables) {
					return variables.every(v => this.hasVariable(v));
				},
				isNegated : isNegated,
				toString: function () {
					return [this.isNegated ? "!" : "", this.name, "(", this.parameters.map(p => p.toString()).join(", "), ")"].join("");
				},
				type : "predicate",
				isPredicate : true,
				isVariable: false,
				isConstant: false,
				applyMgu: function(equations){
					var result = Object.assign({}, this);
					result.parameters = this.parameters.map(p => p.applyMgu(equations));
					return result;
				},
				countFor: function(variable){
					return this.parameters.filter(p=> p.isEqualTo(variable)).length;
				},
				isEqualTo(anotherPredicate){
					if(anotherPredicate.type != this.type) return false;
					if(anotherPredicate.isNegated != this.isNegated) return false;
					if(anotherPredicate.name != this.name) return false;
					if(anotherPredicate.parameters.length != this.parameters.length) return false;
					return anotherPredicate.parameters.length.createArrayOfNElements().every(i => anotherPredicate.parameters[i].isEqualTo(this.parameters[i]));
				},
				renameVariablesAndNulls : function(setOfAtoms){
					var result = Object.assign({}, this);
					result.parameters =  result.parameters.filter(p => p.type == 'null' || p.type == 'variable').map(p => {
						var renamedP = p.renameIfPresentInAtoms(setOfAtoms);
						renamedP.type = p.type;
						return renamedP;
					})
					return result;
				},
				prependPrefixToAllVariables : function(prefix){
					var result = Object.assign({}, this);
					result.parameters =  result.parameters.filter(p => p.type == 'null' || p.type == 'variable').map(p => {
						var renamedP = p.preprendPrefix(prefix);
						renamedP.type = p.type;
						return renamedP;
					})
					return result;
				},
				removeFirstCharacterFromAllVars: function(){
					var result = Object.assign({}, this);
					result.parameters =  result.parameters.filter(p => p.type == 'null' || p.type == 'variable').map(p => {
						var renamedP = p.removeFirstCharacter();
						renamedP.type = p.type;
						return renamedP;
					})
					return result;

				},
				renameVariables(equations){
					var result = Object.assign({}, this);
					result.parameters = this.parameters.filter(p => p.isVariable).map(p => p.renameFromEquations(equations));					
					return result;
				}
			}
		}
	}
}

export const builder = _builder();