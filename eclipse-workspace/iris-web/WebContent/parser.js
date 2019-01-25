const parse = function(program){
	
	this.tgds = [];
	this.queries = [];
	this.facts = [];
	
	var lines = program.split('\n');

	for(var i = 0;i < lines.length;i++){
		if(regExService().tgdRegEx.test(lines[i].trim())) this.tgds.push(tgdBuilder().buildTgd(lines[i]));
	}
	
	return { tgds: this.tgds, queries : this.queries, facts: this.facts };	
	
}

//module.exports = parser;