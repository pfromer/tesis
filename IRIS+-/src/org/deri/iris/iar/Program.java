package org.deri.iris.iar;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;
import org.deri.iris.semantic_executor.SemanticParams;



public class Program {
	public List<String> facts;
	public List<String> tgds;
	public List<String> ncsAsQueries;
	public Boolean isGuarded;
	
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
	}
	
	public AboxSubSet ABox() {
		AtomicInteger index = new AtomicInteger();
		return new AboxSubSet(this.facts.stream().map(f -> new Fact(f,index.getAndIncrement())).collect(Collectors.toList()));
	}

	public Boolean IsConsistent(AboxSubSet subset){
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();
		
		configuration.variablesToShowByQuery = this.ncsAsQueries.stream().map(q -> new ArrayList<String>()).collect(Collectors.toList());
		
		configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();

		
		if(subset.Facts.size() == 0) return true;
		
		String program = GenerateSubProgram(subset);
		ProgramExecutor executor = new ProgramExecutor(program, configuration);
		
		return !executor.getResults().stream().anyMatch(q -> q.BooleanResult == true);
	}
	
	private String GenerateSubProgram(AboxSubSet subset) {
		
		String tgds =  this.tgds.stream().collect(Collectors.joining("\n"));
		String facts = subset.Facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.ncsAsQueries.stream().collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;
	}
}