// ═══════════════════════════════════════════════════════════════════
// Franci & Ben — Budget Tracker
// Google Apps Script — paste this into Tools > Script editor
// in your Google Sheet, then deploy as a Web App.
// ═══════════════════════════════════════════════════════════════════

const SHEET_NAME = 'Expenses';
const HEADERS = ['ID','Date','Month','Description','Category','Total','FranciPct','BenPct','FranciAmt','BenAmt'];

// ── Entry points ────────────────────────────────────────────────────

function doGet(e) {
  const action = e.parameter.action;
  const month  = e.parameter.month;

  if (action === 'get') {
    return respond(getExpenses(month));
  }
  return respond({success:false, error:'Unknown action'});
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;

  if (action === 'add')    return respond(addExpense(body.expense));
  if (action === 'delete') return respond(deleteExpense(body.id));

  return respond({success:false, error:'Unknown action'});
}

// ── Helpers ─────────────────────────────────────────────────────────

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── Get expenses for a month ─────────────────────────────────────────

function getExpenses(month) {
  try {
    const sheet = getSheet();
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return {success:true, expenses:[]};

    const rows = data.slice(1).filter(r => r[2] === month && r[0] !== '');
    const expenses = rows.map(r => ({
      id:          String(r[0]),
      date:        r[1],
      month:       r[2],
      description: r[3],
      category:    r[4],
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

// ── Add expense ──────────────────────────────────────────────────────

function addExpense(exp) {
  try {
    const sheet = getSheet();
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
    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, HEADERS.length);
    return {success:true};
  } catch(err) {
    return {success:false, error: err.message};
  }
}

// ── Delete expense by ID ─────────────────────────────────────────────

function deleteExpense(id) {
  try {
    const sheet = getSheet();
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
