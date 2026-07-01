"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSS_PROPS = void 0;
exports.getCssCompletions = getCssCompletions;
exports.CSS_PROPS = [
    // nagare DSL keywords (highest priority)
    '@if', '@else', '@else if',
    // layout
    'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'inset',
    // sizing
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
    // spacing
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    // flexbox
    'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
    'align-items', 'align-self', 'align-content',
    'justify-content', 'justify-items', 'justify-self',
    'gap', 'row-gap', 'column-gap', 'order',
    // grid
    'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
    'grid-column', 'grid-row', 'grid-area', 'place-items', 'place-content', 'place-self',
    // background
    'background', 'background-color', 'background-image', 'background-size',
    'background-position', 'background-repeat', 'background-attachment', 'background-clip',
    // text / font
    'color', 'font-size', 'font-weight', 'font-family', 'font-style', 'font-variant',
    'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
    'text-indent', 'text-shadow', 'text-overflow', 'white-space', 'word-break', 'word-wrap',
    // border
    'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-width', 'border-style', 'border-color', 'border-radius',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
    // outline
    'outline', 'outline-width', 'outline-style', 'outline-color', 'outline-offset',
    // shadow
    'box-shadow', 'text-shadow',
    // effects
    'opacity', 'visibility', 'overflow', 'overflow-x', 'overflow-y',
    'filter', 'backdrop-filter', 'clip-path', 'mask',
    'mix-blend-mode', 'isolation',
    // transform
    'transform', 'transform-origin', 'transform-style', 'perspective',
    'translate', 'rotate', 'scale', 'skew',
    // transition / animation
    'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay',
    'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
    'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode',
    // interactivity
    'cursor', 'pointer-events', 'user-select', 'touch-action', 'resize',
    'caret-color', 'accent-color', 'appearance',
    // list
    'list-style', 'list-style-type', 'list-style-position',
    // misc
    'content', 'counter-reset', 'counter-increment',
    'object-fit', 'object-position',
    'aspect-ratio', 'will-change',
    'scroll-behavior', 'scroll-margin', 'scroll-padding', 'scroll-snap-type', 'scroll-snap-align',
    'columns', 'column-gap', 'column-span',
    'float', 'clear',
    'table-layout', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells',
    'vertical-align',
];
const CSS_VALUES = {
    'display': ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents', 'flow-root', 'table'],
    'position': ['relative', 'absolute', 'fixed', 'sticky', 'static'],
    'cursor': ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'grab', 'grabbing', 'crosshair', 'zoom-in', 'zoom-out', 'none'],
    'overflow': ['visible', 'hidden', 'auto', 'scroll', 'clip'],
    'flex-direction': ['row', 'column', 'row-reverse', 'column-reverse'],
    'align-items': ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
    'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
    'font-weight': ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold', 'lighter', 'bolder'],
    'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
    'text-decoration': ['none', 'underline', 'overline', 'line-through'],
    'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'],
    'background-size': ['cover', 'contain', 'auto'],
    'background-repeat': ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'],
    'object-fit': ['contain', 'cover', 'fill', 'none', 'scale-down'],
    'visibility': ['visible', 'hidden', 'collapse'],
    'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
    'pointer-events': ['none', 'auto', 'all'],
    'user-select': ['none', 'text', 'all', 'auto'],
};
function getCssCompletions(partial) {
    // if partial has a colon, suggest values for the property
    const colonIdx = partial.indexOf(':');
    if (colonIdx !== -1) {
        const prop = partial.slice(0, colonIdx).trim();
        const values = CSS_VALUES[prop];
        if (values)
            return values;
        return [];
    }
    if (!partial)
        return exports.CSS_PROPS;
    return exports.CSS_PROPS.filter(p => p.startsWith(partial));
}
