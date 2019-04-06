package api;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

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


@WebServlet(name = "query", urlPatterns = { "/query" })
public class QueryExecutionServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		try {
			
			final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();

			String json = request.getParameter("test"); 
			
			JSONObject obj = new JSONObject(json);
			String program = obj.getString("program");
			Boolean isGuarded = obj.getBoolean("isGuarded");
			
			
			if(isGuarded) {
				configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
			}
			else {
		        configuration.evaluationStrategyFactory = new StratifiedBottomUpEvaluationStrategyFactory(new NaiveEvaluatorFactory());
		    }
			
			
			ProgramExecutor executor = new ProgramExecutor(program, configuration);
			
			ArrayList<QueryResult> output = executor.getResults();
			
			Gson gson = new Gson();
			String jsonOutput = gson.toJson(output);
			response.getWriter().append(jsonOutput);

		} catch (Exception e) {
			response.getWriter().append(e.toString());

		}
	}

	private static final String loadFile(final String filename) throws IOException {
		final FileReader r = new FileReader(filename);

		final StringBuilder builder = new StringBuilder();

		int ch = -1;
		while ((ch = r.read()) >= 0) {
			builder.append((char) ch);
		}
		r.close();
		return builder.toString();
	}

}

