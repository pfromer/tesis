/*
 * <Project Name>
 * <Project Description>
 * 
 * Copyright (C) 2010 ICT Institute - Politecnico di Milano, Via Ponzio 34/5, 20133 Milan, Italy.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, 
 * MA  02110-1301, USA.
 */
package org.deri.iris.queryrewriting;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import junit.framework.TestCase;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.deri.iris.api.basics.ILiteral;
import org.deri.iris.api.basics.IPosition;
import org.deri.iris.api.basics.IPredicate;
import org.deri.iris.api.basics.IRule;
import org.deri.iris.api.basics.ITuple;
import org.deri.iris.api.terms.ITerm;
import org.deri.iris.api.terms.IVariable;
import org.deri.iris.basics.Position;
import org.deri.iris.factory.Factory;
import org.deri.iris.queryrewriting.caching.CacheManager;
import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 * @author Giorgio Orsi <orsi AT elet DOT polimi DOT it> ICT Institute - Politecnico di Milano.
 * @version 0.1b
 */
public class PropagationGraphTest extends TestCase {

  @Override public void setUp() {
    // setup caching
    CacheManager.setupCaching();
  }

  static {
    // Load the logging configuration
    PropertyConfigurator.configure("config/logging.properties");

  }

  private final Logger LOGGER = Logger.getLogger(PropagationGraphTest.class);

  private static final IVariable VAR_Y = Factory.TERM.createVariable("Y");

  private static final IVariable VAR_X = Factory.TERM.createVariable("X");

  private final ITuple tupleX = Factory.BASIC.createTuple(VAR_X);

  private final ITuple tupleY = Factory.BASIC.createTuple(VAR_Y);

  private final ITuple tupleXY = Factory.BASIC.createTuple(VAR_X, VAR_Y);

  private final ITuple tupleYX = Factory.BASIC.createTuple(VAR_Y, VAR_X);

