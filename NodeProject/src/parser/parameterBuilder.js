function _builder(){


	var variableProto = {
		type: 'variable',
		isPredicate : false,
		isVariable: true,
		isConstant: false,
		toString : function() { return "?" + this.name },
	}

	var constantProto = {
		type: 'constant',
		isPredicate : false,
		isVariable: false,
		isConstant: true,
		toString : function() { return "'" + this.value + "'"}
	}

	function applyMgu(equations){
		var 

	}


	
	return {		
			build : function(parameter){
				if (parameter.startsWith("?")){
					var result = {};
					Object.setPrototypeOf(result, variableProto);
					var name = parameter.substring(1);
					result.name = name;
					result.applyMgu = applyMgu.bind(this);
					return result;
				}
				if (parameter.startsWith("'")){
					var result = {};
					Object.setPrototypeOf(result, constantProto);
					result.value = parameter.slice(0,-1).substring(1);
					result.applyMgu = function(equations){
						return this;
					}
					return result;
				}
		}
	}
}

export const builder = _builder();