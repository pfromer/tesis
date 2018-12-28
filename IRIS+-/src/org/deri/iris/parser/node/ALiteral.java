/* This file was generated by SableCC (http://www.sablecc.org/). */

package org.deri.iris.parser.node;

import org.deri.iris.parser.analysis.Analysis;

@SuppressWarnings("nls")
public final class ALiteral extends PLiteral
{
    private PPredicate _predicate_;

    public ALiteral()
    {
        // Constructor
    }

    public ALiteral(
        @SuppressWarnings("hiding") PPredicate _predicate_)
    {
        // Constructor
        setPredicate(_predicate_);

    }

    @Override
    public Object clone()
    {
        return new ALiteral(
            cloneNode(this._predicate_));
    }

    public void apply(Switch sw)
    {
        ((Analysis) sw).caseALiteral(this);
    }

    public PPredicate getPredicate()
    {
        return this._predicate_;
    }

    public void setPredicate(PPredicate node)
    {
        if(this._predicate_ != null)
        {
            this._predicate_.parent(null);
        }

        if(node != null)
        {
            if(node.parent() != null)
            {
                node.parent().removeChild(node);
            }

            node.parent(this);
        }

        this._predicate_ = node;
    }

    @Override
    public String toString()
    {
        return ""
            + toString(this._predicate_);
    }

    @Override
    void removeChild(@SuppressWarnings("unused") Node child)
    {
        // Remove child
        if(this._predicate_ == child)
        {
            this._predicate_ = null;
            return;
        }

        throw new RuntimeException("Not a child.");
    }

    @Override
    void replaceChild(@SuppressWarnings("unused") Node oldChild, @SuppressWarnings("unused") Node newChild)
    {
        // Replace child
        if(this._predicate_ == oldChild)
        {
            setPredicate((PPredicate) newChild);
            return;
        }

        throw new RuntimeException("Not a child.");
    }
}
