package org.deri.iris.semantic_executor;

import java.util.List;


public class SemanticExecutor {
	
	
	private SemanticParams params;
	
	public SemanticExecutor(SemanticParams _params) {
		this.params = _params;
	}
	
	public void Execute() {
		
		switch(this.params.semantics) {
			case "Standard":
				ExecuteStandard();
			case "AR":
				ExecuteAR();
			case "IAR":
				ExecuteIAR();		
		}		
	}
	
	private void ExecuteStandard() {
		
		//si ncs es lista vacia armo el programa concatenando todo y devuelvo el resultado
		//si ncs no es vacia armo una query por cada nc y me fijo si alguno da resultado
			//opcion 1 : ninguna da resultado-> concateno todo y devuelvo el resultado
			//opcion 2: alguna da resultado-> devuelvo error diciendo cuales ncs son violadas
	}
	
	private void ExecuteAR() {
		
		//calculo los repairs
		//para cada repair armo un programa (tgds, r, queries)
		//para cada query, devuelvo solo los resultados que figuran en el resulatado de todos los repairs
	}
	
	private void ExecuteIAR() {
		//calclo los repairs
		//calculo la interseccion de los repairs
		//armo un programa con la interseccion, las tgds y las queries
		//devuelvo el resultado
		
	}
}	
