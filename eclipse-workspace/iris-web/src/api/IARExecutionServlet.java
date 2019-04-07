package api;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;
import org.json.*;

import com.google.gson.*;


@WebServlet(name = "iar", urlPatterns = { "/iar" })
public class IARExecutionServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private Program program;
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		try {
			
			BufferedReader br = new BufferedReader(new InputStreamReader(request.getInputStream()));
	        String json = "";
	        if(br != null){
	            json = br.readLine();
	        }
	        
	        Gson gson = new Gson();

			this.program = gson.fromJson(json, Program.class);
			AtomicInteger index = new AtomicInteger();
			AboxSubSet aBox =  new AboxSubSet(program.facts.stream().map(f -> new Fact(f,index.getAndIncrement())).collect(Collectors.toList()));
			
			IARResolver solver = new IARResolver(this::IsConsistent,aBox);
			
			ArrayList<AboxSubSet> repairs = solver.getRepairs();			
			
			String jsonOutput = gson.toJson(repairs);
			response.getWriter().append(jsonOutput);

		} catch (Exception e) {
			response.getWriter().append(e.toString());

		}
	}
	
	
	private Boolean IsConsistent(AboxSubSet subset){
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();		
		
		if(this.program.isGuarded) {			
			configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		}
		else {
	        configuration.evaluationStrategyFactory = new StratifiedBottomUpEvaluationStrategyFactory(new NaiveEvaluatorFactory());
	    }
		
		if(subset.Facts.size() == 0) return true;
		
		String program = GenerateProgram(subset);
		ProgramExecutor executor = new ProgramExecutor(program, configuration);
		ArrayList<QueryResult> output = executor.getResults();
		
		boolean result = !output.stream().anyMatch(q -> hasResult(q));
		
		return result;
	}

	private Boolean hasResult(QueryResult q) {
		return q.Results.size() > 0;
	}

	private String GenerateProgram(AboxSubSet subset) {
		
		String tgds =  this.program.tgds.stream().collect(Collectors.joining("\n"));
		String facts = subset.Facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.program.ncsAsQueries.stream().collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;
	}
}

