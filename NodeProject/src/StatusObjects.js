import * as alertService from "./AlertService2";
import * as editorService from "./EditorService";
import { intersectionRepairs } from "./IARService";

export var nonValidatedStatus = {
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
                component.statusObject = component.iarStatus;
            }
            else{
                var results = await component.program.execute();
                component.setState({ results: results});
                component.statusObject = component.validatedStatus;
            }
        },
        checkConstraints: async function(component){
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
                component.statusObject = component.iarStatus;
            }
            else{
                alertService.setConsistentAlert(component);
            }
        },
        checkDatalogFragment: async function(component){
            var statusObject = await component.program.getStatus();
            if(statusObject.status == "SYNTAX ERROR"){
                alertService.setErrorSyntaxAlert(component);
            }
            else if (statusObject.status == "ARITIES ISSUES"){
                alertService.setArityIssuesAlert(component);
                editorService.markArityIssues(component);
            }
            else if(component.program.isLinear()){
                alertService.setLinearFragmentAlert(component);
            }
            else if(component.program.isGuarded()){
                alertService.setGuardedFragmentAlert(component);
            }
            else if(!component.program.isGuarded()){
                alertService.setOutOfGuardedFragmentAlert(component);
            }  
        }
    }

    export var validatedStatus = {
        submit: async function(component){
            var statusObject = await component.program.getStatus();
            //in this case error syntax will only arive from query editor
            if(statusObject.status == "SYNTAX ERROR"){
                alertService.setErrorSyntaxAlert(component);
            }
            else{
                var results = await component.program.execute();
                component.setState({ results: results});
            }
        },
        checkConstraints: nonValidatedStatus.checkConstraints,
        checkDatalogFragment: nonValidatedStatus.checkDatalogFragment


}
export var iarStatus = {
        submit: async function(component){
            var statusObject = await component.program.getStatus();
            //in this case error syntax will only arive from query editor
            if(statusObject.status == "SYNTAX ERROR"){
                alertService.setErrorSyntaxAlert(component);
            }
            else{
                var iarResult = await intersectionRepairs(component.program);
                component.intersectionRepairs = iarResult.intersection;
                component.repairs = iarResult.repairs;
                component.program.facts = iarResult.intersection;
                var results = await component.program.execute();
                component.setState({ results: results});
                component.statusObject = component.repairsSetStatus;
            }
        },
        checkConstraints: nonValidatedStatus.checkConstraints,
        checkDatalogFragment: nonValidatedStatus.checkDatalogFragment
    }
    export var repairsSetStatus = {
        submit: async function(component){
            var statusObject = await component.program.getStatus();
            //in this case error syntax will only arive from query editor
            if(statusObject.status == "SYNTAX ERROR"){
                alertService.setErrorSyntaxAlert(component);
            }
            else{
                component.program.facts = component.intersectionRepairs;
                var results = await component.program.execute();
                component.setState({ results: results});
                component.statusObject = component.repairsSetStatus;
            }
        },
        checkConstraints: nonValidatedStatus.checkConstraints,
        checkDatalogFragment: nonValidatedStatus.checkDatalogFragment
    }


