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

import org.deri.iris.iar.AboxSubSet;
import org.deri.iris.iar.IARResolver;
import org.deri.iris.iar.Program;

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

			Program program = gson.fromJson(json, Program.class);
			IARResolver solver = new IARResolver(program);
			
			ArrayList<AboxSubSet> repairs = solver.getRepairs();			
			
			String jsonOutput = gson.toJson(repairs);
			response.getWriter().append(jsonOutput);

		} catch (Exception e) {
			response.getWriter().append(e.toString());

		}
	}
	
	
	
}

