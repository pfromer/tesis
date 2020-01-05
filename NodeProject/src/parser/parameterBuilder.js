function _builder(){

		
	return {		
			build : function(parameter){
				if (parameter.startsWith("?")){
					var result = {};
					result.type = 'variable';
					result.isPredicate = false;
					result.isVariable = true;
					result.isConstant = false;
					result.toString = function() { return "?" + this.name }
					var name = parameter.substring(1);
					result.name = name;
					return result;
				}
				if (parameter.startsWith("'")){
					var result = {};
					result.type = 'constant';
					result.isPredicate = false;
					result.isVariable = false;
					result.isConstant = true;
					result.toString = function() { return "'" + this.value + "'"};
					result.value = parameter.slice(0,-1).substring(1);
					return result;
				}
		}
	}
}

export const builder = _builder();