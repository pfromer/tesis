package org.deri.iris.iar;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.function.Function;

public class IARResolver {
	
	private AboxSubSet ABox;
	private ArrayList<AboxSubSet> bigRepairs;
	private ArrayList<AboxSubSet> culprits;
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
		this.culprits = new ArrayList<AboxSubSet>();
		this.smallRepairs = new ArrayList<AboxSubSet>();
		this.bigRepairs = new ArrayList<AboxSubSet>();
		this.bottomPlusOne = new ArrayList<AboxSubSet>();
	}

	public ArrayList<AboxSubSet> getRepairs() {
		SetBottomConsistencyAndAddToCulprits();
		ApplyConsistencyFilterOnBottom();
		
		while(this.top.size() != 0 && this.bottom.size() != 0 && this.top.get(0).size() > this.bottom.get(0).size()) {	
			SetTopConsistencyAndAddToBigRepairs();			
			BuildNextTop();			
			BuildBottomPlusOne();
			SetBottomPlusOneConsistencyAndAddToCulprits();
			AddBottomToSmallRepairs();
			BuildNextBottom();
		}
				
		if(ABox.Facts.size() % 2 == 0) {
			SetTopConsistencyAndAddToBigRepairs();
		}
		
		smallRepairs.addAll(bigRepairs);
		return smallRepairs;
	}
	
	private void BuildNextBottom() {
		this.bottom = new ArrayList<AboxSubSet>(bottomPlusOne.stream().filter(s-> s.Consistent).collect(Collectors.toList()));
	}
	
	private void BuildBottomPlusOne() {
		this.bottomPlusOne = new  ArrayList<AboxSubSet>(this.ABox.allPossibleSubSetsWithOneMore(bottom).stream().
			filter(s ->  !s.isSuperSetOfAny(culprits)).collect(Collectors.toList()));
	}
	
	private void SetBottomConsistencyAndAddToCulprits() {
		this.bottom.forEach(a -> {
			a.Consistent = IsConsistentFunction.apply(a);
			if(!a.Consistent)
				culprits.add(a);			
		});
	}
	
	private void SetBottomPlusOneConsistencyAndAddToCulprits() {
		this.bottomPlusOne.forEach(s -> {
			if(bigRepairs.stream().anyMatch(r -> s.isSubSetOf(r))) {
				s.Consistent = true;
			}
			else {
				s.Consistent = IsConsistentFunction.apply(s);
				if(!s.Consistent) { //ya se que no es super set de ningun culprit porque asi arme bottom plus one
					this.culprits.add(s);
				}
			}
		});
	}
	
	private void AddBottomToSmallRepairs() {
		this.bottom.forEach(s -> {//los bottom ya se que son consistntes porque los filtre antes
			if(bottomPlusOne.stream().filter(s2 -> s2.isSuperSetOf(s)).allMatch(s2 -> s2.Consistent == false)) {
				smallRepairs.add(s);
			}
		});
	}
	
	private void SetTopConsistencyAndAddToBigRepairs() {
		this.top.forEach(s -> {
			if (culprits.stream().anyMatch(inc -> inc.isSubSetOf(s))) {
				s.Consistent = false;
			}
			else {
				s.Consistent = IsConsistentFunction.apply(s);
				if(s.Consistent) { //ya sabemos que no es sub set de big r
					this.bigRepairs.add(s);
				}
			}
		});
	}
	
	private void ApplyConsistencyFilterOnBottom(){
		this.bottom = this.bottom.stream().filter(s -> s.Consistent).collect(Collectors.toList());
	}
	
	//todos los subSet que puedo generar sacando un elemento a 
	//los set de top inconsistentes. Filtrsar el resuiltado por los que no son sub conjunto de un repair grande.
	private void BuildNextTop(){
		List<AboxSubSet> nextTop = new ArrayList<AboxSubSet>();
		this.top.forEach(s -> {
			if(!s.Consistent) {
				s.allSubSetsWithOneLess().forEach(x -> {
					if(!nextTop.stream().anyMatch(x2 -> x2.equals(x))) {
						nextTop.add(x);
					}
				});
			}
		});
		this.top = nextTop.stream().filter(s ->  !s.isSubSetOfAny(this.bigRepairs)).collect(Collectors.toList()); 
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