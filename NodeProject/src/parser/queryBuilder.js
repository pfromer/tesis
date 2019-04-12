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
				execute : function(program){
					var programWithQuery = program.toStringWithoutNcsAndEgdsAndQueries() + "\n" + this.toString();
					return new Promise(resolve => {
						executeQuery(programWithQuery, program.isGuarded())
						.then(res => {							
							resolve(res);						
						});							
					})
				}


			}
		}
	}
}

export const builder = _builder();

