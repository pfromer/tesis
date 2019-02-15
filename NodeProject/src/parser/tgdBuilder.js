import * as predicateModule  from "./predicateBuilder";
import * as bodyModule from "./bodyBuilder";


function _builder() {

	var buildTgdHeadPredicate = function (predicateText, tgdBody) {
		var predicate = predicateModule.builder.build(predicateText);
		var parameters = predicate.parameters.filter(p => p.type == 'variable');

		//check if variable is actually a null (not present in tgd's body)
		for (var i = 0; i < parameters.length; i++) {
			if (!tgdBody.hasVariable(parameters[i].name)) {
				parameters[i].type = 'null'
			}
		}

		return {
			name: predicate.name,
			parameters: predicate.parameters,
			toString : predicate.toString
		}
	}

	var buildTgdHead = function (headText, tgdBody) {
		return {
			predicate: buildTgdHeadPredicate(headText, tgdBody)
		};
	};

	return {
		build : function (line) {
			var split = line.split(":-");
			var body = bodyModule.builder.build(split[1]);
			var head = buildTgdHead(split[0], body);
			var allVariables = [];
			body.predicates.forEach(function (predicate) {
				predicate.allVariables.forEach(function (variable) {
					allVariables.push(variable);
				});
			});
			
			var isGuarded = body.predicates.some(p => p.hasAllVariables(allVariables));

			return {
				body: body,
				head: head,
				isGuarded: isGuarded,
				toString: function () {
					return [this.head.predicate.toString(), " :- ", this.body.toString(), "."].join("");
				},
				type : isGuarded ? "GUARDED_TGD" : "UNAGARDED_TGD" 
			}
		}
	}
}


export const builder = _builder();