/**
 * Приём заявок с лендинга → Google-таблица.
 * Форма на сайте постит сюда (Apps Script), скрипт добавляет строку в таблицу.
 * Работает без VPN: посетитель отправляет данные на script.google.com (Google в РФ доступен).
 *
 * ── НАСТРОЙКА (5 минут) ─────────────────────────────────────────────
 * 1) Создайте Google-таблицу (sheets.new) под своим аккаунтом.
 * 2) В таблице: Расширения → Apps Script.
 * 3) Удалите пример, вставьте этот код целиком, сохраните (Ctrl/Cmd+S).
 * 4) Деплой → Новое развёртывание → шестерёнка → «Веб-приложение»:
 *      - Выполнять от имени: Я
 *      - У кого есть доступ: Все   (важно!)
 *    Нажмите «Развернуть», разрешите доступ к аккаунту.
 * 5) Скопируйте «URL веб-приложения» (…/exec).
 * 6) Вставьте его в файлы сайта: window.FORM_ENDPOINT = "…".
 *
 * Заявки падают строками в первый лист (шапку создаст сам).
 * Хотите письмо о каждой заявке — впишите адрес в NOTIFY_EMAIL.
 * ───────────────────────────────────────────────────────────────────
 */

var SHEET_ID     = ""; // ID таблицы из URL: docs.google.com/spreadsheets/d/ВОТ_ЭТО/edit
var NOTIFY_EMAIL = ""; // напр. "you@gmail.com" — пусто = без писем

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Дата', 'Имя', 'Телефон', 'Telegram', 'Ниша / выручка', 'Источник']);
    }

    sheet.appendRow([
      new Date(),
      d.name || '',
      d.phone || '',
      d.telegram || '',
      d.comment || '',
      d.source || ''
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'Новая заявка с лендинга AI-воркшоп',
        'Имя: ' + (d.name || '-') +
        '\nТелефон: ' + (d.phone || '-') +
        '\nTelegram: ' + (d.telegram || '-') +
        '\nНиша/выручка: ' + (d.comment || '-'));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
