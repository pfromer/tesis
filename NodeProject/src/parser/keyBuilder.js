function _builder(){
	
	return {		
			build : function(line){				
				return {
                    parameters : JSON.parse(line.substring(line.indexOf('['),line.indexOf(']') + 1)),
                    predicate : line.substring(line.indexOf('(') + 1,line.indexOf(','))
					
				}
		}
	}
}

export const builder = _builder();