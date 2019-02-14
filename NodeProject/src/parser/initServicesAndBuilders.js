import * as regExServiceModule from "./regExService";
import * as parameterBuilderModule from "./parameterBuilder";
import * as predicateBuilderModule  from "./predicateBuilder";
import * as tgdBuilderModule from "./tgdBuilder";
import * as ncBuilderModule  from "./ncBuilder";
import * as egdBuilderModule from "./egdBuilder";
import * as factBuilderModule  from "./factBuilder";
import * as queryBuilderModule  from "./queryBuilder";




export function initServicesAndBuilders(){

	var _regExService = regExService();
	var _parameterBuilder = parameterBuilder();
	var _predicateBuilder = predicateBuilder();
	var _tgdBuilder = tgdBuilder();
	var _ncBuilder = ncBuilder();
	var _egdBuilder = egdBuilder();
	var _factBuilder = factBuilder();
	var _queryBuilder = queryBuilder();
	
	return {
		regExService : _regExService,
		parameterBuilder : _parameterBuilder,
		predicateBuilder : _predicateBuilder,
		tgdBuilder : _tgdBuilder,
		ncBuilder : _ncBuilder,
		egdBuilder : _egdBuilder,
		factBuilder : _factBuilder,
		queryBuilder : _queryBuilder
	}
}
