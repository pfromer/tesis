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



public class Program {
	public List<String> facts;
	public List<String> tgds;
	public List<String> ncsAsQueries;
	public Boolean isGuarded;

	
	public AboxSubSet ABox() {
		AtomicInteger index = new AtomicInteger();
		return new AboxSubSet(this.facts.stream().map(f -> new Fact(f,index.getAndIncrement())).collect(Collectors.toList()));
	}

	public Boolean IsConsistent(AboxSubSet subset){
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();		
		
		if(this.isGuarded) {			
			configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		}
		else {
	        configuration.evaluationStrategyFactory = new StratifiedBottomUpEvaluationStrategyFactory(new NaiveEvaluatorFactory());
	    }
		
		if(subset.Facts.size() == 0) return true;
		
		String program = GenerateSubProgram(subset);
		ProgramExecutor executor = new ProgramExecutor(program, configuration);
		ArrayList<QueryResult> output = executor.getResults();
		
		boolean result = !output.stream().anyMatch(q -> hasResult(q));
		
		return result;
	}
	
	private Boolean hasResult(QueryResult q) {
		return q.Results.size() > 0;
	}
	
	private String GenerateSubProgram(AboxSubSet subset) {
		
		String tgds =  this.tgds.stream().collect(Collectors.joining("\n"));
		String facts = subset.Facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.ncsAsQueries.stream().collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;
	}
}