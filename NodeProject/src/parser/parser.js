import * as regExModule from "./regExService";
import * as tgdModule from "./tgdBuilder";
import * as ncModule from "./ncBuilder";
import * as egdModule from "./egdBuilder";
import * as factModule from "./factBuilder";
import * as queryModule from "./queryBuilder";
import { executeQuery } from "../IrisCaller";


export function parse (program){
	
	var tgds = [];
	var facts = [];
	var ncs = [];
	var egds = [];		
	var queries = [];
	var errors = [];
	
	var lines = program.split('\n');

	var programStructure = []

	var regexAndBuilders = [
		{regEx: regExModule.service.tgdRegEx, builder: tgdModule.builder, collection: tgds },
		{regEx: regExModule.service.ncRegEx, builder: ncModule.builder, collection: ncs  },
		{regEx: regExModule.service.egdRegEx, builder: egdModule.builder, collection: egds },
		{regEx: regExModule.service.factRegEx, builder: factModule.builder, collection: facts },
		{regEx: regExModule.service.queryRegEx, builder: queryModule.builder, collection: queries }
	]

	for(var i = 0;i < lines.length;i++){
		var matched = false;
		regexAndBuilders.forEach(function (regexAndBuilder) {			
			if(regexAndBuilder.regEx.test(lines[i].trim())) {
				var lineAsObject = Object.assign({lineNumber : i}, regexAndBuilder.builder.build(lines[i]));
				regexAndBuilder.collection.push(lineAsObject);
				matched = true;
				programStructure.push({text: lines[i], type: lineAsObject.type})			
			}
		});
		if(!matched){
			if(!regExModule.service.whiteSpacesRegEx.test(lines[i])) {
				errors.push({lineNumber : i, text: lines[i]})
				programStructure.push({text: lines[i], type: "SYNTAX_ERROR"})
			}
			else{
				programStructure.push({text: " ", type: "EMPTY_LINE"})
			}
		}
	}

	function toStringForNc(program, nc){
		return program.tgds.concat(program.facts).concat(nc.toStringAsQuery()).join("\n");
	}
	

	return  { 	
				tgds: tgds, 
				ncs : ncs,
				egds: egds,
				queries : queries, 
				facts: facts,
				programStructure : programStructure,
				ungardedTgds : function() { return this.tgds.filter(t => !t.isGuarded)}, 
				isGuarded : function() { return this.tgds.every(t => t.isGuarded)},
				isLinear : function() { return this.tgds.every(t => t.body.predicates.length == 1)}, 
				toString : function(){
					return this.ncs.concat(this.egds).concat(this.tgds).concat(this.facts).concat(this.queries).join("\n");					
				},
				toStringWithoutNcsAndEgds : function(){
					return this.tgds.concat(this.facts).concat(this.queries).join("\n");
				},
				errors: errors,
				consistencyPromise: function(){

					var result = [];

					var currentProgram = this;
					var getProm = function(nc) {
						return new Promise(resolve => {
							executeQuery(toStringForNc(currentProgram, nc))
							.then(res => {
								result.push({nc: nc, result: res.data })
								resolve(result);								
							});
							
						})
					}					
				
					let chain = Promise.resolve();

					this.ncs.forEach((nc) => {
						chain = chain.then(()=>getProm(nc))
					});	
				
					return chain;

				}
			};
}