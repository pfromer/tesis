

export function setErrorSyntaxAlert(component){
    setAlert(component,
        {                
            lines: ["Please correct the syntax errors in your program first."]
        })

};
export function setArityIssuesAlert(component){
    setAlert(component,{
        heading: "Before executing your query plase make sure there are no predicates with ambigous arity.",
        lines: component.program.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent
    })

};
export function setConflictingKeysAlert(component){
    setAlert(component,{
        heading: "Before executing your query plase make sure all of the keys are non conflicting with the TGDs.",
        lines: component.program.getConflictingKeys.map(k => k.toString())
    })
};
export function setInconsistentAlert(component){
    setAlert(component,{
        heading: "Not consistent.",
        lines: [["The lines marked in green are not fulfilled by your program.", 
        "You may execute a query under IAR semantics."]]
    })
};


function setAlert(component, params){       
    component.setState(
        {alert: {
            lines: params.lines,
            opened: true,
            onHandleClick : component.onHandleAlertClose,
            heading: params.heading
            }
        })
}