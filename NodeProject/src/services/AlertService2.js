export function setErrorSyntaxAlert(component) {
    setAlert(component, {
        lines: ["Please correct the syntax errors in your program first."]
    })

};

export function setArityIssuesAlert(component) {
    setAlert(component, {
        heading: component.context.arityIssueAlertHeading,
        lines: component.programWithNoQueries.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent
    })

};

export function setConflictingKeysAlert(component) {
    setAlert(component, {
        heading: component.context.conflictingKeysHeading,
        lines: component.programWithNoQueries.getConflictingKeys.map(k => k.toString())
    })
};

export function setInconsistentAlert(component) {
    setAlert(component, {
        heading: "Not consistent.",
        lines: ["The lines marked in green are not fulfilled by your program.",
            "You may execute a query under IAR semantics."
        ]
    })
};

export function setConsistentAlert(component) {
    setAlert(component, {
        heading: "Your program is consistent.",
        lines: []
    })
};

export function setLinearFragmentAlert(component) {
    setAlert(component, {
        lines: ["Your program is in the Linear Fragment."]
    })
};

export function setGuardedFragmentAlert(component) {
    setAlert(component, {
        lines: ["Your program is in the Guarded Fragment."]
    })
};

export function setOutOfGuardedFragmentAlert(component) {
    setAlert(component, {
        heading: "Out of the Guarded Fragment. Optimizations on the query answering process are not guaranteed.",
        lines: ["The lines marked in blue are ungarded TGDs"],
    })
};

export function showRepairs(component) {
    setAlert(component, {
        heading: "Repairs:",
        lines: component.repairs,
    })
};

function setAlert(component, params) {
    component.setState({
        alert: {
            lines: params.lines,
            opened: true,
            onHandleClick: component.onHandleAlertClose,
            heading: params.heading
        }
    })
}