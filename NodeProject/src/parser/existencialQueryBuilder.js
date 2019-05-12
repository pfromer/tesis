import * as bodyModule from "./bodyBuilder";
import * as parameterModule  from "./parameterBuilder";
import { executeQuery } from "./../IrisCaller";

function _builder(){

	return {	
		build : function(queryText){

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
                body: body,
                isBoolean: function() {return this.variablesInHead.length == 0},
				toString : function(){
                    return [isNegated ? "!" : "","(" + variablesInHead.map(v => v.toString()).join(", ") + ")", " :- ", body.toString(), "."].join("")
                 },
                toNonExistencialQueryString: function(){ return ["?- ", body.toString(), "."].join("") },
				type : "EXISTENCIAL QUERY",
				getAtoms : function(indexes){
					return indexes.map(i => this.predicates[i]);
				},
				getOtherAtoms : function(indexes){
					return Array.from(Array(this.predicates.length).keys()).filter(i => !indexes.some(i2 => i2 == i)).map(i => this.predicates[i]);
				},
				execute : function(program){
					var programWithQuery = program.toStringWithoutNcsAndEgdsAndQueries() + "\n" + this.toNonExistencialQueryString();
					var queryString = this.toString();
					var isBoolean = this.isBoolean();
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
				isSharedVariable : function(parameter){
					if(parameter.type == 'constant'){
						return false;
					}
					else{
						return this.predicates.map(p => p.countFor(parameter)).reduce(function(a,b){return a + b}, 0) + variablesInHead.filter(v => v.isEqualTo(parameter)).length
						> 1;
					}
				}
			}
		}
	}
}

export const builder = _builder();

