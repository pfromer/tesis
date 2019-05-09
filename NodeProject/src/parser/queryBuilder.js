import * as bodyModule from "./bodyBuilder";
import { executeQuery } from "./../IrisCaller";

function _builder(){

	return {	
		build : function(queryText){
			var body = bodyModule.builder.build(queryText.trim().substring(2));			
			return {		
				predicates : body.predicates,
				toString : function(){ return ["?- ", body.toString(), "."].join("") },
				type : "QUERY",
				getAtmos : function(indexes){
					return indexes.map(i => this.predicates[i]);
				},
				execute : function(program){
					var programWithQuery = program.toStringWithoutNcsAndEgdsAndQueries() + "\n" + this.toString();
					return new Promise(resolve => {
						executeQuery(programWithQuery, program.isGuarded())
						.then(res => {							
							resolve(res);						
						});							
					})
				},
				isSharedVariable : function(parameter){
					if(parameter.type == 'constant'){
						return false;
					}
					else{
						return this.predicates.map(p => p.countFor(parameter)).reduce(function(a,b){return a + b}, 0)
						> 1;
					}
						

				}


			}
		}
	}
}

export const builder = _builder();

