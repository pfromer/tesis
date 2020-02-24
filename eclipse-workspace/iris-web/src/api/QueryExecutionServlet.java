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

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.iar.AboxSubSet;
import org.deri.iris.iar.IARResolver;
import org.deri.iris.semantic_executor.SemanticExecutor;
import org.deri.iris.semantic_executor.SemanticParams;
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
		
			SemanticExecutor executor = new SemanticExecutor(params);
			
			response.getWriter().append(executor.Execute());

		} catch (Exception e) {
			response.getWriter().append(e.toString());
		}
	}
}