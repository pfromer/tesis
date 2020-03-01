package org.deri.iris.semantic_executor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;

import com.google.gson.Gson;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.repairs_finder.AboxSubSet;
import org.deri.iris.repairs_finder.Program;
import org.deri.iris.repairs_finder.RepairsFinder;

public class SemanticExecutor {

	private SemanticParams params;

	public SemanticExecutor(SemanticParams _params) {
		this.params = _params;
	}

	public String Execute() {

		switch (this.params.semantics) {
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

		if (this.params.ncs.size() == 0) {
			return this.ExecuteWithoutNcs();
		} else {

			List<Integer> violatingNcsIndexes = new ArrayList<Integer> ();

			for (int i = 0; i<this.params.ncs.size(); i++) {
				String irisInput = this.generateIrisInputForOneNc(this.params.ncs.get(i));

				final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();

				configuration.variablesToShowByQuery = new ArrayList<>();

				configuration.variablesToShowByQuery.add(new ArrayList<String> ());

				configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();

				configuration.max_depth = params.max_depth;

				ProgramExecutor executor = new ProgramExecutor(irisInput, configuration);

				ArrayList<QueryResult> output = executor.getResults();

				Boolean isViolatingNc = output.get(0).BooleanResult;

				if (isViolatingNc) {
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

		ProgramExecutor executor = new ProgramExecutor(irisInput, getConfiguration());

		ArrayList<QueryResult> output = executor.getResults();

		Gson gson = new Gson();

		return gson.toJson(output);
	}

	private String ExecuteAR() {

		List<List<org.deri.iris.repairs_finder.Fact >> repairs = this.getRepairs();

		ArrayList<ArrayList<QueryResult>> allResults = new ArrayList<ArrayList<QueryResult>> ();

		for (int i = 0; i<repairs.size(); i++) {
			String irisInput = this.makeIrisInputForRepair(repairs.get(i));
			ProgramExecutor executor = new ProgramExecutor(irisInput, getConfiguration());
			ArrayList<QueryResult> output = executor.getResults();
			allResults.add(output);
		}

		ArrayList<QueryResult> arResults = new ArrayList<QueryResult> ();

		for (int i = 0; i<this.params.queries.size(); i++) {
			QueryResult queryResult = this.getArResultsFor(allResults, i);
			arResults.add(queryResult);
		}

		Gson gson = new Gson();

		return gson.toJson(arResults);
	}

	private QueryResult getArResultsFor(ArrayList<ArrayList<QueryResult>> allResults, int i) {

		List<QueryResult> allARResultsForQuery = allResults.stream().map(r -> r.get(i)).collect(Collectors.toList());
		QueryResult r = new QueryResult();

		if (allARResultsForQuery.get(0).IsBoolean) {
			r.IsBoolean = true;
			r.BooleanResult = allARResultsForQuery.stream().allMatch(qr -> qr.BooleanResult);
			r.Query = allARResultsForQuery.get(0).Query;
			r.VariableBindings = allARResultsForQuery.get(0).VariableBindings;
			r.Results = new ArrayList<ArrayList<String>> ();
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

		ArrayList<ArrayList<String>> result = new ArrayList<ArrayList<String>> ();

		for (int i = 0; i<first.size(); i++) {
			final int j = i;
			if (all.stream().allMatch(o -> this.contains(o, first.get(j)))) {
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

		if (line1.size() != line2.size()) {
			return false;
		}

		for (int i = 0; i<line1.size(); i++) {
			if (!line1.get(i).equals(line2.get(i))) {
				return false;
			}
		}

		return true;
	}

	private String makeIrisInputForRepair(List<org.deri.iris.repairs_finder.Fact > repair) {
		String tgds = this.params.tgds.stream().map(t -> t.head + " :- " + t.body + ".").collect(Collectors.joining("\n"));
		String facts = repair.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.params.queries.stream().map(q -> "?-" + q.body + ".").collect(Collectors.joining("\n"));

		return tgds + "\n" + facts + "\n" + queries;
	}

	private String ExecuteIAR() {

		List<org.deri.iris.repairs_finder.Fact > iarIntersection = this.getRepairsIntersection();

		String irisInput = this.makeIrisInputForFacts(iarIntersection);

		ProgramExecutor executor = new ProgramExecutor(irisInput, getConfiguration());

		ArrayList<QueryResult> output = executor.getResults();

		Gson gson = new Gson();

		return gson.toJson(output);

	}

	private String generateIrisInput() {

		String tgds = this.params.tgds.stream().map(t -> t.head + " :- " + t.body + ".").collect(Collectors.joining("\n"));
		String facts = this.params.facts.stream().map(f -> f.value + ".").collect(Collectors.joining("\n"));
		String queries = this.params.queries.stream().map(q -> "?-" + q.body + ".").collect(Collectors.joining("\n"));

		return tgds + "\n" + facts + "\n" + queries;
	}

	private String generateIrisInputForOneNc(NegativeConstraint nc) {

		String tgds = this.params.tgds.stream().map(t -> t.head + " :- " + t.body + ".").collect(Collectors.joining("\n"));
		String facts = this.params.facts.stream().map(f -> f.value + ".").collect(Collectors.joining("\n"));
		String _nc = "?-" + nc.body + ".";

		return tgds + "\n" + facts + "\n" + _nc;
	}

	private List<List<org.deri.iris.repairs_finder.Fact >> getRepairs() {
		return this.getIarResolver().getRepairs().stream().map(s -> this.toStringFacts(s)).collect(Collectors.toList());
	}

	private List<org.deri.iris.repairs_finder.Fact > getRepairsIntersection() {
		return this.getIarResolver().getRepairsIntersection();
	}

	private String makeIrisInputForFacts(List<org.deri.iris.repairs_finder.Fact > _facts) {
		String tgds = this.params.tgds.stream().map(t -> t.head + " :- " + t.body + ".").collect(Collectors.joining("\n"));
		String facts = _facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.params.queries.stream().map(q -> "?-" + q.body + ".").collect(Collectors.joining("\n"));

		return tgds + "\n" + facts + "\n" + queries;
	}

	private RepairsFinder getIarResolver() {
		Program program = new Program(this.params);
		ConsistentFunctionBuilder functionBuilder = new ConsistentFunctionBuilder(program);
		return new RepairsFinder(program, functionBuilder::IsConsistent);
	}

	private List<org.deri.iris.repairs_finder.Fact > toStringFacts(AboxSubSet s) {
		return s.Facts.stream().collect(Collectors.toList());
	}

	private Configuration getConfiguration() {
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();

		configuration.variablesToShowByQuery = this.params.queries.stream().map(q -> q.showInOutput).collect(Collectors.toList());

		configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();

		configuration.max_depth = params.max_depth;

		return configuration;
	}

}