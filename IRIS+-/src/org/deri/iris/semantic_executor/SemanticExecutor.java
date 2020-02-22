package org.deri.iris.semantic_executor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.iar.AboxSubSet;
import org.deri.iris.iar.Fact;
import org.deri.iris.iar.IARResolver;
import org.deri.iris.iar.Program;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;

import com.google.gson.Gson;

import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;



public class SemanticExecutor {


	private SemanticParams params;

	public SemanticExecutor(SemanticParams _params) {
		this.params = _params;
	}

	public String Execute() {

		switch(this.params.semantics) {
			case "standard":
				return ExecuteStandard();
			case "AR":
				return ExecuteAR();
			case "IAR":
				return ExecuteIAR();		
		}
		
		return "";
	}

	private String ExecuteStandard() {
		
		//si ncs es lista vacia armo el programa concatenando todo y devuelvo el resultado
		//si ncs no es vacia armo una query por cada nc y me fijo si alguno da resultado
			//opcion 1 : ninguna da resultado-> concateno todo y devuelvo el resultado
			//opcion 2: alguna da resultado-> devuelvo error diciendo cuales ncs son violadas
		
		if(this.params.ncs.size() == 0) {
			return this.ExecuteWithoutNcs();
		}
		
		else {
			
			List<Integer> violatingNcsIndexes = new ArrayList<Integer>(); 
			
			for (int i = 0; i < this.params.ncs.size(); i++) {
				String irisInput = this.generateIrisInputForOneNc(this.params.ncs.get(i));
				
				final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();
				
				configuration.variablesToShowByQuery =  new ArrayList<>();
						
				configuration.variablesToShowByQuery.add(new ArrayList<String>());
				
				configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
				
				ProgramExecutor executor = new ProgramExecutor(irisInput, configuration);
				
				ArrayList<QueryResult> output = executor.getResults();
				
				Boolean isViolatingNc = output.get(0).BooleanResult;
				
				if(isViolatingNc) {
					violatingNcsIndexes.add(i);
				}  
			}
			
			if (violatingNcsIndexes.size() == 0) {
				return this.ExecuteWithoutNcs();
			} else {
				Gson gson = new Gson();
				return gson.toJson(new ViolatingNcsResult(violatingNcsIndexes));
			}
		}
	}
	
	private String ExecuteWithoutNcs() {
		String irisInput = this.generateIrisInput();
		
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();
		
		configuration.variablesToShowByQuery = this.params.queries.stream().map(q -> q.showInOutput).collect(Collectors.toList());
		
		configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		
		ProgramExecutor executor = new ProgramExecutor(irisInput, configuration);
		
		ArrayList<QueryResult> output = executor.getResults();
		
		Gson gson = new Gson();

		return gson.toJson(output);
	}

	private String ExecuteAR() {

		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();
		
		configuration.variablesToShowByQuery = this.params.queries.stream().map(q -> q.showInOutput).collect(Collectors.toList());
		
		configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		
		List<List<org.deri.iris.iar.Fact>> repairs = this.getRepairs();
		 
	    ArrayList<ArrayList<QueryResult>> allResults = new ArrayList<ArrayList<QueryResult>>();
		
		for (int i = 0; i < repairs.size(); i++) { 
			String irisInput = this.makeIrisInputForRepair(repairs.get(i));
			ProgramExecutor executor = new ProgramExecutor(irisInput, configuration);
			ArrayList<QueryResult> output = executor.getResults();
			allResults.add(output);
		}
		
		ArrayList<QueryResult> arResults = new ArrayList<QueryResult>();
		
		for (int i = 0; i < this.params.queries.size(); i++) { 
			QueryResult queryResult = this.getArResultsFor(allResults, i);
			arResults.add(queryResult);
		}
		
		Gson gson = new Gson();

		return gson.toJson(arResults);
		
		
		/*
		public Boolean IsBoolean;
		
		public Boolean BooleanResult;
		
		public String Query;
		
		public List<String> VariableBindings;
		
		public ArrayList<ArrayList<String>> Results;
		*/

		
		//calculo los repairs
		//para cada repair armo un programa (tgds, r, queries)
		//para cada query, devuelvo solo los resultados que figuran en el resulatado de todos los repairs
	}
	
	
	

	private QueryResult getArResultsFor(ArrayList<ArrayList<QueryResult>> allResults, int i) {
		
		List<QueryResult> allARResultsForQuery = allResults.stream().map(r -> r.get(i)).collect(Collectors.toList());
		QueryResult r = new QueryResult();
		
		if(allARResultsForQuery.get(0).IsBoolean) {			
			r.IsBoolean = true;
			r.BooleanResult = allARResultsForQuery.stream().allMatch(qr -> qr.BooleanResult);
			r.Query = allARResultsForQuery.get(0).Query;
			r.VariableBindings = allARResultsForQuery.get(0).VariableBindings;
			r.Results = new ArrayList<ArrayList<String>>();
		} else {
			r.IsBoolean = false;
			r.BooleanResult = false;
			r.Query = allARResultsForQuery.get(0).Query;
			r.VariableBindings = allARResultsForQuery.get(0).VariableBindings;
			r.Results = this.getIntersectionFor(allARResultsForQuery.stream().map(qr -> qr.Results).collect(Collectors.toList()));
		}
		return r;
	}

