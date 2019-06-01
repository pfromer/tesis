import * as bodyModule from "./bodyBuilder";
import * as parameterModule  from "./parameterBuilder";
import { executeQuery } from "./../IrisCaller";
import {UpdateArrayPrototype} from "./ArrayUtils";

function _builder(){

	return {	
		build : function(queryText){

			UpdateArrayPrototype();
			var queryText = queryText.trim();
			var isNegated = queryText[0] == '!';
			var subStringIndex = isNegated? 2 : 1;
			var split = queryText.split(":-");
			var body = bodyModule.builder.build(split[1].trim());
			var headString = split[0].trim();
			var variablesSeparatedByComma = headString.slice(0,-1).substring(subStringIndex).split(',');
			var variablesInHead = variablesSeparatedByComma.filter(v => v!="").map(v => parameterModule.builder.build(v.trim()));
			return {
        isNegated : isNegated,
				variablesInHead : variablesInHead,	
        predicates : body.predicates,
        isBoolean: function() {return this.variablesInHead.length == 0},
				toString : function(){
										var bodyString = this.predicates.map(p => p.toString()).join(', ');
                    return [isNegated ? "!" : "","(" + variablesInHead.map(v => v.toString()).join(", ") + ")", " :- ", bodyString, "."].join("")
                 },
        toNonExistencialQueryString: function(){ 
					var bodyString = this.predicates.map(p => p.toString()).join(', ');
					return ["?- ", bodyString, "."].join("") }
					,
				type : "EXISTENCIAL QUERY",
				getAtoms : function(indexes){
					return indexes.map(i => this.predicates[i]);
				},
				getOtherAtoms : function(indexes){
					return this.predicates.length.createArrayOfNElements().filter(i => !indexes.some(i2 => i2 == i)).map(i => this.predicates[i]);
				},
				allVariableNames : function(){
					return this.predicates.map(p => p.allVariables()).reduce(
						(flatenedArray, value) => flatenedArray.concat(value),
						[]
					).unique();
				},
				execute : function(program){
					var programWithQuery = program.toStringWithoutNcsAndEgdsAndQueries() + "\n" + this.toNonExistencialQueryString();
					var queryString = this.toString();
					var isNegated = this.isNegated;
					return new Promise(resolve => {
                        var variablesToShowByQuery = variablesInHead.map(v => v.toString());
						executeQuery(programWithQuery, program.isGuarded(), variablesToShowByQuery)
						.then(res => {
							res.data[0].Query = queryString;
							if(isNegated){
								res.data[0].BooleanResult = !res.data[0].BooleanResult;
							}
							resolve(res);						
						});							
					})
				},
				bodyPermutations: function() {
						return this.predicates.permutations();
				},
				isSharedVariable : function(parameter){
					if(parameter.type == 'constant'){
						return false;
					}
					else{
						return this.predicates.map(p => p.countFor(parameter)).reduce(function(a,b){return a + b}, 0) + variablesInHead.filter(v => v.isEqualTo(parameter)).length
						> 1;
					}
				},
				allBodySubsets : function(){
					return this.predicates.allSubSets();
				},
				applyMgu(equations){
					var result = Object.assign({}, this);
					result.variablesInHead = result.variablesInHead.map(v => v.applyMgu(equations));
					result.predicates = result.predicates.map(p => p.applyMgu(equations));
					return result;
				},
				replace: function(indexes, replacingPredicates){
					var result = Object.assign({}, this);
					var stayingPredicates = this.getOtherAtoms(indexes);
					var renamedPredicates = replacingPredicates.map(p => p.renameVariablesAndNulls(stayingPredicates));
					result.predicates = renamedPredicates.concat(stayingPredicates);
					return result;
				},				
				renameVariables(equations){
					var result = Object.assign({}, this);
					result.predicates = this.predicates.map(p => p.renameVariables(equations));
					return result;
				},
				isEqualTo: function(aQuery){
					if(aQuery.type != "EXISTENCIAL QUERY" || aQuery.predicates.length != this.predicates.length) return false;
					var otherQueryPermutations = aQuery.bodyPermutations();
					var allQueryParameters = this.variablesInHead.concat(this.predicates.map(p => p.parameters).reduce(function(previous, current){
						return previous.concat(current);
					}, []) );

					var isEqual = false;
					var i = 0;

					while(!isEqual && i < otherQueryPermutations.length){
						var variablesAlreadyChecked = [];
						var permutation = otherQueryPermutations[i];
						var mightBeEqual =  permutation.length.createArrayOfNElements().every(i => permutation[i].name == this.predicates[i].name && permutation[i].isNegated == this.predicates[i].isNegated);						
						if(mightBeEqual){
							var allOtherQueryParams = aQuery.variablesInHead.concat(permutation.map(p => p.parameters).reduce(function(previous, current){
								return previous.concat(current);
							}, []) );
							var parametersAreHomomorphic = true;
							var j = 0;
							while(j<allOtherQueryParams.length && parametersAreHomomorphic){
								var selfParam = allQueryParameters[j];
								var otherParam = allOtherQueryParams[j];
								if((selfParam.isConstant || otherParam.isConstant) && selfParam.value != otherParam.value){
									parametersAreHomomorphic = false;
								}
								else{
									if(!variablesAlreadyChecked.some(x => selfParam.name == x.name)){
										for(var k = 0; k<allOtherQueryParams.length; k++){
											if((allQueryParameters[k].name == selfParam.name && allOtherQueryParams[k].name != otherParam.name) || 
											(allQueryParameters[k].name != selfParam.name && allOtherQueryParams[k].name == otherParam.name)){
												parametersAreHomomorphic = false;
											}
										}
										if(parametersAreHomomorphic){
											variablesAlreadyChecked.push(selfParam);
										}
									}
								}
								j++;
							}
							isEqual = parametersAreHomomorphic;
						}
						i++;
					}
					return isEqual;
				}
			}
		}
	}
}

export const builder = _builder();

