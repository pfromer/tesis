package api;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.demo.TimeoutDtoResult;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.iar.AboxSubSet;
import org.deri.iris.iar.RepairsFinder;
import org.deri.iris.semantic_executor.SemanticExecutor;
import org.deri.iris.semantic_executor.SemanticParams;
import org.deri.iris.semantic_executor.ViolatingNcsResult;
import org.deri.iris.iar.Program;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;
import org.json.*;
import com.google.gson.*;


/*
 * 
 * program : {
	ncs : [],
	tgds : [],
	facts : [],
	queries : [
		{	
			nonQuantifiedVariables : [],
			body : ""	
		}
	]
	semantic : [standard|AR|IAR]
}
 */


@WebServlet(name = "query", urlPatterns = { "/query" })
public class QueryExecutionServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		try {	
			
			BufferedReader br = new BufferedReader(new InputStreamReader(request.getInputStream()));
	        String json = "";
	        if(br != null){
	            json = br.readLine();
	        }
	        
	        Gson gson = new Gson();

	        SemanticParams params = gson.fromJson(json, SemanticParams.class);		

	        final Thread t = new Thread(new ExecutionTask(params, response));

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
	
	static class ExecutionTask implements Runnable {
		ExecutionTask(final SemanticParams params, HttpServletResponse response) {
			this.params = params;
			this.response = response;
		}

		// @Override
		@Override
		public void run() {
			SemanticExecutor executor = new SemanticExecutor(params);
			try {
				this.response.getWriter().append(executor.Execute());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		private final SemanticParams params;
		private HttpServletResponse response;

	}
}


