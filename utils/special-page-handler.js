// utils/special-page-handler.js - 统一处理特殊页面的识别和消息提示

// 预编译正则表达式以提高性能
const specialPageRegex = /^(chrome:\/\/|edge:\/\/|opera:\/\/|brave:\/\/|vivaldi:\/\/|firefox:\/\/|safari:\/\/|about:|chrome-extension:\/\/|moz-extension:\/\/|file:\/\/|data:)/;

// 检查是否已经存在SpecialPageHandler，如果不存在才定义
if (typeof SpecialPageHandler === 'undefined') {
  /**
   * 特殊页面处理器类
   */
  class SpecialPageHandler {
    /**
     * 构造函数
     */
    constructor() {
      // 浏览器内置页面配置
      this.browserPages = new Map([
        ['chrome://', '这是Chrome浏览器内置页面，无法提取URL'],
        ['edge://', '这是Edge浏览器内置页面，无法提取URL'],
        ['opera://', '这是Opera浏览器内置页面，无法提取URL'],
        ['brave://', '这是Brave浏览器内置页面，无法提取URL'],
        ['vivaldi://', '这是Vivaldi浏览器内置页面，无法提取URL'],
        ['firefox://', '这是Firefox浏览器内置页面，无法提取URL'],
        ['safari://', '这是Safari浏览器内置页面，无法提取URL'],
        ['about:', '这是浏览器关于页面，无法提取URL']
      ]);
      
      // 特殊页面类型配置
      this.specialPageTypes = [
        { 
          check: (url) => specialPageRegex.test(url),
          message: (url) => {
            // 使用循环查找匹配的前缀
            for (const [prefix, message] of this.browserPages) {
              if (url.startsWith(prefix)) {
                return message;
              }
            }
            // 如果没有找到特定的浏览器页面，返回通用消息
            if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
              return '这是扩展页面，无法提取URL';
            } else if (url.startsWith('file://')) {
              return '这是本地文件页面，无法提取URL';
            } else if (url.startsWith('data:')) {
              return '这是数据URL页面，无法提取URL';
            }
            return '这是浏览器内置页面，无法提取URL';
          }
        }
      ];
    }

    /**
     * 检查是否为特殊页面
     * @param {string} url - 页面URL
     * @returns {boolean} 是否为特殊页面
     */
    isSpecialPage(url) {
      try {
        // 使用预编译的正则表达式快速检查
        if (!specialPageRegex.test(url)) {
          return false;
        }
        
        // 对于匹配的URL，使用详细检查
        return this.specialPageTypes.some(type => type.check(url));
      } catch (error) {
        console.error('Error in isSpecialPage:', error, 'URL:', url);
        // 出错时默认不视为特殊页面，以免阻止正常页面的URL提取
        return false;
      }
    }

    /**
     * 根据页面URL返回相应的友好错误提示信息
     * @param {string} url - 页面URL
     * @returns {string} 友好错误提示信息
     */
    getSpecialPageMessage(url) {
      try {
        for (const type of this.specialPageTypes) {
          if (type.check(url)) {
            return type.message(url);
          }
        }
        
        return '此页面无法提取URL';
      } catch (error) {
        console.error('Error in getSpecialPageMessage:', error, 'URL:', url);
        // 出错时返回默认错误信息
        return '页面类型识别出错，无法提取URL';
      }
    }
  }

  // 创建单例实例
  const specialPageHandler = new SpecialPageHandler();

  // 导出函数
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = specialPageHandler;
  } else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.SpecialPageHandler = specialPageHandler;
  }
}