export function NothingValidated(){

    return{
        submit: async function(component){
            var statusObject = await component.program.getStatus();
            if(statusObject.status == "SYNTAX ERROR"){
                alertService.setErrorSyntaxAlert(component);
            }
            else if (statusObject.status == "ARITIES ISSUES"){
                alertService.setArityIssuesAlert(component);
                editorService.markArityIssues(component);
            }
            else if (statusObject.status == "CONFLICTING KEYS"){
                alertService.setConflictingKeysAlert(component);
                editorService.markConflictingKeys(component);
            }
            else if (statusObject.status == "INCONSISTENT"){
                alertService.setInconsistentAlert(component);
                editorService.markInconsistencies(component);
            }
        }
    }
}

