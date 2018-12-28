/* This file was generated by SableCC (http://www.sablecc.org/). */

package org.deri.iris.parser.node;

import org.deri.iris.parser.analysis.Analysis;

@SuppressWarnings("nls")
public final class AGmonthdayTerm extends PTerm
{
    private TTPreGmonthday _tPreGmonthday_;
    private TTLpar _tLpar_;
    private PIntlist _intlist_;
    private TTRpar _tRpar_;

    public AGmonthdayTerm()
    {
        // Constructor
    }

    public AGmonthdayTerm(
        @SuppressWarnings("hiding") TTPreGmonthday _tPreGmonthday_,
        @SuppressWarnings("hiding") TTLpar _tLpar_,
        @SuppressWarnings("hiding") PIntlist _intlist_,
        @SuppressWarnings("hiding") TTRpar _tRpar_)
    {
        // Constructor
        setTPreGmonthday(_tPreGmonthday_);

        setTLpar(_tLpar_);

        setIntlist(_intlist_);

        setTRpar(_tRpar_);

    }

    @Override
    public Object clone()
    {
        return new AGmonthdayTerm(
            cloneNode(this._tPreGmonthday_),
            cloneNode(this._tLpar_),
            cloneNode(this._intlist_),
            cloneNode(this._tRpar_));
    }

    public void apply(Switch sw)
    {
        ((Analysis) sw).caseAGmonthdayTerm(this);
    }

    public TTPreGmonthday getTPreGmonthday()
    {
        return this._tPreGmonthday_;
    }

    public void setTPreGmonthday(TTPreGmonthday node)
    {
        if(this._tPreGmonthday_ != null)
        {
            this._tPreGmonthday_.parent(null);
        }

        if(node != null)
        {
            if(node.parent() != null)
            {
                node.parent().removeChild(node);
            }

            node.parent(this);
        }

        this._tPreGmonthday_ = node;
    }

    public TTLpar getTLpar()
    {
        return this._tLpar_;
    }

    public void setTLpar(TTLpar node)
    {
        if(this._tLpar_ != null)
        {
            this._tLpar_.parent(null);
        }

        if(node != null)
        {
            if(node.parent() != null)
            {
                node.parent().removeChild(node);
            }

            node.parent(this);
        }

        this._tLpar_ = node;
    }

    public PIntlist getIntlist()
    {
        return this._intlist_;
    }

    public void setIntlist(PIntlist node)
    {
        if(this._intlist_ != null)
        {
            this._intlist_.parent(null);
        }

        if(node != null)
        {
            if(node.parent() != null)
            {
                node.parent().removeChild(node);
            }

            node.parent(this);
        }

        this._intlist_ = node;
    }

    public TTRpar getTRpar()
    {
        return this._tRpar_;
    }

    public void setTRpar(TTRpar node)
    {
        if(this._tRpar_ != null)
        {
            this._tRpar_.parent(null);
        }

        if(node != null)
        {
            if(node.parent() != null)
            {
                node.parent().removeChild(node);
            }

            node.parent(this);
        }

        this._tRpar_ = node;
    }

    @Override
    public String toString()
    {
        return ""
            + toString(this._tPreGmonthday_)
            + toString(this._tLpar_)
            + toString(this._intlist_)
            + toString(this._tRpar_);
    }

    @Override
    void removeChild(@SuppressWarnings("unused") Node child)
    {
        // Remove child
        if(this._tPreGmonthday_ == child)
        {
            this._tPreGmonthday_ = null;
            return;
        }

        if(this._tLpar_ == child)
        {
            this._tLpar_ = null;
            return;
        }

        if(this._intlist_ == child)
        {
            this._intlist_ = null;
            return;
        }

        if(this._tRpar_ == child)
        {
            this._tRpar_ = null;
            return;
        }

        throw new RuntimeException("Not a child.");
    }

    @Override
    void replaceChild(@SuppressWarnings("unused") Node oldChild, @SuppressWarnings("unused") Node newChild)
    {
        // Replace child
        if(this._tPreGmonthday_ == oldChild)
        {
            setTPreGmonthday((TTPreGmonthday) newChild);
            return;
        }

        if(this._tLpar_ == oldChild)
        {
            setTLpar((TTLpar) newChild);
            return;
        }

        if(this._intlist_ == oldChild)
        {
            setIntlist((PIntlist) newChild);
            return;
        }

        if(this._tRpar_ == oldChild)
        {
            setTRpar((TTRpar) newChild);
            return;
        }

        throw new RuntimeException("Not a child.");
    }
}
