import * as alertService from "./AlertService2";
import * as editorService from "./EditorService";
import * as irisCaller from "./IrisCaller"

export var nonValidatedStatus = {
    submit: async function(component){
        onAction("submit", component)
    },
    checkConstraints: async function(component){
        onAction("checkConstraints", component)
    }
}

var inconsistentStatus = {
    submit: async function(component){
        inconsistentSubmit(component)
    },
    showRepairs: async function(component){
        component.setState({ repairsLoading: true});
        var jsonParams = component.programWithNoQueries.toJson();
        var results = await irisCaller.getIarRepairs(jsonParams);
        component.setState({ repairsLoading: false}); 
        component.repairs = results;
        alertService.showRepairs(component);
    }
}

export var iarStatus = {
    submit: async function(component){
        inconsistentSubmit(component, "IAR")
    },
    checkConstraints: nonValidatedStatus.checkConstraints,
    showRepairs: inconsistentStatus.showRepairs
}

export var arStatus = {
    submit: async function(component){
        inconsistentSubmit(component, "AR")
    },
    checkConstraints: nonValidatedStatus.checkConstraints,
    showRepairs: inconsistentStatus.showRepairs
}



async function onAction(actionName, component){
    var statusObject = await actionSettingsDictionary[actionName].program(component).getStatus();
    switch(statusObject.status){
        case("SYNTAX ERROR"):
            alertService.setErrorSyntaxAlert(component);
            break;
        case("ARITIES ISSUES"):
        alertService.setArityIssuesAlert(component);
            editorService.markArityIssues(component);
            break;
        case("CONFLICTING KEYS"):
        alertService.setConflictingKeysAlert(component);
            editorService.markConflictingKeys(component);
            break;
        case("OK"):
        actionSettingsDictionary[actionName].okFunction(component);
            break;
    }
}

async function inconsistentSubmit(component, semantic){

    var fullProgram = component.getFullProgram();
    var statusObject = await fullProgram.getStatus();
    switch(statusObject.status){
        case("SYNTAX ERROR"):
            alertService.setErrorSyntaxAlert(component);
            break;
        default:
            var results = await fullProgram.execute(semantic);
            component.setState({ results: results, resultsLoading: false});
    }
}

var actionSettingsDictionary = {
    "checkConstraints":{
        okFunction: async function(component){

            component.setState({ resultsLoading: true}); 
            var results = await component.programWithNoQueries.execute("standard");
            if(results.unsatisfied) {
                alertService.setInconsistentAlert(component);
                editorService.markInconsistencies(component, results.unsatisfied);
                component.statusObject = iarStatus;
                component.setState({showIAR : true, resultsLoading: false});
            } else {
                alertService.setConsistentAlert(component);
                component.setState({ resultsLoading: false}); 
            }
        },
        program: function(component){
            return component.programWithNoQueries;
        }

    },
    "submit":{
        okFunction: async function(component){
            component.setState({ resultsLoading: true}); 
            var results = await component.getFullProgram().execute("standard");
            if(results.unsatisfied) {
                alertService.setInconsistentAlert(component);
                editorService.markInconsistencies(component, results.unsatisfied);
                component.statusObject = iarStatus;
                component.setState({showIAR : true, resultsLoading: false});
            }
            else {
                component.setState({ results: results, resultsLoading: false});
            }
        },
        program: function(component){
            return component.getFullProgram();
        }
    }
}