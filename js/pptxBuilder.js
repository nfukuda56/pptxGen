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
     * 左マージンをインチで取得
     */
    getLeftPadding() {
        return ptToInch(this.config.contentPaddingLeft);
    }

    /**
     * 上マージンをインチで取得
     */
    getTopPadding() {
        return ptToInch(this.config.contentPaddingTop);
    }

    /**
     * コンテンツ領域の幅をインチで取得
     */
    getContentWidth() {
        return this.config.slideWidth - (this.getLeftPadding() * 2);
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
        let currentY = this.getTopPadding();

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
        const width = this.getContentWidth();
        const height = this.estimateTextHeight(text, this.config.headingFontSize, width);

        slide.addText(text, {
            x: this.getLeftPadding(),
            y: y,
            w: width,
            h: height,
            fontSize: this.config.headingFontSize,
            fontFace: this.config.fontFace,
            bold: true,
            color: '333333',
            valign: 'top',
        });

        // 見出しの高さ + 見出し下マージン
        return y + height + ptToInch(this.config.headingMarginBottom);
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
        const width = this.getContentWidth();

        texts.forEach(text => {
            const height = this.estimateTextHeight(text, this.config.bodyFontSize, width);

            slide.addText(text, {
                x: this.getLeftPadding(),
                y: y,
                w: width,
                h: height,
                fontSize: this.config.bodyFontSize,
                fontFace: this.config.fontFace,
                color: '333333',
                valign: 'top',
            });

            // 本文の高さ + 縦方向マージン
            y += height + ptToInch(this.config.bodyBoxMarginVertical);
        });

        return y;
    }

    /**
     * 横配置テキストボックス群を追加（折り返し対応）
     * @param {Object} slide - PptxGenJSスライドオブジェクト
     * @param {string[]} texts - テキスト配列
     * @param {number} startY - 開始Y座標（インチ）
     * @returns {number} - 次のY座標
     */
    addHorizontalBoxes(slide, texts, startY) {
        const count = texts.length;
        if (count === 0) return startY;

        const boxesPerRow = this.config.horizontalBoxesPerRow || 3;
        const horizontalMarginInch = ptToInch(this.config.bodyBoxMarginHorizontal);
        const verticalMarginInch = ptToInch(this.config.bodyBoxMarginVertical);

        // 1行あたりのボックス数に基づいて幅を計算
        const totalHMargin = horizontalMarginInch * (boxesPerRow - 1);
        const availableWidth = this.getContentWidth() - totalHMargin;
        const boxWidth = availableWidth / boxesPerRow;

        let currentY = startY;
        let rowIndex = 0;

        // テキストを行ごとに分割して処理
        while (rowIndex * boxesPerRow < count) {
            const rowStart = rowIndex * boxesPerRow;
            const rowEnd = Math.min(rowStart + boxesPerRow, count);
            const rowTexts = texts.slice(rowStart, rowEnd);

            // この行の最大高さを計算
            let maxHeight = 0;
            rowTexts.forEach(text => {
                const height = this.estimateTextHeight(text, this.config.bodyFontSize, boxWidth);
                if (height > maxHeight) maxHeight = height;
            });

            // この行のテキストボックスを配置
            let x = this.getLeftPadding();
            rowTexts.forEach(text => {
                slide.addText(text, {
                    x: x,
                    y: currentY,
                    w: boxWidth,
                    h: maxHeight,
                    fontSize: this.config.bodyFontSize,
                    fontFace: this.config.fontFace,
                    color: '333333',
                    align: 'center',
                    valign: 'top',
                });

                x += boxWidth + horizontalMarginInch;
            });

            // 次の行へ
            currentY += maxHeight + verticalMarginInch;
            rowIndex++;
        }

        return currentY;
    }

    /**
     * テキストの高さを推定
     * @param {string} text - テキスト
     * @param {number} fontSize - フォントサイズ（pt）
     * @param {number} width - テキストボックスの幅（インチ）
     * @returns {number} - 推定高さ（インチ）
     */
    estimateTextHeight(text, fontSize, width) {
        // 1文字あたりの幅を概算（日本語は全角、英数字は半角として）
        const avgCharWidthInch = ptToInch(fontSize) * 0.9;

        // テキストボックスの幅に収まる文字数
        const charsPerLine = Math.floor(width / avgCharWidthInch);

        // 必要な行数を計算
        const lines = Math.ceil(text.length / Math.max(charsPerLine, 1));

        // 行の高さ（フォントサイズ + 行間）
        const lineHeight = ptToInch(fontSize) * 1.4;

        // 最低1行分の高さを確保
        return Math.max(lines * lineHeight, lineHeight);
    }

    /**
     * PPTXファイルをダウンロード
     * @param {string} filename - ファイル名
     */
    async download(filename = 'presentation.pptx') {
        await this.pptx.writeFile({ fileName: filename });
    }
}
