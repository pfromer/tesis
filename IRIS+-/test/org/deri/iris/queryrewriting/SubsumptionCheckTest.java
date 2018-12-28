/**
 * 
 */
package org.deri.iris.queryrewriting;

import java.util.LinkedHashSet;
import java.util.Set;

import junit.framework.TestCase;

import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.deri.iris.api.basics.ILiteral;
import org.deri.iris.api.basics.IPredicate;
import org.deri.iris.api.basics.IRule;
import org.deri.iris.api.basics.ITuple;
import org.deri.iris.api.terms.IVariable;
import org.deri.iris.factory.Factory;
import org.deri.iris.parser.parser.ParserException;
import org.deri.iris.queryrewriting.caching.CacheManager;
import org.junit.Assert;
import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

/**
 * @author jd
 */
public class SubsumptionCheckTest extends TestCase {

  private final Logger LOGGER = Logger.getLogger(SubsumptionCheckTest.class);

  @Override public void setUp() {
    // setup caching
    CacheManager.setupCaching();
  }

  {
    // Load the logging configuration
    PropertyConfigurator.configure("config/logging.properties");
  }

  /**
   * p(?X, ?Y), p(?Y, ?X) -> Q(?X) | p(?X, ?X) -> Q(?X).
   * 
   * @throws ParserException
   */
  @Test public void testSubsumption1() throws Exception {

    final ITuple tupleX = Factory.BASIC.createTuple(Factory.TERM.createVariable("X"));
    final ITuple tupleXY = Factory.BASIC
        .createTuple(Factory.TERM.createVariable("X"), Factory.TERM.createVariable("Y"));
    final ITuple tupleYX = Factory.BASIC
        .createTuple(Factory.TERM.createVariable("Y"), Factory.TERM.createVariable("X"));
    final ITuple tupleXX = Factory.BASIC
        .createTuple(Factory.TERM.createVariable("X"), Factory.TERM.createVariable("X"));

    final ILiteral blit1 = Factory.BASIC.createLiteral(true, Factory.BASIC.createPredicate("p", 2), tupleXY);
    final ILiteral blit2 = Factory.BASIC.createLiteral(true, Factory.BASIC.createPredicate("p", 2), tupleYX);

    final ILiteral blit3 = Factory.BASIC.createLiteral(true, Factory.BASIC.createPredicate("p", 2), tupleXX);

    final ILiteral hlit = Factory.BASIC.createLiteral(true, Factory.BASIC.createPredicate("q", 1), tupleX);

    final Set<ILiteral> b1 = new LinkedHashSet<ILiteral>();
    b1.add(blit1);
    b1.add(blit2);

    final Set<ILiteral> h1 = new LinkedHashSet<ILiteral>();
    h1.add(hlit);

    final Set<ILiteral> b2 = new LinkedHashSet<ILiteral>();
    b2.add(blit3);

    final Set<ILiteral> h2 = new LinkedHashSet<ILiteral>();
    h2.add(hlit);

    final IRule r1 = Factory.BASIC.createRule(h1, b1);
    final IRule r2 = Factory.BASIC.createRule(h2, b2);

    Assert.assertTrue(RewritingUtils.mapsTo(r1, r2));

  }

  @Test public void testPurgeWithQueryIndex() throws Exception {
    // Queries

    /*
     * Q1(?U0) :- AssistiveDevice(?U0), TactileReading(?U0). Q1(?U0) :- Device(?U0), TactileReading(?U0). Q1(?U0) :-
     * TactileReading(?U0).
     */

    final IPredicate q = Factory.BASIC.createPredicate("Q1", 1);

    final IPredicate ad = Factory.BASIC.createPredicate("AssistiveDevice", 1);
    final IPredicate tr = Factory.BASIC.createPredicate("TactileReading", 1);
    final IPredicate d = Factory.BASIC.createPredicate("Device", 1);

    final IVariable u0 = Factory.TERM.createVariable("U0");

    final ILiteral qu0 = Factory.BASIC.createLiteral(true, q, Factory.BASIC.createTuple(u0));

    final ILiteral adu0 = Factory.BASIC.createLiteral(true, ad, Factory.BASIC.createTuple(u0));
    final ILiteral tru0 = Factory.BASIC.createLiteral(true, tr, Factory.BASIC.createTuple(u0));
    final ILiteral du0 = Factory.BASIC.createLiteral(true, d, Factory.BASIC.createTuple(u0));

    final IRule q1 = Factory.BASIC.createRule(ImmutableList.of(qu0), ImmutableList.of(adu0, tru0));
    final IRule q2 = Factory.BASIC.createRule(ImmutableList.of(qu0), ImmutableList.of(du0, tru0));
    final IRule q3 = Factory.BASIC.createRule(ImmutableList.of(qu0), ImmutableList.of(tru0));

    final QueryGraph input = new QueryGraph();
    input.addRule(q1, q2);
    input.addRule(q2, q3);
    final Set<IRule> cmp = ImmutableSet.of(q3);

    RewritingUtils.purgeSubsumed(input);

    // Do the test
    Assert.assertEquals(cmp, input.getRules());
  }

  public void testRemoveAndBypass() throws Exception {
    // Queries

    /*
     * Q1(?U0) :- AssistiveDevice(?U0), TactileReading(?U0). Q1(?U0) :- Device(?U0), TactileReading(?U0). Q1(?U0) :-
     * TactileReading(?U0).
     */

    final IPredicate q = Factory.BASIC.createPredicate("Q1", 1);

    final IPredicate ad = Factory.BASIC.createPredicate("AssistiveDevice", 1);
    final IPredicate tr = Factory.BASIC.createPredicate("TactileReading", 1);
    final IPredicate d = Factory.BASIC.createPredicate("Device", 1);

    final IVariable u0 = Factory.TERM.createVariable("U0");

    final ILiteral qu0 = Factory.BASIC.createLiteral(true, q, Factory.BASIC.createTuple(u0));

    final ILiteral adu0 = Factory.BASIC.createLiteral(true, ad, Factory.BASIC.createTuple(u0));
    final ILiteral tru0 = Factory.BASIC.createLiteral(true, tr, Factory.BASIC.createTuple(u0));
    final ILiteral du0 = Factory.BASIC.createLiteral(true, d, Factory.BASIC.createTuple(u0));

    final IRule q1 = Factory.BASIC.createRule(ImmutableList.of(qu0), ImmutableList.of(adu0, tru0));
    final IRule q2 = Factory.BASIC.createRule(ImmutableList.of(qu0), ImmutableList.of(du0, tru0));
    final IRule q3 = Factory.BASIC.createRule(ImmutableList.of(qu0), ImmutableList.of(tru0));

    final QueryGraph input = new QueryGraph();
    input.addRule(q1, q2);
    input.addRule(q2, q3);

    final QueryGraph cmp = new QueryGraph();
    cmp.addRule(q1, q3);

    input.removeAndBypass(q2);

    // Do the test
    Assert.assertEquals(cmp, input);
  }
}
