import * as bodyModule from "./bodyBuilder";

function _builder(){

	return {	
		build : function(queryText){
			var body = bodyModule.builder.build(queryText.trim().substring(2));			
			return {		
				predicates : body.predicates,
				toString : function(){ return ["?- ", body.toString(), "."].join("") }
			}
		}
	}
}

export const builder = _builder();