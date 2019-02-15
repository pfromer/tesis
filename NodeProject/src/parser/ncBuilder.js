import * as bodyModule from "./bodyBuilder";
import * as queryModule from "./queryBuilder";

function _builder(){
	
	return {		
			build : function(line){				
				var split = line.split(":-");
				return {
					body : bodyModule.builder.build(split[1]),
					toString : function(){
						return ["⊥ :- ", this.body.toString(), "."].join("");						
					},
					toStringAsQuery : function(){
						return queryModule.builder.build("?-" + this.body.toString()).toString();
					},
					type : "NC"
					
				}
		}
	}
}

export const builder = _builder();