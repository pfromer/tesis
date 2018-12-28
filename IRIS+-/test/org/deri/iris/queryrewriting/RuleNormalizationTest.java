/**
 * 
 */
package org.deri.iris.queryrewriting;

import java.util.HashSet;
import java.util.Set;

import junit.framework.TestCase;

import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.deri.iris.api.basics.ILiteral;
import org.deri.iris.api.basics.IPredicate;
import org.deri.iris.api.basics.IRule;
import org.deri.iris.api.terms.IVariable;
import org.deri.iris.factory.Factory;
import org.junit.Assert;
import org.junit.Test;

import com.google.common.collect.ImmutableSet;

/**
 * @author
 */
public class RuleNormalizationTest extends TestCase {

  private final Logger LOGGER = Logger.getLogger(RuleNormalizationTest.class);

  {
    // Load the logging configuration
    PropertyConfigurator.configure("config/logging.properties");
  }

  @Test public void testNormalizeNoExVarSingleHeadAtom() throws Exception {

    //
    // Rule:
    //
    // t(X,Y) -> p(X).
    //

    final IVariable x = Factory.TERM.createVariable("X");
    final IVariable y = Factory.TERM.createVariable("Y");

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);

    final ILiteral px = Factory.BASIC.createLiteral(true, p, Factory.BASIC.createTuple(x));
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, Factory.BASIC.createTuple(x, y));

    final IRule r = Factory.BASIC.createRule(ImmutableSet.of(px), ImmutableSet.of(txy));

    /*
     * Comparison Structure: p(X) -> aux0(X,Y). aux0(X,Y) -> t(X,Y). aux0(X,Y) -> s(Y).
     */

    final Set<IRule> cmp = new HashSet<IRule>();
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(px), ImmutableSet.of(txy)));

    LOGGER.debug("Expected: " + cmp.toString());

    //
    // test
    //
    final Set<IRule> normalized = RewritingUtils.normalizeTGD(r);
    LOGGER.debug("Actual: " + normalized.toString());

    Assert.assertEquals(cmp, normalized);
  }

  @Test public void testNormalizeNoExVarMultipleHeadAtoms() throws Exception {

    //
    // Rule:
    //
    // t(X,Y) -> p(X),s(Y).
    //

    final IVariable x = Factory.TERM.createVariable("X");
    final IVariable y = Factory.TERM.createVariable("Y");

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);

    final ILiteral px = Factory.BASIC.createLiteral(true, p, Factory.BASIC.createTuple(x));
    final ILiteral sy = Factory.BASIC.createLiteral(true, s, Factory.BASIC.createTuple(y));
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, Factory.BASIC.createTuple(x, y));

    final IRule r = Factory.BASIC.createRule(ImmutableSet.of(px, sy), ImmutableSet.of(txy));

    /*
     * Comparison Structure: p(X) -> aux0(X,Y). aux0(X,Y) -> t(X,Y). aux0(X,Y) -> s(Y).
     */

    final Set<IRule> cmp = new HashSet<IRule>();
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(px), ImmutableSet.of(txy)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(sy), ImmutableSet.of(txy)));

    LOGGER.debug("Expected: " + cmp.toString());

    //
    // test
    //
    final Set<IRule> normalized = RewritingUtils.normalizeTGD(r);
    LOGGER.debug("Actual: " + normalized.toString());

    Assert.assertEquals(cmp, normalized);
  }

  @Test public void testNormalizeNoExJoinsMultipleHeadAtoms() throws Exception {

    //
    // Rule:
    //
    // p(X) -> t(X,Y),s(X).
    //

    final IVariable x = Factory.TERM.createVariable("X");
    final IVariable y = Factory.TERM.createVariable("Y");

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);

    final ILiteral px = Factory.BASIC.createLiteral(true, p, Factory.BASIC.createTuple(x));
    final ILiteral sx = Factory.BASIC.createLiteral(true, s, Factory.BASIC.createTuple(x));
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, Factory.BASIC.createTuple(x, y));

    final IRule r = Factory.BASIC.createRule(ImmutableSet.of(txy, sx), ImmutableSet.of(px));

    /*
     * Comparison Structure: p(X) -> t(X,Y). p(X) -> s(X).
     */

    final Set<IRule> cmp = new HashSet<IRule>();
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(txy), ImmutableSet.of(px)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(sx), ImmutableSet.of(px)));

    LOGGER.debug("Expected: " + cmp.toString());

    //
    // test
    //
    final Set<IRule> normalized = RewritingUtils.normalizeTGD(r);
    LOGGER.debug("Actual: " + normalized.toString());

    Assert.assertEquals(cmp, normalized);
  }

  @Test public void testNormalizeSingleExVar() throws Exception {

    //
    // Rule:
    //
    // p(X) -> t(X,Y), s(Y).
    //

    final IVariable x = Factory.TERM.createVariable("X");
    final IVariable y = Factory.TERM.createVariable("Y");

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);

    final IPredicate auxPred = Factory.BASIC.createPredicate("aux0", 2);

    final ILiteral px = Factory.BASIC.createLiteral(true, p, Factory.BASIC.createTuple(x));
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, Factory.BASIC.createTuple(x, y));
    final ILiteral sy = Factory.BASIC.createLiteral(true, s, Factory.BASIC.createTuple(y));

    final ILiteral auxLit = Factory.BASIC.createLiteral(true, auxPred, Factory.BASIC.createTuple(y, x));

    final IRule r = Factory.BASIC.createRule(ImmutableSet.of(txy, sy), ImmutableSet.of(px));

    /*
     * Comparison Structure: p(X) -> aux0(X,Y). aux0(X,Y) -> t(X,Y). aux0(X,Y) -> s(Y).
     */

    final Set<IRule> cmp = new HashSet<IRule>();
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(auxLit), ImmutableSet.of(px)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(txy), ImmutableSet.of(auxLit)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(sy), ImmutableSet.of(auxLit)));

    LOGGER.debug("Expected: " + cmp.toString());

    //
    // test
    //
    final Set<IRule> normalized = RewritingUtils.normalizeTGD(r);
    LOGGER.debug("Actual: " + normalized.toString());

    Assert.assertEquals(cmp, normalized);
  }

  @Test public void testNormalizeMultipleExVarsSinglePartition() throws Exception {

    //
    // Rule:
    //
    // p(X) -> t(X,Y), t(Y,Z), s(Z).
    //

    final IVariable x = Factory.TERM.createVariable("X");
    final IVariable y = Factory.TERM.createVariable("Y");
    final IVariable z = Factory.TERM.createVariable("Z");

    final IPredicate p = Factory.BASIC.createPredicate("p", 1);
    final IPredicate t = Factory.BASIC.createPredicate("t", 2);
    final IPredicate s = Factory.BASIC.createPredicate("s", 1);

    final IPredicate auxPred = Factory.BASIC.createPredicate("aux0", 3);

    final ILiteral px = Factory.BASIC.createLiteral(true, p, Factory.BASIC.createTuple(x));
    final ILiteral txy = Factory.BASIC.createLiteral(true, t, Factory.BASIC.createTuple(x, y));
    final ILiteral tyz = Factory.BASIC.createLiteral(true, t, Factory.BASIC.createTuple(y, z));
    final ILiteral sz = Factory.BASIC.createLiteral(true, s, Factory.BASIC.createTuple(z));

    final ILiteral auxLit = Factory.BASIC.createLiteral(true, auxPred, Factory.BASIC.createTuple(z, y, x));

    final IRule r = Factory.BASIC.createRule(ImmutableSet.of(txy, tyz, sz), ImmutableSet.of(px));

    // @formatter:off 
    /*
     * Comparison Structure:
     * 
     * p(X) -> aux0(X,Y,Z). 
     * aux0(X,Y,Z) -> t(X,Y). 
     * aux0(X,Y,Z) -> t(Y,Z).
     * aux0(X,Y,Z) -> s(Z).
     * 
     */
    // @formatter:on
    final Set<IRule> cmp = new HashSet<IRule>();
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(auxLit), ImmutableSet.of(px)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(tyz), ImmutableSet.of(auxLit)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(txy), ImmutableSet.of(auxLit)));
    cmp.add(Factory.BASIC.createRule(ImmutableSet.of(sz), ImmutableSet.of(auxLit)));

    LOGGER.debug("Expected: " + cmp.toString());

    //
    // test
    //
    final Set<IRule> normalized = RewritingUtils.normalizeTGD(r);
    LOGGER.debug("Actual: " + normalized.toString());

    Assert.assertEquals(cmp, normalized);
  }
}
