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
      heading: 'The arguments length of the folowing predicates is not consistent through your program:', 
      lines: function(component) {return component.state.program.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent},
      proceedToExecute: false
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
      { 
        condition: function(component){return component.state.program.arityDictionary.aritiesAreConsistent().result == false },
        heading: 'The arguments length of the folowing predicates is not consistent through your program', 
        lines: function(component) {return component.state.program.arityDictionary.aritiesAreConsistent().predicatesNotArityConsistent},
        proceedToExecute: false
      },
      { 
        condition: function(component){return hasInconsistencies(component)},
        heading: "Not consistent.", 
        lines: function(component) {return ["The lines marked in green are not fulfilled by your program.", 
                "You may execute a query under IAR semantics."]},
        proceedToExecute: false
      },
      { 
        condition: function(component){return !hasInconsistencies(component)},
        heading: "Your program is consistent.", 
        lines: function(component) {return []},
        proceedToExecute: true
      }
    ]
  }
}

function hasInconsistencies(component){
    return component.state.inconsistencies && component.state.inconsistencies.length > 0;
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

function markUngardedTgds(component) {
  var lineNumber = 0;
  var lineInfo = component.state.programEditorInstance.lineInfo(lineNumber);
  while (lineInfo) {
    updateUngardedClass(lineInfo.text, lineNumber, component);
    lineNumber++;
    lineInfo = component.state.programEditorInstance.lineInfo(lineNumber);
  }
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

export function validateBeforeSubmit(component){
  debugger
  var settings = getSettings()['checkConstraintsSettings'];
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