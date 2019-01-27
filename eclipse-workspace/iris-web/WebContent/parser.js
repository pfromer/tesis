const parse = function(program){
	
	this.tgds = [];
	this.queries = [];
	this.facts = [];
	this.ncs = [];
	this.egds = [];
	
	var lines = program.split('\n');

	for(var i = 0;i < lines.length;i++){
		if(regExService().tgdRegEx.test(lines[i].trim())) this.tgds.push(tgdBuilder().buildTgd(lines[i]));
		if(regExService().ncRegEx.test(lines[i].trim())) this.ncs.push(ncBuilder().buildNc(lines[i]));
		if(regExService().egdRegEx.test(lines[i].trim())) this.egds.push(egdBuilder().buildEgd(lines[i]));
	}
	
	return  { 	
				tgds: this.tgds, 
				ncs : this.ncs,
				egds: this.egds,
				queries : this.queries, 
				facts: this.facts, 
				isGuarded : this.tgds.every(t => t.isGuarded),
				
			
			};	
	
}

//module.exports = parser;