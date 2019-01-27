function egdBuilder(){
	
	return {		
			buildEgd : function(line){
				var split = line.split(":-");		
				var head = split[0].split("=");
				var headLeft = parameterBuilder().build(head[0].trim());
				var headRight = parameterBuilder().build(head[1].trim());	
				return {
					body : bodyBuilder().build(split[1]),
					head : { left : headLeft, right : headRight  }
				}
			}
		}
}