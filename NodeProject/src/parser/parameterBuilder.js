function _builder(){
	
	return {		
			build : function(parameter){
				if (parameter.startsWith("?")){
					var name = parameter.substring(1);				
					return {
						type: 'variable', 
						name : name, 
						toString : function() { return "?" + this.name }
						}
				}
				if (parameter.startsWith("'")){
					return{
						type: 'constant', 
						value : parameter.slice(0,-1).substring(1), 
						toString : function() { return "'" + this.value + "'"}
						};
				}
		}
	}
}

export const builder = _builder();