import * as parameterModule  from "./parameterBuilder";
import * as bodyModule from "./bodyBuilder";

function _builder(){
	
	function buildEquality(equlityText)	{
		var left = parameterModule.builder.build(equlityText.split("=")[0].trim());
		var right = parameterModule.builder.build(equlityText.split("=")[1].trim());	
		return { left : left, right : right };
	}

	function eliminateDuplicates(_array){
		return Array.from(new Set(_array.map(p => p.name)));
	}


	return {		
			build : function(line){
				var split = line.split(":-");		
				var equalities = split[0].split(",");
				var head = equalities.map(e => buildEquality(e));

				return {
					body : bodyModule.builder.build(split[1]),
					head : head,
					toString : function(){
						var headText = this.head.map(e => e.left.toString() + " = " + e.right.toString()).join(", ");
						return [
								headText,
								" :- ",
								this.body.toString(),
								"."
								].join("");		
					},
					type : "EGD"
					/*,
					isValidKey : function(){
						
						//in egd body all predicate names are the same
						if(body.predicates[0].name != body.predicates[1].name)
							return false;
							
						//all predicates have the same quantity of parameters	
						if(body.predicates[0].parameters.length != body.predicates[1].parameters.length)
							return false;

						//all parameters are variables
						if(this.body.predicates.some(p => p.parameters.some(x => x.type == "constant")))
							return false;
						
						var allVariableNamesInTheHead = head.map(p => p.left).map(p => p.name).concat(head.map(p => p.right).map(p => p.name))

						//all variables in the head are present in the body
						/*if(!this.body.predicates.some(pred => pred.parameters.some(param => allVariableNamesInTheHead.some(n => n == param.name))))
							return false;
						
						if(this.body.predicates[0].parameters.some(
							(p,i)=> p.name != body.predicates[1].parameters[i].name && (!allVariableNamesInTheHead.some(n => n==)  )


						))

						return true;
					},
					keyPositions : function(){


					}*/



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


r(x,y1,z1),r(x,y2,z2) -> z1 = z2, y1 = y2.

?z1 = ?z2 :- r(?x,?y1,?z1),r(?x,?y2,?z2).

keys(r1, [1,2]).
*/
