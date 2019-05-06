import * as predicateModule  from "./predicateBuilder";
import * as bodyModule from "./bodyBuilder";
import { getMguFor } from "../rewrite/mguBuilder";


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
			name: predicate.name,
			parameters: predicate.parameters,
			toString : predicate.toString,
			renameVariablesAndNulls : function(setOfAtoms){			
				var renamedParameters = [];
				forEach(p => {
					if(p.type == 'null' || p.type == 'variable'){
						if(setOfAtoms.some(a => a.hasVariable(p.name))){
							var renamedP = parameterBuilder('?' + '_renamed_' + p.name);
							renamedP.type = renamedP.type;
							renamedParameters.push(renamedP);
						}
						else{
							renamedParameters.push(p);
						}
					}
				})

				return {
					name : this.name,
					parameters : renamedParameters,
					toString : function(){
						return this.name + "(" + renamedParameters.map(p => p.toString()).join(", ") + ")";
					},
					renameVariablesAndNulls : this.renameVariablesAndNulls
				}
			}
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
				},
				isApplicableTo : function(query, indexes){
					var atoms = query.getAtoms(indexes);
					var _nullPosition = this.nullPosition();
					return getMguFor(atoms, this.head).unfies && _nullPosition != -1 && query.getAtoms(indexes).all(
						a =>  a.parameters[_nullPosition].type != 'constant' && 
						!query.isSharedVariable(a.parameters[_nullPosition])
					)
				},
				nullPosition : function(){
					var found = false;
					var i = 0;
					while(!found && i<this.head.parameters.length){
						if(this.head.parameters[i].type == 'null')
						{
							found = true;							
						}
						i++;
					}
					if(found){
						return i-1;
					}
					else{
						return -1;
					}
				}
			}
		}
	}
}


export const builder = _builder();