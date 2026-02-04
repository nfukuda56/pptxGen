import { DEFAULT_CONFIG, ptToInch } from './config.js';

/**
 * PPTX生成クラス
 */
export class PptxBuilder {
    /**
     * @param {Object} config - 設定オブジェクト
     */
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.pptx = new PptxGenJS();
        this.pptx.layout = 'LAYOUT_16x9';
    }

    /**
     * スライドデータからPPTXを構築
     * @param {Array} slides - パース済みスライドデータ
     */
    build(slides) {
        slides.forEach(slideData => this.addSlide(slideData));
    }

    /**
     * 1スライドを追加
     * @param {Object} slideData - スライドデータ
     */
    addSlide(slideData) {
        const slide = this.pptx.addSlide();
        let currentY = this.config.headingY;

        // 見出し追加
        if (slideData.heading) {
            currentY = this.addHeading(slide, slideData.heading, currentY);
        }

        // コンテンツブロック追加
        slideData.blocks.forEach(block => {
            if (block.type === 'vertical') {
                currentY = this.addVerticalBoxes(slide, block.texts, currentY);
            } else if (block.type === 'horizontal') {
                currentY = this.addHorizontalBoxes(slide, block.texts, currentY);
            }
        });
    }

    /**
     * 見出しを追加
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     * @param {string} text - 見出しテキスト
     * @param {number} y - Y座標（インチ）
     * @returns {number} - 次のY座標
     */
    addHeading(slide, text, y) {
        const width = this.config.slideWidth - (this.config.contentPadding * 2);

        slide.addText(text, {
            x: this.config.contentPadding,
            y: y,
            w: width,
            fontSize: this.config.headingFontSize,
            fontFace: this.config.fontFace,
            bold: true,
            color: '333333',
        });

        // 見出しの高さ + 見出し下マージン
        return y + ptToInch(this.config.headingFontSize) + ptToInch(this.config.headingMarginBottom);
    }

    /**
     * 縦配置テキストボックス群を追加
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     * @param {string[]} texts - テキスト配列
     * @param {number} startY - 開始Y座標（インチ）
     * @returns {number} - 次のY座標
     */
    addVerticalBoxes(slide, texts, startY) {
        let y = startY;
        const width = this.config.slideWidth - (this.config.contentPadding * 2);

        texts.forEach(text => {
            slide.addText(text, {
                x: this.config.contentPadding,
                y: y,
                w: width,
                fontSize: this.config.bodyFontSize,
                fontFace: this.config.fontFace,
                color: '333333',
            });

            // 本文の高さ + 縦方向マージン
            y += ptToInch(this.config.bodyFontSize) + ptToInch(this.config.bodyBoxMarginVertical);
        });

        return y;
    }

    /**
     * 横配置テキストボックス群を追加
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     * @param {string[]} texts - テキスト配列
     * @param {number} startY - 開始Y座標（インチ）
     * @returns {number} - 次のY座標
     */
    addHorizontalBoxes(slide, texts, startY) {
        const count = texts.length;
        if (count === 0) return startY;

        // 横方向マージンをインチに変換
        const horizontalMarginInch = ptToInch(this.config.bodyBoxMarginHorizontal);

        // 利用可能な幅を計算
        const totalMargin = horizontalMarginInch * (count - 1);
        const availableWidth = this.config.slideWidth - (this.config.contentPadding * 2) - totalMargin;
        const boxWidth = availableWidth / count;

        let x = this.config.contentPadding;

        texts.forEach(text => {
            slide.addText(text, {
                x: x,
                y: startY,
                w: boxWidth,
                fontSize: this.config.bodyFontSize,
                fontFace: this.config.fontFace,
                color: '333333',
                align: 'center',
                valign: 'top',
            });

            x += boxWidth + horizontalMarginInch;
        });

        // 本文の高さ + 縦方向マージン（次の要素との間隔）
        return startY + ptToInch(this.config.bodyFontSize) + ptToInch(this.config.bodyBoxMarginVertical);
    }

    /**
     * PPTXファイルをダウンロード
     * @param {string} filename - ファイル名
     */
    async download(filename = 'presentation.pptx') {
        await this.pptx.writeFile({ fileName: filename });
    }
}
