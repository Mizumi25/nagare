export function parseCss(input) {
    const properties = {};
    const conditions = [];
    // normalize — split by both newlines AND semicolons
    const lines = input
        .split(/\n|;/)
        .map(l => l.trim())
        .filter(Boolean);
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith('@if ')) {
            const blocks = collectConditionalBlocks(lines, i);
            blocks.conditions.forEach(c => conditions.push(c));
            i = blocks.nextIndex;
        }
        else {
            const parsed = parseProp(line);
            if (parsed)
                properties[parsed.prop] = parsed.value;
            i++;
        }
    }
    return { properties, conditions };
}
function collectConditionalBlocks(lines, startIndex) {
    const conditions = [];
    let i = startIndex;
    let previousExpressions = [];
    while (i < lines.length) {
        const line = lines[i];
        let expression = null;
        if (line.startsWith('@if ')) {
            expression = line.slice(4).replace('{', '').trim();
        }
        else if (line.startsWith('@else if ')) {
            expression = line.slice(9).replace('{', '').trim();
        }
        else if (line.startsWith('@else')) {
            expression = null;
        }
        else {
            break;
        }
        i++;
        const blockProps = {};
        while (i < lines.length && lines[i] !== '}') {
            const parsed = parseProp(lines[i]);
            if (parsed)
                blockProps[parsed.prop] = parsed.value;
            i++;
        }
        i++;
        if (expression !== null) {
            const fullExpression = previousExpressions.length > 0
                ? previousExpressions.map(e => `!(${e})`).join(' && ') + ` && (${expression})`
                : expression;
            conditions.push({ expression: fullExpression, properties: blockProps });
            previousExpressions.push(expression);
        }
        else {
            const fullExpression = previousExpressions.map(e => `!(${e})`).join(' && ');
            conditions.push({ expression: fullExpression, properties: blockProps });
            break;
        }
        while (i < lines.length && lines[i] === '')
            i++;
        const next = lines[i];
        if (!next || (!next.startsWith('@else if') && !next.startsWith('@else'))) {
            break;
        }
    }
    return { conditions, nextIndex: i };
}
function parseProp(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1)
        return null;
    const prop = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim().replace(/;$/, '');
    if (!prop || !value)
        return null;
    return { prop, value };
}
//# sourceMappingURL=css.js.map