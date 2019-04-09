import * as regExModule from "./parser/regExService";
import * as tgdModule from "./parser/tgdBuilder";

function getSettings(){

    var errorSyntaxSettings = { 
      condition: function(component){return component.state.program.errors.length > 0 },
      heading: '', 
      lines: function(component) {return ["Please correct the syntax errors in your program first."]},
      proceedToExecute: false
    }

    var arityErrorSettings =       { 
      condition: function(component){return component.state.program.arityDictionary.aritiesAreConsistent().result == false },
      heading: 'Before we validate consistency please make sure there are no predicates with ambigous arity.', 
      lines: function(component) {return component.state.program.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent},
      proceedToExecute: false,
      callback: function(component){return markArityIssues(component) },
    };

    var arityErrorSettingsForQueryExecutionValidation = copySetting(arityErrorSettings); 
    arityErrorSettingsForQueryExecutionValidation.heading = "Before executing your query plase make sure there are no predicates with ambigous arity.";


    var conflictingKeyErrorSettings =       { 
      condition: function(component){return component.state.program.getConflictingKeys.length > 0},
      heading: 'Before we validate consistency plase make sure all of the keys are non conflicting with the TGDs.', 
      lines: function(component) {return component.state.program.getConflictingKeys.map(k => k.toString())},
      proceedToExecute: false,
      callback: function(component){return markConflictingKeys(component) },
    };

    var conflictingKeyErrorSettingsForQueryExecutionValidation = copySetting(conflictingKeyErrorSettings); 
    conflictingKeyErrorSettingsForQueryExecutionValidation.heading = "Before executing your query plase make sure all of the keys are non conflicting with the TGDs.";


    var nonConsistentProgramSettings = { 
      condition: function(component){return hasInconsistencies(component)},
      heading: "Not consistent.", 
      lines: function(component) {return ["The lines marked in green are not fulfilled by your program.", 
              "You may execute a query under IAR semantics."]},
      proceedToExecute: false,
      callback: function(component){return markInconsistencies(component)}
    };

    var consistentProgramSettings = { 
      condition: function(component){return !hasInconsistencies(component)},
      heading: "Your program is consistent.", 
      lines: function(component) {return []},
      proceedToExecute: true
    };



    return{
    datalogFragmentSettings:[
      errorSyntaxSettings,
      arityErrorSettings,
      { 
        condition: function(component){return component.state.program.isLinear()},
        heading: '', 
        lines: function(component) {return ["Your program is in the Linear Fragment."]},
        proceedToExecute: true
      },
      { 
        condition: function(component){return component.state.program.isGuarded()}, 
        heading: '', 
        lines: function(component) {return ["Your program is in the Guarded Fragment."]},
        proceedToExecute: true
      },
      { 
        condition: function(component){return !component.state.program.isGuarded()},
        heading: "Out of the Guarded Fragment. Optimizations on the query answering process are not guaranteed.", 
        lines: function(component) {return ["The lines marked in blue are ungarded TGDs"]},
        callback: function(component){return markUngardedTgds(component) },
        proceedToExecute: true
      }
    ],
    checkConstraintsSettings:[
      errorSyntaxSettings,
      arityErrorSettings,
      conflictingKeyErrorSettings,     
      nonConsistentProgramSettings,
      consistentProgramSettings
    ],
    checkBeforeExecutionSettings:[
      errorSyntaxSettings,
      arityErrorSettingsForQueryExecutionValidation,
      conflictingKeyErrorSettingsForQueryExecutionValidation,     
      nonConsistentProgramSettings
    ]

  }
}

function copySetting(setting){
  return Object.assign({}, setting);
  //return result;
}

function hasInconsistencies(component){
    return component.state.program.getProcessedInconsistencies.length > 0;
}

function setAlert(component, settingsType){
    var settings = getSettings();
    var setting = settings[settingsType].find(s => s.condition(component));

    if(setting){
        component.setState({alert: {
        lines: setting.lines(component),
        opened: true,
        onHandleClick : component.onHandleAlertClose,
        heading: setting.heading
      }})

      if(setting.callback) setting.callback(component);
    }
}

function markConflictingKeys(component){
  component.state.program.getConflictingKeys.forEach(key => {
    component.state.programEditorInstance.addLineClass(key.lineNumber, "text", "ungarded-tgd");
  })
}

function markUngardedTgds(component) {
  var lineNumber = 0;
  var lineInfo = component.state.programEditorInstance.lineInfo(lineNumber);
  while (lineInfo) {
    updateUngardedClass(lineInfo.text, lineNumber, component);
    lineNumber++;
    lineInfo = component.state.programEditorInstance.lineInfo(lineNumber);
  }
}

function markInconsistencies(component){
  component.state.program.processedInconsistencies.forEach(inconsitency => {
    component.state.programEditorInstance.addLineClass(inconsitency.nc.lineNumber, "text", "inconsistent-constraint");
  });
}

function updateUngardedClass(text, lineNumber, component) {
  if (regExModule.service.tgdRegEx.test(text)) {
    var tgd = tgdModule.builder.build(text);
    if (!tgd.isGuarded) {
      component.state.programEditorInstance.addLineClass(lineNumber, "text", "ungarded-tgd");
    } else {
      component.state.programEditorInstance.removeLineClass(lineNumber, "text", "ungarded-tgd");
    }
  }
}

function markArityIssues(component){
  var notConsistentArityPredicates = component.state.program.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent;

  
  var markers = [];
  notConsistentArityPredicates.forEach(predicateName => {
    var lessCommonAritiesByLine = component.state.program.arityDictionary.getLessCommonArityLinesForPredicate(predicateName);
             
    lessCommonAritiesByLine.forEach(arityLine => {
      var lineText = component.state.programEditorInstance.getLine(arityLine.lineNumber);
      var regEx = regExModule.service.predicateRegExByNameAndArity(predicateName, arityLine.arity);
      var indexes = regExModule.service.arrayOfIndexes(regEx, lineText); 
      indexes.forEach(i => {
        markers.push(component.state.programEditorInstance.markText(
          {line :parseInt(arityLine.lineNumber), ch: i.start}, 
          {line :parseInt(arityLine.lineNumber), ch : i.end}, 
          {className : 'arity-error'}))
        })
    })
    })
  component.setState({markers : markers})
}

export function validateBeforeSubmit(component){
  var settings = getSettings()['checkBeforeExecutionSettings'];
    var setting = settings.find(s => s.condition(component));
    if(setting && !setting.proceedToExecute){
      component.setState(
        {alert: {
          lines: setting.lines(component),
          opened: true,
          onHandleClick : component.onHandleAlertClose,
          heading: setting.heading
          }
        })
      if(setting.callback){
        setting.callback(component);
      } 
      return false;
    }
    else{
      return true;
    }
}

export function setDatalogFragmentAlert(component){
    setAlert(component, 'datalogFragmentSettings');
}

export function setConstraintsAlert(component){
    setAlert(component, 'checkConstraintsSettings');
}