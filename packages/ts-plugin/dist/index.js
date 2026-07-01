"use strict";
const tw_classes_1 = require("./tw-classes");
const css_props_1 = require("./css-props");
function getStringContext(ts, sourceFile, position) {
    function visit(node) {
        var _a;
        if (position < node.getStart(sourceFile) || position > node.getEnd()) {
            return null;
        }
        // string literal or template literal
        if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
            position >= node.getStart(sourceFile) &&
            position <= node.getEnd()) {
            const parent = node.parent;
            if (ts.isPropertyAssignment(parent)) {
                const nameNode = parent.name;
                const key = ts.isIdentifier(nameNode) ? nameNode.text : null;
                if (key === 'tw' || key === 'css') {
                    return {
                        key,
                        text: node.getText(sourceFile),
                        valueStart: node.getStart(sourceFile) + 1 // +1 to skip opening quote/backtick
                    };
                }
            }
        }
        return (_a = ts.forEachChild(node, visit)) !== null && _a !== void 0 ? _a : null;
    }
    return visit(sourceFile);
}
// ─── Plugin ─────────────────────────────────────────────────────────────────
function init(modules) {
    const ts = modules.typescript;
    function create(info) {
        const proxy = Object.create(null);
        for (const k of Object.keys(info.languageService)) {
            const x = info.languageService[k];
            proxy[k] = (...args) => x.apply(info.languageService, args);
        }
        proxy.getCompletionsAtPosition = (fileName, position, options) => {
            var _a, _b, _c, _d;
            const prior = (_a = info.languageService.getCompletionsAtPosition(fileName, position, options)) !== null && _a !== void 0 ? _a : {
                isGlobalCompletion: false,
                isMemberCompletion: false,
                isNewIdentifierLocation: false,
                entries: []
            };
            const program = info.languageService.getProgram();
            const sourceFile = program === null || program === void 0 ? void 0 : program.getSourceFile(fileName);
            if (!sourceFile)
                return prior;
            const ctx = getStringContext(ts, sourceFile, position);
            if (!ctx)
                return prior;
            // extract what the user has typed so far inside the string
            const typedSoFar = ctx.key === 'tw'
                // tw: space-separated classes, get last word
                ? (_b = sourceFile.text.slice(ctx.valueStart, position).split(/\s+/).pop()) !== null && _b !== void 0 ? _b : ''
                // css: newline-separated, get last line (trimmed)
                : (_d = (_c = sourceFile.text.slice(ctx.valueStart, position).split('\n').pop()) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
            const suggestions = ctx.key === 'tw'
                ? (0, tw_classes_1.getTwCompletions)(typedSoFar)
                : (0, css_props_1.getCssCompletions)(typedSoFar);
            const newEntries = suggestions.map(name => ({
                name,
                kind: ts.ScriptElementKind.string,
                kindModifiers: 'color',
                sortText: `0_${name}`,
                labelDetails: { description: ctx.key === 'tw' ? 'Tailwind' : 'Nagare CSS' }
            }));
            return {
                ...prior,
                entries: [...newEntries, ...prior.entries]
            };
        };
        proxy.getCompletionEntryDetails = (fileName, position, name, formatOptions, source, preferences, data) => {
            const program = info.languageService.getProgram();
            const sourceFile = program === null || program === void 0 ? void 0 : program.getSourceFile(fileName);
            if (sourceFile) {
                const ctx = getStringContext(ts, sourceFile, position);
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
                    };
                }
            }
            return info.languageService.getCompletionEntryDetails(fileName, position, name, formatOptions, source, preferences, data);
        };
        return proxy;
    }
    function getExternalFiles(project) {
        return project.getFileNames();
    }
    return { create, getExternalFiles };
}
module.exports = init;
