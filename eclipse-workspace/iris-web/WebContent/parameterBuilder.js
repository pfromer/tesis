function parameterBuilder(){
	
	return {		
			build : function(parameter){
				if (parameter.startsWith("?")){
					var name = parameter.substring(1);				
					return {type: 'variable', name : name}
				}
				if (parameter.startsWith("'")){
					return{type: 'constant', value : parameter.slice(0,-1).substring(1)};
				}
		}
	}
}