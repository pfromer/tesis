import * as bodyModule from "./bodyBuilder";
import * as queryModule from "./queryBuilder";

function _builder() {

	return {
		build: function (line) {
			var split = line.split("->");
			return {
				body: bodyModule.builder.build(split[0]),
				toString: function () {
					return ["⊥ :- ", this.body.toString(), "."].join("");
				},
				toStringAsQuery: function () {
					return queryModule.builder.build("?-" + this.body.toString()).toNonExistencialQueryString();
				},
				type: "NC",
				equals: function (nc) {
					return nc.toString() === this.toString();
				},
				arities: function () {
					return this.body.arities();
				},
				getQueryForProgram: function (program) {
					return program.tgds.concat(program.facts).concat(this.toStringAsQuery()).join("\n");
				},
				toJson: function () {
					return {
						"body": this.body.toString()
					}
				}
			}
		}
	}
}

export const builder = _builder();