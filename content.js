class URLParameterOptimizer {
    static ['buildWithSearchParams'](a) {
        const b = new URLSearchParams();
        for (const [c, d] of Object['entries'](a)) {
            d !== undefined && d !== null && b['append'](c, d);
        }
        return b['toString']();
    }
    static ['buildWithFilter'](a) {
        return Object['entries'](a)['filter'](([b, c]) => c !== undefined && c !== null)['map'](([b, c]) => encodeURIComponent(b) + '=' + encodeURIComponent(c))['join']('&');
    }
    static ['buildWithStringConcat'](a) {
        const b = [];
        for (const [c, d] of Object['entries'](a)) {
            d !== undefined && d !== null && b['push'](encodeURIComponent(c) + '=' + encodeURIComponent(d));
        }
        return b['join']('&');
    }
    static ['setLocationHref'](a = '/', b = {}, c = 'searchParams') {
        let queryString = '';
        switch (c) {
        case 'searchParams':
            queryString = this['buildWithSearchParams'](b);
            break;
        case 'filter':
            queryString = this['buildWithFilter'](b);
            break;
        case 'concat':
            queryString = this['buildWithStringConcat'](b);
            break;
        default:
            throw new Error('不支持的构建方法');
        }
        const d = queryString ? a + '?' + queryString : a;
        return d;
    }
}
class URLPathExtractor {
    constructor() {
        this['extractedUrls'] = [], this['currentPage'] = {
            'origin': window['location']['origin'],
            'hostname': window['location']['hostname'],
            'protocol': window['location']['protocol']
        };
    }
    ['extractAllUrls']() {
        return this['extractedUrls'] = [], this['extractFromDOM'](), this['extractFromInlineScripts'](), this['extractFromCSS'](), this['extractFromForms'](), this['extractDynamicUrls'](), this['deduplicateUrls'](), window['extractedUrls'] = this['extractedUrls'], this['extractedUrls'];
    }
    ['extractFromDOM']() {
        const a = [
                {
                    'selector': 'a[href]',
                    'attribute': 'href',
                    'method': 'GET'
                },
                {
                    'selector': 'img[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'link[href]',
                    'attribute': 'href',
                    'method': 'GET'
                },
                {
                    'selector': 'script[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'iframe[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'frame[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'source[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'form[action]',
                    'attribute': 'action',
                    'method': 'POST'
                },
                {
                    'selector': 'audio[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'video[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'track[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'embed[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'object[data]',
                    'attribute': 'data',
                    'method': 'GET'
                },
                {
                    'selector': 'input[src]',
                    'attribute': 'src',
                    'method': 'GET'
                },
                {
                    'selector': 'blockquote[cite]',
                    'attribute': 'cite',
                    'method': 'GET'
                },
                {
                    'selector': 'q[cite]',
                    'attribute': 'cite',
                    'method': 'GET'
                },
                {
                    'selector': 'area[href]',
                    'attribute': 'href',
                    'method': 'GET'
                }
            ], b = new Set();
        a['forEach'](d => {
            const e = document['querySelectorAll'](d['selector']);
            e['forEach'](f => {
                const g = f['getAttribute'](d['attribute']);
                if (g && !b['has'](g)) {
                    b['add'](g);
                    const h = this['normalizeUrl'](g);
                    if (h) {
                        let i = '';
                        try {
                            const j = new URL(h);
                            i = j['search']['slice'](0x1);
                        } catch (k) {
                        }
                        this['extractedUrls']['push']({
                            'url': h,
                            'method': d['method'],
                            'params': i
                        });
                    }
                }
            });
        });
        const c = document['querySelectorAll']('[style*="background"]');
        c['forEach'](d => {
            const f = d['getAttribute']('style'), g = f['match'](/background(?:-image)?\s*:\s*url\(['"]?([^'")]+)['"]?\)/i);
            if (g) {
                const h = g[0x1];
                if (!b['has'](h)) {
                    b['add'](h);
                    const i = this['normalizeUrl'](h);
                    if (i) {
                        let j = '';
                        try {
                            const k = new URL(i);
                            j = k['search']['slice'](0x1);
                        } catch (l) {
                        }
                        this['extractedUrls']['push']({
                            'url': i,
                            'method': 'GET',
                            'params': j
                        });
                    }
                }
            }
        });
    }
    ['extractFromInlineScripts']() {
        const a = document['querySelectorAll']('script');
        a['forEach'](c => {
            if (c['src'])
                return;
            const d = c['textContent'], e = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[\w\-\u0400-\u04FF]+(?:[\w\-\u0400-\u04FF()@:%_\+.~#?&=]*[\w\-\u0400-\u04FF()@:%_\+.~#?&=])?/gi, f = d['match'](e);
            f && f['forEach'](g => {
                if (g['length'] > 0x5) {
                    const h = this['normalizeUrl'](g);
                    if (h) {
                        let i = '';
                        try {
                            const j = new URL(h);
                            i = j['search']['slice'](0x1);
                        } catch (k) {
                        }
                        this['extractedUrls']['push']({
                            'url': h,
                            'method': 'GET',
                            'params': i
                        });
                    }
                }
            }), this['extractFromJSONRequests'](d), this['extractWebSocketUrls'](d), this['extractWebRTCConnections'](d), this['extractFromGraphQLRequests'](d), this['extractFromXMLHttpRequest'](d), this['extractFromjQueryAjax'](d), this['extractFromGraphQLWebSocket'](d), this['extractFromWindowLocation'](d);
        });
        const b = new MutationObserver(c => {
            c['forEach'](d => {
                d['addedNodes']['forEach'](e => {
                    if (e['nodeType'] === Node['ELEMENT_NODE'] && e['tagName'] === 'SCRIPT') {
                        if (e['src']) {
                            const f = this['normalizeUrl'](e['src']);
                            f && this['extractedUrls']['push']({
                                'url': f,
                                'method': 'GET',
                                'params': ''
                            });
                        } else {
                            const g = e['textContent'];
                            if (g) {
                                const h = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[\w\-\u0400-\u04FF]+(?:[\w\-\u0400-\u04FF()@:%_\+.~#?&=]*[\w\-\u0400-\u04FF()@:%_\+.~#?&=])?/gi, i = g['match'](h);
                                i && i['forEach'](j => {
                                    if (j['length'] > 0x5) {
                                        const k = this['normalizeUrl'](j);
                                        if (k) {
                                            let l = '';
                                            try {
                                                const m = new URL(k);
                                                l = m['search']['slice'](0x1);
                                            } catch (n) {
                                            }
                                            this['extractedUrls']['push']({
                                                'url': k,
                                                'method': 'GET',
                                                'params': l
                                            });
                                        }
                                    }
                                }), this['extractFromJSONRequests'](g), this['extractWebSocketUrls'](g), this['extractWebRTCConnections'](g), this['extractFromGraphQLRequests'](g), this['extractFromXMLHttpRequest'](g), this['extractFromjQueryAjax'](g), this['extractFromGraphQLWebSocket'](g), this['extractFromWindowLocation'](g);
                            }
                        }
                    }
                });
            });
        });
        b['observe'](document['documentElement'], {
            'childList': !![],
            'subtree': !![]
        });
    }
    ['extractFromDynamicScripts']() {
        const a = new MutationObserver(b => {
            b['forEach'](c => {
                c['addedNodes']['forEach'](d => {
                    d['nodeType'] === Node['ELEMENT_NODE'] && d['tagName'] === 'SCRIPT' && setTimeout(() => {
                        if (d['src']) {
                            const f = this['normalizeUrl'](d['src']);
                            if (f) {
                                let g = '';
                                try {
                                    const h = new URL(f);
                                    g = h['search']['slice'](0x1);
                                } catch (i) {
                                }
                                this['extractedUrls']['push']({
                                    'url': f,
                                    'method': 'GET',
                                    'params': g
                                });
                            }
                        } else {
                            const j = d['textContent'];
                            if (j) {
                                const k = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[\w\-\u0400-\u04FF]+(?:[\w\-\u0400-\u04FF()@:%_\+.~#?&=]*[\w\-\u0400-\u04FF()@:%_\+.~#?&=])?/gi, l = j['match'](k);
                                l && l['forEach'](m => {
                                    if (m['length'] > 0x5) {
                                        const n = this['normalizeUrl'](m);
                                        if (n) {
                                            let o = '';
                                            try {
                                                const p = new URL(n);
                                                o = p['search']['slice'](0x1);
                                            } catch (q) {
                                            }
                                            this['extractedUrls']['push']({
                                                'url': n,
                                                'method': 'GET',
                                                'params': o
                                            });
                                        }
                                    }
                                }), this['extractFromJSONRequests'](j), this['extractWebSocketUrls'](j), this['extractWebRTCConnections'](j), this['extractFromGraphQLRequests'](j), this['extractFromXMLHttpRequest'](j), this['extractFromjQueryAjax'](j), this['extractFromGraphQLWebSocket'](j);
                            }
                        }
                    }, 0x64);
                });
            });
        });
        document['body'] && a['observe'](document['body'], {
            'childList': !![],
            'subtree': !![]
        });
    }
    ['extractFromCSS']() {
        const a = document['querySelectorAll']('link[rel=\x22stylesheet\x22]');
        a['forEach'](c => {
            const d = c['getAttribute']('href');
            if (d) {
                const f = this['normalizeUrl'](d);
                if (f) {
                    let g = '';
                    try {
                        const h = new URL(f);
                        g = h['search']['slice'](0x1);
                    } catch (i) {
                    }
                    this['extractedUrls']['push']({
                        'url': f,
                        'method': 'GET',
                        'params': g
                    });
                }
            }
        });
        const b = document['querySelectorAll']('style');
        b['forEach'](c => {
            const d = c['textContent'], f = /url\(\s*['"]?((?:[^'"\s()]*(?:\([^)]*\))?)*[^'"\s()]*)['"]?\s*\)/gi;
            let g;
            while ((g = f['exec'](d)) !== null) {
                const h = g[0x1];
                if (h) {
                    const i = this['normalizeUrl'](h);
                    if (i) {
                        let j = '';
                        try {
                            const k = new URL(i);
                            j = k['search']['slice'](0x1);
                        } catch (l) {
                        }
                        this['extractedUrls']['push']({
                            'url': i,
                            'method': 'GET',
                            'params': j
                        });
                    }
                }
            }
        });
    }
    ['extractFromForms']() {
        const a = document['querySelectorAll']('form');
        a['forEach'](b => {
            const c = b['getAttribute']('action') || window['location']['href'], d = (b['getAttribute']('method') || 'GET')['toUpperCase'](), e = this['normalizeUrl'](c);
            if (e) {
                const f = [], g = b['querySelectorAll']('input[name]');
                g['forEach'](h => {
                    const i = h['getAttribute']('name'), j = h['getAttribute']('value') || '';
                    f['push'](i + '=' + j);
                }), this['extractedUrls']['push']({
                    'url': e,
                    'method': d,
                    'params': f['join']('&')
                });
            }
        });
    }
    ['normalizeUrl'](b) {
        try {
            if (b['startsWith']('#'))
                return null;
            if (b['startsWith']('http://') || b['startsWith']('https://') || b['startsWith']('//'))
                return b;
            if (b['startsWith']('//'))
                return '' + this['currentPage']['protocol'] + b;
            if (b['startsWith']('/'))
                return '' + this['currentPage']['origin'] + b;
            if (b['startsWith']('../') || b['startsWith']('./')) {
                const c = document['createElement']('a');
                return c['href'] = b, c['href'];
            }
            return b;
        } catch (d) {
            return console['error']('URL标准化错误:', d, '原始URL:', b), b;
        }
    }
    ['deduplicateUrls']() {
        const a = new Map();
        this['extractedUrls'] = this['extractedUrls']['filter'](b => {
            if (a['has'](b['url'])) {
                const c = a['get'](b['url']);
                if (c['has'](b['method']))
                    return ![];
                return c['add'](b['method']), !![];
            } else
                return a['set'](b['url'], new Set([b['method']])), !![];
        });
    }
    ['extractFromJSONRequests'](a) {
        const fetchJsonRegex = /fetch\s*\(\s*['"]([^'"]+)['"]\s*,\s*\{[^}]*body\s*:\s*JSON\.stringify\s*\([^}]*\}\s*\}\s*\)/gi;
        let b;
        while ((b = fetchJsonRegex['exec'](a)) !== null) {
            const d = b[0x1];
            if (d) {
                const e = this['normalizeUrl'](d);
                e && this['extractedUrls']['push']({
                    'url': e,
                    'method': 'POST',
                    'params': ''
                });
            }
        }
        const c = /xhr\.open\s*\(\s*['"]POST['"]\s*,\s*['"]([^'"]+)['"]/gi;
        while ((b = c['exec'](a)) !== null) {
            const f = b[0x1];
            if (f) {
                const g = this['normalizeUrl'](f);
                g && this['extractedUrls']['push']({
                    'url': g,
                    'method': 'POST',
                    'params': ''
                });
            }
        }
    }
    ['extractWebSocketUrls'](a) {
        const b = /new\s+WebSocket\s*\(\s*['"](wss?:\/\/[^'"]+)['"]\s*\)/gi;
        let c;
        while ((c = b['exec'](a)) !== null) {
            const d = c[0x1];
            if (d) {
                const e = this['normalizeUrl'](d);
                e && this['extractedUrls']['push']({
                    'url': e,
                    'method': 'WEBSOCKET',
                    'params': ''
                });
            }
        }
    }
    ['extractWebRTCConnections'](a) {
        const b = /new\s+RTCPeerConnection\s*\(\s*\{[^}]*urls\s*:\s*['"]([^'"]+)['"]/gi;
        let c;
        while ((c = b['exec'](a)) !== null) {
            const d = c[0x1];
            if (d) {
                const e = this['normalizeUrl'](d);
                e && this['extractedUrls']['push']({
                    'url': e,
                    'method': 'WEBRTC',
                    'params': ''
                });
            }
        }
    }
    ['extractFromGraphQLRequests'](a) {
        const b = /graphql\s*\(\s*\{[^}]*url\s*:\s*['"]([^'"]+)['"]/gi;
        let c;
        while ((c = b['exec'](a)) !== null) {
            const d = c[0x1];
            if (d) {
                const e = this['normalizeUrl'](d);
                e && this['extractedUrls']['push']({
                    'url': e,
                    'method': 'POST',
                    'params': ''
                });
            }
        }
    }
    ['extractFromXMLHttpRequest'](a) {
        const b = /xhr\.open\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/gi;
        let c;
        while ((c = b['exec'](a)) !== null) {
            const d = c[0x1], e = c[0x2];
            if (e) {
                const f = this['normalizeUrl'](e);
                f && this['extractedUrls']['push']({
                    'url': f,
                    'method': d,
                    'params': ''
                });
            }
        }
    }
    ['extractFromjQueryAjax'](a) {
        const jqueryRegex = /\$\.ajax\s*\(\s*\{[^}]*url\s*:\s*['"]([^'"]+)['"]/gi;
        let b;
        while ((b = jqueryRegex['exec'](a)) !== null) {
            const c = b[0x1];
            if (c) {
                const d = this['normalizeUrl'](c);
                if (d) {
                    const e = /type\s*:\s*['"]([^'"]+)['"]/i['exec'](b[0x0]), f = e ? e[0x1] : 'GET';
                    this['extractedUrls']['push']({
                        'url': d,
                        'method': f,
                        'params': ''
                    });
                }
            }
        }
    }
    ['extractFromGraphQLWebSocket'](a) {
        const b = /new\s+SubscriptionClient\s*\(\s*['"](wss?:\/\/[^'"]+)['"]\s*\)/gi;
        let c;
        while ((c = b['exec'](a)) !== null) {
            const d = c[0x1];
            if (d) {
                const e = this['normalizeUrl'](d);
                e && this['extractedUrls']['push']({
                    'url': e,
                    'method': 'GRAPHQL_WEBSOCKET',
                    'params': ''
                });
            }
        }
    }
    ['extractFromWindowLocation'](a) {
        const b = /window\.location\.href\s*=\s*['"]([^'"]+)['"]/gi;
        let c;
        while ((c = b['exec'](a)) !== null) {
            const d = c[0x1];
            if (d) {
                const e = this['normalizeUrl'](d);
                e && this['extractedUrls']['push']({
                    'url': e,
                    'method': 'GET',
                    'params': ''
                });
            }
        }
    }
    ['categorizeUrls']() {
        const a = [
                '.jpg',
                '.jpeg',
                '.png',
                '.gif',
                '.bmp',
                '.svg',
                '.ico',
                '.webp',
                '.css',
                '.scss',
                '.sass',
                '.less',
                '.js',
                '.jsx',
                '.ts',
                '.tsx',
                '.coffee',
                '.woff',
                '.woff2',
                '.ttf',
                '.eot',
                '.otf',
                '.mp3',
                '.wav',
                '.ogg',
                '.m4a',
                '.flac',
                '.mp4',
                '.avi',
                '.mov',
                '.wmv',
                '.flv',
                '.webm',
                '.mkv'
            ], b = {
                'static': [],
                'api': [],
                'navigation': []
            };
        return this['extractedUrls']['forEach'](c => {
            const d = c['url'], e = a['some'](f => d['toLowerCase']()['endsWith'](f) || d['indexOf']('?') !== -0x1 && d['substring'](0x0, d['indexOf']('?'))['toLowerCase']()['endsWith'](f) || d['indexOf']('#') !== -0x1 && d['substring'](0x0, d['indexOf']('#'))['toLowerCase']()['endsWith'](f));
            if (e)
                b['static']['push'](c);
            else
                d['includes']('/api/') || d['includes']('/rest/') || d['includes']('/v1/') || d['includes']('/v2/') || d['includes']('/graphql') || d['includes']('/json') || d['includes']('/xml') ? b['api']['push'](c) : b['navigation']['push'](c);
        }), b;
    }
    ['extractDynamicUrls']() {
    }
    async ['getCurrentTab']() {
        if (typeof chrome === 'undefined' || !chrome['tabs'] || !chrome['tabs']['query'])
            return Promise['reject'](new Error('chrome.tabs\x20API不可用'));
        return new Promise((a, b) => {
            chrome['tabs']['query']({
                'active': !![],
                'currentWindow': !![]
            }, tabs => {
                chrome['runtime']['lastError'] ? b(new Error(chrome['runtime']['lastError']['message'])) : a(tabs[0x0]);
            });
        });
    }
}
const extractor = new URLPathExtractor();
extractor['extractAllUrls'](), chrome['runtime']['onMessage']['addListener']((a, b, c) => {
    if (a['action'] === 'getUrls') {
        const d = window['location']['href'];
        if (typeof SpecialPageHandler !== 'undefined') {
            const e = SpecialPageHandler;
            if (e['isSpecialPage'](d)) {
                c({
                    'isSpecialPage': !![],
                    'error': e['getSpecialPageMessage'](d)
                });
                return;
            }
        } else {
            const f = [
                    'chrome://',
                    'edge://',
                    'about:',
                    'file://',
                    'data:'
                ], g = f['some'](h => d['startsWith'](h));
            if (g) {
                c({
                    'isSpecialPage': !![],
                    'error': '当前页面不支持URL提取'
                });
                return;
            }
        }
        return c({
            'urls': extractor['extractAllUrls'](),
            'categorizedUrls': extractor['categorizeUrls']()
        }), !![];
    }
});