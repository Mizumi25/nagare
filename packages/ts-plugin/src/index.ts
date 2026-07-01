import type ts from 'typescript/lib/tsserverlibrary'
import { getTwCompletions } from './tw-classes'
import { getCssCompletions } from './css-props'

// ─── AST context detection ──────────────────────────────────────────────────

interface StringContext {
  key: 'tw' | 'css'
  text: string
  valueStart: number  // position right after the opening quote
}

function getStringContext(
  ts: typeof import('typescript'),
  sourceFile: ts.SourceFile,
  position: number
): StringContext | null {
  function visit(node: ts.Node): StringContext | null {
    if (position < node.getStart(sourceFile) || position > node.getEnd()) {
      return null
    }

    // string literal or template literal
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      position >= node.getStart(sourceFile) &&
      position <= node.getEnd()
    ) {
      const parent = node.parent
      if (ts.isPropertyAssignment(parent)) {
        const nameNode = parent.name
        const key = ts.isIdentifier(nameNode) ? nameNode.text : null
        if (key === 'tw' || key === 'css') {
          return {
            key,
            text: node.getText(sourceFile),
            valueStart: node.getStart(sourceFile) + 1  // +1 to skip opening quote/backtick
          }
        }
      }
    }

    return ts.forEachChild(node, visit) ?? null
  }

  return visit(sourceFile)
}

// ─── Plugin ─────────────────────────────────────────────────────────────────

function init(modules: { typescript: typeof import("typescript") }) {
  const ts = modules.typescript

  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const proxy = Object.create(null) as ts.LanguageService

    for (const k of Object.keys(info.languageService) as (keyof ts.LanguageService)[]) {
      const x = info.languageService[k]!
      ;(proxy as any)[k] = (...args: any[]) => (x as any).apply(info.languageService, args)
    }

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const prior = info.languageService.getCompletionsAtPosition(fileName, position, options) ?? {
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        entries: []
      }

      const program = info.languageService.getProgram()
      const sourceFile = program?.getSourceFile(fileName)
      if (!sourceFile) return prior

      const ctx = getStringContext(ts, sourceFile, position)
      if (!ctx) return prior

      // extract what the user has typed so far inside the string
      const typedSoFar = ctx.key === 'tw'
        // tw: space-separated classes, get last word
        ? sourceFile.text.slice(ctx.valueStart, position).split(/\s+/).pop() ?? ''
        // css: newline-separated, get last line (trimmed)
        : sourceFile.text.slice(ctx.valueStart, position).split('\n').pop()?.trim() ?? ''

      const suggestions = ctx.key === 'tw'
        ? getTwCompletions(typedSoFar)
        : getCssCompletions(typedSoFar)

      const newEntries: ts.CompletionEntry[] = suggestions.map(name => ({
        name,
        kind: ts.ScriptElementKind.string,
        kindModifiers: 'color',
        sortText: `0_${name}`,
        labelDetails: { description: ctx.key === 'tw' ? 'Tailwind' : 'Nagare CSS' }
      }))

      return {
        ...prior,
        entries: [...newEntries, ...prior.entries]
      }
    }

    proxy.getCompletionEntryDetails = (fileName, position, name, formatOptions, source, preferences, data) => {
      const program = info.languageService.getProgram()
      const sourceFile = program?.getSourceFile(fileName)

      if (sourceFile) {
        const ctx = getStringContext(ts, sourceFile, position)
        if (ctx) {
          return {
            name,
            kind: ts.ScriptElementKind.string,
            kindModifiers: '',
            displayParts: [{ text: name, kind: 'text' }],
            documentation: [
              {
                text: ctx.key === 'tw'
                  ? `Tailwind CSS class — applied via Nagare \`tw\` block`
                  : name.startsWith('@')
                    ? `Nagare DSL conditional — \`${name} <state_key> { ... }\``
                    : `CSS property — used in Nagare \`css\` block`,
                kind: 'text'
              }
            ]
          }
        }
      }

      return info.languageService.getCompletionEntryDetails(
        fileName, position, name, formatOptions, source, preferences, data
      )
    }

    return proxy
  }

  function getExternalFiles(project: ts.server.Project): string[] {
    return project.getFileNames()
  }

  return { create, getExternalFiles }
}

export = init
