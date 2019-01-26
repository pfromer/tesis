function ncBuilder(tgdText){
	
	return {		
			buildNc : function(line){
				var result = {};
				var split = line.split(":-");		
				result.body = bodyBuilder().build(split[1]);
				return result;
		}
	}
}