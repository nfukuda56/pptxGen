// デフォルト設定値
export const DEFAULT_CONFIG = {
    // スライドサイズ（インチ）- 25.4cm × 14.288cm（画面に合わせる）
    slideWidth: 10,      // 25.4cm = 10インチ
    slideHeight: 5.625,  // 14.288cm ≈ 5.625インチ

    // フォント設定
    fontFace: 'BIZ UDGothic',
    headingFontSize: 60,  // pt
    bodyFontSize: 40,     // pt

    // マージン設定（pt）
    headingMarginBottom: 30,
    bodyBoxMarginVertical: 10,    // 縦配置間
    bodyBoxMarginHorizontal: 20,  // 横配置間

    // 開始位置（pt）
    contentPaddingLeft: 36,   // 左マージン（0.5インチ相当）
    contentPaddingTop: 36,    // 上マージン（0.5インチ相当）

    // 横配置設定
    horizontalBoxesPerRow: 3, // 1行あたりの横配置個数
};

// 記法パターン（正規表現）
export const SYNTAX = {
    HEADING: /^#(.+)$/,              // #テキスト
    PAGE_BREAK: /^---$/,             // ---
    HORIZONTAL_BOXES: /^--\[(.+)\]$/,// --[aaa,bbb,ccc]
    VERTICAL_BOX: /^--$/,            // --
};

// フォント選択肢
export const FONT_OPTIONS = [
    { value: 'BIZ UDGothic', label: 'BIZ UDゴシック' },
    { value: 'Meiryo', label: 'メイリオ' },
    { value: 'Yu Gothic', label: '游ゴシック' },
    { value: 'MS Gothic', label: 'MS ゴシック' },
];

// ポイントをインチに変換（1pt = 1/72 inch）
export function ptToInch(pt) {
    return pt / 72;
}
