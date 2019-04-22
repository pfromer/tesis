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
        iarSubmit(component)
    },
    checkConstraints: nonValidatedStatus.checkConstraints,
    showRepairs: async function(component){
        var iarResult = await intersectionRepairs(component.programWithNoQueries);
        component.intersectionRepairs = iarResult.intersection;
        component.repairs = iarResult.repairs;
        component.statusObject = component.repairsSetStatus;
        alertService.showRepairs(component);
    },
    getIntersectionRepairs: async function(component){
        var iarResult = await intersectionRepairs(component.programWithNoQueries);
        component.intersectionRepairs = iarResult.intersection;
        component.repairs = iarResult.repairs;
        component.statusObject = component.repairsSetStatus;
        return iarResult.intersection;
    }
}

export var repairsSetStatus = {
    submit: async function(component){
        iarSubmit(component)
    },
    checkConstraints: async function(component){
        nonValidatedStatus.checkConstraints(component);
        component.statusObject = component.repairsSetStatus;
    },
    showRepairs: async function(component){
        alertService.showRepairs(component);
    },
    getIntersectionRepairs: async function(component){
        return component.intersectionRepairs;
    }
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
        case("INCONSISTENT"):
            alertService.setInconsistentAlert(component);
            editorService.markInconsistencies(component);
            component.statusObject = component.iarStatus;
            component.setState({showIAR : true});
            break;
        case("OK"):
            actionSettingsDictionary[actionName].okFunction(component);
            break;
    }
}

async function iarSubmit(component){
    var fullProgram = component.getFullProgram();
    var statusObject = await fullProgram.getStatus();
    switch(statusObject.status){
        case("SYNTAX ERROR"):
            alertService.setErrorSyntaxAlert(component);
            break;
        case("INCONSISTENT"):
            console.log("iar submit before facts")
            var factStrings = await component.statusObject.getIntersectionRepairs(component);
            fullProgram.facts = factStrings.map(f => factModule.builder.build(f));
            var results = await fullProgram.execute();
            component.setState({ results: results});
            break;
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
            var results = await component.getFullProgram().execute();
            component.setState({ results: results});
        },
        program: function(component){
            return component.getFullProgram();
        }
    }
}