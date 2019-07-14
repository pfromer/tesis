package org.deri.iris.iar;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.function.Function;

public class IARResolver {
	
	private AboxSubSet ABox;
	private ArrayList<AboxSubSet> bigRepairs;
	private ArrayList<AboxSubSet> minimalInconsistents;
	private ArrayList<AboxSubSet> smallRepairs;
	private Function<AboxSubSet, Boolean> IsConsistentFunction;
	private List<AboxSubSet> top;
	private List<AboxSubSet> bottom;
	private List<AboxSubSet> bottomPlusOne;
	
	public IARResolver(Program program) {
		this.IsConsistentFunction = program::IsConsistent;
		this.ABox = program.ABox();
		this.top = this.ABox.allSubSetsWithOneLess();
		this.bottom = this.ABox.allSubSetsWithOneElement();
		this.minimalInconsistents = new ArrayList<AboxSubSet>();
		this.smallRepairs = new ArrayList<AboxSubSet>();
		this.bigRepairs = new ArrayList<AboxSubSet>();
		this.bottomPlusOne = new ArrayList<AboxSubSet>();
	}

	public ArrayList<AboxSubSet> getRepairs() {
		
		SetBottomStatusAndAddToMinimalInconsistents();
		FilterBottomAsConsistents();
		
		while(this.top.size() != 0 && this.bottom.size() != 0 && this.top.get(0).size() > this.bottom.get(0).size()) {	
			SetTopConsistentStatusAndAddToBigRepairs();			
			BuildNextTop();			
			BuildBottomPlusOne();
			SetBottomPlusOneConsistentStatusAndAddToMinimalInconsistents();
			AddBottomToSmalRepairs();
			BuildNextBottom();
		}
				
		if(ABox.Facts.size() % 2 == 0) {
			SetTopConsistentStatusAndAddToBigRepairs();
		}
		
		smallRepairs.addAll(bigRepairs);
		return smallRepairs;
	}
	
	private void BuildNextBottom() {
		this.bottom = new ArrayList<AboxSubSet>(bottomPlusOne.stream().filter(s-> s.ConsistentStatus).collect(Collectors.toList()));
	}
	
	private void BuildBottomPlusOne() {
		this.bottomPlusOne = new  ArrayList<AboxSubSet>(this.ABox.allPossibleSubSetsWithOneMore(bottom).stream().
			filter(s ->  !s.isSuperSetOfAny(minimalInconsistents)).collect(Collectors.toList()));
	}
	
	private void SetBottomStatusAndAddToMinimalInconsistents() {
		this.bottom.forEach(a -> {
			a.ConsistentStatus = IsConsistentFunction.apply(a);
			if(!a.ConsistentStatus)
				minimalInconsistents.add(a);			
		});
	}
	
	private void SetBottomPlusOneConsistentStatusAndAddToMinimalInconsistents() {
		this.bottomPlusOne.forEach(s -> {
			if(bigRepairs.stream().anyMatch(r -> s.isSubSetOf(r))) {
				s.ConsistentStatus = true;
			}
			else {
				s.ConsistentStatus = IsConsistentFunction.apply(s);
				if(!s.ConsistentStatus && !s.isSuperSetOfAny(minimalInconsistents)) {
					this.minimalInconsistents.add(s);
				}
			}
		});
	}
	
	private void AddBottomToSmalRepairs() {
		this.bottom.forEach(s -> {
			if(bottomPlusOne.stream().filter(s2 -> s2.isSuperSetOf(s)).allMatch(s2 -> s2.ConsistentStatus == false)) {
				smallRepairs.add(s);
			}
		});
	}
	
	private void SetTopConsistentStatusAndAddToBigRepairs() {
		this.top.forEach(s -> {
			if (minimalInconsistents.stream().anyMatch(inc -> inc.isSubSetOf(s))) {
				s.ConsistentStatus = false;
			}
			else {
				s.ConsistentStatus = IsConsistentFunction.apply(s);
				if(s.ConsistentStatus && !s.isSubSetOfAny(this.bigRepairs)) {
					this.bigRepairs.add(s);
				}
			}
		});
	}
	
	private void FilterBottomAsConsistents(){
		this.bottom = this.bottom.stream().filter(s -> s.ConsistentStatus).collect(Collectors.toList());
	}
	
	//todos los subSet que puedo generar sacando un elemento a 
	//los set de top inconsistentes, siempre y cuando no sean sub conjunto de un repair grande.
	private void BuildNextTop(){
		List<AboxSubSet> nextTop = new ArrayList<AboxSubSet>();
		this.top.forEach(s -> {
			//TODO AGREGAR UNA PROPIEDAD QUE SEA ES SUBSET DE UN REPAIR DE MANERA DE NO TENER QUE VOLVER A CALCULAR
			if(!s.ConsistentStatus && !s.isSubSetOfAny(this.bigRepairs)) {
				s.allSubSetsWithOneLess().forEach(x -> {
					if(!nextTop.stream().anyMatch(x2 -> x2.equals(x))) {
						nextTop.add(x);
					}
				});
			}
		});
		this.top = nextTop; 
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