function initServicesAndBuilders(){

	var _regExService = regExService();
	var _parameterBuilder = parameterBuilder();
	var _predicateBuilder = predicateBuilder();
	var _bodyBuilder = bodyBuilder();
	var _tgdBuilder = tgdBuilder();
	var _ncBuilder = ncBuilder();
	var _egdBuilder = egdBuilder();
	
	return {
		regExService : _regExService,
		parameterBuilder : _parameterBuilder,
		predicateBuilder : _predicateBuilder,
		bodyBuilder : _bodyBuilder,
		tgdBuilder : _tgdBuilder,
		ncBuilder : _ncBuilder,
		egdBuilder : _egdBuilder
	}
}

var servicesAndBuilders = initServicesAndBuilders();