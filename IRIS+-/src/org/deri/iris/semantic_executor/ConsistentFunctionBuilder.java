package org.deri.iris.semantic_executor;

import java.util.ArrayList;
import java.util.stream.Collectors;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.repairs_finder.AboxSubSet;
import org.deri.iris.repairs_finder.Program;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;

public class ConsistentFunctionBuilder {
	
	private Program program;
	
	public ConsistentFunctionBuilder(Program _program) {
		this.program = _program;
	}	
	
	public Boolean IsConsistent(AboxSubSet subset){
		
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();
		
		configuration.variablesToShowByQuery = this.program.ncsAsQueries.stream().map(q -> new ArrayList<String>()).collect(Collectors.toList());
		
		configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		
		configuration.max_depth = this.program.max_depth;
		
		if(subset.Facts.size() == 0) return true;
		
		String program = GenerateSubProgram(subset);
		ProgramExecutor executor = new ProgramExecutor(program, configuration);
		
		return !executor.getResults().stream().anyMatch(q -> q.BooleanResult == true);
	}
	
	private String GenerateSubProgram(AboxSubSet subset) {
			
			String tgds =  this.program.tgds.stream().collect(Collectors.joining("\n"));
			String facts = subset.Facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
			String queries = this.program.ncsAsQueries.stream().collect(Collectors.joining("\n"));
			
			return tgds + "\n" + facts + "\n" + queries;
		}

}
