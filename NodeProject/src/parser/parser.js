import * as regExModule from "./regExService";
import * as tgdModule from "./tgdBuilder";
import * as ncModule from "./ncBuilder";
import * as keyModule from "./keyBuilder";
import * as factModule from "./factBuilder";
import * as queryModule from "./queryBuilder";
import { executeProgram } from "../IrisCaller";
import * as existencialQueryModule from "./existencialQueryBuilder";
import {ArityDictionary} from "./ArityDictionary";

export function parse (program){

	var tgds = [];
	var facts = [];
	var ncs = [];
	var keys = [];		
	var queries = [];
	var errors = [];
	
	var lines = program.split('\n');

	var arityDictionary = new ArityDictionary();

	var programStructure = []

	var regexAndBuilders = [
		{regEx: regExModule.service.tgdRegEx, builder: tgdModule.builder, collection: tgds },
		{regEx: regExModule.service.ncRegEx, builder: ncModule.builder, collection: ncs  },
		{regEx: regExModule.service.keyRegEx, builder: keyModule.builder, collection: keys },
		{regEx: regExModule.service.factRegEx, builder: factModule.builder, collection: facts },
		{regEx: regExModule.service.queryRegEx, builder: queryModule.builder, collection: queries },
		{regEx: regExModule.service.existencialQueryRegEx, builder: existencialQueryModule.builder, collection: queries }
	]

	
	for(var i = 0;i < lines.length;i++){
		var matched = false;
		regexAndBuilders.forEach(function (regexAndBuilder) {			
			if(regexAndBuilder.regEx.test(lines[i].trim())) {
				var lineAsObject = Object.assign({lineNumber : i}, regexAndBuilder.builder.build(lines[i]));
				regexAndBuilder.collection.push(lineAsObject);
				matched = true;
				programStructure.push({text: lines[i], type: lineAsObject.type, index: i, object: lineAsObject});
				if(lineAsObject.arities){
					arityDictionary.addArities(lineAsObject.arities(), i);
				}
			}
		});
		if(!matched){
			if(!regExModule.service.whiteSpacesRegEx.test(lines[i])) {
				errors.push({lineNumber : i, text: lines[i]})
				programStructure.push({text: lines[i], type: "SYNTAX_ERROR", index : i})
			}
			else{
				programStructure.push({text: " ", type: "EMPTY_LINE", index : i})
			}
		}
	}

	return  { 	
				tgds: tgds, 
				ncs : ncs,
				keys: keys,
				queries : queries, 
				facts: facts,
				set setFacts(newFacts){
					this.inconsistencies = undefined;
					this.processedInconsistencies = undefined;
					this.facts = newFacts;
				},
				ncsForServerDictionary : function() {
					var result = {};
					var i = 0;
					var self = this;

					this.programStructure.filter(e => e.type == "NC" || e.type == "KEY").forEach(function (programElement) {          
						if(programElement.type == "NC") {
							result[i] = programElement.object.lineNumber + 1;
						  i++;
						}
						if(programElement.type == "KEY") {
				  
						  var ncsForKey = programElement.object.toJson(self.arityDictionary);
						  ncsForKey.forEach(function(nc) {
							result[i] = programElement.object.lineNumber + 1;
							i++;
						  });
						}
					  });
					  return result;
				},
				programStructure : programStructure,
				arityDictionary : arityDictionary,
				ungardedTgds : function() { return this.tgds.filter(t => !t.isGuarded)}, 
				isGuarded : function() { return this.tgds.every(t => t.isGuarded)},
				isLinear : function() { return this.tgds.every(t => t.body.predicates.length == 1)}, 
				toString : function(){
					return this.ncs.concat(this.tgds).concat(this.facts).concat(this.queries).join("\n");					
				},
				toStringWithoutNcsAndEgds : function(){
					return this.tgds.concat(this.facts).concat(this.queries).join("\n");
				},
				toStringWithoutNcsAndEgdsAndQueries : function(){
					return this.tgds.concat(this.facts).join("\n");
				},
				conflictingKeys: undefined,
				get getConflictingKeys() {
					if(this.conflictingKeys == undefined){
						this.conflictingKeys = []
						this.keys.forEach(key => {
							if(!this.isNonConflicting(key)){
								this.conflictingKeys.push(key);
							}
						});
					}
					return this.conflictingKeys; 
				},
				inconsistencies: undefined,
				/*get getInconsistencies() {
					if(this.inconsistencies == undefined){
						return new Promise(resolve => {
							this.consistencyPromise().then(inconsistencies => {
								if (inconsistencies && inconsistencies.length > 0) {
									this.inconsistencies = inconsistencies;								     
								}      
								else{
									this.inconsistencies = [];
								}
								resolve({inconsistencies: this.inconsistencies});
							  })
						  })
					}
					else{
						return new Promise(resolve => {
							resolve({inconsistencies: this.inconsistencies});
						})
					} 
				},*/
				processedInconsistencies: undefined,
				get getProcessedInconsistencies(){
					if(this.processedInconsistencies == undefined)
					{
						this.processedInconsistencies = this.inconsistencies;
					}
					return this.processedInconsistencies;
				},
				errors: errors,
				consistencyPromise: function(){
					/*var result = [];
					var currentProgram = this;					
					var getProm = function(nc) {						
						return new Promise(resolve => {
							executeQuery(nc.getQueryForProgram(currentProgram), currentProgram.isGuarded())
							.then(res => {
								if(res.data.some(r => r.Results.length >0)){
									result.push({nc: nc, result: res.data })
								}
								resolve(result);						
							});						
						})
					}
					let chain = Promise.resolve();
					this.ncs.concat(this.keys).forEach((nc) => {
						chain = chain.then(()=>getProm(nc))
					});
					return chain;*/
				},
				programToString: function(){
					return this.programStructure.filter(i => i.type != "QUERY" && i.type != "EXISTENCIAL QUERY").map(i=> i.text).join("\n");

				},
				queriesToString: function(){
					return this.queries.filter(i => i.type == "QUERY" || i.type == "EXISTENCIAL QUERY").map(i=> i.toString()).join("\n");
				},
				canBeSubmitted: function(){				
					return this.errors.length == 0 && this.arityDictionary.aritiesAreConsistent().result == true && this.getConflictingKeys.length == 0;
				},
				isNonConflicting(key){
					return this.tgds.every(tgd => key.isNonConflicting(tgd));
				},
				getStatus: function(){
					if(this.cachedStatus) return this.cachedStatus;
					var result = {};
					if(this.errors.length > 0){
						result = {
							status: "SYNTAX ERROR"
						}
					}
					else if(!this.arityDictionary.aritiesAreConsistent().result){						
						result = {
							status: "ARITIES ISSUES"
						}
					}
					else if(this.getConflictingKeys.length > 0){						
						result = {
							status: "CONFLICTING KEYS"
						}
					}
					else result = {
						status: "OK"
					}					
					/*else {
						var incResult = await this.getInconsistencies;
						if(incResult.inconsistencies.length > 0){
							result = {
								status: "INCONSISTENT"
							}
						}
						else result = {
							status: "OK"
						}	
					}*/
					this.cachedStatus = result;
					return result;
				},
				cachedStatus: undefined,
				execute: async function(semantics){

					var programJson = {
						"ncs" : [],
						"tgds" : [],
						"facts" : [],
						"queries" : [],
						"semantics" : semantics,
						"max_depth" : 30
					};
				
					programStructure.filter(e => e.type == "NC" || e.type == "KEY").forEach(function (programElement) {
						if(programElement.type == "NC") {
							programJson["ncs"].push(programElement.object.toJson());
						}

						if(programElement.type == "KEY") {
				
							var ncsForKey = programElement.object.toJson(arityDictionary);
							ncsForKey.forEach(function(nc) {
								programJson["ncs"].push(nc);
							});
						}
					});
				
					this.facts.forEach(function(fact) {
						programJson["facts"].push(fact.toJson());
					});
				
					this.tgds.forEach(function(tgd) {
						programJson["tgds"].push(tgd.toJson());
					});
				
					this.queries.forEach(function(query) {
						programJson["queries"].push(query.toJson());
					});

					var response = await executeProgram(programJson);
					return response;
				},
				getCachedThingsFrom(anotherProgram){
					if(anotherProgram){
						if(anotherProgram.inconsistencies) this.inconsistencies = anotherProgram.inconsistencies;
						if(anotherProgram.arityDictionary) this.arityDictionary = anotherProgram.arityDictionary;
						if(anotherProgram.conflictingKeys) this.conflictingKeys = anotherProgram.conflictingKeys;
						if(this.inconsistencies) anotherProgram.inconsistencies = this.inconsistencies;
						if(this.arityDictionary) anotherProgram.arityDictionary = this.arityDictionary;
						if(this.conflictingKeys) anotherProgram.conflictingKeys = this.conflictingKeys;
					}
				}
			};
}