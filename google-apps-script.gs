/**
 * Приём заявок с лендинга → база Notion.
 * Форма на сайте постит сюда (Apps Script), а скрипт создаёт запись в Notion по API.
 * Посетитель Notion не открывает — VPN ему не нужен. Notion нужен только вам, чтобы смотреть заявки.
 *
 * ── НАСТРОЙКА (10 минут) ───────────────────────────────────────────
 * 1) Создайте интеграцию: https://www.notion.so/my-integrations → New integration
 *      - Имя любое, тип Internal. Скопируйте «Internal Integration Secret» (токен ntn_… / secret_…).
 * 2) Создайте в Notion базу-таблицу с такими колонками (названия — ВАЖНО, один в один):
 *      - «Имя»            → тип Title (есть по умолчанию, переименуйте первую колонку)
 *      - «Телефон»        → тип Text
 *      - «Telegram»       → тип Text
 *      - «Ниша / выручка» → тип Text
 *      - «Источник»       → тип Text
 *      (дату создания Notion проставит сам — отдельная колонка не нужна)
 * 3) Откройте базу → «···» (вверху справа) → Connections → подключите вашу интеграцию.
 * 4) Скопируйте ID базы из её URL:
 *      notion.so/workspace/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...
 *      ID — это 32 символа (XXXX…). Их и вставьте ниже.
 * 5) script.google.com → New project → вставьте этот код → впишите токен и ID ниже → Сохранить.
 * 6) Deploy → New deployment → тип «Web app»:
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Скопируйте URL веб-приложения (…/exec).
 * 7) Вставьте этот URL в файлы сайта: window.FORM_ENDPOINT = "…".
 * ───────────────────────────────────────────────────────────────────
 */

var NOTION_TOKEN       = "";   // секрет интеграции, напр. "ntn_xxxxxxxxxxxx"
var NOTION_DATABASE_ID = "";   // 32-символьный ID базы из URL
var NOTIFY_EMAIL       = "";   // (опц.) почта для письма о каждой заявке; пусто — без писем

// Названия колонок в базе Notion (поменяйте здесь, если назвали иначе)
var P_NAME     = "Имя";
var P_PHONE    = "Телефон";
var P_TELEGRAM = "Telegram";
var P_COMMENT  = "Ниша / выручка";
var P_SOURCE   = "Источник";

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);

    var props = {};
    props[P_NAME]     = { title:     [{ text: { content: (d.name     || "").slice(0, 2000) } }] };
    props[P_PHONE]    = { rich_text: [{ text: { content: (d.phone    || "").slice(0, 2000) } }] };
    props[P_TELEGRAM] = { rich_text: [{ text: { content: (d.telegram || "").slice(0, 2000) } }] };
    props[P_COMMENT]  = { rich_text: [{ text: { content: (d.comment  || "").slice(0, 2000) } }] };
    props[P_SOURCE]   = { rich_text: [{ text: { content: (d.source   || "").slice(0, 2000) } }] };

    var res = UrlFetchApp.fetch("https://api.notion.com/v1/pages", {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + NOTION_TOKEN,
        "Notion-Version": "2022-06-28"
      },
      payload: JSON.stringify({ parent: { database_id: NOTION_DATABASE_ID }, properties: props }),
      muteHttpExceptions: true
    });

    var ok = res.getResponseCode() === 200;

    if (ok && NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, "Новая заявка с лендинга AI-воркшоп",
        "Имя: " + (d.name || "-") +
        "\nТелефон: " + (d.phone || "-") +
        "\nTelegram: " + (d.telegram || "-") +
        "\nНиша/выручка: " + (d.comment || "-"));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: ok, notion: res.getResponseCode() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
