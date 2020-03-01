package org.deri.iris.repairs_finder;

public class Fact {
	
	public int Id;
	public String Text; 
	
	public Fact(String text, int id) {
		this.Id = id;
		this.Text = text;
	}
	
	 public Boolean equals(Fact anotherFact) {
		return this.Id == anotherFact.Id;
	}

}
