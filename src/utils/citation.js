/**
 * 处理单个作者的名字格式
 * @param {String} author 作者全名
 * @param {Boolean} invert 是否姓在前，名在后 (如 Long, Kunkun)
 * @param {Boolean} abbreviate 名是否需要缩写 (如 Kunkun 变为 K.)
 * @returns {String} 处理后的名字
 */
export const processAuthorName = (author, invert, abbreviate) => {
    if (!author) return '';
    const parts = author.trim().split(/\s+/);
    if (parts.length <= 1) return author;

    const lastName = parts.pop(); // 提取姓氏 (默认最后一部分为姓)
    let firstNames = parts; // 剩余部分为名列表

    // 如果需要缩写名，将 ["Kunkun", "Michael"] 变为 ["K.", "M."]
    if (abbreviate) {
        firstNames = firstNames.map(name => name.charAt(0).toUpperCase() + '.');
    }

    const firstNameStr = firstNames.join(' ');

    if (invert) {
        return `${lastName}, ${firstNameStr}`;
    } else {
        return `${firstNameStr} ${lastName}`;
    }
};

/**
 * 根据指定的格式生成文献引用文本
 * @param {Object} paper 文献对象 (包含 title, authors, pub_year, venue, doi, page_range 等)
 * @param {String} format 引用格式 ('APA', 'MLA', 'IEEE', 'Chicago', 'Harvard')
 * @returns {String} 格式化后的引用字符串
 */
export const formatPaperCitation = (paper, format) => {
    if (!paper) return '';

    const { title, authors, pub_year, venue, doi, page_range } = paper;
    const year = pub_year || 'n.d.';
    const journal = venue || 'Unknown Venue';
    const pages = page_range ? `pp. ${page_range}` : '';

    // 辅助函数：处理多作者列表的拼接
    const getAuthorsFormatted = (invert, abbreviate, useAnd = false) => {
        if (!authors || authors.length === 0) return 'Unknown Author';
        const processed = authors.map(a => processAuthorName(a, invert, abbreviate));
        if (useAnd && processed.length > 1) {
            return processed.slice(0, -1).join(', ') + ' & ' + processed.slice(-1);
        }
        return processed.join(', ');
    };

    switch (format) {
        case 'APA':
            // 规范：Long, K., & Huang, H. (2025). Title. Journal.
            return `${getAuthorsFormatted(true, true, true)} (${year}). ${title}. ${journal}.${pages ? ' ' + pages + '.' : ''}${doi ? ' https://doi.org/' + doi : ''}`;
        
        case 'MLA':
            // 规范：Long, Kunliang, and Huang, Han. "Title." Journal, 2025.
            return `${getAuthorsFormatted(true, false)}. "${title}." ${journal}, ${year}.${pages ? ' ' + pages + '.' : ''}`;
        
        case 'IEEE':
            // 规范：K. Long and H. Huang, "Title," Journal, 2025.
            return `${getAuthorsFormatted(false, true)}, "${title}," ${journal}, ${year}.${pages ? ' ' + pages + '.' : ''}${doi ? ' doi: ' + doi : ''}`;
        
        case 'Chicago':
            // 规范：Long, Kunliang. "Title." Journal (2025).
            return `${getAuthorsFormatted(true, false)}. "${title}." ${journal} (${year}).${pages ? ' ' + pages + '.' : ''}`;
        
        case 'Harvard':
            // 规范：Long, K. (2025) 'Title', Journal.
            return `${getAuthorsFormatted(true, true)} (${year}) '${title}', ${journal}.${pages ? ' ' + pages + '.' : ''}`;
        
        default:
            return '';
    }
};