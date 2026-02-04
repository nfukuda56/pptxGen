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
    let currentVerticalBlock = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 空行は無視
        if (line === '') {
            continue;
        }

        // 改ページ（新スライド）: ---
        if (SYNTAX.PAGE_BREAK.test(line)) {
            // 現在の縦配置ブロックを確定
            finalizeVerticalBlock(currentSlide, currentVerticalBlock);
            currentVerticalBlock = null;

            // 現在のスライドを保存し、新しいスライドを開始
            if (hasContent(currentSlide)) {
                slides.push(currentSlide);
            }
            currentSlide = createEmptySlide();
            continue;
        }

        // 見出し: #テキスト
        const headingMatch = line.match(SYNTAX.HEADING);
        if (headingMatch) {
            // 現在の縦配置ブロックを確定
            finalizeVerticalBlock(currentSlide, currentVerticalBlock);
            currentVerticalBlock = null;

            currentSlide.heading = headingMatch[1].trim();
            continue;
        }

        // 横配置テキストボックス: --[aaa,bbb,ccc]
        const horizontalMatch = line.match(SYNTAX.HORIZONTAL_BOXES);
        if (horizontalMatch) {
            // 現在の縦配置ブロックを確定
            finalizeVerticalBlock(currentSlide, currentVerticalBlock);
            currentVerticalBlock = null;

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

        // 縦配置テキストボックス開始: --
        if (SYNTAX.VERTICAL_BOX.test(line)) {
            // 現在の縦配置ブロックを確定
            finalizeVerticalBlock(currentSlide, currentVerticalBlock);

            // 新しい縦配置ブロックを開始
            currentVerticalBlock = {
                type: 'vertical',
                texts: []
            };
            continue;
        }

        // 通常のテキスト行
        if (currentVerticalBlock) {
            // 縦配置ブロック内のテキストとして追加（改行は空白で連結）
            if (currentVerticalBlock.currentText === undefined) {
                currentVerticalBlock.currentText = line;
            } else {
                currentVerticalBlock.currentText += ' ' + line;
            }
        }
        // 縦配置ブロック外のテキストは無視（仕様に従う）
    }

    // 最後の縦配置ブロックを確定
    finalizeVerticalBlock(currentSlide, currentVerticalBlock);

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
 * 縦配置ブロックをスライドに追加（確定）
 * @param {Slide} slide
 * @param {ContentBlock|null} block
 */
function finalizeVerticalBlock(slide, block) {
    if (block && block.currentText) {
        slide.blocks.push({
            type: 'vertical',
            texts: [block.currentText]
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
