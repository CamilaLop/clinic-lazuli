/** Lazuli — cole este arquivo em Extensões > Apps Script da planilha. */
const AGENDA_VERSION = 'SEM_FORMATACAO_2026_10_05';
const PROFESSIONALS = ['Aline Reis', 'Géssyca Martins', 'Laura Casanova'];
const ROOMS = ['Sala 1', 'Sala 2'];
const SLOT_HEADERS = ['profissional', 'data', 'horario', 'modalidade', 'ativo', 'sala', 'duracao_min', 'intervalo_min'];
const REQUEST_HEADERS = ['id', 'criado_em', 'nome', 'whatsapp', 'profissional', 'data', 'horario', 'modalidade', 'status', 'consentimento', 'sala', 'duracao_min', 'intervalo_min', 'fim_reserva'];

// A planilha fornecida já tem seus formatos. O script não altera formatos de
// número ou data, pois tabelas com colunas tipadas controlam essa apresentação.
function setupAgenda() {
  console.log('Versão da agenda: ' + AGENDA_VERSION);
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Abra o Apps Script a partir da sua planilha.');
  book.setSpreadsheetTimeZone('America/Sao_Paulo');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', book.getId());
  [['Horarios', SLOT_HEADERS], ['Solicitacoes', REQUEST_HEADERS]].forEach(function(item) {
    const sheet = book.getSheetByName(item[0]) || book.insertSheet(item[0]);
    const current = sheet.getRange(1, 1, 1, item[1].length).getValues()[0];
    item[1].forEach(function(header, i) { if (current[i] && current[i] !== header) throw new Error('Confira os cabeçalhos de ' + item[0]); });
    if (sheet.getLastRow() === 0 || current.some(function(v) { return !v; })) {
      sheet.getRange(1, 1, 1, item[1].length).setValues([item[1]]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, item[1].length).setBackground('#252b41').setFontColor('#ffffff').setFontWeight('bold');
      sheet.autoResizeColumns(1, item[1].length);
    }
  });
  console.log('Agenda inicializada com sucesso.');
}
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function today_() { return Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd'); }
function date_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, 'America/Sao_Paulo', 'yyyy-MM-dd');
  if (typeof value === 'number') return new Date(Math.round((value - 25569) * 86400000)).toISOString().slice(0, 10);
  return String(value).trim();
}
function clock_(value) { return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0'); }
function time_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, 'America/Sao_Paulo', 'HH:mm');
  if (typeof value === 'number') return clock_(Math.round(value * 1440));
  return String(value).trim();
}
function minutes_(value) { const text = time_(value); return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? Number(text.slice(0, 2)) * 60 + Number(text.slice(3)) : NaN; }
function duration_(value, fallback) { return value === '' || value == null ? fallback : Number(value); }
function active_(value) { return ['true', 'sim', '1'].indexOf(String(value).trim().toLowerCase()) >= 0; }
function blocked_(r) { return ['pendente', 'confirmado'].indexOf(String(r[8]).trim().toLowerCase()) >= 0; }
function validDate_(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= today_();
}
function validSelection_(p) { return p && PROFESSIONALS.indexOf(p.professional) >= 0 && validDate_(p.date) && ['presencial', 'online'].indexOf(p.modality) >= 0; }
function validRequest_(p) {
  return validSelection_(p) && typeof p.name === 'string' && p.name.trim().length >= 2 && p.name.length <= 100 && /^\d{10,13}$/.test(p.whatsapp) && /^[a-f0-9-]{36}$/i.test(p.id) && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.time) && p.consent === true;
}
function rows_(sheet, headers) {
  if (!sheet) throw new Error('missing_sheet');
  const data = sheet.getDataRange().getValues();
  if (headers.some(function(h, i) { return data[0][i] !== h; })) throw new Error('invalid_headers');
  return data.slice(1);
}
function freeOptions_(book, p) {
  const weekday = new Date(p.date + 'T12:00:00Z').getUTCDay();
  if (weekday === 0 || weekday === 6) return [];
  const requests = rows_(book.getSheetByName('Solicitacoes'), REQUEST_HEADERS).filter(function(r) { return date_(r[5]) === p.date && blocked_(r); });
  const now = minutes_(Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'HH:mm'));
  return rows_(book.getSheetByName('Horarios'), SLOT_HEADERS).filter(function(r) {
    return r[0] === p.professional && date_(r[1]) === p.date && String(r[3]).trim().toLowerCase() === p.modality && active_(r[4]);
  }).map(function(r) {
    const start = minutes_(r[2]), duration = duration_(r[6], 50), interval = duration_(r[7], 10);
    return { time: time_(r[2]), room: String(r[5] || '').trim(), start: start, end: start + duration + interval, duration: duration, interval: interval };
  }).filter(function(slot) {
    if (!Number.isInteger(slot.duration) || slot.duration < 1 || slot.duration > 240 || !Number.isInteger(slot.interval) || slot.interval < 0 || slot.interval > 60) return false;
    if (!Number.isFinite(slot.start) || slot.start < 540 || slot.end > 1200 || (p.date === today_() && slot.start <= now)) return false;
    if (slot.room && ROOMS.indexOf(slot.room) < 0 || p.modality === 'presencial' && !slot.room) return false;
    return !requests.some(function(r) {
      const sameProfessional = r[4] === p.professional;
      const sameRoom = slot.room && String(r[10] || '').trim() === slot.room;
      const unknownRoom = p.modality === 'presencial' && r[7] === 'presencial' && ROOMS.indexOf(String(r[10] || '').trim()) < 0;
      if (!(sameProfessional || sameRoom || unknownRoom)) return false;
      const start = minutes_(r[6]);
      const end = Number.isFinite(minutes_(r[13])) ? minutes_(r[13]) : start + duration_(r[11], 50) + duration_(r[12], 10);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('invalid_existing_reservation');
      return slot.start < end && start < slot.end;
    });
  }).sort(function(a, b) { return a.start - b.start || a.room.localeCompare(b.room); });
}
function freeSlots_(book, p) { return Array.from(new Set(freeOptions_(book, p).map(function(slot) { return slot.time; }))); }
function safeCell_(value) { const text = String(value); return /^[=+\-@]/.test(text.trimStart()) ? "'" + text : text; }
function doPost(e) {
  let lock;
  try {
    const payload = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    const secret = props.getProperty('AGENDA_SECRET');
    if (!secret || payload.secret !== secret) return json_({ ok: false, error: 'unauthorized' });
    const book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
    if (payload.action === 'availability') {
      if (!validSelection_(payload)) return json_({ ok: false, error: 'invalid_data' });
      return json_({ ok: true, slots: freeSlots_(book, payload) });
    }
    if (payload.action !== 'request' || !validRequest_(payload.appointment)) return json_({ ok: false, error: 'invalid_data' });
    const p = payload.appointment;
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const sheet = book.getSheetByName('Solicitacoes');
    const requests = rows_(sheet, REQUEST_HEADERS);
    const existing = requests.find(function(r) { return r[0] === p.id; });
    if (existing) {
      // O Google pode ocultar a aspa usada para impedir fórmulas em uma célula.
      const sameName = existing[2] === safeCell_(p.name.trim()) || existing[2] === p.name.trim();
      if (!sameName || String(existing[3]) !== p.whatsapp || existing[4] !== p.professional || date_(existing[5]) !== p.date || time_(existing[6]) !== p.time || existing[7] !== p.modality) return json_({ ok: false, error: 'invalid_data' });
      return json_({ ok: true, id: p.id });
    }
    const option = freeOptions_(book, p).find(function(slot) { return slot.time === p.time; });
    if (!option) return json_({ ok: false, error: 'slot_unavailable' });
    const cache = CacheService.getScriptCache();
    const cacheKey = 'requests_' + p.whatsapp;
    const count = Number(cache.get(cacheKey) || 0);
    if (count >= 5) return json_({ ok: false, error: 'rate_limit' });
    const row = [p.id, new Date(), safeCell_(p.name.trim()), p.whatsapp, p.professional, new Date(p.date + 'T00:00:00-03:00'), option.start / 1440, p.modality, 'pendente', 'sim', option.room, option.duration, option.interval, option.end / 1440];
    // As fórmulas de controle em linhas vazias não contam como solicitações.
    let last = 0; requests.forEach(function(r, i) { if (r[0]) last = i + 1; });
    const nextRow = last + 2;
    const range = sheet.getRange(nextRow, 1, 1, row.length);
    // Preserve os formatos da planilha; grave as datas como Date, os horários
    // como valores numéricos e os identificadores/WhatsApp como texto.
    range.setValues([row]);
    SpreadsheetApp.flush();
    cache.put(cacheKey, String(count + 1), 3600);
    return json_({ ok: true, id: p.id });
  } catch (error) { return json_({ ok: false, error: 'service_unavailable' }); }
  finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}
