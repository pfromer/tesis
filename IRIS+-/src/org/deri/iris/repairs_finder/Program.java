package org.deri.iris.repairs_finder;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import org.deri.iris.semantic_executor.SemanticParams;

public class Program {
	public List<String> facts;
	public List<String> tgds;
	public List<String> ncsAsQueries;
	public Boolean isGuarded;
	public Integer max_depth;
	
	public Program(List<String> _facts, List<String> _tgds, List<String> _ncsAsQueries, Boolean _isGuarded) {
		this.facts = _facts;
		this.tgds = _tgds;
		this.ncsAsQueries = _ncsAsQueries;
		this.isGuarded = _isGuarded;
	}
	
	public Program(SemanticParams params) {		
		this.facts = params.facts.stream().map(f -> f.value + ".").collect(Collectors.toList());
		this.tgds = params.tgds.stream().map(t -> t.head + " :- "  + t.body + ".").collect(Collectors.toList());
		this.ncsAsQueries = params.ncs.stream().map(nc -> "?-" +  nc.body + ".").collect(Collectors.toList());
		this.max_depth = params.max_depth;
	}
	
	public AboxSubSet ABox() {
		AtomicInteger index = new AtomicInteger();
		return new AboxSubSet(this.facts.stream().map(f -> new Fact(f,index.getAndIncrement())).collect(Collectors.toList()));
	}
}