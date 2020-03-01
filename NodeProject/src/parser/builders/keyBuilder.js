function _builder() {

	function buildPredicate(predicateName, keyPositions, arity, predicateNumber) {

		var i = 1;
		var parameters = [];

		while (i <= arity) {
			if (!keyPositions.includes(i)) {
				parameters.push("?x" + i + predicateNumber);
			} else {
				parameters.push("?x" + i);
			}
			i++;
		}

		return predicateName + "(" + parameters.join(", ") + ")";
	}

	return {
		build: function (line) {
			return {
				keyPositions: JSON.parse(line.substring(line.indexOf('['), line.indexOf(']') + 1)),
				predicate: line.substring(line.indexOf('(') + 1, line.indexOf(',')),
				type: "KEY",
				isNonConflicting: function (tgd) {
					return this.predicate != tgd.head.predicate.name ||
						(!this.keyPositions.isProperSubsetOf(tgd.xPositionsInHead()) && tgd.allNullsAppearOnlyOnceInTheHead());
				},
				toString: function () {
					return "key(" + this.predicate + "," + "[" + this.keyPositions.join(",") + "]).";
				},
				toQueryString: function (program) {

					var lineNumber = Object.keys(program.arityDictionary.dictionary[this.predicate])[0];
					var arity = program.arityDictionary.dictionary[this.predicate][lineNumber][0];
					var p1 = buildPredicate(this.predicate, this.keyPositions, arity, "1");
					var p2 = buildPredicate(this.predicate, this.keyPositions, arity, "2");


					var inequalities = [];
					var i = 1;
					while (i <= arity) {
						if (!this.keyPositions.includes(i)) {
							inequalities.push("?x" + i + +"1" + " != " + "?x" + i + "2");
						}
						i++;
					}

					var queries = [];

					inequalities.forEach(ineq => {
						queries.push("?- " + [p1, p2, ineq].join(", ") + ".");
					})

					return queries.join("\n");
				},
				getQueryForProgram: function (program) {
					return program.facts.concat(this.toQueryString(program)).join("\n");
				},
				toJson: function (arityDictionary) {
					var lineNumber = Object.keys(arityDictionary.dictionary[this.predicate])[0];
					var arity = arityDictionary.dictionary[this.predicate][lineNumber][0];
					var p1 = buildPredicate(this.predicate, this.keyPositions, arity, "1");
					var p2 = buildPredicate(this.predicate, this.keyPositions, arity, "2");


					var inequalities = [];
					var i = 1;
					while (i <= arity) {
						if (!this.keyPositions.includes(i)) {
							inequalities.push("?x" + i + +"1" + " != " + "?x" + i + "2");
						}
						i++;
					}

					var ncs = [];

					inequalities.forEach(ineq => {
						ncs.push({
							"body": [p1, p2, ineq].join(", ")
						});
					})

					return ncs;
				}





			}
		}
	}
}

export const builder = _builder();