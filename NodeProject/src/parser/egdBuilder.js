import * as parameterModule  from "./parameterBuilder";
import * as bodyModule from "./bodyBuilder";

function _builder(){
	
	return {		
			build : function(line){
				var split = line.split(":-");		
				var head = split[0].split("=");
				var headLeft = parameterModule.builder.build(head[0].trim());
				var headRight = parameterModule.builder.build(head[1].trim());	
				return {
					body : bodyModule.builder.build(split[1]),
					head : { left : headLeft, right : headRight  },
					toString : function(){
						return [
								this.head.left.toString(), 
								" = ", 
								this.head.right.toString(), 
								" :- ",
								this.body.toString(),
								"."
								].join("");		
					},
					type : "EGD"
				}
			}
		}
}

export const builder = _builder();