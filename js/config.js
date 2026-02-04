// デフォルト設定値
export const DEFAULT_CONFIG = {
    // スライドサイズ（インチ）- 16:9標準
    slideWidth: 13.333,
    slideHeight: 7.5,

    // フォント設定
    fontFace: 'BIZ UDGothic',
    headingFontSize: 60,  // pt
    bodyFontSize: 40,     // pt

    // マージン設定（pt）
    headingMarginBottom: 30,
    bodyBoxMarginVertical: 10,    // 縦配置間
    bodyBoxMarginHorizontal: 20,  // 横配置間

    // レイアウト領域（インチ）
    contentPadding: 0.5,
    headingY: 0.5,
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
