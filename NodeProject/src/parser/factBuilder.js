import * as predicateModule  from "./predicateBuilder";

function _builder(){

	return {
	
		build : function(factText){		
			var predicate = predicateModule.builder.build(factText.trim().slice(0,-1));
			return {		
				name : predicate.name,
				parameters : predicate.parameters,
				toString : function(){ return [predicate.toString(), "."].join("") },
				type : "FACT"
			}
		}
	}
}

export const builder = _builder();