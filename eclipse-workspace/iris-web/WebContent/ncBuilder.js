function ncBuilder(){
	
	return {		
			buildNc : function(line){
				var result = {};
				var split = line.split(":-");		
				result.body = servicesAndBuilders.bodyBuilder.build(split[1]);
				return result;
		}
	}
}