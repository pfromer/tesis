const parse = function(program){
	
	this.tgds = [];
	this.queries = [];
	this.facts = [];
	this.ncs = [];
	this.egds = [];
	
	var lines = program.split('\n');

	for(var i = 0;i < lines.length;i++){
		if(servicesAndBuilders.regExService.tgdRegEx.test(lines[i].trim())) this.tgds.push(tgdBuilder().buildTgd(lines[i]));
		if(servicesAndBuilders.regExService.ncRegEx.test(lines[i].trim())) this.ncs.push(ncBuilder().buildNc(lines[i]));
		if(servicesAndBuilders.regExService.egdRegEx.test(lines[i].trim())) this.egds.push(egdBuilder().buildEgd(lines[i]));
		if(servicesAndBuilders.regExService.factRegEx.test(lines[i].trim())) this.facts.push(factBuilder().build(lines[i]));
		if(servicesAndBuilders.regExService.queryRegEx.test(lines[i].trim())) this.queries.push(queryBuilder().build(lines[i]));
	}
	
	return  { 	
				tgds: this.tgds, 
				ncs : this.ncs,
				egds: this.egds,
				queries : this.queries, 
				facts: this.facts, 
				isGuarded : this.tgds.every(t => t.isGuarded),
				toString : function(){
					return this.ncs.concat(this.egds).concat(this.tgds).concat(this.facts).concat(this.queries).join("\n");
					
				}
			};
}