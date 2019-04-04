package api;

import java.util.List;
import java.util.ListIterator;

public class AboxSubSet {
	public List<Fact> Facts;
	public Boolean ConsistentStatus;
	
	public AboxSubSet(List<Fact> facts) {
		this.Facts = facts;
		this.ConsistentStatus = null;
	}

	public boolean isSubSetOf(AboxSubSet s) {
		
		ListIterator<Fact> thisIterator =  this.Facts.listIterator();
		ListIterator<Fact> sIterator =  s.Facts.listIterator();
		
		if(this.Facts.size() > s.Facts.size()) {
			return false;
		}
		
		/*this: [4,6,9]
		s: [1,4,5,8,9,10]
			*/
		
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
				}
			}
		}		
		
		return true;
	}
	
	public boolean isSuperSetOf(AboxSubSet s) {
		return s.isSubSetOf(this);
	}
	
}
