import React, { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import "blockly/javascript";
import { javascriptGenerator } from "blockly/javascript";

// Define JavaScript generators first
const initBlocklyGenerators = () => {
  javascriptGenerator["setVariable"] = function (block) {
    const variable = block.getFieldValue("VAR");
    const value =
      javascriptGenerator.valueToCode(
        block,
        "VALUE",
        javascriptGenerator.ORDER_ASSIGNMENT
      ) || "0";
    return `let ${variable} = ${value};\n`;
  };

  javascriptGenerator["arithmetic"] = function (block) {
    const a =
      javascriptGenerator.valueToCode(
        block,
        "A",
        javascriptGenerator.ORDER_ATOMIC
      ) || "0";
    const b =
      javascriptGenerator.valueToCode(
        block,
        "B",
        javascriptGenerator.ORDER_ATOMIC
      ) || "0";
    const op = block.getFieldValue("OP");
    const operators: { [key: string]: string } = {
      ADD: "+",
      SUBTRACT: "-",
      MULTIPLY: "*",
      DIVIDE: "/",
    };
    return [`(${a} ${operators[op]} ${b})`, javascriptGenerator.ORDER_ATOMIC];
  };

  javascriptGenerator["print"] = function (block) {
    const text =
      javascriptGenerator.valueToCode(
        block,
        "TEXT",
        javascriptGenerator.ORDER_NONE
      ) || '""';
    return `console.log(${text});\n`;
  };

  javascriptGenerator["ifElse"] = function (block) {
    const condition =
      javascriptGenerator.valueToCode(
        block,
        "CONDITION",
        javascriptGenerator.ORDER_NONE
      ) || "false";
    const doCode = javascriptGenerator.statementToCode(block, "DO") || "";
    const elseCode = javascriptGenerator.statementToCode(block, "ELSE") || "";
    return `if (${condition}) {\n${doCode}} else {\n${elseCode}}\n`;
  };
};

// Define custom blocks
const initBlocklyBlocks = () => {
  Blockly.Blocks["setVariable"] = {
    init: function () {
      this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField("set")
        .appendField(new Blockly.FieldTextInput("variable"), "VAR")
        .appendField("to");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    },
  };

  Blockly.Blocks["arithmetic"] = {
    init: function () {
      this.appendValueInput("A").setCheck("Number");
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ["+", "ADD"],
          ["-", "SUBTRACT"],
          ["×", "MULTIPLY"],
          ["÷", "DIVIDE"],
        ]),
        "OP"
      );
      this.appendValueInput("B").setCheck("Number");
      this.setOutput(true, "Number");
      this.setColour(160);
    },
  };

  Blockly.Blocks["print"] = {
    init: function () {
      this.appendValueInput("TEXT").setCheck(null).appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
    },
  };

  Blockly.Blocks["ifElse"] = {
    init: function () {
      this.appendValueInput("CONDITION").setCheck("Boolean").appendField("if");
      this.appendStatementInput("DO").appendField("do");
      this.appendStatementInput("ELSE").appendField("else");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
    },
  };
};

const App: React.FC = () => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const toolbox = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "Logic",
        colour: "#5C81A6",
        contents: [
          { kind: "block", type: "ifElse" },
          { kind: "block", type: "controls_if" },
          { kind: "block", type: "logic_compare" },
          { kind: "block", type: "logic_operation" },
        ],
      },
      {
        kind: "category",
        name: "Variables",
        colour: "#A65C81",
        contents: [
          { kind: "block", type: "setVariable" },
          { kind: "block", type: "math_number" },
          { kind: "block", type: "text" },
        ],
      },
      {
        kind: "category",
        name: "Math",
        colour: "#5CA681",
        contents: [
          { kind: "block", type: "arithmetic" },
          { kind: "block", type: "math_arithmetic" },
        ],
      },
      {
        kind: "category",
        name: "Output",
        colour: "#A6815C",
        contents: [{ kind: "block", type: "print" }],
      },
    ],
  };

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Initialize Blockly blocks and generators
    initBlocklyBlocks();
    initBlocklyGenerators();

    // Initialize workspace
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      scrollbars: true,
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: "#ccc",
        snap: true,
      },
    });

    return () => workspace.dispose();
  }, []);

  const runCode = () => {
    const workspace = Blockly.getMainWorkspace();
    const code = javascriptGenerator.workspaceToCode(workspace);
    try {
      // eslint-disable-next-line no-eval
      eval(code);
    } catch (e) {
      console.error("Error executing code:", e);
    }
  };

  const resetWorkspace = () => {
    const workspace = Blockly.getMainWorkspace();
    workspace.clear();
  };

  return (
    <div className="h-screen">
      <div className="flex flex-col h-screen">
        <div className="bg-blue-600 p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Kid's Block Coding</h1>
            <div className="space-x-4">
              <button
                onClick={runCode}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition-colors">
                ▶ Run Code
              </button>
              <button
                onClick={resetWorkspace}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-colors">
                ↺ Reset
              </button>
            </div>
          </div>
        </div>
        <div ref={blocklyDiv} className="flex-1 w-full" />
      </div>
    </div>
  );
};

export default App;
