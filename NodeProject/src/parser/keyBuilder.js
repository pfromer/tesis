function _builder(){
	
	return {		
			build : function(line){				
				return {
                    parameters : JSON.parse(line.substring(line.indexOf('['),line.indexOf(']') + 1)),
					predicate : line.substring(line.indexOf('(') + 1,line.indexOf(',')),
					type : "KEY",
					isNonConflicting : function(tgd){
						return this.predicate != tgd.head.predicate.name ||
							(!this.parameters.isProperSubsetOf(tgd.xPositionsInHead()) && tgd.allNullsAppearOnlyOnceInTheHead());
					},
					toString: function(){
						return "key(" + this.predicate + "," + "[" + this.parameters.join(",") + "]).";
					} 
			}
		}
	}
}

export const builder = _builder();