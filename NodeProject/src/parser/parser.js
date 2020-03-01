import * as regExModule from "../services/regExService";
import * as tgdModule from "./builders/tgdBuilder";
import * as ncModule from "./builders/ncBuilder";
import * as keyModule from "./builders/keyBuilder";
import * as factModule from "./builders/factBuilder";
import * as queryModule from "./builders/queryBuilder";
import {
	executeProgram
} from "../services/IrisCaller";
import * as existencialQueryModule from "./builders/existencialQueryBuilder";
import {
	ArityDictionary
} from "./ArityDictionary";

export function parse(program) {

	var tgds = [];
	var facts = [];
	var ncs = [];
	var keys = [];
	var queries = [];
	var errors = [];
	var max_depth;

	var lines = program.split('\n');

	var arityDictionary = new ArityDictionary();

	var programStructure = []

	var regexAndBuilders = [{
			regEx: regExModule.service.tgdRegEx,
			builder: tgdModule.builder,
			collection: tgds
		},
		{
			regEx: regExModule.service.ncRegEx,
			builder: ncModule.builder,
			collection: ncs
		},
		{
			regEx: regExModule.service.keyRegEx,
			builder: keyModule.builder,
			collection: keys
		},
		{
			regEx: regExModule.service.factRegEx,
			builder: factModule.builder,
			collection: facts
		},
		{
			regEx: regExModule.service.queryRegEx,
			builder: queryModule.builder,
			collection: queries
		},
		{
			regEx: regExModule.service.existencialQueryRegEx,
			builder: existencialQueryModule.builder,
			collection: queries
		}
	]


	for (var i = 0; i < lines.length; i++) {
		var matched = false;
		regexAndBuilders.forEach(function (regexAndBuilder) {
			if (regexAndBuilder.regEx.test(lines[i].trim())) {
				var lineAsObject = Object.assign({
					lineNumber: i
				}, regexAndBuilder.builder.build(lines[i]));
				regexAndBuilder.collection.push(lineAsObject);
				matched = true;
				programStructure.push({
					text: lines[i],
					type: lineAsObject.type,
					index: i,
					object: lineAsObject
				});
				if (lineAsObject.arities) {
					arityDictionary.addArities(lineAsObject.arities(), i);
				}
			}
		});

		if (!matched) {
			if (regExModule.service.maxDepthRegex.test(lines[i])) {
				programStructure.push({
					text: lines[i],
					type: "MAX_DEPTH",
					index: i
				});
				max_depth = parseInt(lines[i].split('=')[1].trim());
			} else {
				if (!regExModule.service.whiteSpacesRegEx.test(lines[i])) {
					errors.push({
						lineNumber: i,
						text: lines[i]
					})
					programStructure.push({
						text: lines[i],
						type: "SYNTAX_ERROR",
						index: i
					})
				} else {
					programStructure.push({
						text: " ",
						type: "EMPTY_LINE",
						index: i
					})
				}
			}
		}
	}

	return {
		tgds: tgds,
		ncs: ncs,
		keys: keys,
		queries: queries,
		facts: facts,
		max_depth: max_depth,
		ncsForServerDictionary: function () {
			var result = {};
			var i = 0;
			var self = this;

			this.programStructure.filter(e => e.type == "NC" || e.type == "KEY").forEach(function (programElement) {
				if (programElement.type == "NC") {
					result[i] = programElement.object.lineNumber + 1;
					i++;
				}
				if (programElement.type == "KEY") {

					var ncsForKey = programElement.object.toJson(self.arityDictionary);
					ncsForKey.forEach(function (nc) {
						result[i] = programElement.object.lineNumber + 1;
						i++;
					});
				}
			});
			return result;
		},
		programStructure: programStructure,
		arityDictionary: arityDictionary,
		ungardedTgds: function () {
			return this.tgds.filter(t => !t.isGuarded)
		},
		isGuarded: function () {
			return this.tgds.every(t => t.isGuarded)
		},
		isLinear: function () {
			return this.tgds.every(t => t.body.predicates.length == 1)
		},
		toString: function () {
			return this.ncs.concat(this.tgds).concat(this.facts).concat(this.queries).join("\n");
		},
		toStringWithoutNcsAndEgds: function () {
			return this.tgds.concat(this.facts).concat(this.queries).join("\n");
		},
		toStringWithoutNcsAndEgdsAndQueries: function () {
			return this.tgds.concat(this.facts).join("\n");
		},
		conflictingKeys: undefined,
		get getConflictingKeys() {
			if (this.conflictingKeys == undefined) {
				this.conflictingKeys = []
				this.keys.forEach(key => {
					if (!this.isNonConflicting(key)) {
						this.conflictingKeys.push(key);
					}
				});
			}
			return this.conflictingKeys;
		},
		errors: errors,
		programToString: function () {
			return this.programStructure.filter(i => i.type != "QUERY" && i.type != "EXISTENCIAL QUERY").map(i => i.text).join("\n");
		},
		queriesToString: function () {
			return this.queries.filter(i => i.type == "QUERY" || i.type == "EXISTENCIAL QUERY").map(i => i.toString()).join("\n");
		},
		canBeSubmitted: function () {
			return this.errors.length == 0 && this.arityDictionary.aritiesAreConsistent().result == true && this.getConflictingKeys.length == 0;
		},
		isNonConflicting(key) {
			return this.tgds.every(tgd => key.isNonConflicting(tgd));
		},
		getStatus: function () {
			if (this.cachedStatus) return this.cachedStatus;
			var result = {};
			if (this.errors.length > 0) {
				result = {
					status: "SYNTAX ERROR"
				}
			} else if (!this.arityDictionary.aritiesAreConsistent().result) {
				result = {
					status: "ARITIES ISSUES"
				}
			} else if (this.getConflictingKeys.length > 0) {
				result = {
					status: "CONFLICTING KEYS"
				}
			} else result = {
				status: "OK"
			}
			this.cachedStatus = result;
			return result;
		},
		cachedStatus: undefined,

		toJson: function () {
			var programJson = {
				"ncs": [],
				"tgds": [],
				"facts": [],
				"queries": []
			};

			programStructure.filter(e => e.type == "NC" || e.type == "KEY").forEach(function (programElement) {
				if (programElement.type == "NC") {
					programJson["ncs"].push(programElement.object.toJson());
				}

				if (programElement.type == "KEY") {

					var ncsForKey = programElement.object.toJson(arityDictionary);
					ncsForKey.forEach(function (nc) {
						programJson["ncs"].push(nc);
					});
				}
			});

			this.facts.forEach(function (fact) {
				programJson["facts"].push(fact.toJson());
			});

			this.tgds.forEach(function (tgd) {
				programJson["tgds"].push(tgd.toJson());
			});

			this.queries.forEach(function (query) {
				programJson["queries"].push(query.toJson());
			});

			programJson.max_depth = this.max_depth;

			return programJson;
		},


		execute: async function (semantics) {
			var params = this.toJson();
			params.semantics = semantics;
			var response = await executeProgram(params);
			return response;
		},
		getRepairs: async function () {

		}
	};
}