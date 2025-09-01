const fallbackSpecialPageHandler = {
    'isSpecialPage': function (a) {
        const b = new RegExp('^(chrome://|edge://|opera://|brave://|vivaldi://|firefox://|safari://|about:|chrome-extension://|moz-extension://|file://|data:)');
        return b['test'](a);
    },
    'getSpecialPageMessage': function (a) {
        return '无法提取此页面的URL';
    }
};
let specialPageHandler = fallbackSpecialPageHandler;
if (typeof SpecialPageHandler === 'undefined')
    try {
        import(chrome['runtime']['getURL']('utils/special-page-handler.js'))['then'](() => {
            typeof SpecialPageHandler !== 'undefined' && (specialPageHandler = SpecialPageHandler);
        })['catch'](a => {
            console['warn']('动态加载SpecialPageHandler失败\uFF0C使用简化版本:', a);
        });
    } catch (c) {
        console['warn']('动态导入不支持或失败，使用简化版本:', c);
    }
else
    specialPageHandler = SpecialPageHandler;
function isSpecialPage(a) {
    if (specialPageHandler && typeof specialPageHandler['isSpecialPage'] === 'function')
        return specialPageHandler['isSpecialPage'](a);
    return fallbackSpecialPageHandler['isSpecialPage'](a);
}
function getSpecialPageMessage(a) {
    if (specialPageHandler && typeof specialPageHandler['getSpecialPageMessage'] === 'function')
        return specialPageHandler['getSpecialPageMessage'](a);
    return fallbackSpecialPageHandler['getSpecialPageMessage'](a);
}
window['SpecialPages'] = {
    'isSpecialPage': isSpecialPage,
    'getSpecialPageMessage': getSpecialPageMessage
};