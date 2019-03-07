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

/*
r(x,y,z),r(x,y,z2) -> z = z2. En este caso r[1] y r[2] forman una key.

r(x,y1,z1),r(x,y2,z2) -> z1 = z2. En este r[3] depende de r[1], pero 
							r[1] no es necesariamente una key


r(x,y1,z1),r(x,y2,z2) -> y1 = y2. En este r[2] depende de r[1], pero 
							r[1] no es necesariamente una key

PERO JUNTANDO LAS DOS ANTERIORES r[1] es una key.










*/
