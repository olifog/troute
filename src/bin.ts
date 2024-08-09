#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs/promises';
import path from 'path';

yargs(hideBin(process.argv))
  .command('generate [path]', 'Regenerate actions. Needed whenever troute\'s queries change.', (yargs) => {
    return yargs.positional('path', {
      type: 'string',
      default: '',
      describe: 'Path to the troute file',
    });
  }, async (argv) => {
    const WARN = (text: string) => {console.warn("[WARN] " + text)}
    const INFO = (text: string) => {console.info("[INFO] " + text)}
    const DEBUG = (text: string) => {if (argv['verbose']) console.debug("[DEBUG] " + text)}

    DEBUG('Starting troute generation')

    let troutePath = argv.path as string
    if (troutePath === '') {
      DEBUG('No path provided, checking for src directory')
      if (await fs.access('src').then(() => true).catch(() => false)) {
        troutePath = path.join('src', 'troute.ts')
      } else {
        troutePath = 'troute.ts'
      }
    }

    DEBUG(`Looking for troute file at ${troutePath}`)

    if (!await fs.access(troutePath).then(() => true).catch(() => false)) {
      WARN(`Troute file not found at ${troutePath}`)
      process.exit(1)
    }

    INFO(`Found troute file at ${troutePath}`)
    const trouteContent = await fs.readFile(troutePath, 'utf-8')

    // Extract imports and createTroute object
    const importRegex = /import\s+{([^}]+)}\s+from\s+["']([^"']+)["']/g
    const createTrouteRegex = /createTroute\(\s*{([^}]+)}\s*\)/

    let imports: {names: string[], path: string}[] = []
    let match

    while ((match = importRegex.exec(trouteContent)) !== null) {
      const names = match[1]!.split(',').map(name => name.trim())
      const importPath = match[2]!
      imports.push({names, path: importPath})
    }

    const createTrouteMatch = createTrouteRegex.exec(trouteContent)
    if (!createTrouteMatch) {
      WARN('Could not find createTroute object in troute file')
      process.exit(1)
    }

    const createTrouteContent = createTrouteMatch[1]!
    const actionNames = createTrouteContent.split(',').map(action => action.trim())

    // Generate new file content
    let newFileContent = '"use server"\n\n'

    imports.forEach(importItem => {
      const importNames = importItem.names.filter(name => actionNames.includes(name))
      if (importNames.length > 0) {
        newFileContent += `import { ${importNames.join(', ')} } from ".${importItem.path}";\n`
      }
    })

    newFileContent += `\nexport { ${actionNames.join(', ')} }\n`

    // Determine output path
    const outputDir = path.dirname(troutePath)
    const outputPath = path.join(outputDir, '.troute', 'actions.ts')

    DEBUG(`Writing output to ${outputPath}`)

    // Ensure .troute directory exists
    await fs.mkdir(path.join(outputDir, '.troute'), { recursive: true })

    // Write the new file
    await fs.writeFile(outputPath, newFileContent)

    INFO(`Successfully generated ${outputPath}`)
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .parse();