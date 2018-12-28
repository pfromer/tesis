package test;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.Demo;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.evaluation.forewriting.SQLRewritingEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.guardednaive.GuardedNaiveEvaluatorFactory;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;
import org.deri.iris.rules.safety.LinearReducibleRuleSafetyProcessor;
import org.json.*;
/**
 * Servlet implementation class Test
 */
@WebServlet(name = "test", urlPatterns = { "/test" })
public class Test extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		try {
			// Demo.main(new String[] {
			// "program-file=C:\\Git\\nyaya\\IRIS+-\\examples\\guardedExample.dtg",
			// "guarded-rules"
			// });
			// response.getWriter().append("Served at x:
			// ").append(request.getContextPath());
			final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();

			String json = request.getParameter("test"); 
			
			JSONObject obj = new JSONObject(json);
			String program = obj.getString("program");
			
			
			//String program = loadFile("C:\\Git\\nyaya\\IRIS+-\\examples\\guardedExample.dtg");
			//configuration.ruleSafetyProcessor = new SQLRewritingEvaluationStrategyFactory ();
			//configuration.evaluationStrategyFactory = new SQLRewritingEvaluationStrategyFactory();
			//configuration.ruleSafetyProcessor = new LinearReducibleRuleSafetyProcessor();
			
			configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
			ProgramExecutor executor = new ProgramExecutor(program, configuration);
			response.getWriter().append(executor.getOutput());

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
