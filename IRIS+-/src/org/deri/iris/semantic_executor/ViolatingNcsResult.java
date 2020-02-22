package org.deri.iris.semantic_executor;

import java.util.List;

public class ViolatingNcsResult {
	
	public List<Integer> unsatisfied;
	
	public ViolatingNcsResult(List<Integer> ncsIndexes) {
		this.unsatisfied = ncsIndexes;
	}

}
