import * as TJS from 'typescript-json-schema';
import * as path from 'path'
import fsExtra from 'fs-extra'
import _ from 'lodash';
import {recursiveObjectMap} from '@freephoenix888/recursive-object-map';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {capitalCase} from 'case-anything'
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import debug from 'debug';


generateJsonSchema()

async function generateJsonSchema () {
  const log = debug(generateJsonSchema.name)
  const cliOptions = await parseCliOptions();
  const settings: TJS.PartialArgs = {
    required: true,
    titles: true
  };
  
  const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: false,
    skipLibCheck: true
  };
 
  const program = TJS.getProgramFromFiles([cliOptions.interfaceFilePath], compilerOptions);
  
  let schema = TJS.generateSchema(program, cliOptions.interfaceName, settings); 
  if(!schema) {
    throw new Error("Failed to generate schema")
  }
  

  log({schema})
  schema = await recursiveObjectMap(schema, (key, value) => {
    log({key, value})
    return {newKey: key, newValue: (key === 'title' && typeof value === 'string') ? capitalCase(value) : value}
  });
  if(cliOptions.outputJsonFilePath) {
    fsExtra.mkdirSync(path.dirname(cliOptions.outputJsonFilePath), {recursive: true});
    fsExtra.writeFileSync(cliOptions.outputJsonFilePath, JSON.stringify(schema, null, 2));
  } else {
    console.log(JSON.stringify(schema, null, 2));
  }
}

async function parseCliOptions(): Promise<Options> {
  const cliOptions = yargs(hideBin(process.argv))
  .option('interface-file-path', {
    type: 'string',
    description: 'File path to the interface file',
    demandOption: true
  })
  .option('interface-name', {
    type: 'string',
    description: 'Interface name',
    demandOption: true
  })
  .option('output-json-file-path', {
    type: 'string',
    description: 'Output json file path',
    demandOption: false
  })
  .parseSync();
 
   return cliOptions;
 }

 interface Options {
    interfaceFilePath: string,
    interfaceName: string,
    outputJsonFilePath?: string | undefined;
 }