	private ArrayList<ArrayList<String>> getIntersectionFor(List<ArrayList<ArrayList<String>>> all) {
		ArrayList<ArrayList<String>> first = all.get(0);
		
		ArrayList<ArrayList<String>> result = new ArrayList<ArrayList<String>>();
		
		for (int i = 0; i < first.size(); i++) {
			final int j = i; 
			if(all.stream().allMatch(o -> this.contains(o,first.get(j)))) {
				result.add(first.get(j));
			}
		}
		return result;
	}

	private Boolean contains(ArrayList<ArrayList<String>> table, ArrayList<String> line) {
		Boolean anyMatch = table.stream().anyMatch(l -> this.areEqual(l, line)); 
		return anyMatch;
	}
	
	
	private Boolean areEqual(ArrayList<String> line1, ArrayList<String> line2) {
		
		if(line1.size() != line2.size()) {
			return false;
		}
		
		for (int i = 0; i < line1.size(); i++) {
			if (!line1.get(i).equals(line2.get(i))) {
				return false;
			} 
		}
		
		return true;
	}

	private String makeIrisInputForRepair(List<org.deri.iris.iar.Fact> repair) {
		String tgds = this.params.tgds.stream().map(t -> t.head + " :- "  + t.body + ".").collect(Collectors.joining("\n"));
		String facts = repair.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.params.queries.stream().map(q -> "?-" + q.body + ".").collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;		
	}

	private String ExecuteIAR() {
		
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();
		
		configuration.variablesToShowByQuery = this.params.queries.stream().map(q -> q.showInOutput).collect(Collectors.toList());
		
		configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		
		List<org.deri.iris.iar.Fact> iarIntersection = this.getRepairsIntersection();
		
		String irisInput = this.makeIrisInputForFacts(iarIntersection);

		ProgramExecutor executor = new ProgramExecutor(irisInput, configuration);
		
		ArrayList<QueryResult> output = executor.getResults();
		
		Gson gson = new Gson();

		return gson.toJson(output);

	}
	
	private String generateIrisInput() {
		
		String tgds = this.params.tgds.stream().map(t -> t.head + " :- "  + t.body + ".").collect(Collectors.joining("\n"));
		String facts = this.params.facts.stream().map(f -> f.value + ".").collect(Collectors.joining("\n"));
		String queries = this.params.queries.stream().map(q -> "?-" + q.body + ".").collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;
	}
	
	private String generateIrisInputForOneNc(NegativeConstraint nc) {
		
		String tgds = this.params.tgds.stream().map(t -> t.head + " :- "  + t.body + ".").collect(Collectors.joining("\n"));
		String facts = this.params.facts.stream().map(f -> f.value + ".").collect(Collectors.joining("\n"));
		String _nc = "?-" + nc.body + ".";
		
		return tgds + "\n" + facts + "\n" + _nc;
	}
	
	private List<List<org.deri.iris.iar.Fact>> getRepairs(){		
		return this.getIarResolver().getRepairs().stream().map(s -> this.toStringFacts(s)).collect(Collectors.toList());		
	}
	
	private List<org.deri.iris.iar.Fact> getRepairsIntersection(){
		return this.getIarResolver().getRepairsIntersection();		
	}
	
	private String makeIrisInputForFacts(List<org.deri.iris.iar.Fact> _facts) {
		String tgds = this.params.tgds.stream().map(t -> t.head + " :- "  + t.body + ".").collect(Collectors.joining("\n"));
		String facts = _facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.params.queries.stream().map(q -> "?-" + q.body + ".").collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;
	}
	
	
	private IARResolver getIarResolver() {
		List<String> facts = this.params.facts.stream().map(f -> f.value + ".").collect(Collectors.toList());
		List<String> tgds = this.params.tgds.stream().map(t -> t.head + " :- "  + t.body + ".").collect(Collectors.toList());
		List<String> ncsAsQueries = this.params.ncs.stream().map(nc -> "?-" +  nc.body + ".").collect(Collectors.toList());
		
		Program program = new Program(facts, tgds, ncsAsQueries, false);
				
		return new IARResolver(program);
	}
	
	
	private List<org.deri.iris.iar.Fact> toStringFacts(AboxSubSet s){
		return s.Facts.stream().collect(Collectors.toList());
	}
	
}