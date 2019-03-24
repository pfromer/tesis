import React from "react";
import {UnControlled as CodeMirror} from 'react-codemirror2'
import './App.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');

export class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.instance = null;
        this.allRegex = props.allRegex;         
        this.updateErrorColors = this.updateErrorColors.bind(this);
        this.refresh = this.refresh.bind(this);
        this.markError = this.markError.bind(this);
        this.removeError = this.removeError.bind(this);
        this.removeClass = this.removeClass.bind(this);
        this.iterateAllLines = this.iterateAllLines.bind(this);
      }

      refresh(){          
        this.iterateAllLines(lineInfo => {
            this.removeClass(lineInfo.line, "ungarded-tgd");
            this.removeClass(lineInfo.line, "inconsistent-constraint");
        })
      }

      iterateAllLines(f){
        var lineNumber = 0;
        var lineInfo = this.instance.lineInfo(lineNumber);
        while(lineInfo){
            f(lineInfo);
            lineNumber ++;
            lineInfo = this.instance.lineInfo(lineNumber);
        }
      }

      updateErrorColors(text, lineNumber){
        if(!this.allRegex.some(r => r.test(text)))
        {
            this.markError(lineNumber);
        }
        else{
            this.removeError(lineNumber);
        }
      }

      markError(lineNumber){
        this.instance.addLineClass(lineNumber, "text", "syntax-error")
      }

      removeError(lineNumber){
        this.instance.removeLineClass(lineNumber, "text", "syntax-error")
      } 

      removeClass(lineNumber, className){
        this.instance.removeLineClass(lineNumber, "text", className)
      }

      
      render() {
          return(
        <CodeMirror
            editorDidMount={editor => { this.instance = editor; this.props.setInstance(editor) }}
            value={this.props.text}
            options={{
                mode: 'xml',
                theme: 'material',
                lineNumbers: true
            }}
            onChange={(editor, data, value) => {

                this.props.onEditorChange();
                this.refresh();

                if(!data.origin || ["undo", "redo"].some(o => o == data.origin))
                {
                    this.iterateAllLines(lineInfo => {
                        this.updateErrorColors(lineInfo.text, lineInfo.line);
                    })
                }

                else if(data.origin === "paste"){
                    var lineNumber = data.from.line;
                    data.text.forEach( (text, i) => {
                        this.updateErrorColors(text, lineNumber + i);
                    });
                }

                else{
                    var lineNumber = data.from.line;
                    var lineInfo = this.instance.lineInfo(lineNumber);
                    this.updateErrorColors(lineInfo.text, lineNumber);
                }
            }}
          /> ) 
      }
}