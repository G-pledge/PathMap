class URLExtractorPopup {
    constructor() {
        this['urls'] = [], this['filteredUrls'] = [], this['activeTab'] = 'api', this['sensitiveInfo'] = [], this['init']();
    }
    ['init']() {
        this['urlList'] = document['getElementById']('urlList'), this['searchInput'] = document['getElementById']('searchInput'), this['methodFilter'] = document['getElementById']('methodFilter'), this['copyAllBtn'] = document['getElementById']('copyAllBtn'), this['exportBtn'] = document['getElementById']('exportBtn'), this['themeToggleBtn'] = document['getElementById']('themeToggleBtn'), this['statusText'] = document['getElementById']('statusText'), this['copyOption'] = document['getElementById']('copyOption'), this['modal'] = document['getElementById']('urlDetailModal'), this['modalContent'] = document['getElementById']('urlDetailContent'), this['closeModalBtn'] = document['querySelector']('.modal\x20.close');
        if (!this['urlList']) {
            console['error']('无法找到URL列表元素');
            return;
        }
        if (!this['modal'] || !this['modalContent']) {
            console['error']('无法找到模态框元素');
            return;
        }
        if (!this['closeModalBtn']) {
            console['error']('无法找到模态框关闭按钮');
            return;
        }
        if (this['copyOption']) {
            const a = localStorage['getItem']('copyOption') || 'full';
            this['copyOption']['value'] = a;
        }
        this['searchInput'] && this['searchInput']['addEventListener']('input', () => this['filterUrls']()['catch'](console['error'])), this['methodFilter'] && this['methodFilter']['addEventListener']('change', () => this['filterUrls']()['catch'](console['error'])), this['copyAllBtn'] && this['copyAllBtn']['addEventListener']('click', () => this['copyAllUrls']()['catch'](console['error'])), this['copyOption'] && this['copyOption']['addEventListener']('change', () => {
            localStorage['setItem']('copyOption', this['copyOption']['value']);
        }), document['querySelectorAll']('.tab-btn')['forEach'](b => {
            b['addEventListener']('click', c => {
                const d = c['target']['dataset']['tab'];
                this['switchTab'](d);
            });
        }), this['exportBtn'] && this['exportBtn']['addEventListener']('click', () => this['exportUrls']()), this['closeModalBtn']['addEventListener']('click', () => this['closeModal']()), this['modal']['addEventListener']('click', b => {
            b['target'] === this['modal'] && this['closeModal']();
        }), this['fetchUrls'](), this['loadSensitiveRules']()['then'](() => {
            this['detectSensitiveInfo']();
        })['catch'](console['error']);
    }
    async ['loadSensitiveRules']() {
        try {
            const a = await fetch(chrome['runtime']['getURL']('rules.json'));
            this['sensitiveRules'] = await a['json']();
        } catch (b) {
            console['error']('加载敏感信息规则失败:', b), this['sensitiveRules'] = [];
        }
    }
    ['isStaticAsset'](a) {
        const b = a['url'], c = b['toLowerCase'](), d = [
                '.css',
                '.js',
                '.png',
                '.jpg',
                '.jpeg',
                '.gif',
                '.svg',
                '.woff',
                '.woff2',
                '.ttf',
                '.eot',
                '.ico',
                '.webp',
                '.bmp',
                '.tiff',
                '.tif',
                '.raw',
                '.avif',
                '.apng',
                '.gifv',
                '.flv',
                '.mkv',
                '.mov',
                '.avi',
                '.wmv',
                '.mp3',
                '.wav',
                '.ogg',
                '.aac',
                '.otf',
                '.fon',
                '.ps1',
                '.psd',
                '.ai',
                '.eps',
                '.pdf',
                '.doc',
                '.docx',
                '.xls',
                '.xlsx',
                '.ppt',
                '.pptx',
                '.txt',
                '.rtf',
                '.json',
                '.csv',
                '.tsv'
            ];
        return d['some'](e => c['includes'](e)) || c['startsWith']('data:image');
    }
    async ['detectSensitiveInfo']() {
        if (!this['sensitiveRules'] || this['sensitiveRules']['length'] === 0x0) {
            console['log']('没有加载敏感信息规则');
            return;
        }
        try {
            const [a] = await chrome['tabs']['query']({
                'active': !![],
                'currentWindow': !![]
            });
            console['log']('当前标签页:', a['url']);
            if (a['url']['startsWith']('chrome://') || a['url']['startsWith']('about:') || a['url']['startsWith']('edge://') || a['url']['startsWith']('file://') || a['url']['startsWith']('data:')) {
                console['log']('特殊页面，跳过敏感信息检测');
                return;
            }
            const b = await chrome['scripting']['executeScript']({
                'target': { 'tabId': a['id'] },
                'func': c => {
                    const d = [], e = document['body']['innerText'];
                    c['forEach'](g => {
                        try {
                            const h = new RegExp(g['Rule'], 'g'), i = e['match'](h);
                            i && i['forEach'](j => {
                                d['push']({
                                    'type': g['ExtraTag'] ? g['ExtraTag'][0x0] : '敏感信息',
                                    'content': j,
                                    'source': 'page_content'
                                });
                            });
                        } catch (j) {
                            console['error']('规则执行错误:', j);
                        }
                    });
                    const f = document['querySelectorAll']('script:not([src])');
                    return f['forEach'](g => {
                        c['forEach'](h => {
                            try {
                                const i = new RegExp(h['Rule'], 'g'), j = g['textContent']['match'](i);
                                j && j['forEach'](k => {
                                    d['push']({
                                        'type': h['ExtraTag'] ? h['ExtraTag'][0x0] : '敏感信息',
                                        'content': k,
                                        'source': 'inline_script'
                                    });
                                });
                            } catch (k) {
                                console['error']('脚本规则执行错误:', k);
                            }
                        });
                    }), d;
                },
                'args': [this['sensitiveRules']]
            });
            this['sensitiveInfo'] = b[0x0]?.['result'] || [], this['activeTab'] === 'sensitive' && this['renderSensitiveInfo']();
        } catch (c) {
            console['error']('敏感信息检测失败:', c);
        }
    }
    async ['fetchUrls']() {
        try {
            if (!chrome['tabs'] || typeof chrome['tabs']['query'] !== 'function')
                throw new Error('浏览器扩展API不可用，请检查扩展权限设置');
            const [a] = await chrome['tabs']['query']({
                'active': !![],
                'currentWindow': !![]
            });
            if (!a)
                throw new Error('无法获取当前标签页信息');
            this['currentDomain'] = new URL(a['url'])['origin'];
            let b = ![], c = '当前页面不支持URL提取';
            try {
                if (typeof SpecialPageHandler !== 'undefined') {
                    const f = SpecialPageHandler;
                    b = f['isSpecialPage'](a['url']), b && (c = f['getSpecialPageMessage'](a['url']));
                } else {
                    const g = [
                        'chrome://',
                        'edge://',
                        'about:',
                        'file://',
                        'data:'
                    ];
                    b = g['some'](h => a['url']['startsWith'](h)), b && (c = '此页面为特殊页面，无法提取URL');
                }
            } catch (h) {
                console['warn']('特殊页面检查出错:', h);
                const i = [
                    'chrome://',
                    'edge://',
                    'about:',
                    'file://',
                    'data:'
                ];
                b = i['some'](j => a['url']['startsWith'](j)), b && (c = '此页面为特殊页面，无法提取URL');
            }
            if (b) {
                this['urls'] = [], this['categorizedUrls'] = {}, this['filteredUrls'] = [], this['renderSpecialPageMessage'](c);
                return;
            }
            const d = await Promise['race']([
                chrome['tabs']['sendMessage'](a['id'], { 'action': 'getUrls' }),
                new Promise((j, k) => setTimeout(() => k(new Error('获取数据超时')), 0x1388))
            ]);
            if (d && d['isSpecialPage'])
                throw new Error(d['error']);
            this['urls'] = d['urls'] || [], this['categorizedUrls'] = d['categorizedUrls'] || {}, this['filteredUrls'] = [...this['urls']], await this['filterUrls']();
            const e = await this['getFilteredUrlCount']();
            this['updateStatus']('找到\x20' + e + '\x20个路径');
        } catch (j) {
            console['error']('获取URL数据失败:', j), this['updateStatus']('获取数据失败:\x20' + j['message']);
            let k = j['message'], l = '请在普通网页上使用此功能';
            k['includes']('不支持URL提取') && (l = '此页面为特殊页面，无法提取URL'), k['includes']('超时') && (k = '获取数据超时', l = '请确保页面已完全加载后重试'), k['includes']('API不可用') && (l = '请检查扩展权限设置或重新加载扩展'), this['urlList']['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<li\x20class=\x22url-item\x20error\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-path\x22\x20style=\x22color:\x20#f44336;\x22>错误:\x20' + this['escapeHtml'](k) + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-details\x22>' + l + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</li>\x0a\x20\x20\x20\x20\x20\x20\x20\x20';
        }
    }
    async ['filterUrls']() {
        if (this['activeTab'] === 'sensitive') {
            this['renderSensitiveInfo']();
            return;
        }
        const a = this['searchInput']['value']['toLowerCase'](), b = this['methodFilter']['value'];
        let c = this['urls']['filter'](g => {
            if (g['url']['startsWith']('data:image'))
                return ![];
            try {
                const k = new URL(g['url'], this['currentDomain'])['origin'];
                if (k !== this['currentDomain'])
                    return ![];
            } catch (l) {
                return console['warn']('无法解析URL:', g['url'], '错误详情:', l), ![];
            }
            const h = b === 'all' || g['method'] === b, i = !a || (g['url'] + '\x20' + g['params'])['toLowerCase']()['includes'](a);
            let j = !![];
            if (this['activeTab'] === 'api')
                j = !this['isStaticAsset'](g);
            else
                this['activeTab'] === 'static' && (j = this['isStaticAsset'](g));
            return i && h && j;
        });
        const d = [], e = [];
        c['forEach'](g => {
            this['isStaticAsset'](g) ? d['push'](g) : e['push'](g);
        }), this['categorizedUrls'] = {
            'staticAssets': d,
            'others': e
        }, this['filteredUrls'] = c, this['renderUrlList']();
        const f = this['filteredUrls']['length'];
        this['updateStatus']('找到\x20' + f + '\x20个路径');
    }
    ['switchTab'](a) {
        this['activeTab'] = a, document['querySelectorAll']('.tab-btn')['forEach'](c => {
            c['classList']['remove']('active');
        }), document['querySelector']('[data-tab=\x22' + a + '\x22]')['classList']['add']('active');
        const b = this['urls']['length'] === 0x0 && (!this['categorizedUrls']['staticAssets'] || this['categorizedUrls']['staticAssets']['length'] === 0x0) && (!this['categorizedUrls']['others'] || this['categorizedUrls']['others']['length'] === 0x0);
        if (a === 'sensitive')
            this['urlList'] && (this['urlList']['innerHTML'] = ''), this['methodFilter'] && (this['methodFilter']['style']['display'] = 'none'), this['copyOption'] && (this['copyOption']['style']['display'] = 'none'), this['searchInput'] && (this['searchInput']['value'] = ''), this['renderSensitiveInfo']();
        else
            b ? this['renderSpecialPageMessage']('此页面为特殊页面，无法提取URL') : (this['methodFilter'] && (this['methodFilter']['style']['display'] = 'block'), this['copyOption'] && (this['copyOption']['style']['display'] = 'block'), this['filterUrls']()['catch'](console['error']));
    }
    ['renderUrlList']() {
        if (!this['urlList']) {
            console['error']('无法找到URL列表元素');
            return;
        }
        this['urlList']['innerHTML'] = '';
        if (this['categorizedUrls']['others'] && this['categorizedUrls']['others']['length'] > 0x0) {
            const c = document['createElement']('li');
            c['className'] = 'url-group-header';
            const d = document['createElement']('span');
            d['textContent'] = 'API', c['appendChild'](d);
            const e = document['createElement']('button');
            e['className'] = 'copy-all-group-btn', e['textContent'] = '📋', e['title'] = '复制所有API路径', e['addEventListener']('click', () => this['copyAllAPIUrls']()['catch'](console['error'])), c['appendChild'](e), this['urlList']['appendChild'](c), this['categorizedUrls']['others']['forEach']((f, g) => {
                const h = document['createElement']('li');
                h['className'] = 'url-item', h['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-path-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-path\x22>' + this['escapeHtml'](f['url']) + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-details\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22url-method\x22>' + f['method'] + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22url-params\x22>' + this['escapeHtml'](f['params'] || '') + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20class=\x22copy-btn\x22\x20data-index=\x22' + g + '\x22>复制</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20', h['addEventListener']('click', j => {
                    if (j['target']['classList']['contains']('copy-btn'))
                        return;
                    this['showUrlDetails'](f);
                });
                const i = h['querySelector']('.copy-btn');
                i && i['addEventListener']('click', () => this['copyUrl'](f)), this['urlList']['appendChild'](h);
            });
        }
        if (this['categorizedUrls']['staticAssets'] && this['categorizedUrls']['staticAssets']['length'] > 0x0) {
            const f = document['createElement']('li');
            f['className'] = 'url-group-header';
            const g = document['createElement']('span');
            g['textContent'] = '静态资源', f['appendChild'](g);
            const h = document['createElement']('button');
            h['className'] = 'copy-all-group-btn', h['textContent'] = '📋', h['title'] = '复制所有静态资源路径', h['addEventListener']('click', () => this['copyAllStaticUrls']()['catch'](console['error'])), f['appendChild'](h), this['urlList']['appendChild'](f), this['categorizedUrls']['staticAssets']['forEach']((i, j) => {
                const k = document['createElement']('li');
                k['className'] = 'url-item', k['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-path\x22>' + this['escapeHtml'](i['url']) + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-details\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22url-method\x22>' + i['method'] + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22url-params\x22>' + this['escapeHtml'](i['params'] || '') + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20class=\x22copy-btn\x22\x20data-index=\x22' + j + '\x22>复制</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20', k['addEventListener']('click', m => {
                    if (m['target']['classList']['contains']('copy-btn'))
                        return;
                    this['showUrlDetails'](i);
                });
                const l = k['querySelector']('.copy-btn');
                l && l['addEventListener']('click', () => this['copyUrl'](i)), this['urlList']['appendChild'](k);
            });
        }
        const a = this['categorizedUrls']['others'] && this['categorizedUrls']['others']['length'] > 0x0, b = this['categorizedUrls']['staticAssets'] && this['categorizedUrls']['staticAssets']['length'] > 0x0;
        if (!a && !b) {
            const i = document['createElement']('li');
            i['className'] = 'url-item';
            let j = '未找到API路径';
            this['activeTab'] === 'static' && (j = '未找到静态资源路径'), i['textContent'] = j, this['urlList']['appendChild'](i);
        }
    }
    ['renderSensitiveInfo']() {
        this['searchInput'] && (this['searchInput']['value'] = '');
        this['methodFilter'] && (this['methodFilter']['style']['display'] = 'none');
        this['copyOption'] && (this['copyOption']['style']['display'] = 'none');
        if (this['sensitiveInfo']['length'] === 0x0) {
            const a = document['createElement']('li');
            a['className'] = 'url-item', a['textContent'] = '未检测到敏感信息', this['urlList']['appendChild'](a), this['updateStatus']('未检测到敏感信息');
            return;
        }
        this['urlList']['innerHTML'] = '', this['sensitiveInfo']['forEach'](b => {
            const c = document['createElement']('li');
            c['className'] = 'url-item', c['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-info\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22url-type-badge\x22>' + b['type'] + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22url-text\x22>' + b['content'] + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20class=\x22copy-btn\x22\x20title=\x22复制敏感信息\x22>复制</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20';
            const d = c['querySelector']('.copy-btn');
            d['addEventListener']('click', () => {
                navigator['clipboard']['writeText'](b['content'])['then'](() => {
                    this['showToast']('敏感信息已复制到剪贴板');
                })['catch'](e => {
                    console['error']('复制失败:', e), this['updateStatus']('复制失败');
                });
            }), this['urlList']['appendChild'](c);
        }), this['updateStatus']('检测到\x20' + this['sensitiveInfo']['length'] + '\x20个敏感信息');
    }
    ['renderSpecialPageMessage'](a) {
        if (!this['urlList']) {
            console['error']('无法找到URL列表元素');
            return;
        }
        this['urlList']['innerHTML'] = '';
        const b = document['createElement']('li');
        if (b) {
            b['className'] = 'url-item';
            const c = document['createElement']('div');
            c && (c['className'] = 'url-path', c['style']['color'] = '#FF9800', c['textContent'] = '特殊页面提示', b['appendChild'](c));
            const d = document['createElement']('div');
            d && (d['className'] = 'url-details', d['textContent'] = this['escapeHtml'](a), b['appendChild'](d));
            const e = document['createElement']('div');
            e && (e['className'] = 'url-details', e['style']['marginTop'] = '10px', e['style']['fontStyle'] = 'italic', e['textContent'] = '请在普通网页上使用此扩展功能', b['appendChild'](e)), this['urlList'] ? this['urlList']['appendChild'](b) : console['error']('URL列表元素在添加特殊页面项目时已不存在');
        }
        this['updateStatus']('特殊页面无法提取URL');
    }
    ['getTextToCopy'](a) {
        const b = this['copyOption'] ? this['copyOption']['value'] : 'full';
        switch (b) {
        case 'path':
            try {
                const c = new URL(a['url']);
                return c['pathname'];
            } catch (d) {
                try {
                    const f = a['url']['indexOf']('?');
                    if (f !== -0x1)
                        return a['url']['substring'](0x0, f);
                    return a['url'];
                } catch (g) {
                    return a['url'];
                }
            }
        case 'full':
        default:
            if (a['params'] && !a['url']['includes']('?'))
                return a['url'] + '?' + a['params'];
            return a['url'];
        }
    }
    async ['copyTextToClipboard'](a, b = '已复制到剪贴板') {
        try {
            await navigator['clipboard']['writeText'](a), this['updateStatus'](b), setTimeout(async () => {
                const c = await this['getFilteredUrlCount']();
                this['updateStatus']('找到\x20' + c + '\x20个路径');
            }, 0xbb8);
        } catch (c) {
            console['error']('复制失败:', c), this['updateStatus']('复制失败');
        }
    }
    ['copyUrl'](a) {
        const b = this['getTextToCopy'](a);
        this['copyTextToClipboard'](b);
    }
    async ['copyAllAPIUrls']() {
        if (!this['categorizedUrls'] || !this['categorizedUrls']['others'] || this['categorizedUrls']['others']['length'] === 0x0) {
            this['updateStatus']('没有可复制的API路径');
            return;
        }
        let a = '';
        try {
            const tabs = await this['getCurrentTab']();
            if (tabs && tabs['url']) {
                const e = new URL(tabs['url']);
                a = e['origin'];
            } else {
                const f = new URL(this['urls'][0x0]['url']);
                a = f['origin'];
            }
        } catch (g) {
            console['error']('获取当前标签页URL失败:', g);
            const h = new URL(this['urls'][0x0]['url']);
            a = h['origin'];
        }
        const b = this['categorizedUrls']['others']['filter'](i => i['url']['startsWith'](a)), c = this['deduplicateUrlsForCopy'](b), d = c['map'](i => this['getTextToCopy'](i))['join']('\x0a');
        this['copyTextToClipboard'](d, '已复制\x20' + c['length'] + '\x20个API路径到剪贴板');
    }
    async ['copyAllStaticUrls']() {
        if (!this['categorizedUrls'] || !this['categorizedUrls']['staticAssets'] || this['categorizedUrls']['staticAssets']['length'] === 0x0) {
            this['updateStatus']('没有可复制的静态资源路径');
            return;
        }
        let a = '';
        try {
            const tabs = await this['getCurrentTab']();
            if (tabs && tabs['url']) {
                const e = new URL(tabs['url']);
                a = e['origin'];
            } else {
                const f = new URL(this['urls'][0x0]['url']);
                a = f['origin'];
            }
        } catch (g) {
            console['error']('获取当前标签页URL失败:', g);
            const h = new URL(this['urls'][0x0]['url']);
            a = h['origin'];
        }
        const b = this['categorizedUrls']['staticAssets']['filter'](i => i['url']['startsWith'](a)), c = this['deduplicateUrlsForCopy'](b), d = c['map'](i => this['getTextToCopy'](i))['join']('\x0a');
        this['copyTextToClipboard'](d, '已复制\x20' + c['length'] + '\x20个静态资源路径到剪贴板');
    }
    ['deduplicateUrlsForCopy'](a) {
        const b = new Set();
        return a['filter'](c => {
            const d = document['getElementById']('copyOption')['value'];
            try {
                const f = new URL(c['url']);
                let g;
                d === 'path' ? g = f['pathname'] + (c['params'] ? '|' + c['params'] : '') : g = c['url'] + (c['params'] ? '|' + c['params'] : '');
                if (b['has'](g))
                    return ![];
                return b['add'](g), !![];
            } catch (h) {
                const i = c['url'] + (c['params'] ? '|' + c['params'] : '');
                if (b['has'](i))
                    return ![];
                return b['add'](i), !![];
            }
        });
    }
    async ['copyAllUrls']() {
        if (this['urls']['length'] === 0x0) {
            this['updateStatus']('没有可复制的路径');
            return;
        }
        let a = '';
        try {
            const tabs = await this['getCurrentTab']();
            if (tabs && tabs['url']) {
                const i = new URL(tabs['url']);
                a = i['origin'];
            } else {
                const j = new URL(this['urls'][0x0]['url']);
                a = j['origin'];
            }
        } catch (k) {
            console['error']('获取当前标签页URL失败:', k);
            const l = new URL(this['urls'][0x0]['url']);
            a = l['origin'];
        }
        const b = [], c = [];
        this['urls']['forEach'](m => {
            if (m['url']['startsWith'](a)) {
                let n = !![];
                if (this['activeTab'] === 'api')
                    n = !this['isStaticAsset'](m);
                else
                    this['activeTab'] === 'static' && (n = this['isStaticAsset'](m));
                n && (this['isStaticAsset'](m) ? b['push'](m) : c['push'](m));
            }
        });
        const d = this['deduplicateUrlsForCopy'](c), e = this['deduplicateUrlsForCopy'](b), f = [
                ...d,
                ...e
            ], g = f['map'](m => this['getTextToCopy'](m))['join']('\x0a');
        let h = '已复制\x20' + f['length'] + '\x20个API路径到剪贴板';
        this['activeTab'] === 'static' && (h = '已复制\x20' + f['length'] + '\x20个静态资源路径到剪贴板'), this['copyTextToClipboard'](g, h);
    }
    ['exportUrls']() {
        this['showExportDialog']();
    }
    ['showExportDialog']() {
        const a = document['getElementById']('exportModal');
        if (a) {
            a['style']['display'] = 'block';
            return;
        }
        const b = document['createElement']('div');
        b['id'] = 'exportModal', b['className'] = 'modal', b['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22modal-content\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22close\x22>&times;</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h2>选择导出格式</h2>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22export-options\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20id=\x22exportJson\x22\x20class=\x22export-option-btn\x22>JSON格式</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20id=\x22exportCsv\x22\x20class=\x22export-option-btn\x22>CSV格式</button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20', document['body']['appendChild'](b);
        const c = b['querySelector']('.close');
        c && c['addEventListener']('click', () => {
            b['style']['display'] = 'none';
        });
        b['addEventListener']('click', f => {
            f['target'] === b && (b['style']['display'] = 'none');
        });
        const d = b['querySelector']('#exportJson'), e = b['querySelector']('#exportCsv');
        d && d['addEventListener']('click', () => {
            this['doExport']('json'), b['style']['display'] = 'none';
        }), e && e['addEventListener']('click', () => {
            this['doExport']('csv'), b['style']['display'] = 'none';
        }), b['style']['display'] = 'block';
    }
    ['doExport'](a) {
        let b, c, d;
        const e = new URL(this['urls'][0x0]['url']), f = e['origin'], g = [], h = [];
        this['urls']['forEach'](j => {
            if (j['url']['startsWith'](f)) {
                let k = !![];
                if (this['activeTab'] === 'api')
                    k = !this['isStaticAsset'](j);
                else
                    this['activeTab'] === 'static' && (k = this['isStaticAsset'](j));
                k && (this['isStaticAsset'](j) ? g['push'](j) : h['push'](j));
            }
        });
        const i = [
            ...h,
            ...g
        ];
        switch (a['toLowerCase']()) {
        case 'json':
            b = 'urls.json', c = JSON['stringify'](i, null, 0x2), d = 'application/json';
            break;
        case 'csv':
            b = 'urls.csv', c = this['urlsToCSV'](i), d = 'text/csv';
            break;
        default:
            this['updateStatus']('不支持的导出格式');
            return;
        }
        this['downloadFile'](b, c, d), this['updateStatus']('已导出\x20' + i['length'] + '\x20个路径到\x20' + b);
    }
    ['urlsToCSV'](a) {
        let b = 'URL,Parameters\x0a';
        return a['forEach'](c => {
            const d = this['escapeCSVField'](c['url'] || ''), e = this['escapeCSVField'](c['params'] || '');
            b += d + ',' + e + '\x0a';
        }), b;
    }
    ['escapeCSVField'](a) {
        if (a['includes'](',') || a['includes']('\x22') || a['includes']('\x0a'))
            return '\x22' + a['replace'](/"/g, '\x22\x22') + '\x22';
        return a;
    }
    ['downloadFile'](b, c, d) {
        const e = new Blob([c], { 'type': d }), f = URL['createObjectURL'](e), g = document['createElement']('a');
        if (!g) {
            console['error']('无法创建下载元素');
            return;
        }
        g['href'] = f, g['download'] = b, document['body'] ? (document['body']['appendChild'](g), g['click'](), setTimeout(() => {
            document['body']['removeChild'](g), URL['revokeObjectURL'](f);
        }, 0x64)) : console['error']('无法找到document.body元素');
    }
    ['showUrlDetails'](a) {
        const b = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-label\x22>完整URL:</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-value\x22\x20id=\x22detail-url\x22>' + this['escapeHtml'](a['url']) + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-label\x22>请求方法:</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-value\x22\x20id=\x22detail-method\x22>' + this['escapeHtml'](a['method']) + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-label\x22>参数:</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22url-detail-value\x22\x20id=\x22detail-params\x22>' + this['escapeHtml'](a['params'] || '无') + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20';
        this['modalContent']['innerHTML'] = b, this['modal']['style']['display'] = 'block', setTimeout(() => {
            const c = this['modalContent']['querySelectorAll']('.url-detail-value');
            c['forEach'](d => {
                d['scrollTop'] = 0x0;
            });
        }, 0x0);
    }
    ['closeModal']() {
        this['modal']['style']['display'] = 'none';
    }
    async ['getFilteredUrlCount']() {
        if (this['filteredUrls']['length'] === 0x0)
            return 0x0;
        try {
            const [a] = await chrome['tabs']['query']({
                'active': !![],
                'currentWindow': !![]
            });
            if (!a) {
                const d = new URL(this['filteredUrls'][0x0]['url']), f = d['origin'], g = this['filteredUrls']['filter'](h => h['url']['startsWith'](f))['length'];
                return g;
            }
            const b = new URL(a['url'])['origin'], c = this['filteredUrls']['filter'](h => h['url']['startsWith'](b))['length'];
            return c;
        } catch (h) {
            return console['error']('获取域名失败:', h), this['filteredUrls']['length'];
        }
    }
    ['showToast'](a) {
        this['updateStatus'](a);
    }
    ['updateStatus'](a) {
        let b = a;
        if (this['urls']['length'] > 0x0) {
            if (this['activeTab'] === 'api')
                b = a['replace']('路径', 'API路径');
            else
                this['activeTab'] === 'static' && (b = a['replace']('路径', '静态资源路径'));
        }
        this['statusText']['textContent'] = b;
    }
    ['escapeHtml'](a) {
        if (!a)
            return '';
        return a['replace'](/&/g, '&amp;')['replace'](/</g, '&lt;')['replace'](/>/g, '&gt;')['replace'](/"/g, '&quot;')['replace'](/'/g, '&#039;');
    }
}
document['addEventListener']('DOMContentLoaded', () => {
    new URLExtractorPopup();
});