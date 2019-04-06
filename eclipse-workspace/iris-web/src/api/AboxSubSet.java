package api;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.stream.Collectors;

public class AboxSubSet {
	public List<Fact> Facts;
	public Boolean ConsistentStatus;
	
	public AboxSubSet(List<Fact> facts) {
		this.Facts = facts;
		this.ConsistentStatus = null;
	}

	public AboxSubSet() {
		this.Facts = new ArrayList<Fact>();
	}

	public boolean isSubSetOf(AboxSubSet s) {
		ListIterator<Fact> thisIterator =  this.Facts.listIterator();
		ListIterator<Fact> sIterator =  s.Facts.listIterator();
		
		if(this.Facts.size() > s.Facts.size()) {
			return false;
		}
		
		int included = 0;
		
		while(thisIterator.hasNext()) {
			
			Fact next = thisIterator.next();
			Boolean continueWithS = true;
			
			
			
			while(sIterator.hasNext() && continueWithS) {
				Fact nextS = sIterator.next();
				if(nextS.Id > next.Id) {
					return false;
				}
				if(nextS.Id == next.Id) {
					continueWithS = false;
					included++;
				}
			}
		}		
		
		return included == this.Facts.size();
	}
	
	public void add(Fact f) {
		ListIterator<Fact> thisIterator =  this.Facts.listIterator();
		int index = 0;
		boolean added = false;
		

		while(thisIterator.hasNext() && !added) {
			Fact f2 = thisIterator.next(); 
			if(f2.Id > f.Id) {
				added = true;
				this.Facts.add(index, f);
			}
			else if(f2.Id == f.Id) {
				added = true;
			}				
			index++;
		}
		
		if(!added) {
			this.Facts.add(index, f);
		}
	}
	
	public AboxSubSet copyWithoutStatus() {
		return new AboxSubSet(new ArrayList<Fact>(this.Facts));
	}
	
	public boolean isSubSetOfAny(List<AboxSubSet> subSets) {		
		return subSets.stream().anyMatch(s -> this.isSubSetOf(s));
	}
	
	public boolean isSuperSetOfAny(List<AboxSubSet> subSets) {		
		return subSets.stream().anyMatch(s -> this.isSuperSetOf(s));
	}
	
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }

        if (!AboxSubSet.class.isAssignableFrom(obj.getClass())) {
            return false;
        }

        final AboxSubSet other = (AboxSubSet) obj;       

        return other.size() == this.size() && this.isSubSetOf(other);
    }
    
    public int size() {
    	return this.Facts.size();
    }
	
	
	public boolean isSuperSetOf(AboxSubSet s) {
		return s.isSubSetOf(this);
	}
	
	public String toString() {
		String cons = "";
		if (this.ConsistentStatus == null) {
			cons = "null";
		}
		else {
			cons = this.ConsistentStatus? "consistent" : "inconsistent"; 
		}
		return "[" + this.Facts.stream().map(f -> f.Text).collect(Collectors.joining(",")) + "] - " + cons;
	}
	
	//todo pasar esto a metodos de AboxSubSet
	public List<AboxSubSet> allSubSetsWithOneLess(){
		List<AboxSubSet> result = new ArrayList<AboxSubSet>();
		
		int i = 0;
		int size = this.Facts.size();
		while(i < size) {
			result.add(allFactsBut(this.Facts.get(i).Id));
			i++;
		}		
		return result;
	}
	
	private AboxSubSet allFactsBut(int i){
		return new AboxSubSet(this.Facts.stream().filter(f -> f.Id != i).collect(Collectors.toList()));
	}
	
	public boolean Contains(Fact f) {
		return this.Facts.stream().anyMatch(f2 -> f2.equals(f));
	}
	
	
	public  ArrayList<AboxSubSet>allPossibleSubSetsWithOneMore(List<AboxSubSet> l){
		ArrayList<AboxSubSet> result = new ArrayList<AboxSubSet>();
		
		l.forEach(s -> {			
			this.Facts.forEach(f -> {
				if(!s.Contains(f) ) {
					AboxSubSet s2 = s.copyWithoutStatus();
					s2.add(f);
					if (!result.stream().anyMatch(s4 -> s2.equals(s4))) {
						result.add(s2);
					}
				}
			});
		});
		
		return result;
	}
	

	
	public List<AboxSubSet> allSubSetsWithOneElement(){
		return this.Facts.stream().map(f -> listWithOneElement(f)).collect(Collectors.toList());
	}
	
	private AboxSubSet listWithOneElement(Fact fact){
		AboxSubSet result = new AboxSubSet();
		result.add(fact);
		return result;
	}
	
	
}
