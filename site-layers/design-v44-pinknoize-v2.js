/* TRIZNES · design-v44 · PINK NOIZE v2 + ассистенты Нейрофермы (2026-10-21).
   Без сети и без ключей. Голоса — по правилам Даниэля: АПОЛЛОН — собеседник, BEZLIKI — старший брат-подсказчик,
   ЧИВУРУНДУ — только улыбка и смех, Дионис — через игру, Любик — только сердечки.
   Выключить для себя: ?pn2=0 в адресе. */
(function () {
  'use strict';
  try { if (/[?&]pn2=0\b/.test(location.search)) return; } catch (e) {}
  var SMILE = window.PN2_SMILE || 'assets/pinknoize/triznes-smile-128.png';
  var root = document.documentElement;
  root.classList.add('pn2');

  var ASSISTANTS = [
    { id: 'apollon', name: 'АПОЛЛОН', color: '#42ECFF', letter: 'А',
      role: 'Собеседник: поможет сформулировать идею и войти в игру', act: 'Открыть',
      run: function () { if (typeof window.openApollonGateway === 'function') window.openApollonGateway(); else tab('viewer-hub'); } },
    { id: 'bezliki', name: 'BEZLIKI', color: '#CAFF39', letter: 'B',
      role: 'Старший брат: подскажет маршрут и один следующий шаг', act: 'Спросить',
      run: function () { tab('chats'); try { if (typeof window.selectChat === 'function') window.selectChat(4); } catch (e) {} } },
    { id: 'dionysus', name: 'Дионис', color: '#9A7BFF', letter: 'Д',
      role: 'Игра: квесты и уровни в правильном формате', act: 'В игру',
      run: function () { tab('game'); } },
    { id: 'chivurundu', name: 'ЧИВУРУНДУ', color: '#FF35C8', letter: 'Ч',
      role: 'Говорит улыбкой и смехом', act: 'smile', run: function (btn) { burst(btn, 'smile'); } },
    { id: 'lubik', name: 'Любик', color: '#FF8AD8', letter: '♥',
      role: 'Только сердечки', act: 'heart', run: function (btn) { burst(btn, 'heart'); } }
  ];

  function tab(id) { try { if (typeof window.switchTab === 'function') window.switchTab(id); } catch (e) {} }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  var HEART = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>';

  function burst(btn, kind) {
    var r = btn.getBoundingClientRect();
    for (var i = 0; i < (kind === 'heart' ? 6 : 3); i++) {
      var f = kind === 'heart'
        ? el('span', { 'class': 'pn2-float', 'aria-hidden': 'true', style: 'color:#FF8AD8;left:' + (r.left + Math.random() * 40 - 10) + 'px;top:' + (r.top - 10) + 'px;animation-delay:' + (i * 0.12) + 's' }, HEART.replace('16', '22').replace('16', '22'))
        : el('img', { 'class': 'pn2-float', alt: '', src: SMILE, style: 'width:' + (34 + i * 10) + 'px;left:' + (r.left - 20 + i * 18) + 'px;top:' + (r.top - 20) + 'px;animation-delay:' + (i * 0.15) + 's' });
      document.body.appendChild(f);
      setTimeout(function (x) { return function () { x.remove(); }; }(f), 2200);
    }
  }

  function addSmile() {
    document.querySelectorAll('.v29-brand, .v5-brand').forEach(function (brand) {
      if (brand.querySelector('.pn2-smile')) return;
      // фон, а не <img>: другие слои сайта подменяют картинки внутри логотипа на знак ТРИЗНЕС
      brand.appendChild(el('span', { 'class': 'pn2-smile', role: 'img', 'aria-label': 'PINK NOIZE', title: 'PINK NOIZE', style: 'background-image:url("' + SMILE + '")' }));
    });
  }

  function dock() {
    if (document.querySelector('.pn2-dock')) return;
    var wrap = el('div', { 'class': 'pn2-dock' });
    var faces = ASSISTANTS.map(function (a) { return '<span class="pn2-face" style="background:' + a.color + '">' + a.letter + '</span>'; }).join('');
    var btn = el('button', { type: 'button', 'class': 'pn2-dock-btn', 'aria-expanded': 'false', 'aria-controls': 'pn2-panel' },
      '<span class="pn2-mini" aria-hidden="true" style="background-image:url(&quot;' + SMILE + '&quot;)"></span><span class="pn2-faces" aria-hidden="true">' + faces + '</span><span class="pn2-label">АССИСТЕНТЫ</span>');
    var panel = el('div', { id: 'pn2-panel', 'class': 'pn2-panel', role: 'dialog', 'aria-label': 'Ассистенты TRIZNES', hidden: '' });
    panel.appendChild(el('div', { 'class': 'pn2-head' }, '<b>АССИСТЕНТЫ</b><span>Нейроферма · TRIZNES</span>'));
    ASSISTANTS.forEach(function (a) {
      var row = el('div', { 'class': 'pn2-row' });
      row.appendChild(el('span', { 'class': 'pn2-face', style: 'background:' + a.color, 'aria-hidden': 'true' }, a.letter));
      row.appendChild(el('div', { 'class': 'pn2-who' }, '<b>' + a.name + '</b><span>' + a.role + '</span>'));
      var label = a.act === 'smile' ? '<span class="pn2-mini" style="display:inline-block;width:22px;height:20px;background-image:url(&quot;' + SMILE + '&quot;)"></span>' : a.act === 'heart' ? HEART : a.act;
      var b = el('button', { type: 'button', 'class': 'pn2-act', 'aria-label': a.act === 'smile' ? 'Улыбка ЧИВУРУНДУ' : a.act === 'heart' ? 'Сердечко от Любика' : a.act + ': ' + a.name, style: 'color:' + a.color }, label);
      b.addEventListener('click', function () { if (a.act !== 'smile' && a.act !== 'heart') close(); a.run(b); });
      row.appendChild(b);
      panel.appendChild(row);
    });
    panel.appendChild(el('p', { 'class': 'pn2-note' }, 'Личный диалог открывается после входа. Ассистенты помогают — решения остаются за тобой.'));
    function close() { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var open = panel.hidden; panel.hidden = !open; btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); } });
    wrap.appendChild(panel);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  function boot() {
    addSmile(); dock();
    var tries = 0, t = setInterval(function () { addSmile(); if (++tries > 10) clearInterval(t); }, 800);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
