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

			var hasVariable = function (v) {
				return parametersAsObjets.some(p => p.name == v)
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
				hasVariable: hasVariable,
				allVariables: parametersAsObjets.filter(p => p.type == 'variable').map(p => p.name),
				hasAllVariables: function (variables) {
					return variables.every(v => hasVariable(v));
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
				}
			}
		}
	}
}

export const builder = _builder();