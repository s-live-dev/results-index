// Code.gs - Google Apps Script サーバーサイドコード

/**
 * Webアプリケーションのエントリーポイント
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * スプレッドシートの設定
 */
const SPREADSHEET_ID = '1vuhb8Nu0ga81H1W87xtMCIkQktG-tpG3TGQdIymvVbw';
const SHEET_NAME = '大会設定';

/**
 * スプレッドシートから大会データを取得
 * @return {Array} 大会データの配列
 */
function getTournamentData() {
  try {
    console.log('データ取得開始');
    
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`シート "${SHEET_NAME}" が見つかりません`);
    }
    
    // フィルターを無視して全ての日付や値を取得
    const values = sheet.getDataRange().getValues();
    console.log('生データ行数:', values.length);
    
    if (values.length < 2) {
      console.log('データがありません（ヘッダー行のみ、または空）');
      return [];
    }
    
    const headers = values[0];
    
    const tournaments = values.slice(1).map(row => {
      const tournament = {};
      headers.forEach((header, index) => {
        // ★★★ 修正点 ★★★
        // Dateオブジェクト等のデータ型問題を回避するため、全ての値を文字列に変換する
        tournament[header] = String(row[index]);
      });
      return tournament;
    });
    
    console.log('処理後のデータ件数:', tournaments.length);
    return tournaments;
    
  } catch (error) {
    console.error('データ取得エラー:', error);
    throw new Error(`データの取得に失敗しました: ${error.message}`);
  }
}