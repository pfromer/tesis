package org.deri.iris.semantic_executor;

import java.util.List;

public class SemanticParams {
	public List<NegativeConstraint> ncs;
	public List<Tgd> tgds;
	public List<Fact> facts;
	public List<ExistencialQuery> queries;
	public String semantics;
	public int max_depth;
}