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
                    return [isNegated ? "!" : "","(" + this.variablesInHead.map(v => v.toString()).join(", ") + ")", " :- ", bodyString, "."].join("")
                 },
        toNonExistencialQueryString: function(){ 
					var bodyString = this.predicates.map(p => p.toString()).join(', ');
					return ["?- ", bodyString, "."].join("") }
					,
				type : "EXISTENCIAL QUERY",
				toJson: function() {
					return {
						"showInOutput" : variablesInHead.map(v => v.name),
						"body" : this.predicates.map(p => p.toString()).join(', ')
					}
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
						})
						.catch(err =>{
							console.log("hubo un error " + err)
	
					});							
					})
				}
			}
		}
	}
}

export const builder = _builder();

