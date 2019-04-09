function _builder(){

	function buildPredicate(predicateName, keyPositions, arity, predicateNumber){

		var i = 1;
		var parameters = [];

		while(i <= arity){
			if(!keyPositions.includes(i)){
				parameters.push("?x" + i + predicateNumber);								
			}
			else{
				parameters.push("?x" + i);
			}
			i++;						
		}

		return predicateName + "(" + parameters.join(", ") + ")";
	}
	
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
					},
					toQueryString: function(program){
						
						var lineNumber = Object.keys(program.arityDictionary.dictionary[this.predicate])[0];
						var arity = program.arityDictionary.dictionary[this.predicate][lineNumber][0];
						var p1 = buildPredicate(this.predicate, this.parameters, arity, "1");
						var p2 = buildPredicate(this.predicate, this.parameters, arity, "2");


						var inequalities = [];
						var i = 1;
						while(i <= arity){
							if(!this.parameters.includes(i)){
								inequalities.push("?x" + i + + "1" + " != " + "?x" + i + "2");
							}
							i++;
						}
						
						var queries = [];

						inequalities.forEach( ineq => {
							queries.push("?- " + [p1, p2, ineq].join(", ") + ".");
						})

						return queries.join("\n");
					}, 
					getQueryForProgram : function(program){
						return program.facts.concat(this.toQueryString(program)).join("\n");
					}
			}
		}
	}
}

export const builder = _builder();