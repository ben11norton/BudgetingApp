// ═══════════════════════════════════════════════════════════════════
// Franci & Ben — Budget Tracker
// Google Apps Script — complete rewrite, all data in Google Sheets
// ═══════════════════════════════════════════════════════════════════

const EXPENSES_SHEET = 'Expenses';
const SETTINGS_SHEET = 'Settings';
const EXPENSE_HEADERS = ['ID','Date','Month','Description','Category','Total','FranciPct','BenPct','FranciAmt','BenAmt'];

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'get')          return respond(getExpenses(e.parameter.month));
  if (action === 'getSettings')  return respond(getSettings());
  return respond({success:false, error:'Unknown action'});
}

function doPost(e) {
  const body   = JSON.parse(e.postData.contents);
  const action = body.action;
  if (action === 'add')          return respond(addExpense(body.expense));
  if (action === 'delete')       return respond(deleteExpense(body.id));
  if (action === 'saveSettings') return respond(saveSettings(body.settings));
  return respond({success:false, error:'Unknown action'});
}

function getExpensesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EXPENSES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(EXPENSES_SHEET);
    sheet.appendRow(EXPENSE_HEADERS);
    sheet.getRange(1, 1, 1, EXPENSE_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET);
    sheet.appendRow(['Key', 'Value']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function formatDate(val) {
  const d = new Date(val);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatMonth(val) {
  const d = new Date(val);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function getExpenses(month) {
  try {
    const sheet = getExpensesSheet();
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return {success:true, expenses:[]};

    const rows = data.slice(1).filter(r => {
      if (!r[0] || r[0] === '') return false;
      const cellMonth = r[2] instanceof Date ? formatMonth(r[2]) : String(r[2]).trim().substring(0, 7);
      return cellMonth === month;
    });

    const expenses = rows.map(r => ({
      id:          String(r[0]),
      date:        r[1] instanceof Date ? formatDate(r[1]) : String(r[1]).substring(0, 10),
      month:       r[2] instanceof Date ? formatMonth(r[2]) : String(r[2]).trim().substring(0, 7),
      description: String(r[3]),
      category:    String(r[4]),
      amount:      parseFloat(r[5]) || 0,
      franciPct:   parseInt(r[6])   || 50,
      benPct:      parseInt(r[7])   || 50,
      franciAmt:   parseFloat(r[8]) || 0,
      benAmt:      parseFloat(r[9]) || 0,
    }));

    return {success:true, expenses};
  } catch(err) {
    return {success:false, error: err.message};
  }
}

function addExpense(exp) {
  try {
    const sheet = getExpensesSheet();
    sheet.appendRow([
      exp.id,
      exp.date,
      exp.month,
      exp.description,
      exp.category,
      exp.amount,
      exp.franciPct,
      exp.benPct,
      exp.franciAmt,
      exp.benAmt,
    ]);
    sheet.autoResizeColumns(1, EXPENSE_HEADERS.length);
    return {success:true};
  } catch(err) {
    return {success:false, error: err.message};
  }
}

function deleteExpense(id) {
  try {
    const sheet = getExpensesSheet();
    const data  = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return {success:true};
      }
    }
    return {success:false, error:'Row not found'};
  } catch(err) {
    return {success:false, error: err.message};
  }
}

function getSettings() {
  try {
    const sheet = getSettingsSheet();
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return {success:true, settings:null};

    const map = {};
    data.slice(1).forEach(r => {
      if (r[0]) map[String(r[0])] = String(r[1]);
    });

    if (!map['franciIncome']) return {success:true, settings:null};

    const settings = {
      franciIncome:  parseFloat(map['franciIncome']) || 0,
      benIncome:     parseFloat(map['benIncome'])    || 0,
      franciBudgets: JSON.parse(map['franciBudgets'] || '{}'),
      benBudgets:    JSON.parse(map['benBudgets']    || '{}'),
    };

    return {success:true, settings};
  } catch(err) {
    return {success:false, error: err.message};
  }
}

function saveSettings(settings) {
  try {
    const sheet = getSettingsSheet();

    const rows = [
      ['franciIncome',  settings.franciIncome],
      ['benIncome',     settings.benIncome],
      ['franciBudgets', JSON.stringify(settings.franciBudgets)],
      ['benBudgets',    JSON.stringify(settings.benBudgets)],
    ];

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
    sheet.autoResizeColumns(1, 2);

    return {success:true};
  } catch(err) {
    return {success:false, error: err.message};
  }
}

function diagnose() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EXPENSES_SHEET);
  const data = sheet.getDataRange().getValues();
  Logger.log('Total rows: ' + data.length);
  for (let i = 0; i < data.length; i++) {
    Logger.log('Row ' + i + ': ' + JSON.stringify(data[i]));
    Logger.log('Col C type: ' + typeof data[i][2]);
    Logger.log('Col C value: ' + data[i][2]);
  }
}
