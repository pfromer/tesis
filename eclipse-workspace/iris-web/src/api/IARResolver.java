package api;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;

import java.util.concurrent.atomic.AtomicInteger;

public class IARResolver {
	
	private List<Fact> ABox;
	private List<String> Tgds;
	private List<String> ncsAsQueries;
	private Boolean isGuarded;
	
	public IARResolver(Program program) {
		
		AtomicInteger index = new AtomicInteger();		
		this.ABox = program.facts.stream().map( f -> new Fact(f,index.getAndIncrement())).collect(Collectors.toList());
		this.Tgds = program.tgds;
		this.ncsAsQueries = program.ncsAsQueries;
		this.isGuarded = program.isGuarded;
		
	}

	public ArrayList<AboxSubSet> getRepairs() {
		List<AboxSubSet> top = allSubSetsWithOneLess();
		List<AboxSubSet> bottom = allSubSetsWithOneElement();
		ArrayList<AboxSubSet> minimalInconsistents = new ArrayList<AboxSubSet>();
		ArrayList<AboxSubSet> smallRepairs = new ArrayList<AboxSubSet>();
		ArrayList<AboxSubSet> bigRepairs = new ArrayList<AboxSubSet>();
		ArrayList<AboxSubSet> topLessOne = new ArrayList<AboxSubSet>();
		ArrayList<AboxSubSet> bottomPlusOne = new ArrayList<AboxSubSet>();
		
		bottom.forEach(a -> {
			a.ConsistentStatus = IsConsistent(a);
			if(!a.ConsistentStatus)
				minimalInconsistents.add(a);			
		});
		
		while(top.size() != 0 && bottom.size() != 0 && top.get(0).Facts.size() != bottom.get(0).Facts.size()) {
			
			top.forEach(s -> {
				minimalInconsistents.forEach(inc -> {
					if(inc.isSubSetOf(s))
					{
						s.ConsistentStatus = false;
					}
				});
			});
			
			
		}
		
		
		
		
		return null;
	}
	
	private List<AboxSubSet> allSubSetsWithOneLess(){
		return this.ABox.stream().map(f -> allFactsBut(f.Id)).collect(Collectors.toList());		
	}
	
	private AboxSubSet allFactsBut(int i){
		return new AboxSubSet(this.ABox.stream().filter(f -> f.Id != i).collect(Collectors.toList()));
	}
	
	private List<AboxSubSet> allSubSetsWithOneElement(){
		return this.ABox.stream().map(f -> listWithOneElement(f)).collect(Collectors.toList());
	}
	
	private AboxSubSet listWithOneElement(Fact fact){
		List<Fact> result = new ArrayList<Fact>();
		result.add(fact);
		return new AboxSubSet(result.stream().collect(Collectors.toList()));
	}
	
	private Boolean IsConsistent(AboxSubSet subset){
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();		
		
		if(this.isGuarded) {			
			configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		}
		else {
	        configuration.evaluationStrategyFactory = new StratifiedBottomUpEvaluationStrategyFactory(new NaiveEvaluatorFactory());
	    }
		
		String program = GenerateProgram(subset);
		ProgramExecutor executor = new ProgramExecutor(program, configuration);
		ArrayList<QueryResult> output = executor.getResults();
		
		return output.stream().anyMatch(q -> hasResult(q));
		
	}

	private Boolean hasResult(QueryResult q) {
		return q.Results.size() > 0;
	}

	private String GenerateProgram(AboxSubSet subset) {
		
		String tgds =  this.Tgds.stream().collect(Collectors.joining("\n"));
		String facts = subset.Facts.stream().map(f -> f.Text).collect(Collectors.joining("\n"));
		String queries = this.ncsAsQueries.stream().collect(Collectors.joining("\n"));
		
		return tgds + "\n" + facts + "\n" + queries;
	}
}



/*
input: program

var top = todosLosSubSetDeUnoMenos(program.Abox);
var bottom = todosLosSetDeUnElemento(program.Abox);
var minimalesIncosistentes = vacio;
var repairsChicos = vacio;
var repairsGrandes = vacio;
var topMenos1 = vacio;
var bottomMasUno = vacio;

para cada s en bottom:
	fijarase si es consistente o no
	si s es inconsistente:
		s.consistentStatus = inconsistent
		agregar s a minimalesInconsistentes
	si no:
		s.consistentSatus = consistent


while(top != vacio and bottom != vacio and top.first.length != bottom.first.length){
			
	para cada set s en top:
	si s es superCojunto de un minimalInconsistente:
		s.consistentStatus = inconsistent		
			
	para cada s en top con consistentStatus en undefined: 
		fijarse si s es consistente (tirando las queries).
		si s es consistente: 
			s.consistentStatus = consistent.
			agregar s a repairsGrandes// no hace falta mirar que no sea subconjutno de algun repair existente, pues eso lo filtro cuando elijo los hijos de topMenos1
		si no
			s.consistenteStatus = inconsistent. //no necesariamente es inconsistente minimal.
	
	top := todos los subSet que puedo generar sacando un elemento a 
				los set de top inconsistentes, siempre y cuando no sean sub conjunto de un repair grande.
	
	
	bottomMasUno = todos los subset de la ABox que se pueden formar agregnado un elemento 
				de la ABox a los consistentes de bottom siempre y cuando no sean superConjunto de un minimal inconsistente. 
				
	//ir armando el grafo (hijo-padre). // el objeto AboxSubSet, donde cada uno tiene una lista de hijos y de padres

	
	para cada s en bottomMasUno:
		si s es subConbj de un repairGrande
			s.consistentStatus = consistent
		si no:
			tirar query y fijarse si es consistnete
			si s es consistente:
				s.consistentSatus = consistente
			si no
				s.consistentSatus = inconsistent
				agregar s a minimales inconsistentes
	
		
	para todos los s en bottom consistentes cuyos padres son todos inconsistentes //esto lo miro rapido gracias al grafo
		agregar s a repairsChicos
	
	bottom = bottomMasUno que sean consistentes
}

return {repairs: repairsChicos U repairsGrandes, intersection : intersection(this.repairs) }*/