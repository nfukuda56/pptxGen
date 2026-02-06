import { SYNTAX } from './config.js';

/**
 * @typedef {Object} ContentBlock
 * @property {'vertical'|'horizontal'} type - 配置タイプ
 * @property {string[]} texts - テキスト配列
 */

/**
 * @typedef {Object} Slide
 * @property {string|null} heading - 見出しテキスト
 * @property {ContentBlock[]} blocks - コンテンツブロック配列
 */

/**
 * 入力テキストをスライドデータにパース
 * 先頭3文字で行の種類を判別し、構文記号以外の行は直前の要素に空白で連結する
 * @param {string} inputText - 入力テキスト
 * @returns {Slide[]} - スライド配列
 */
export function parseText(inputText) {
    if (!inputText || inputText.trim() === '') {
        return [];
    }

    const lines = inputText.split('\n');
    const slides = [];
    let currentSlide = createEmptySlide();
    // 直前の要素を追跡（継続行の連結先）
    // { type: 'heading'|'vertical', text: string }
    let currentElement = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 空行は無視
        if (line === '') {
            continue;
        }

        // 改ページ（新スライド）: ---
        if (SYNTAX.PAGE_BREAK.test(line)) {
            finalizeElement(currentSlide, currentElement);
            currentElement = null;

            if (hasContent(currentSlide)) {
                slides.push(currentSlide);
            }
            currentSlide = createEmptySlide();
            continue;
        }

        // 見出し: --# テキスト
        const headingMatch = line.match(SYNTAX.HEADING);
        if (headingMatch) {
            finalizeElement(currentSlide, currentElement);
            currentElement = { type: 'heading', text: headingMatch[1].trim() };
            continue;
        }

        // 横配置テキストボックス: --[aaa,bbb,ccc]
        const horizontalMatch = line.match(SYNTAX.HORIZONTAL_BOXES);
        if (horizontalMatch) {
            finalizeElement(currentSlide, currentElement);
            currentElement = null;

            const items = horizontalMatch[1]
                .split(',')
                .map(item => item.trim())
                .filter(item => item !== '');

            if (items.length > 0) {
                currentSlide.blocks.push({
                    type: 'horizontal',
                    texts: items
                });
            }
            continue;
        }

        // 縦配置テキストボックス: --/ テキスト
        const verticalMatch = line.match(SYNTAX.VERTICAL_BOX);
        if (verticalMatch) {
            finalizeElement(currentSlide, currentElement);
            currentElement = { type: 'vertical', text: verticalMatch[1].trim() };
            continue;
        }

        // 継続行: 構文記号以外の行は直前の要素にスペースで連結
        if (currentElement) {
            if (currentElement.text === '') {
                currentElement.text = line;
            } else {
                currentElement.text += ' ' + line;
            }
        }
        // currentElementがnullの場合（先頭でどの構文にも属さない行）は無視
    }

    // 最後の要素を確定
    finalizeElement(currentSlide, currentElement);

    // 最後のスライドを保存
    if (hasContent(currentSlide)) {
        slides.push(currentSlide);
    }

    return slides;
}

/**
 * 空のスライドを作成
 * @returns {Slide}
 */
function createEmptySlide() {
    return {
        heading: null,
        blocks: []
    };
}

/**
 * 現在の要素をスライドに確定する
 * @param {Slide} slide
 * @param {Object|null} element - { type: 'heading'|'vertical', text: string }
 */
function finalizeElement(slide, element) {
    if (!element || element.text === '') {
        return;
    }
    if (element.type === 'heading') {
        slide.heading = element.text;
    } else if (element.type === 'vertical') {
        slide.blocks.push({
            type: 'vertical',
            texts: [element.text]
        });
    }
}

/**
 * スライドにコンテンツがあるか確認
 * @param {Slide} slide
 * @returns {boolean}
 */
function hasContent(slide) {
    return slide.heading !== null || slide.blocks.length > 0;
}
