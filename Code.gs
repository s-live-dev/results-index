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
 * スプレッドシートから大会データを取得（フィルター機能付き）
 * @return {Array} フィルター済み大会データの配列
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
    
    // 大会名のカラムインデックスを取得
    const tournamentNameIndex = headers.indexOf('大会名');
    if (tournamentNameIndex === -1) {
      console.warn('大会名カラムが見つかりません');
    }
    
    const tournaments = values.slice(1)
      .filter(row => {
        // 空行チェック: 全てのセルが空またはnull/undefinedの場合は除外
        const isEmpty = row.every(cell => 
          cell === '' || 
          cell === null || 
          cell === undefined || 
          (typeof cell === 'string' && cell.trim() === '')
        );
        
        if (isEmpty) {
          console.log('空行をスキップしました');
          return false;
        }
        
        // テスト大会チェック: 大会名に"テスト"が含まれている場合は除外
        if (tournamentNameIndex !== -1) {
          const tournamentName = String(row[tournamentNameIndex] || '');
          if (tournamentName.includes('テスト')) {
            console.log(`テスト大会をスキップしました: ${tournamentName}`);
            return false;
          }
        }
        
        return true;
      })
      .map(row => {
        const tournament = {};
        headers.forEach((header, index) => {
          // Dateオブジェクト等のデータ型問題を回避するため、全ての値を文字列に変換する
          tournament[header] = String(row[index] || '');
        });
        return tournament;
      });
    
    console.log('フィルター前データ件数:', values.length - 1);
    console.log('フィルター後データ件数:', tournaments.length);
    return tournaments;
    
  } catch (error) {
    console.error('データ取得エラー:', error);
    throw new Error(`データの取得に失敗しました: ${error.message}`);
  }
}