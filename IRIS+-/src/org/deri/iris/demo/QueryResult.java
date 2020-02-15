package org.deri.iris.demo;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.deri.iris.api.terms.IVariable;
import org.deri.iris.storage.IRelation;

public class QueryResult {
	
	public QueryResult() {}
	
	public QueryResult(IRelation results, List<IVariable> variableBindings, List<String> variableNamesToAdd, String query) {
		
		this.Query = query.toString();
		this.VariableBindings = variableBindings.stream().filter(v -> variableNamesToAdd.stream().map(v2 -> "?" + v2).anyMatch(v2 -> v.toString().equals(v2))).
				map(v -> v.toString()).			
				collect(Collectors.toList());
		
		if(this.VariableBindings.size() == 0) {
			this.IsBoolean = true;
			this.BooleanResult = results.size() > 0;
		}
		
		else {			
			this.IsBoolean = false;
			this.BooleanResult = false;
  	  	}
		
		List<Integer> positionsToConsider =  variableBindings.stream().filter(v -> variableNamesToAdd.stream().map(v2 -> "?" + v2).anyMatch(v2 -> v.toString().equals(v2))).map
				(v -> variableBindings.indexOf(v)).collect(Collectors.toList());
  	  
  	  	this.Results = new ArrayList<ArrayList<String>>();
  	  	for (int i = 0; i < results.size(); i++) {
  	  		final int finalI = i;
  	  		if(!positionsToConsider.stream().anyMatch(p -> results.get(finalI).get(p).getClass().getName() == "org.deri.iris.terms.Null")){  	  		
	  		  ArrayList<String> resultList = new ArrayList<String>();
	  		  for(int j = 0; j < results.get(i).size(); j++) {  			  
	  			  if(positionsToConsider.contains(j)) 
	  			  {  			  
	  				  resultList.add(results.get(i).get(j).toString());
	  			  }
	  		  }
	  		  
	  		  if(!Contains(resultList)) {
	  			this.Results.add(resultList);
	  		  }
  	  		}
  	  	} 
	}
	
	public Boolean IsBoolean;
	
	public Boolean BooleanResult;
	
	public String Query;
	
	public List<String> VariableBindings;
	
	public ArrayList<ArrayList<String>> Results;
	
	private Boolean Contains(ArrayList<String> resultList) {
		return this.Results.stream().anyMatch(r -> AreEqual(r, resultList));
	}
	
	private Boolean AreEqual(ArrayList<String> l1, ArrayList<String> l2) {
		if(l1.size() != l2.size()) {
			return false;
		}
		
		for(int i = 0; i < l1.size(); i++) {
			if(!l1.get(i).equals(l2.get(i))){
				return false;
			}
		}
		return true;
	}

}
