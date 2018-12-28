/**
 *
 */
package org.deri.iris.queryrewriting;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.log4j.Logger;
import org.deri.iris.api.basics.IAtom;
import org.deri.iris.api.basics.ILiteral;
import org.deri.iris.api.basics.IPosition;
import org.deri.iris.api.basics.IPredicate;
import org.deri.iris.api.basics.IRule;
import org.deri.iris.api.terms.ITerm;
import org.deri.iris.api.terms.IVariable;
import org.deri.iris.queryrewriting.configuration.NCCheck;
import org.deri.iris.queryrewriting.configuration.SubCheckStrategy;
import org.deri.iris.utils.TermMatchingAndSubstitution;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * @author jd
 */
public class LinearRewriter extends FORewriter implements QueryRewriter {

  private static final Logger LOGGER = Logger.getLogger(LinearRewriter.class);

  @Override
  public Set<IRule> call() throws Exception {
    return rewrite();
  }

  LinearRewriter(final IRule query, final List<IRule> rules, final Set<IRule> constraints,
      final Map<Pair<IPosition, IPosition>, Set<Pair<List<IPosition>, List<IRule>>>> posDeps,
      final SubCheckStrategy subchkStrategy, final NCCheck ncCheckStrategy) {
    super(query, rules, constraints, posDeps, subchkStrategy, ncCheckStrategy);
  }

  @Override
  public Set<IRule> rewrite() {

    // partial rewritings (will be returned)
    final QueryGraph partialRewritings = new QueryGraph();

    // rewritten queries (mark all those queries that have been used in a
    // rewriting step)
    final Set<IRule> exploredQueries = new HashSet<IRule>();

    final Set<IRule> newQueries = Sets.newHashSet(NormalizationUtils.canonicalRenaming(
        RewritingUtils.reduceQuery(query, deps), "U"));

    // The (reduced) input query is always part of the rewriting
    partialRewritings.addRule(newQueries.iterator().next());

    // The temporary rewritings
    List<IRule> tempRew;
    do {

      tempRew = ImmutableList.copyOf(newQueries);
      newQueries.clear();

      // For each new query q
      for (final IRule qn : tempRew) {

        // avoid double exploration
        if (!exploredQueries.contains(qn)) {

          // For each TGD
          for (IRule r : mRules) {

            r = NormalizationUtils.canonicalRenaming(r, "V");
            final IPredicate headPred = r.getHead().iterator().next().getAtom().getPredicate();

            /*
             * Check if the new query factorizes w.r.t the TGD r
             */
            final long factorTime = System.currentTimeMillis();
            final Set<IRule> factorizedQueries = new LinkedHashSet<IRule>();
            factorizedQueries.add(qn);
            if ((r.getExistentialVariables().size() > 0) && (qn.getBody().size() > 1)
                && qn.getBodyPredicates().contains(headPred)) {

              factorizedQueries.addAll(factorisable(qn, r, exploredQueries));

            }
            rep.addToValue(RewMetric.FACTOR_TIME, System.currentTimeMillis() - factorTime);

            /*
             * Apply the TGD until it is possible
             */
            for (final IRule qFact : factorizedQueries) {

              for (final ILiteral l : qFact.getBody()) {
                // get the atom a
                final IAtom a = l.getAtom();

                final Map<IVariable, ITerm> gamma = new HashMap<IVariable, ITerm>();
                // Check if the rule is applicable to the atom a
                if (RewritingUtils.isApplicable(r, qFact, a, gamma)) {

                  // rewrite the atom a with the body of the rule sigma
                  final IRule qrew = NormalizationUtils.canonicalRenaming(
                      RewritingUtils.rewrite(qFact, a, r.getBody(), gamma), "U");

                  final IRule qRed = NormalizationUtils.canonicalRenaming(RewritingUtils.reduceQuery(qrew, deps), "U");
                  if (!exploredQueries.contains(qRed)) {

                    partialRewritings.addRule(qn, qRed);
                    // Checking subsumption
                    if (subchkStrategy.equals(SubCheckStrategy.INTRAREW)) {
                      // LOGGER.trace("Applying intra-rewriting subsumption check against "
                      // + partialRewritings.size()
                      // + " queries.");
                      final long subCheckTime = System.currentTimeMillis();
                      if (!RewritingUtils.isSubsumed(partialRewritings, qRed, exploredQueries, newQueries)) {
                        newQueries.add(qRed);
                      }
                      rep.addToValue(RewMetric.SUBCHECK_TIME, System.currentTimeMillis() - subCheckTime);
                    } else {
                      newQueries.add(qRed);
                    }
                  }
                  // Checking that qn survived the INTRAREW check.
                  if (!partialRewritings.contains(qn)) {
                    break;
                  }
                }
              }
            }
            if (!partialRewritings.contains(qn)) {
              break;
            }
          }
        }
        // Check that qn survived the subsumption check (required for INTRAREW)
        if (partialRewritings.contains(qn)) {
          exploredQueries.add(qn);
        }
      }
      LOGGER.trace("|" + partialRewritings.getRules().size() + " [" + newQueries.size() + "]");
      rep.addToValue(RewMetric.GENERATED_QUERIES, (long) newQueries.size());

    } while (!newQueries.isEmpty());

    assert partialRewritings.getRules().size() > 0;

    // Cleaning auxiliary predicates
    LOGGER.debug("Cleaning auxiliary predicates from " + partialRewritings.getRules().size() + " queries.");
    final long auxCleaningTime = System.currentTimeMillis();
    CleaningUtils.cleanRewriting(partialRewritings, new String[] { "aux_" });
    rep.addToValue(RewMetric.AUX_CLEANING_TIME, System.currentTimeMillis() - auxCleaningTime);
    LOGGER.debug("done.");

    assert partialRewritings.getRules().size() > 0;

    if (subchkStrategy.equals(SubCheckStrategy.INTRADEC)) {
      LOGGER.debug("Applying intra-decomposition subsumption check on " + partialRewritings.getRules().size()
          + " queries.");
      final long subCheckTime = System.currentTimeMillis();
      RewritingUtils.purgeSubsumed(partialRewritings);
      rep.addToValue(RewMetric.SUBCHECK_TIME, System.currentTimeMillis() - subCheckTime);
      LOGGER.debug("done.");
    }

    assert partialRewritings.getRules().size() > 0;

    if (ncchkStrategy.equals(NCCheck.INTRADEC)) {
      final long cnsViolationTime = System.currentTimeMillis();
      RewritingUtils.purgeConstraintsViolations(partialRewritings, cns);
      rep.addToValue(RewMetric.CNS_VIOLATION_TIME, System.currentTimeMillis() - cnsViolationTime);
    }

    rep.addToValue(RewMetric.EXPLORED_QUERIES, (long) exploredQueries.size());

    return ImmutableSet.copyOf(partialRewritings.getRules());
  }

