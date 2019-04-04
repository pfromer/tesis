package api;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
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

				// JSON to Map
				IARRequestBody bodyObject = gson.fromJson(json, IARRequestBody.class);
		        
		        
		        
		        
		        
		        
			
			
			System.out.println("jajaja");
			
			
			ArrayList<ArrayList<String>> output = new ArrayList<ArrayList<String>>();
			
			
			ArrayList<String> array1 = new ArrayList<String>();
			array1.add("r1('a').");
			array1.add("r1('b').");
			
			ArrayList<String> array2 = new ArrayList<String>();
			array1.add("r1('c').");
			
			output.add(array1);
			output.add(array2);
			
			String jsonOutput = gson.toJson(output);
			response.getWriter().append(jsonOutput);

		} catch (Exception e) {
			response.getWriter().append(e.toString());

		}
	}
}

