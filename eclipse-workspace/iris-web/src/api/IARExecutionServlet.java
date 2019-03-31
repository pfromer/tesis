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


@WebServlet(name = "iar", urlPatterns = { "/iar" })
public class IARExecutionServlet extends HttpServlet {
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

			String facts = request.getParameter("facts");
			String tgds = request.getParameter("tgds"); 
			String ncsAsQueries = request.getParameter("ncsAsQueries"); 
			String isGuarded = request.getParameter("isGuarded"); 
			
		
			
			
			if(isGuarded) {
				configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
				System.out.println("guarded program");
			}
			else {
		        configuration.evaluationStrategyFactory = new StratifiedBottomUpEvaluationStrategyFactory(new NaiveEvaluatorFactory());
		        System.out.println("not guarded program");
		    }
			
			System.out.println("jajaja");
			
			
			ArrayList<ArrayList<String>> output = new ArrayList<ArrayList<String>>();
			
			
			ArrayList<String> array1 = new ArrayList<String>();
			array1.add("r1('a').");
			array1.add("r1('b').");
			
			ArrayList<String> array2 = new ArrayList<String>();
			array1.add("r1('c').");
			
			output.add(array1);
			output.add(array2);
			
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
