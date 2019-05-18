import * as bodyModule from "./bodyBuilder";
import * as existencialQueryModule from "./existencialQueryBuilder";

function _builder(){

	return {	
		build : function(queryText){
			var body = bodyModule.builder.build(queryText.trim().substring(2));
			
			var variables = [];

			body.predicates.forEach(p => {

				p.parameters.forEach(x => {
					if(x.isVariable){
						if(!variables.some(v => v == x.toString())){
							variables.push(x.toString())
						}
					}
				})
			})
			
			return existencialQueryModule.builder.build("(" + variables.join(", ") + ") :- " + body.toString());
		}
	}
}

export const builder = _builder();

