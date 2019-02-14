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

	var regexAndBuilders = [
		{regEx: regExModule.service.tgdRegEx, builder: tgdModule.builder, properties: tgds },
		{regEx: regExModule.service.ncRegEx, builder: ncModule.builder, properties: ncs  },
		{regEx: regExModule.service.egdRegEx, builder: egdModule.builder, properties: egds },
		{regEx: regExModule.service.factRegEx, builder: factModule.builder, properties: facts },
		{regEx: regExModule.service.queryRegEx, builder: queryModule.builder, properties: queries }
	]

	for(var i = 0;i < lines.length;i++){
		var matched = false;
		regexAndBuilders.forEach(function (regexAndBuilders) {			
			if(regexAndBuilders.regEx.test(lines[i].trim())) {
				regexAndBuilders.properties.push(regexAndBuilders.builder.build(lines[i]));
				matched = true;			
			}
		});
		if(!matched){
			if(!regExModule.service.whiteSpacesRegEx.test(lines[i])) {
				errors.push({lineNumber : i, type : 'Invalid Line', text: lines[i]})
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
								debugger
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