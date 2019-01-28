function queryBuilder(){

	return {	
		build : function(queryText){
			var body = queryText.trim().substring(2);
			return {		
				predicates : servicesAndBuilders.bodyBuilder.build(body).predicates			
			}
		}
	}
}