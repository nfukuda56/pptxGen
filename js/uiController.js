import { DEFAULT_CONFIG } from './config.js';

/**
 * UI制御クラス
 */
export class UIController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.onGenerate = null; // コールバック関数
    }

    /**
     * DOM要素の初期化
     */
    initElements() {
        // 入力要素
        this.textArea = document.getElementById('inputText');
        this.fileInput = document.getElementById('fileInput');
        this.generateBtn = document.getElementById('generateBtn');

        // 設定要素
        this.fontSelect = document.getElementById('fontSelect');
        this.headingSizeInput = document.getElementById('headingSize');
        this.bodySizeInput = document.getElementById('bodySize');
        this.headingMarginInput = document.getElementById('headingMargin');
        this.verticalMarginInput = document.getElementById('verticalMargin');
        this.horizontalMarginInput = document.getElementById('horizontalMargin');
    }

    /**
     * イベントバインディング
     */
    bindEvents() {
        // ファイルアップロード
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // 生成ボタン
        this.generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    /**
     * ファイルアップロード処理
     * @param {Event} event
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.textArea.value = e.target.result;
        };
        reader.onerror = () => {
            alert('ファイルの読み込みに失敗しました。');
        };
        reader.readAsText(file, 'UTF-8');
    }

    /**
     * 現在の設定を取得
     * @returns {Object} 設定オブジェクト
     */
    getConfig() {
        return {
            fontFace: this.fontSelect.value || DEFAULT_CONFIG.fontFace,
            headingFontSize: this.parseNumber(this.headingSizeInput.value, DEFAULT_CONFIG.headingFontSize),
            bodyFontSize: this.parseNumber(this.bodySizeInput.value, DEFAULT_CONFIG.bodyFontSize),
            headingMarginBottom: this.parseNumber(this.headingMarginInput.value, DEFAULT_CONFIG.headingMarginBottom),
            bodyBoxMarginVertical: this.parseNumber(this.verticalMarginInput.value, DEFAULT_CONFIG.bodyBoxMarginVertical),
            bodyBoxMarginHorizontal: this.parseNumber(this.horizontalMarginInput.value, DEFAULT_CONFIG.bodyBoxMarginHorizontal),
        };
    }

    /**
     * 数値をパース（無効な場合はデフォルト値を返す）
     * @param {string} value
     * @param {number} defaultValue
     * @returns {number}
     */
    parseNumber(value, defaultValue) {
        const num = parseInt(value, 10);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * 入力テキストを取得
     * @returns {string}
     */
    getText() {
        return this.textArea.value;
    }

    /**
     * 生成ボタンクリック処理
     */
    handleGenerate() {
        const text = this.getText();

        if (!text.trim()) {
            alert('テキストを入力してください。');
            return;
        }

        const config = this.getConfig();

        // コールバック呼び出し
        if (this.onGenerate) {
            this.onGenerate(text, config);
        }
    }

    /**
     * 生成ボタンの有効/無効を切り替え
     * @param {boolean} enabled
     */
    setGenerateButtonEnabled(enabled) {
        this.generateBtn.disabled = !enabled;
    }

    /**
     * 生成ボタンのテキストを変更
     * @param {string} text
     */
    setGenerateButtonText(text) {
        this.generateBtn.textContent = text;
    }
}
