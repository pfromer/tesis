package api;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.deri.iris.demo.TimeoutDtoResult;
import org.deri.iris.repairs_finder.AboxSubSet;
import org.deri.iris.repairs_finder.RepairsFinder;
import org.deri.iris.repairs_finder.Program;
import org.deri.iris.semantic_executor.ConsistentFunctionBuilder;
import org.deri.iris.semantic_executor.SemanticParams;

import com.google.gson.*;

@WebServlet(name = "repairs_finder", urlPatterns = {
	"/repairs_finder"
})
public class RepairsFinderServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

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
			if (br != null) {
				json = br.readLine();
			}

			Gson gson = new Gson();

			SemanticParams params = gson.fromJson(json, SemanticParams.class);

			final Thread t = new Thread(new RepairsTask(params, response));

			t.setPriority(Thread.MIN_PRIORITY);
			t.start();

			try {
				t.join(30000);
			} catch (final InterruptedException e) {
				e.printStackTrace();
			}

			if (t.isAlive()) {
				response.getWriter().append(gson.toJson(new TimeoutDtoResult()));
				t.stop();
			}

		} catch (Exception e) {
			response.getWriter().append(e.toString());
		}
	}

	static class RepairsTask implements Runnable {
		RepairsTask(final SemanticParams params, HttpServletResponse response) {
			this.params = params;
			this.response = response;
		}

		// @Override
		@Override
		public void run() {

			Program program = new Program(this.params);
			ConsistentFunctionBuilder functionBuilder = new ConsistentFunctionBuilder(program);
			RepairsFinder solver = new RepairsFinder(program, functionBuilder::IsConsistent);
			ArrayList<AboxSubSet> repairs = solver.getRepairs();
			Gson gson = new Gson();
			String jsonOutput = gson.toJson(repairs);
			try {
				this.response.getWriter().append(jsonOutput);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		private final SemanticParams params;
		private HttpServletResponse response;

	}
}