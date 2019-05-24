import * as predicateModule  from "./predicateBuilder";
import * as parameterModule  from "./parameterBuilder";
import * as bodyModule from "./bodyBuilder";
import { getMguFor } from "../rewrite/mguBuilder";
import { format } from "url";


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
				this.parameters.forEach(p => {
					if(p.type == 'null' || p.type == 'variable'){
						if(setOfAtoms.some(a => a.hasVariable(p.name))){
							var renamedP = parameterModule.builder.build('?' + '_renamed_' + p.name);
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
					var unifies = getMguFor(atoms, this).unifies;
					if(!unifies) return false;
					return _nullPosition == undefined || (atoms.every(
						a =>  a.parameters[_nullPosition].type != 'constant' && 
						!query.isSharedVariable(a.parameters[_nullPosition])))
					
				},
				isFactorizableFor : function(query, indexes){
					var atoms = query.getAtoms(indexes);
					var unifies = getMguFor(atoms, this).unifies;
					if(!unifies) return false;
					var _nullPosition = this.nullPosition();
					if(_nullPosition == undefined) return true;
					var variableAtNullPosition = atoms[0].parameters[_nullPosition];
					return atoms.every(
						a =>  a.parameters[_nullPosition].isEqualTo(variableAtNullPosition) && this.notNullPositionIndexes().every(i =>
							a.parameters[i].isConstant || !a.parameters[i].isEqualTo(variableAtNullPosition))
						) && query.getOtherAtoms(indexes).every(a => !a.hasVariable(variableAtNullPosition.name))

				},
				factorize(query){
					var allBodySubsetsIndxes = query.predicates.length.createArrayOfNElements().allSubSets();
					var i = 0;
					while(i < allBodySubsetsIndxes.length){
						if(allBodySubsetsIndxes[i].length > 1 && this.isFactorizableFor(query, allBodySubsetsIndxes[i])){
							var result = getMguFor(query.getAtoms(allBodySubsetsIndxes[i]));
							var newQuery =  result.mgu(query);
							var predicates = [];
							//remove duplicates
							newQuery.predicates.forEach(p => {
								if(!predicates.some(p2 => p2.isEqualTo(p))){
									predicates.push(p);
								}
							});
							newQuery.predicates = predicates;
							return newQuery;
						}
						i++;
					}
					return query;
				},
				nullPosition : function(){
					var found = false;
					var i = 0;
					while(!found && i<this.head.predicate.parameters.length){
						if(this.head.predicate.parameters[i].type == 'null')
						{
							found = true;							
						}
						i++;
					}
					if(found){
						return i-1;
					}
					else{
						return undefined;
					}
				},
				notNullPositionIndexes : function(){
					var _nullPosition = this.nullPosition();
					//https://stackoverflow.com/questions/39924644/es6-generate-an-array-of-numbers
					return Array.from(Array(this.head.predicate.parameters.length).keys()).filter(i => i != _nullPosition);
				}
			}
		}
	}
}


export const builder = _builder();