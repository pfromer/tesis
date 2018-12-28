/* This file was generated by SableCC (http://www.sablecc.org/). */

package org.deri.iris.parser.node;

import org.deri.iris.parser.analysis.Analysis;

@SuppressWarnings("nls")
public final class AFactExpr extends PExpr
{
    private PFact _fact_;

    public AFactExpr()
    {
        // Constructor
    }

    public AFactExpr(
        @SuppressWarnings("hiding") PFact _fact_)
    {
        // Constructor
        setFact(_fact_);

    }

    @Override
    public Object clone()
    {
        return new AFactExpr(
            cloneNode(this._fact_));
    }

    public void apply(Switch sw)
    {
        ((Analysis) sw).caseAFactExpr(this);
    }

    public PFact getFact()
    {
        return this._fact_;
    }

    public void setFact(PFact node)
    {
        if(this._fact_ != null)
        {
            this._fact_.parent(null);
        }

        if(node != null)
        {
            if(node.parent() != null)
            {
                node.parent().removeChild(node);
            }

            node.parent(this);
        }

        this._fact_ = node;
    }

    @Override
    public String toString()
    {
        return ""
            + toString(this._fact_);
    }

    @Override
    void removeChild(@SuppressWarnings("unused") Node child)
    {
        // Remove child
        if(this._fact_ == child)
        {
            this._fact_ = null;
            return;
        }

        throw new RuntimeException("Not a child.");
    }

    @Override
    void replaceChild(@SuppressWarnings("unused") Node oldChild, @SuppressWarnings("unused") Node newChild)
    {
        // Replace child
        if(this._fact_ == oldChild)
        {
            setFact((PFact) newChild);
            return;
        }

        throw new RuntimeException("Not a child.");
    }
}
