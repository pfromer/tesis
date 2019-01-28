function egdBuilder(){
	
	return {		
			buildEgd : function(line){
				var split = line.split(":-");		
				var head = split[0].split("=");
				var headLeft = servicesAndBuilders.parameterBuilder.build(head[0].trim());
				var headRight = servicesAndBuilders.parameterBuilder.build(head[1].trim());	
				return {
					body : servicesAndBuilders.bodyBuilder.build(split[1]),
					head : { left : headLeft, right : headRight  }
				}
			}
		}
}