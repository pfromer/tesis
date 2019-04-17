import * as alertService from "./AlertService2";
import * as editorService from "./EditorService";
import * as factModule from "./parser/factBuilder";
import { intersectionRepairs } from "./IARService";

export var nonValidatedStatus = {
    submit: async function(component){
        onAction("submit", component)
    },
    checkConstraints: async function(component){
        onAction("checkConstraints", component)
    }
}

export var iarStatus = {
    submit: async function(component){
        iarSubmit("iarStatus", component)
    },
    checkConstraints: nonValidatedStatus.checkConstraints,
    showRepairs: async function(component){
        var iarResult = await intersectionRepairs(component.program);
        component.intersectionRepairs = iarResult.intersection;
        component.repairs = iarResult.repairs;
        component.statusObject = component.repairsSetStatus;
        debugger
        alertService.showRepairs(component);
    }
}

export var repairsSetStatus = {
    submit: async function(component){
        iarSubmit("repairsSetStatus", component)
    },
    checkConstraints: async function(component){
        nonValidatedStatus.checkConstraints(component);
        component.statusObject = component.repairsSetStatus;
    },
    showRepairs: async function(component){
        debugger
        alertService.showRepairs(component);
    }
}

async function onAction(actionName, component){
    var statusObject = await actionSettingsDictionary[actionName].program(component).getStatus();
    syncPrograms(component);
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
        case("INCONSISTENT"):
            alertService.setInconsistentAlert(component);
            editorService.markInconsistencies(component);
            component.statusObject = component.iarStatus;
            break;
        case("OK"):
            actionSettingsDictionary[actionName].okFunction(component);
            break;
    }
}

async function iarSubmit(statusName, component){
    var statusObject = await component.program.getStatus();
    syncPrograms(component);
    switch(statusObject.status){
        case("SYNTAX ERROR"):
            alertService.setErrorSyntaxAlert(component);
            break;
        case("INCONSISTENT"):
            var factStrings = await getIntersectionDictionary[statusName](component);
            component.program.facts = factStrings.map(f => factModule.builder.build(f))
            debugger
            //component.program.facts.filter(f => factStrings.some(f2 => f2.toString() == f));
            var results = await component.program.execute();
            component.setState({ results: results});
            component.statusObject = component.repairsSetStatus;
            break;
    }
}

var getIntersectionDictionary = {
    "iarStatus" : async function(component){
        var iarResult = await intersectionRepairs(component.program);
        component.intersectionRepairs = iarResult.intersection;
        component.repairs = iarResult.repairs;
        return iarResult.intersection;
    },
    "repairsSetStatus" : async function(component){
        return component.intersectionRepairs;
    }
}

var actionSettingsDictionary = {
    "checkConstraints":{
        okFunction: function(component){
            alertService.setConsistentAlert(component);
        },
        program: function(component){
            return component.programWithNoQueries;
        }

    },
    "submit":{
        okFunction: async function(component){
            var results = await component.program.execute();
            component.setState({ results: results});
        },
        program: function(component){
            return component.program;
        }
    }
}

function syncPrograms(component){
    if(component.program && component.programWithNoQueries){
        component.program.getCachedThingsFrom(component.programWithNoQueries);
        component.programWithNoQueries.getCachedThingsFrom(component.program);
    }
}