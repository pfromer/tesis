import * as predicateModule  from "./predicateBuilder";
import * as bodyModule from "./bodyBuilder";


function _builder() {

	var buildTgdHeadPredicate = function (predicateText, tgdBody) {
		var predicate = predicateModule.builder.build(predicateText);
		var variables = predicate.parameters.filter(p => p.type == 'variable');

		//check if variable is actually a null (not present in tgd's body)
		for (var i = 0; i < variables.length; i++) {
			if (!tgdBody.hasVariable(variables[i].name)) {
				variables[i].type = 'null'
			}
		}

		return {
			predicate: predicate,
			name: predicate.name,
			parameters: predicate.parameters,
			toString : predicate.toString
		}
	}

	var buildTgdHead = function (headText, tgdBody) {
		return {
			predicate: buildTgdHeadPredicate(headText, tgdBody),
			prependPrefixToAllVariables: function(prefix){
				var result = Object.assign({}, this);
				result.predicate = result.predicate.prependPrefixToAllVariables(prefix);
				return result;
			}
		};
	};

	return {
		build : function (line) {
			var split = line.split("->");
			var body = bodyModule.builder.build(split[0]);
			var head = buildTgdHead(split[1], body);
			var allVariables = [];
			body.predicates.forEach(function (predicate) {
				predicate.allVariables().forEach(function (variable) {
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

				toJson: function () {
					return { 
						"head" : this.head.predicate.toString(),
						"body" : this.body.toString()
					}
				},
				type : isGuarded ? "GUARDED_TGD" : "UNAGARDED_TGD",
				arities : function(){
					var result = this.body.arities();
					if(this.head.predicate.name in result){
						result[this.head.predicate.name].push(this.head.predicate.parameters.length);						
					}
					else{
						result[this.head.predicate.name] = [this.head.predicate.parameters.length];
					}
					return result;
				},
				xPositionsInHead : function(){
					var result = [];
					this.head.predicate.parameters.forEach((parameter,index)=>{
						if(parameter.type === "variable"){
							result.push(index +1);
						}
					})
					return result;
				},
				allNullsAppearOnlyOnceInTheHead : function(){
					var allNullNames = this.head.predicate.parameters.filter(p => p.type == 'null').map(p => p.name);
					return allNullNames.unique().length == allNullNames.length;
				}
			}
		}
	}
}


export const builder = _builder();