import type ts from 'typescript/lib/tsserverlibrary';
declare function init(modules: {
    typescript: typeof import("typescript");
}): {
    create: (info: ts.server.PluginCreateInfo) => ts.LanguageService;
    getExternalFiles: (project: ts.server.Project) => string[];
};
export = init;
