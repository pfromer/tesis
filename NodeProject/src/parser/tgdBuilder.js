import * as predicateModule  from "./predicateBuilder";
import * as parameterModule  from "./parameterBuilder";
import * as bodyModule from "./bodyBuilder";
import mguModule from "../rewrite/mguBuilder";


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
			toString : predicate.toString,
			renameVariablesAndNulls : function(setOfAtoms){	

				var predicate = this.predicate.renameVariablesAndNulls(setOfAtoms);

				return {
					predicate : predicate,
					name : predicate.name,
					parameters : predicate.parameters,
					toString : predicate.toString,
					renameVariablesAndNulls : this.renameVariablesAndNulls,
					prependPrefixToAllVariables : this.prependPrefixToAllVariables
				}
			},
			prependPrefixToAllVariables : function(prefix){	

				var predicate = this.predicate.prependPrefixToAllVariables(prefix);

				return {
					predicate : predicate,
					name : predicate.name,
					parameters : predicate.parameters,
					toString : predicate.toString,
					renameVariablesAndNulls : this.renameVariablesAndNulls,
					prependPrefixToAllVariables : this.prependPrefixToAllVariables
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
					var unifies = mguModule.getMguForTgdHeadWithAtoms(atoms, this).unifies;
					if(!unifies) return false;
					if(!_nullPosition) return true;
					return atoms.every(
						a =>  a.parameters[_nullPosition].type != 'constant' && 
						!query.isSharedVariable(a.parameters[_nullPosition]))
					
				},
				isFactorizableFor : function(query, indexes){
					var atoms = query.getAtoms(indexes);
					var unifies = mguModule.getMguFor(atoms).unifies;
					if(!unifies) return false;
					var _nullPosition = this.nullPosition();
					if(!_nullPosition) return true;
					var variableAtNullPosition = atoms[0].parameters[_nullPosition];
					if(!atoms[0].parameters[_nullPosition]) return true;
					return atoms.every(
						a =>  a.parameters[_nullPosition].isEqualTo(variableAtNullPosition) && this.notNullPositionIndexes().every(i =>
							a.parameters[i].isConstant || !a.parameters[i].isEqualTo(variableAtNullPosition))
						) && query.getOtherAtoms(indexes).every(a => !a.hasVariable(variableAtNullPosition.name)) && !query.variablesInHead.some(v => v.name == variableAtNullPosition.name);

				},
				factorize(query){
					var allBodySubsetsIndxes = query.predicates.length.createArrayOfNElements().allSubSets();
					var i = 0;
					while(i < allBodySubsetsIndxes.length){
						if(allBodySubsetsIndxes[i].length > 1 && this.isFactorizableFor(query, allBodySubsetsIndxes[i])){
							var result = mguModule.getMguFor(query.getAtoms(allBodySubsetsIndxes[i]));
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
				},
				prependPrefixToAllVariables : function(prefix){
					var result = Object.assign({}, this);
					result.body = result.body.prependPrefixToAllVariables(prefix);
					result.head.predicate = result.head.predicate.prependPrefixToAllVariables(prefix);
					return result;
				}	
			}
		}
	}
}


export const builder = _builder();