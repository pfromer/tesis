import * as alertService from "./AlertService2";
import * as editorService from "./EditorService";
import { intersectionRepairs } from "./IARService";

export function nonValidatedStatus(){
    return{
        submit: async function(component){
            debugger
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
        }
    }
}

export function validatedStatus(){
    return{
        submit: async function(component){
            debugger
            var statusObject = await component.program.getStatus();
            //in this case error syntax will only arive from query editor
            if(statusObject.status == "SYNTAX ERROR"){
                alertService.setErrorSyntaxAlert(component);
            }
            else{
                var results = await component.program.execute();
                component.setState({ results: results});
            }
        }
    }
}

export function iarStatus(){
    return{
        submit: async function(component){
            debugger
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
        }
    }
}

export function repairsSetStatus(){
    return{
        submit: async function(component){
            debugger
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
        }
    }
}

