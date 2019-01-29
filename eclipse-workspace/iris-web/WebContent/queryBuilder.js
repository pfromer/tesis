function queryBuilder(){

	return {	
		build : function(queryText){
			var body = servicesAndBuilders.bodyBuilder.build(queryText.trim().substring(2));			
			return {		
				predicates : body.predicates,
				toString : function(){ return ["?- ", body.toString(), "."].join("") }
			}
		}
	}
}