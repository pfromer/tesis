package api;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.deri.iris.Configuration;
import org.deri.iris.KnowledgeBaseFactory;
import org.deri.iris.demo.ProgramExecutor;
import org.deri.iris.demo.QueryResult;
import org.deri.iris.evaluation.stratifiedbottomup.StratifiedBottomUpEvaluationStrategyFactory;
import org.deri.iris.evaluation.stratifiedbottomup.naive.NaiveEvaluatorFactory;
import org.deri.iris.rules.safety.GuardedRuleSafetyProcessor;

import com.sun.glass.ui.Size;

import java.util.concurrent.atomic.AtomicInteger;

public class IARResolver {
	
	private AboxSubSet ABox;
	private List<String> Tgds;
	private List<String> ncsAsQueries;
	private Boolean isGuarded;
	private ArrayList<AboxSubSet> bigRepairs;
	private ArrayList<AboxSubSet> minimalInconsistents; 
	
	public IARResolver(Program program) {
		
		AtomicInteger index = new AtomicInteger();		
		this.ABox = new AboxSubSet(program.facts.stream().map(f -> new Fact(f,index.getAndIncrement())).collect(Collectors.toList()));
		this.Tgds = program.tgds;
		this.ncsAsQueries = program.ncsAsQueries;
		this.isGuarded = program.isGuarded;
		
	}

	public ArrayList<AboxSubSet> getRepairs() {
		List<AboxSubSet> top = this.ABox.allSubSetsWithOneLess();
		List<AboxSubSet> bottom = this.ABox.allSubSetsWithOneElement();
		this.minimalInconsistents = new ArrayList<AboxSubSet>();
		ArrayList<AboxSubSet> smallRepairs = new ArrayList<AboxSubSet>();
		this.bigRepairs = new ArrayList<AboxSubSet>();
		
		bottom.forEach(a -> {
			a.ConsistentStatus = IsConsistent(a);
			if(!a.ConsistentStatus)
				minimalInconsistents.add(a);			
		});
		
		bottom = bottom.stream().filter(s -> s.ConsistentStatus).collect(Collectors.toList());
		
		while(top.size() != 0 && bottom.size() != 0 && top.get(0).size() > bottom.get(0).size()) {	
			SetTopConsistentStatus(top);
			
			final ArrayList<AboxSubSet> topMinusOne = topMinusOne(top);
			
			final ArrayList<AboxSubSet> bottomPlusOne =  new ArrayList<AboxSubSet>(this.ABox.allPossibleSubSetsWithOneMore(bottom).stream().
					filter(s ->  !s.isSuperSetOfAny(minimalInconsistents)).collect(Collectors.toList()));
					
			bottomPlusOne.forEach(s -> {
				if(bigRepairs.stream().anyMatch(r -> s.isSubSetOf(r))) {
					s.ConsistentStatus = true;
				}
				else {
					s.ConsistentStatus = IsConsistent(s);
					if(!s.ConsistentStatus && !s.isSuperSetOfAny(minimalInconsistents)) {
						minimalInconsistents.add(s);
					}
				}
			});
			
			bottom.forEach(s -> {
				if(bottomPlusOne.stream().filter(s2 -> s2.isSuperSetOf(s)).allMatch(s2 -> s2.ConsistentStatus == false)) {
					smallRepairs.add(s);
				}
			});
			
			bottom = new ArrayList<AboxSubSet>(bottomPlusOne.stream().filter(s-> s.ConsistentStatus).collect(Collectors.toList()));
			
			top = topMinusOne;
		}
				
		if(ABox.Facts.size() % 2 == 0) {
			SetTopConsistentStatus(top);
		}
		
		smallRepairs.addAll(bigRepairs);
		return smallRepairs;
	}
	
	
	private void SetTopConsistentStatus(List<AboxSubSet> top) {
		top.forEach(s -> {
			
			if (minimalInconsistents.stream().anyMatch(inc -> inc.isSubSetOf(s))) {
				s.ConsistentStatus = false;
			}
			else {
				s.ConsistentStatus = IsConsistent(s);
				if(s.ConsistentStatus && !s.isSubSetOfAny(bigRepairs)) {
					bigRepairs.add(s);
				}
			}
		});
	}
	

	
	
	//todos los subSet que puedo generar sacando un elemento a 
	//los set de top inconsistentes, siempre y cuando no sean sub conjunto de un repair grande.
	private ArrayList<AboxSubSet> topMinusOne(List<AboxSubSet> top){
		ArrayList<AboxSubSet> result = new ArrayList<AboxSubSet>();
		
		
		top.forEach(s -> {			
			if(!s.ConsistentStatus && !s.isSubSetOfAny(this.bigRepairs)) {
				s.allSubSetsWithOneLess().forEach(x -> {
					if(!result.stream().anyMatch(x2 -> x2.equals(x))) {
						result.add(x);
					}
				});
			}
		});
		
		/*top.stream().filter(s -> !s.ConsistentStatus && 
				!this.bigRepairs.stream().anyMatch(r -> s.isSubSetOf(r))).
					forEach(s -> {
						System.out.println("antes de allSubSetsWithOneLess");
						result.addAll(allSubSetsWithOneLess(s));
						System.out.println("despues de allSubSetsWithOneLess");
		});*/
		return result;
	}
	
	private Boolean IsConsistent(AboxSubSet subset){
		final Configuration configuration = KnowledgeBaseFactory.getDefaultConfiguration();		
		
		if(this.isGuarded) {			
			configuration.ruleSafetyProcessor = new GuardedRuleSafetyProcessor();
		}
		else {
	        configuration.evaluationStrategyFactory = new StratifiedBottomUpEvaluationStrategyFactory(new NaiveEvaluatorFactory());
	    }
		
		if(subset.Facts.size() == 0) return true;
		
		String program = GenerateProgram(subset);
		ProgramExecutor executor = new ProgramExecutor(program, configuration);
		ArrayList<QueryResult> output = executor.getResults();
		
		boolean result = !output.stream().anyMatch(q -> hasResult(q));
		
		return result;
		
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
	
	public String toString(ArrayList<AboxSubSet> s) {
		return toString(s.stream());
	}
	
	public String toString(List<AboxSubSet> s) {
		return toString(s.stream());
	}
	
	public String toString(Stream<AboxSubSet> s) {
		return "[" + s.map(f -> f.toString()).collect(Collectors.joining(",")) + "]";
	}
}



/*
 * 
 
 
 []
 1
 
 n = 1 -> l = 2
 ---------------
 1 2
 1 2
 
 
 n = 2 -> l = 2
 ------------------
 		12 13 23        
		
		1 2 3

n = 3 -> l = 2

------------
234 134 124 123

12 13 14 23 24 34

1 2 3 4

n = 4 -> l = 3

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

while(top != vacio and bottom != vacio and (top.get(0).Facts.size() > bottom.get(0).Facts.size() )  ){
			
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
	
	topMenosUno := todos los subSet que puedo generar sacando un elemento a 
				los set de top inconsistentes, siempre y cuando no sean sub conjunto de un repair grande.
	
	top = topMenosUno

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

if (n es par) para cada s en topMenosUno: si es superconj de minimal  consistente: nada
	si no tirar query, si da consistente, agregarlo a maximal consistente





return {repairs: repairsChicos U repairsGrandes, intersection : intersection(this.repairs) }*/