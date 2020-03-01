package org.deri.iris.iar;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import oracle.net.aso.f;

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
	
	public IARResolver(Program program, Function<AboxSubSet, Boolean> consistentFunction) {
		this.IsConsistentFunction = consistentFunction;
		this.ABox = program.ABox();
		this.top = this.ABox.completeSet();
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
				
		if(ABox.Facts.size() % 2 == 1 && (this.top.size() != 0)) {
			SetTopConsistencyAndAddToBigRepairs();
		}
		
		smallRepairs.addAll(bigRepairs);
		return smallRepairs;
	}
	
	
	public List<Fact> getRepairsIntersection() {
		 ArrayList<AboxSubSet> repairs = this.getRepairs();
		 
		 AboxSubSet firstRepair = repairs.get(0);
		 
		 List<Fact> result = new ArrayList<Fact>();
		 
		 for(int i = 0; i<firstRepair.Facts.size(); i++) {
			 if(this.allRepairsContains(repairs, firstRepair.Facts.get(i))) {
				 result.add(firstRepair.Facts.get(i));
			 }
		 }
		 
		 return result;
	}
	
	private boolean allRepairsContains(ArrayList<AboxSubSet> repairs, Fact fact) {	
		return repairs.stream().allMatch(r -> r.Facts.stream().anyMatch(f -> f.equals(fact)));
	}
	
	
	private void BuildNextBottom() {
		this.bottom = new ArrayList<AboxSubSet>(bottomPlusOne.stream().filter(s-> s.Consistent).collect(Collectors.toList()));
	}
	
	private void SetBottomConsistencyAndAddToCulprits() {
		this.bottom.forEach(a -> {
			a.Consistent = IsConsistentFunction.apply(a);
			if(!a.Consistent)
				culprits.add(a);			
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
	
	private void BuildBottomPlusOne() {
		List<Integer> factsIds = this.ABox.Facts.stream().map(f -> f.Id).collect(Collectors.toList());
		List<List<Integer>> subSetsOfSizeK = this.getSubsets(factsIds, this.bottom.get(0).size() + 1);
		this.bottomPlusOne = subSetsOfSizeK.stream().
				map(l -> new AboxSubSet(this.ABox.Facts.stream().filter(f -> l.contains(f.Id)).collect(Collectors.toList()))).filter(s -> 
				!s.isSuperSetOfAny(culprits)).collect(Collectors.toList());
		
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
	
	private void BuildNextTop(){
		
		List<Integer> factsIds = this.ABox.Facts.stream().map(f -> f.Id).collect(Collectors.toList());
		
		List<List<Integer>> subSetsOfSizeK = this.getSubsets(factsIds, this.top.get(0).size() -1);
		
		List<AboxSubSet> nextTop = subSetsOfSizeK.stream().
				map(l -> new AboxSubSet(this.ABox.Facts.stream().filter(f -> l.contains(f.Id)).collect(Collectors.toList()))).collect(Collectors.toList());

		this.top = nextTop.stream().filter(s -> !s.isSubSetOfAny(this.bigRepairs)).collect(Collectors.toList());
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
	
	private static void getSubsets(List<Integer> superSet, int k, int idx, List<Integer> current,List<List<Integer>> solution) {
	    //successful stop clause
	    if (current.size() == k) {
	        solution.add(new ArrayList<Integer>(current));
	        return;
	    }
	    //unseccessful stop clause
	    if (idx == superSet.size()) return;
	    Integer x = superSet.get(idx);
	    current.add(x);
	    //"guess" x is in the subset
	    getSubsets(superSet, k, idx+1, current, solution);
	    current.remove(x);
	    //"guess" x is not in the subset
	    getSubsets(superSet, k, idx+1, current, solution);
	}

	public static List<List<Integer>> getSubsets(List<Integer> superSet, int k) {
	    List<List<Integer>> res = new ArrayList<>();
	    getSubsets(superSet, k, 0, new ArrayList<Integer>(), res);
	    return res;
	}
}