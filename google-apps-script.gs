/**
 * Приём заявок с лендинга в Google-таблицу.
 *
 * Установка (5 минут):
 *  1. Создайте Google-таблицу (sheets.new) под своим Gmail-аккаунтом.
 *  2. В таблице: Расширения → Apps Script.
 *  3. Удалите пример кода, вставьте этот файл целиком, сохраните (Ctrl/Cmd+S).
 *  4. Деплой → Новое развёртывание → шестерёнка → «Веб-приложение».
 *       - Описание: любое
 *       - Выполнять от имени: Я
 *       - У кого есть доступ: Все   (важно!)
 *     Нажмите «Развернуть», разрешите доступ к аккаунту.
 *  5. Скопируйте «URL веб-приложения» (…/exec).
 *  6. Вставьте его в index.html → window.GSHEET_ENDPOINT.
 *
 *  Заявки будут падать строками в первый лист. Шапку создаст сам при первой заявке.
 *  Хотите письмо на почту о каждой заявке — впишите адрес в NOTIFY_EMAIL ниже.
 */

var NOTIFY_EMAIL = ""; // напр. "you@gmail.com" — оставьте пустым, если письма не нужны

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // шапка при первом запуске
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Дата', 'Имя', 'Телефон', 'Telegram', 'Ниша / выручка', 'Источник']);
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.phone || '',
      data.telegram || '',
      data.comment || '',
      data.source || ''
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        'Новая заявка с лендинга AI-воркшоп',
        'Имя: ' + (data.name || '-') +
        '\nТелефон: ' + (data.phone || '-') +
        '\nTelegram: ' + (data.telegram || '-') +
        '\nНиша/выручка: ' + (data.comment || '-')
      );
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
