function factBuilder(){

	return {
	
		build : function(factText){		
			var predicate = servicesAndBuilders.predicateBuilder.build(factText.trim().slice(0,-1));
			return {		
				name : predicate.name,
				parameters : predicate.parameters,
				toString : function(){ return [predicate.toString(), "."].join("") }
			}
		}
	}
}