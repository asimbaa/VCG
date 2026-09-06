const ts = require('typescript');
const fs = require('fs');

const fileName = 'src/components/bank/AuraDriveMap.tsx';
const program = ts.createProgram([fileName], { noEmit: true, jsx: 4 }); // 4 is ReactJSX
const emitResult = program.emit();

let allDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .concat(emitResult.diagnostics);

allDiagnostics.forEach(diagnostic => {
  if (diagnostic.file) {
    let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  }
});
