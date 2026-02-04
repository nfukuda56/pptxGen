import { parseText } from './parser.js';
import { PptxBuilder } from './pptxBuilder.js';
import { UIController } from './uiController.js';

/**
 * メインアプリケーションクラス
 */
class App {
    constructor() {
        this.ui = new UIController();
        this.ui.onGenerate = (text, config) => this.generate(text, config);
    }

    /**
     * PPTX生成処理
     * @param {string} text - 入力テキスト
     * @param {Object} config - 設定オブジェクト
     */
    async generate(text, config) {
        try {
            // ボタンを無効化
            this.ui.setGenerateButtonEnabled(false);
            this.ui.setGenerateButtonText('生成中...');

            // 1. テキストをパース
            const slides = parseText(text);

            if (slides.length === 0) {
                alert('有効なスライドデータがありません。\n記法を確認してください。');
                return;
            }

            // 2. PPTXを生成
            const builder = new PptxBuilder(config);
            builder.build(slides);

            // 3. ダウンロード
            await builder.download('presentation.pptx');

        } catch (error) {
            console.error('Generation failed:', error);
            alert('生成に失敗しました: ' + error.message);
        } finally {
            // ボタンを再有効化
            this.ui.setGenerateButtonEnabled(true);
            this.ui.setGenerateButtonText('PPTXを生成');
        }
    }
}

// DOMContentLoaded時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