  /**
   * Checks if the n atoms are sharing the same variables in all the existential
   * positions
   *
   * @param q
   *          a conjunctive query
   * @param r
   *          a TGD
   * @param a1
   *          the first atom
   * @param a2
   *          the second atom
   * @return true if they share the same variables in all the existential
   *         positions
   */
  @Override
  protected Set<IRule> factorisable(final IRule q, final IRule r, final Set<IRule> explored) {

    rep.incrementValue(RewMetric.FACTOR_COUNT);

    // worst case, return the original query
    final Set<IRule> factorizedQueries = new LinkedHashSet<IRule>();

    if (q.getBody().size() > 1) {
      // Get the atoms in body(q) that unify with head(r).

      final IAtom rheadAtom = r.getHead().iterator().next().getAtom();
      final Set<IPosition> headExPos = r.getExistentialPositions();

      final Set<IAtom> potentiallyUnifiableAtoms = new LinkedHashSet<IAtom>();
      for (final ILiteral l : q.getBody()) {
        final IAtom qbodyAtom = l.getAtom();

        if (qbodyAtom.getPredicate().equals(rheadAtom.getPredicate())) {
          potentiallyUnifiableAtoms.add(qbodyAtom);
        }
      }

      if (potentiallyUnifiableAtoms.size() < 2)
        // No potentially unifiable atoms.
        return factorizedQueries;
      else {

        // compute the powerset of atoms that are potentially unifiable in the
        // body in the query.
        final Set<Set<IAtom>> atomsPowSet = Sets.powerSet(potentiallyUnifiableAtoms);
        // sort the set by size
        final List<Set<IAtom>> sortedPowSet = Lists.newArrayList(atomsPowSet);
        Collections.sort(sortedPowSet, new SetSizeComparator());

        final Set<Set<IAtom>> usedSets = new LinkedHashSet<Set<IAtom>>();
        for (final Set<IAtom> candidateSet : sortedPowSet) {
          // check that we have at least two atoms in the candidate set.
          if ((candidateSet.size() > 1) && !subsumed(candidateSet, usedSets)) {
            final Map<IVariable, ITerm> unifier = new HashMap<IVariable, ITerm>();
            if (TermMatchingAndSubstitution.unify(candidateSet, unifier)) {
              // the atoms have a unifier, check that there is a well-behaved
              // existential variable

              // get variables in existential positions
              final Set<IVariable> variables = getVariablesInPositions(candidateSet, headExPos);
              for (final IVariable var : variables) {
                // check that the variable does not occur in non-existential
                // positions
                if (headExPos.containsAll(q.getPositions(var)) && containedInAllAtoms(var, candidateSet)) {
                  usedSets.add(candidateSet);

                  final IRule factQuery = NormalizationUtils.canonicalRenaming(
                      RewritingUtils.reduceQuery(RewritingUtils.factoriseQuery(q, unifier), deps), "U");
                  factorizedQueries.add(factQuery);

                }
              }

            }
          }
        }
        return factorizedQueries;
      }
    } else
      // No potentially unifiable atoms, return the original query.
      return factorizedQueries;
  }

  private boolean subsumed(final Set<IAtom> sub, final Set<Set<IAtom>> usedSet) {
    for (final Set<IAtom> used : usedSet) {
      if (used.size() < sub.size())
        return false;
      if (used.containsAll(sub))
        return true;
    }
    return false;
  }
}
