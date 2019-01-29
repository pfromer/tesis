function ncBuilder(){
	
	return {		
			buildNc : function(line){				
				var split = line.split(":-");
				return {
					body : servicesAndBuilders.bodyBuilder.build(split[1]),
					toString : function(){
					return ["⊥ :- ", this.body.toString(), "."].join("");						
					}
					
				}
		}
	}
}