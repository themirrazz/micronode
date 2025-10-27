//% block="jsutils" color="#4287f5" icon="\uf121"
namespace jsutils {
    //% block="jslexar"
    export function jslexar(js: string, trackBraces?: boolean): {tokens:any[], length:number} {
        // prep
        let tokens: any[] = [];
        let tok = '';
        // state
        let inmq = false;
        let inmqi = false;
        let indbq = false;
        let insgq = false;
        let incmt = false;
        let inslc = false;
        let bracect = 0;
        let length = 0;
        let d: {
            type: string
            tokens: { type?: string, data?: string, tokens?: any }[]
        } | undefined | null;
        // util
        const allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_".split('');
        const keywords: string[] = ['var', 'let', 'const', 'function', 'async', 'await', 'class', 'extends', 'implements', 'typeof', 'instanceof', 'in', 'for', 'while', 'import', 'from', 'with', 'try', 'catch', 'finally', 'new', 'interface', 'enum', 'export', 'default', 'get', 'set', 'yield'];
        const pushTok = (t?: string) => {
            if (!tok) return;
            if (!isNaN(parseFloat(tok))) {
                tokens.push({
                    type: 'NUMBER',
                    data: tok
                });
            } else if (tok === 'true' || tok === 'false') {
                tokens.push({
                    type: 'BOOLEAN',
                    data: tok
                });
            } else if (tok === 'null') {
                tokens.push({
                    type: 'NULL',
                    data: tok
                });
            } else if (tok === 'undefined') {
                tokens.push({
                    type: 'UNDEFINED',
                    data: tok
                });
            } else if (keywords.indexOf(tok) > -1) {
                tokens.push({
                    type: 'KEYWORD',
                    data: tok
                });
            } else {
                tokens.push({
                    type: 'IDENTIFIER',
                    data: tok
                });
            }
            tok = '';
        };
        // lexar
        let i = 0;
        for (i = 0; i < js.length; i++) {
            let instr = inmq || indbq || insgq;
            if (inslc) {
                if (js[i] === '\n') {
                    inslc = false;
                }
            } else if (incmt) {
                if (js[i] === '*' && js[i + 1] === '/') {
                    i += 1;
                    incmt = false;
                    tokens.push({
                        type: 'COMMENT',
                        data: tok
                    });
                    tok = '';
                } else {
                    tok += js[i];
                }
            } else if (instr) {
                if (js[i] === '\\') {
                    let dd = '\\' + js[i + 1];
                    i += 1;
                    if (dd === '\\u') {
                        dd += js.slice(i + 2, i + 6);
                        i += 4
                    }
                    d.tokens.push({
                        type: 'TEXT',
                        data: tok
                    });
                    d.tokens.push({
                        type: 'ESCAPE',
                        data: dd
                    });
                    tok = dd;
                } else if ((indbq && js[i] === '"') || (insgq && js[i] === '\'') || (inmq && js[i] === '`')) {
                    indbq = false;
                    insgq = false;
                    inmq = false;
                    d.tokens.push({
                        type: 'TEXT',
                        data: tok
                    });
                    tok = '';
                    tokens.push(d);
                    d = null;
                } else if (inmq && js[i] === '$' && js[i + 1] === '{') {
                    d.tokens.push({
                        type: 'TEXT',
                        data: tok
                    });
                    tok = '';
                    const dd = jslexar(js.slice(i + 2), true);
                    i += dd.length || 0;
                    d.tokens.push({
                        type: 'TEMPLATE',
                        tokens: dd.tokens
                    });
                } else {
                    tok += js[i];
                }
            } else if (trackBraces && js[i] === '{') {
                pushTok();
                bracect += 1;
            } else if (trackBraces && js[i] === '}') {
                if (bracect <= 0) {
                    i++;
                    break;
                } else {
                    bracect--;
                    pushTok(tok);
                }
            } else if (js[i] === '/') {
                pushTok(tok);
                if (js[i + 1] === '/') {
                    inslc = true;
                } else {
                    tokens.push({
                        type: 'OPERATOR',
                        data: js[i]
                    });
                }
            } else if (js[i] === '\"') {
                pushTok(tok);
                indbq = true;
                d = {
                    type: 'STRING',
                    tokens: []
                };
            } else if (js[i] === '`') {
                pushTok();
                inmq = true;
                d = {
                    type: 'STRING',
                    tokens: []
                };
            } else if (js[i] === '\'') {
                pushTok();
                insgq = true;
                d = {
                    type: 'STRING',
                    tokens: []
                };
            } else if (allowed.indexOf(js[i]) >= 0) {
                tok += js[i];
            } else if(js[i] === '\r' || js[i] === '\t' || js[i] === '\n' || js[i] === ' ') {
                pushTok();
            } else {
                pushTok();
                tokens.push({
                    type: 'OPERATOR',
                    data: js[i]
                });
            }
        }
        if (inslc) {
            tokens.push({
                type: 'COMMENT',
                data: tok
            });
        }
        pushTok();
        if (!length) { length = i > js.length ? js.length : i }
        return { tokens, length }
    };
}