  /*
   * True Outcome
   */
  @Test public void testPositionDependenciesLinearAcyclicSingleWay() throws Exception {

    //
    // Theory:
    //
    // [R1] p(X) -> t(X,Y).
    // [R2] t(X,Y) -> s(Y).
    // [R3] p(X) -> m(X).
    // [R4] s(X) -> m(X).
    //

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);
    final IPredicate m = Factory.BASIC.createPredicate("m", 1);
    final ILiteral px = Factory.BASIC.createLiteral(true, p, tupleX);
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, tupleXY);
    final ILiteral sx = Factory.BASIC.createLiteral(true, s, tupleX);
    final ILiteral sy = Factory.BASIC.createLiteral(true, s, tupleY);
    final ILiteral mx = Factory.BASIC.createLiteral(true, m, tupleX);

    // Input structure
    final List<ILiteral> h1 = new LinkedList<ILiteral>();
    final List<ILiteral> b1 = new LinkedList<ILiteral>();
    h1.add(txy);
    b1.add(px);

    final List<ILiteral> h2 = new LinkedList<ILiteral>();
    final List<ILiteral> b2 = new LinkedList<ILiteral>();
    h2.add(sy);
    b2.add(txy);

    final List<ILiteral> h3 = new LinkedList<ILiteral>();
    final List<ILiteral> b3 = new LinkedList<ILiteral>();
    h3.add(mx);
    b3.add(px);

    final List<ILiteral> h4 = new LinkedList<ILiteral>();
    final List<ILiteral> b4 = new LinkedList<ILiteral>();
    h4.add(mx);
    b4.add(sx);

    final IRule r1 = Factory.BASIC.createRule(h1, b1);
    final IRule r2 = Factory.BASIC.createRule(h2, b2);
    final IRule r3 = Factory.BASIC.createRule(h3, b3);
    final IRule r4 = Factory.BASIC.createRule(h4, b4);

    final List<IRule> in = ImmutableList.of(r1, r2, r3, r4);

    //
    // Comparison Structure:
    //
    // p[1] -> p[1] {<>}
    // t[1] -> t[1] {<>}
    // t[2] -> t[2] {<>}
    // s[1] -> s[1] {<>}
    // m[1] -> m[1] {<>}
    //
    // p[1] -> t[1] {<R1>}
    // t[2] -> s[1] {<R2>}
    // p[1] -> m[1] {<R3>}
    // s[1] -> m[1] {<R4>}
    //
    // t[2] -> m[1] {<R2,R4>}
    //

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> cmp = new HashMap<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>>();

    final IPosition p1 = new Position(p.getPredicateSymbol(), 1);
    final IPosition t1 = new Position(t.getPredicateSymbol(), 1);
    final IPosition t2 = new Position(t.getPredicateSymbol(), 2);
    final IPosition s1 = new Position(s.getPredicateSymbol(), 1);
    final IPosition m1 = new Position(m.getPredicateSymbol(), 1);

    // final List<IRule> lEmpty = ImmutableList.of();
    // final Set<List<IRule>> slEmpty = ImmutableSet.of(lEmpty);
    // cmp.put(Pair.of(p1, p1), slEmpty); // p[1] -> p[1] {<>}
    // cmp.put(Pair.of(t1, t1), slEmpty); // t[1] -> t[1] {<>}
    // cmp.put(Pair.of(t2, t2), slEmpty); // t[2] -> t[2] {<>}
    // cmp.put(Pair.of(s1, s1), slEmpty); // s[1] -> s[1] {<>}
    // cmp.put(Pair.of(m1, m1), slEmpty); // m[1] -> m[1] {<>}
    //
    // final List<IRule> lr1 = ImmutableList.of(r1); // p[1] -> t[1] {<R1>}
    // final Set<List<IRule>> slr1 = ImmutableSet.of(lr1);
    // cmp.put(ImmutablePair.of(p1, t1), slr1);
    //
    // final List<IRule> lr2 = ImmutableList.of(r2); // t[2] -> s[1] {<R2>}
    // final Set<List<IRule>> slr2 = ImmutableSet.of(lr2);
    // cmp.put(ImmutablePair.of(t2, s1), slr2);
    //
    // final List<IRule> lr3 = ImmutableList.of(r3); // p[1] -> m[1] {<R3>}
    // final Set<List<IRule>> slr3 = ImmutableSet.of(lr3);
    // cmp.put(ImmutablePair.of(p1, m1), slr3);
    //
    // final List<IRule> lr4 = ImmutableList.of(r4); // s[1] -> m[1] {<R4>}
    // final Set<List<IRule>> slr4 = ImmutableSet.of(lr4);
    // cmp.put(ImmutablePair.of(s1, m1), slr4);

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> depGraph = DepGraphUtils
        .computePropagationGraph(in);

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Expected:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(cmp));

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Actual:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(depGraph));

    assertEquals(true, depGraph.equals(cmp));

  }

  /*
   * True Outcome
   */
  @Test public void testPositionDependenciesLinearCyclic() throws Exception {

    //
    // Theory:
    //
    // [R1] t(X,Y) -> s(X).
    // [R2] t(X,Y) -> t(Y,X).
    //

    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);

    final ILiteral txy = Factory.BASIC.createLiteral(true, t, tupleXY);
    final ILiteral tyx = Factory.BASIC.createLiteral(true, t, tupleYX);
    final ILiteral sx = Factory.BASIC.createLiteral(true, s, tupleX);

    // Input structure
    final List<ILiteral> h1 = new LinkedList<ILiteral>();
    final List<ILiteral> b1 = new LinkedList<ILiteral>();
    b1.add(txy);
    h1.add(sx);

    final List<ILiteral> h2 = new LinkedList<ILiteral>();
    final List<ILiteral> b2 = new LinkedList<ILiteral>();

    b2.add(txy);
    h2.add(tyx);
    final IRule r1 = Factory.BASIC.createRule(h1, b1);
    final IRule r2 = Factory.BASIC.createRule(h2, b2);

    final List<IRule> in = ImmutableList.of(r1, r2);

    //
    // Comparison Structure:
    //
    // t[1] -> t[1] {<>, <R2,R2>}
    // t[2] -> t[2] {<>, <R2,R2>}
    // s[1] -> s[1] {<>}
    //
    // t[1] -> s[1] {<R1>}
    // t[1] -> t[2] {<R2>}
    // t[2] -> t[1] {<R2>}
    //
    // t[2] -> s[1] {<R2,R1>}
    //

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> cmp = new HashMap<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>>();

    final IPosition t1 = new Position(t.getPredicateSymbol(), 1);
    final IPosition t2 = new Position(t.getPredicateSymbol(), 2);
    final IPosition s1 = new Position(s.getPredicateSymbol(), 1);

    final List<IRule> lEmpty = ImmutableList.of();
    final Set<List<IRule>> st1t1 = Sets.newHashSet();
    st1t1.add(lEmpty);
    // st1t1.add(lr2r2);
    final Set<List<IRule>> st2t2 = Sets.newHashSet();
    st2t2.add(lEmpty);
    // st2t2.add(lr2r2);
    final Set<List<IRule>> ss1s1 = Sets.newHashSet();
    ss1s1.add(lEmpty);

    // // t[1] -> t[1] {<>}
    // cmp.put(Pair.of(t1, t1), st1t1);
    // // t[2] -> t[2] {<>}
    // cmp.put(Pair.of(t2, t2), st2t2);
    // // s[1] -> s[1] {<>}
    // cmp.put(Pair.of(s1, s1), ss1s1);
    //
    // // t[1] -> s[1] {<R1>}
    // final List<IRule> lr1 = ImmutableList.of(r1);
    // final Set<List<IRule>> slr1 = Sets.newHashSet();
    // slr1.add(lr1);
    // cmp.put(Pair.of(t1, s1), slr1);
    //
    // // t[1] -> t[2] {<R2>}
    // // t[2] -> t[1] {<R2>}
    // final List<IRule> lr2 = ImmutableList.of(r2);
    // final Set<List<IRule>> slr2 = Sets.newHashSet();
    // slr2.add(lr2);
    // cmp.put(Pair.of(t1, t2), slr2);
    // cmp.put(Pair.of(t2, t1), slr2);

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> depGraph = DepGraphUtils
        .computePropagationGraph(in);

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Expected:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(cmp));

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Actual:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(depGraph));

    assertEquals(true, depGraph.equals(cmp));

  }

  /*
   * True Outcome
   */
  @Test public void testPositionDependenciesInverse() throws Exception {

    //
    // Dependencies:
    //
    // [R1] t(X,Y) -> t(Y,X).
    //

    final IPredicate t = Factory.BASIC.createPredicate("t", 2);

    final ILiteral txy = Factory.BASIC.createLiteral(true, t, tupleXY);
    final ILiteral tyx = Factory.BASIC.createLiteral(true, t, tupleYX);

    // Input structure

    final List<ILiteral> h1 = new LinkedList<ILiteral>();
    final List<ILiteral> b1 = new LinkedList<ILiteral>();
    b1.add(txy);
    h1.add(tyx);

    final IRule r1 = Factory.BASIC.createRule(h1, b1);

    final List<IRule> in = ImmutableList.of(r1);

    //
    // Comparison Structure:
    //
    // t[1] -> t[1] {<>, <R1,R1>}
    // t[2] -> t[2] {<>, <R1,R1>}
    //
    // t[1] -> t[2] {<R2>}
    // t[2] -> t[1] {<R2>}
    //

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> cmp = new HashMap<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>>();

    final IPosition t1 = new Position(t.getPredicateSymbol(), 1);
    final IPosition t2 = new Position(t.getPredicateSymbol(), 2);

    final List<IRule> lEmpty = ImmutableList.of();
    final Set<List<IRule>> st1t1 = Sets.newLinkedHashSet();
    st1t1.add(lEmpty);
    final Set<List<IRule>> st2t2 = Sets.newLinkedHashSet();
    st2t2.add(lEmpty);

    // // t[1] -> t[1] {<>}
    // cmp.put(Pair.of(t1, t1), st1t1);
    // // t[2] -> t[2] {<>}
    // cmp.put(Pair.of(t2, t2), st2t2);
    //
    // // t[1] -> t[2] {<R1>}
    // // t[2] -> t[1] {<R1>}
    // final List<IRule> lr1 = ImmutableList.of(r1);
    // final Set<List<IRule>> slr1 = Sets.newLinkedHashSet();
    // slr1.add(lr1);
    // cmp.put(Pair.of(t1, t2), slr1);
    // cmp.put(Pair.of(t2, t1), slr1);

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> depGraph = DepGraphUtils
        .computePropagationGraph(in);

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Expected:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(cmp));

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Actual:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(depGraph));
    assertEquals(true, depGraph.equals(cmp));

  }

  /*
   * True Outcome
   */
  @Test public void testPositionDependenciesLinearCyclicMultiWay() throws Exception {

    //
    // Dependencies:
    //
    // [R1] p(X) -> t(X,Y).
    // [R2] t(X,Y) -> s(X).
    // [R3] t(X,Y) -> t(Y,X).
    // [R4] t(X,Y) -> s(Y).
    //

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);

    final ILiteral px = Factory.BASIC.createLiteral(true, p, tupleX);
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, tupleXY);
    final ILiteral tyx = Factory.BASIC.createLiteral(true, t, tupleYX);
    final ILiteral sx = Factory.BASIC.createLiteral(true, s, tupleX);
    final ILiteral sy = Factory.BASIC.createLiteral(true, s, tupleY);

    // Input structure
    final List<ILiteral> h1 = new LinkedList<ILiteral>();
    final List<ILiteral> b1 = new LinkedList<ILiteral>();
    b1.add(px);
    h1.add(txy);

    final List<ILiteral> h2 = new LinkedList<ILiteral>();
    final List<ILiteral> b2 = new LinkedList<ILiteral>();
    b2.add(txy);
    h2.add(sx);

    final List<ILiteral> h3 = new LinkedList<ILiteral>();
    final List<ILiteral> b3 = new LinkedList<ILiteral>();
    b3.add(txy);
    h3.add(tyx);

    final List<ILiteral> h4 = new LinkedList<ILiteral>();
    final List<ILiteral> b4 = new LinkedList<ILiteral>();
    b4.add(txy);
    h4.add(sy);

    final IRule r1 = Factory.BASIC.createRule(h1, b1);
    final IRule r2 = Factory.BASIC.createRule(h2, b2);
    final IRule r3 = Factory.BASIC.createRule(h3, b3);
    final IRule r4 = Factory.BASIC.createRule(h4, b4);

    final List<IRule> in = ImmutableList.of(r1, r2, r3, r4);

    //
    // Comparison Structure:
    //
    // p[1] -> p[1] {<>}
    // t[1] -> t[1] {<>}
    // t[2] -> t[2] {<>}
    // s[1] -> s[1] {<>}
    //
    // p[1] -> t[1] {<R1>}
    // t[1] -> s[1] {<R2>}
    // t[1] -> t[2] {<R3>}
    // t[2] -> t[1] {<R3>}
    //
    //

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> cmp = new HashMap<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>>();

    final IPosition p1 = new Position(p.getPredicateSymbol(), 1);
    final IPosition t1 = new Position(t.getPredicateSymbol(), 1);
    final IPosition t2 = new Position(t.getPredicateSymbol(), 2);
    final IPosition s1 = new Position(s.getPredicateSymbol(), 1);

    final List<IRule> lEmpty = ImmutableList.of();
    final Set<List<IRule>> slEmpty = ImmutableSet.of(lEmpty);
    // cmp.put(ImmutablePair.of(p1, p1), slEmpty); // p[1] -> p[1] {<>}
    // cmp.put(ImmutablePair.of(t1, t1), slEmpty); // t[1] -> t[1] {<>}
    // cmp.put(ImmutablePair.of(t2, t2), slEmpty); // t[2] -> t[2] {<>}
    // cmp.put(ImmutablePair.of(s1, s1), slEmpty); // s[1] -> s[1] {<>}
    //
    // // p[1] -> t[1] {<R1>}
    // final List<IRule> lr1 = ImmutableList.of(r1);
    // final Set<List<IRule>> slr1 = ImmutableSet.of(lr1);
    // cmp.put(ImmutablePair.of(p1, t1), slr1);
    //
    // // t[1] -> s[1] {<R2>}
    // final List<IRule> lr2 = ImmutableList.of(r2);
    // final Set<List<IRule>> slr2 = ImmutableSet.of(lr2);
    // cmp.put(ImmutablePair.of(t1, s1), slr2);
    //
    // // t[1] -> t[2] {<R3>}
    // // t[2] -> t[1] {<R3>}
    // final List<IRule> lr3 = ImmutableList.of(r3);
    // final Set<List<IRule>> slr3 = ImmutableSet.of(lr3);
    // cmp.put(ImmutablePair.of(t1, t2), slr3);
    // cmp.put(ImmutablePair.of(t2, t1), slr3);
    //
    // // t[2] -> s[1] {<R4>}
    // final List<IRule> lr4 = ImmutableList.of(r4);
    // final Set<List<IRule>> slr4 = ImmutableSet.of(lr4);
    // cmp.put(ImmutablePair.of(t2, s1), slr4);

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> depGraph = DepGraphUtils
        .computePropagationGraph(in);

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Expected:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(cmp));

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Actual:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(depGraph));
    assertEquals(true, depGraph.equals(cmp));
  }

  @Test public void testCyclicMultiWaySinglePredicate() throws Exception {

    //
    // Dependencies:
    //
    // [R1] d(Z,O,B1,Z) -> d(Z,O,B1,O).
    // [R2] d(Z,O,Z,O) -> d(Z,O,O,Z).
    //

    final IPredicate d = Factory.BASIC.createPredicate("d", 4);
    final ITerm z = Factory.TERM.createVariable("Z");
    final ITerm o = Factory.TERM.createVariable("O");
    final ITerm b1 = Factory.TERM.createVariable("B1");

    final ILiteral dzob1z = Factory.BASIC.createLiteral(true, d, Factory.BASIC.createTuple(z, o, b1, z));
    final ILiteral dzob1o = Factory.BASIC.createLiteral(true, d, Factory.BASIC.createTuple(z, o, b1, o));
    final ILiteral dzozo = Factory.BASIC.createLiteral(true, d, Factory.BASIC.createTuple(z, o, z, o));
    final ILiteral dzooz = Factory.BASIC.createLiteral(true, d, Factory.BASIC.createTuple(z, o, o, z));

    // Input structure
    final IRule r1 = Factory.BASIC.createRule(ImmutableList.of(dzob1o), ImmutableList.of(dzob1z));
    final IRule r2 = Factory.BASIC.createRule(ImmutableList.of(dzooz), ImmutableList.of(dzozo));

    final List<IRule> in = ImmutableList.of(r1, r2);

    //
    // Control Structure:
    //
    // d[1] -> d[1] {<>,<R1>,<R2>}
    // d[2] -> d[2] {<>,<R1>,<R2>}
    // d[3] -> d[3] {<>,<R1>}
    // d[4] -> d[4] {<>}
    //
    // d[1] -> d[4] {<R1>}
    //

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> cmp = new HashMap<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>>();

    final IPosition d1 = new Position(d.getPredicateSymbol(), 1);
    final IPosition d2 = new Position(d.getPredicateSymbol(), 2);
    final IPosition d3 = new Position(d.getPredicateSymbol(), 3);
    final IPosition d4 = new Position(d.getPredicateSymbol(), 4);

    final List<IRule> lEmpty = ImmutableList.of();
    final List<IRule> lr1 = ImmutableList.of(r1);
    final List<IRule> lr2 = ImmutableList.of(r2);

    final Set<List<IRule>> sEmpty = ImmutableSet.of(lEmpty);

    final Set<List<IRule>> sd1d1 = ImmutableSet.of(lEmpty, lr1, lr2);
    final Set<List<IRule>> sd2d2 = ImmutableSet.of(lEmpty, lr1, lr2);
    final Set<List<IRule>> sd3d3 = ImmutableSet.of(lEmpty, lr1);
    final Set<List<IRule>> sd4d4 = sEmpty;
    final Set<List<IRule>> sd2d4 = ImmutableSet.of(lr1);
    final Set<List<IRule>> sd4d1 = ImmutableSet.of(lr1);
    final Set<List<IRule>> sd2d3 = ImmutableSet.of(lr2);
    final Set<List<IRule>> sd4d2 = ImmutableSet.of(lr2);
    final Set<List<IRule>> sd4d3 = ImmutableSet.of(lr2);
    final Set<List<IRule>> sd1d4 = ImmutableSet.of(lr2);
    final Set<List<IRule>> sd3d1 = ImmutableSet.of(lr2);
    final Set<List<IRule>> sd3d4 = ImmutableSet.of(lr2);

    // cmp.put(ImmutablePair.of(d1, d1), sd1d1); // d[1] -> d[1] {<>, <R1>, <R2>}
    // cmp.put(ImmutablePair.of(d2, d2), sd2d2); // d[2] -> d[2] {<>, <R1>, <R2>}
    // cmp.put(ImmutablePair.of(d3, d3), sd3d3); // d[3] -> d[3] {<>, <R1>}
    // cmp.put(ImmutablePair.of(d4, d4), sd4d4); // d[4] -> d[4] {<>}
    //
    // cmp.put(ImmutablePair.of(d2, d4), sd2d4); // d[2] -> d[4] {<R1>}
    // cmp.put(ImmutablePair.of(d4, d1), sd4d1); // d[4] -> d[1] {<R1>}
    // cmp.put(ImmutablePair.of(d2, d3), sd2d3); // d[2] -> d[3] {<R2>}
    // cmp.put(ImmutablePair.of(d4, d2), sd4d2); // d[4] -> d[2] {<R2>}
    // cmp.put(ImmutablePair.of(d4, d3), sd4d3); // d[4] -> d[3] {<R2>}
    // cmp.put(ImmutablePair.of(d1, d4), sd1d4); // d[1] -> d[4] {<R2>}
    // cmp.put(ImmutablePair.of(d3, d1), sd3d1); // d[3] -> d[1] {<R2>}
    // cmp.put(ImmutablePair.of(d3, d4), sd3d4); // d[3] -> d[4] {<R2>}

    final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> depGraph = DepGraphUtils
        .computePropagationGraph(in);

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Expected:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(cmp));

    LOGGER.info(IOUtils.LINE_SEPARATOR + "Actual:" + IOUtils.LINE_SEPARATOR
        + DepGraphUtils.prettyPrintPositionGraph(depGraph));

    assertEquals(true, depGraph.equals(cmp));
  }

}
