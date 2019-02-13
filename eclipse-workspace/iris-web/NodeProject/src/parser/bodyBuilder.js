import * as predicateModule  from "./predicateBuilder";
import * as regExModule from "./regExService";


function _builder(bodyText){
	
	var build = function(bodyText){
		var predicates = regExModule.service.arrayOfMatches(regExModule.service.withinPredicateRegEx, bodyText);
		var predicatesAsObjects = [];
		for (var i = 0; i < predicates.length; i++) {
			predicatesAsObjects.push(predicateModule.builder.build(predicates[i]));
		}		
		return { 
			predicates: predicatesAsObjects, 
			hasVariable : function(v){ return predicatesAsObjects.some(p => p.hasVariable(v))},
			toString : function(){
				return predicates.map(p => p.toString()).join(", ");
			}
		};		
	}
	
	return {
		build : build
	}
}

export const builder = _builder();