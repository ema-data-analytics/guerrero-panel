// 25/11/2026 (Anibal): presupuesto con tildes. Muestra por equipo todo lo que dio mal en el check list o tiene observación,
// con el servicio sugerido; lo tildado pasa al presupuesto y el precio se pone en el armado.
function mtPresTildes(agregar) {
  var rows = [];
  (MT_.ord.EQUIPOS || []).forEach(function(x) { var pl = mtPl(x.ID_PLANTILLA); if (!pl) return;
    pl.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(i) { var v = x.RESP[i.ID]; if (!v) return; var mal = v.R === mtMalaResp(g), obs = String(v.OBS || '').trim(); if (!mal && !obs) return;
      var sg = (MT_.d.SUG_ITEM || {})[String(i.ID)]; sg = sg ? (sg.length === undefined ? [sg] : sg) : [];
      if (!sg.length) sg = [''];
      // Solo lo que dio NO o tiene observación, todo tildado. Si el punto tiene más de un servicio (ej.: recapar y vulcanizar) sale un renglón por servicio.
      sg.forEach(function(sv, n) { rows.push({ OE: x.ID_OE, ITEM: i.ID, NOMBRE: i.NOMBRE, R: v.R, MAL: mal, OBS: obs, ALT: n > 0, ON: 1, SERV: sv, CANT: 1, PU: mtTilPLista(sv) }); }); }); }); });
  MT_.til = { rows: rows, agregar: !!agregar }; mtOrdenVer();
}
function mtTilS(id) { return id ? MT_.d.SERVICIOS.filter(function(z) { return String(z.ID_SERVICIO) === String(id); })[0] : null; }
function mtTilPLista(id) { var s = mtTilS(id); return s && s.PRECIO > 0 ? s.PRECIO : ''; }
function mtTilRec(r) { var s = mtTilS(r.SERV), t = 0; if (s) s.RECETA.forEach(function(q) { t += (Number(q.PRECIO) || 0) * q.CANT * (Number(r.CANT) || 0); }); return Math.round(t * 100) / 100; }
function mtTilRecTxt(r) { var s = mtTilS(r.SERV); return s && s.RECETA.length ? '+ repuestos: ' + s.RECETA.map(function(q) { return q.NOMBRE + ' ×' + Math.round(q.CANT * (Number(r.CANT) || 0) * 100) / 100; }).join(', ') + ' (' + mtPlata(mtTilRec(r)) + ', precio de lista)' : ''; }
function mtTilSub(r) { return Math.round(((Number(r.PU) || 0) * (Number(r.CANT) || 0) + mtTilRec(r)) * 100) / 100; }
function mtTilEqTxt(oe) { var x = MT_.ord.EQUIPOS.filter(function(q) { return String(q.ID_OE) === String(oe); })[0]; return x ? mtEqIdent(mtEq(x.ID_EQUIPO)) : ''; }
function mtTilTot() { var t = 0, n = 0; MT_.til.rows.forEach(function(r, k) { if (r.ON) { t += mtTilSub(r); n++; } var e = $id('mt-tsub-' + k); if (e) e.textContent = r.ON ? mtPlata(mtTilSub(r)) : '—'; var rt = $id('mt-trec-' + k); if (rt) rt.textContent = mtTilRecTxt(r); var w = $id('mt-tr-' + k); if (w) w.style.opacity = r.ON ? '1' : '.45'; });
  t = Math.round(t * 100) / 100; var e2 = $id('mt-ttot'); if (e2) e2.innerHTML = n + (n === 1 ? ' renglón' : ' renglones') + ' · Total sin IVA <b>' + mtPlata(t) + '</b> · con IVA <b>' + mtPlata(Math.round(t * 121) / 100) + '</b>'; }
function mtTilServ(sel, uid) { var k = Number(String(uid).replace('mt-ts-', '')), r = MT_.til.rows[k]; if (!r) return; r.SERV = sel.length ? Number(sel[0]) : ''; var pl = mtTilPLista(r.SERV); r.PU = pl; r.ON = 1;
  var c = $id('mt-tc-' + k); if (c) c.checked = true; var p1 = $id('mt-tp-' + k), p2 = $id('mt-tq-' + k); if (p1) p1.value = pl ? String(pl).replace('.', ',') : ''; if (p2) p2.value = pl ? String(Math.round(pl * 121) / 100).replace('.', ',') : ''; var w = $id('mt-tr-' + k); if (w) { w.style.background = ''; } mtTilTot(); }
function mtTilPrecio(k, q, v) { var r = MT_.til.rows[k], x = mtNum(v); if (q === 'CANT') r.CANT = x; else { r.PU = q === 'CON' ? Math.round(x / 1.21 * 100) / 100 : x; var o = $id(q === 'CON' ? 'mt-tp-' + k : 'mt-tq-' + k); if (o) o.value = r.PU ? String(q === 'CON' ? r.PU : Math.round(r.PU * 121) / 100).replace('.', ',') : ''; var w = $id('mt-tr-' + k); if (w && r.PU > 0) w.style.background = ''; } mtTilTot(); }
function mtTilAdd(sel, uid) { if (!sel.length) return; var oe = Number(String(uid).replace('mt-ta-', '')), s = mtTilS(sel[0]); if (!s) return;
  MT_.til.rows.push({ OE: oe, ITEM: '', NOMBRE: s.NOMBRE, R: '', MAL: false, OBS: '', ON: 1, SERV: s.ID_SERVICIO, CANT: 1, PU: mtTilPLista(s.ID_SERVICIO), HOJA: 1 }); mtOrdenVer(); }
function mtTilHtml() {
  var T = MT_.til, opS = MT_.d.SERVICIOS.map(function(x) { return { v: x.ID_SERVICIO, t: x.NOMBRE, sub: x.SISTEMA + ' · ' + x.CODIGO }; });
  var bOk = T.agregar ? '＋ Agregar al presupuesto' : '💾 Guardar presupuesto';
  var css = '<style>.mt-tg{display:grid;grid-template-columns:30px minmax(150px,1.4fr) minmax(170px,1.3fr) 58px 100px 100px 110px;gap:6px;align-items:center;padding:8px 6px;border-bottom:1px solid #e5e7eb}.mt-tg.hd{font-size:11px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #d1d5db;padding-top:0}.mt-tg input[type=checkbox]{width:22px;height:22px}.mt-tg .fi{padding:6px 8px;min-height:38px}.mt-tg .mt-tsb{text-align:right;font-weight:600}.mt-tn{display:contents}.mt-tn label{display:block;margin:0}.mt-tl{display:none;font-size:11px;color:#6b7280;margin-bottom:2px}@media(max-width:800px){.mt-tg{grid-template-columns:30px 1fr;align-items:start;padding:10px 4px}.mt-tg.hd{display:none}.mt-tg .c2,.mt-tg .mt-tn,.mt-tg .mt-tsb{grid-column:2}.mt-tg .mt-tn{display:grid;grid-template-columns:64px 1fr 1fr;gap:6px}.mt-tl{display:block}.mt-tg .mt-tsb{text-align:right;font-size:14px}}</style>';
  var h = css + '<div class="tdim mb2" style="font-size:13px">Están <b>solo</b> los puntos del check list que dieron <b>NO</b> o tienen <b>observación</b>, todos tildados: <b>destildá lo que no se cobra</b>, revisá la cantidad y poné el precio (sin IVA o con IVA, el otro se calcula). Cada renglón lleva su servicio codificado; si un tildado no tiene, elegilo de la lista.</div>';
  (MT_.ord.EQUIPOS || []).forEach(function(x) {
    var e = mtEq(x.ID_EQUIPO), rs = [];
    T.rows.forEach(function(r, k) { if (String(r.OE) === String(x.ID_OE)) rs.push(k); });
    h += '<div class="card mb3"><div class="card-hd"><span class="card-title">' + pcEsc(mtEqIdent(e)) + ' · ' + pcEsc((e.MARCA || '') + ' ' + (e.MODELO || '')) + '</span></div><div class="card-body" style="padding-top:6px">' +
      (x.OBSERVACIONES ? '<div class="mb2" style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:6px 10px;font-size:12.5px"><b>Hoja del mecánico:</b> ' + pcEsc(x.OBSERVACIONES) + '</div>' : '') +
      '<div class="mt-tg hd"><span></span><span>Punto del check list</span><span>Servicio</span><span>Cant.</span><span>Precio s/IVA</span><span>Precio c/IVA</span><span style="text-align:right">Subtotal s/IVA</span></div>';
    if (!rs.length) h += '<div class="tdim" style="padding:8px">No hay nada en NO ni con observación.</div>';
    rs.forEach(function(k) { var r = T.rows[k], pu = Number(r.PU) || 0;
      h += '<div class="mt-tg" id="mt-tr-' + k + '" style="' + (r.ON ? '' : 'opacity:.45') + '"><input type="checkbox" id="mt-tc-' + k + '"' + (r.ON ? ' checked' : '') + ' onchange="MT_.til.rows[' + k + '].ON=this.checked?1:0;mtTilTot()">' +
        '<div style="font-size:13px"><b>' + pcEsc(r.NOMBRE) + '</b> ' + (r.HOJA ? '<span class="mt-bd mt-b-b">agregado</span>' : '<span class="mt-bd ' + (r.MAL ? 'mt-b-o' : 'mt-b-x') + '">' + pcEsc(r.R) + '</span>') + (r.OBS && !r.ALT ? '<div class="tdim" style="font-size:12px">' + pcEsc(r.OBS) + '</div>' : '') + (r.ALT ? '<div class="tdim" style="font-size:12px">otro servicio del mismo punto</div>' : '') + '</div>' +
        '<div class="c2">' + uiBusca('mt-ts-' + k, { opciones: opS, sel: r.SERV ? [String(r.SERV)] : [], max: 0, ph: 'Elegí el servicio', onchange: 'mtTilServ' }) + '<div class="tdim" id="mt-trec-' + k + '" style="font-size:11px">' + mtTilRecTxt(r) + '</div></div>' +
        '<div class="mt-tn"><label><span class="mt-tl">Cantidad</span><input class="fi tr" inputmode="decimal" value="' + r.CANT + '" oninput="mtTilPrecio(' + k + ',\'CANT\',this.value)"></label>' +
        '<label><span class="mt-tl">Precio sin IVA</span><input class="fi tr" id="mt-tp-' + k + '" inputmode="decimal" placeholder="poné el precio" value="' + (pu ? String(pu).replace('.', ',') : '') + '" oninput="mtTilPrecio(' + k + ',\'SIN\',this.value)"></label>' +
        '<label><span class="mt-tl">Precio con IVA</span><input class="fi tr" id="mt-tq-' + k + '" inputmode="decimal" value="' + (pu ? String(Math.round(pu * 121) / 100).replace('.', ',') : '') + '" oninput="mtTilPrecio(' + k + ',\'CON\',this.value)"></label></div>' +
        '<div class="mt-tsb" id="mt-tsub-' + k + '">' + (r.ON ? mtPlata(mtTilSub(r)) : '—') + '</div></div>'; });
    h += '<div class="fg mt2" style="max-width:520px"><label class="fl">＋ Otro servicio que se hizo en esta unidad</label>' + uiBusca('mt-ta-' + x.ID_OE, { opciones: opS, sel: [], max: 0, ph: 'Buscá el servicio', onchange: 'mtTilAdd' }) + '</div></div></div>';
  });
  return h + '<div id="mt-ttot" style="font-size:15px;text-align:right;margin:4px 0 10px"></div><div class="flex gap2"><button class="btn btn-s" onclick="MT_.til=null;mtOrdenVer()">Cancelar</button><button class="btn btn-p" style="flex:1;min-height:52px;font-size:16px" id="mt-til-ok" onclick="mtTilGuardar()">' + bOk + '</button></div>';
}
async function mtTilGuardar() {
  var T = MT_.til, sinS = [], sinP = [];
  T.rows.forEach(function(r, k) { if (!r.ON) return; if (!r.SERV) sinS.push(k); else if (!(Number(r.PU) > 0)) sinP.push(k); });
  var marcar = function(ls) { ls.forEach(function(k) { var e = $id('mt-tr-' + k); if (e) e.style.background = '#fef2f2'; }); var e0 = $id('mt-tr-' + ls[0]); if (e0) e0.scrollIntoView({ block: 'center' }); };
  if (sinS.length) { toast(sinS.length + (sinS.length === 1 ? ' renglón tildado no tiene' : ' renglones tildados no tienen') + ' servicio: elegilo de la lista o destildalo', 'r2'); marcar(sinS); return; }
  if (sinP.length) { toast(sinP.length + (sinP.length === 1 ? ' renglón tildado no tiene' : ' renglones tildados no tienen') + ' precio: ponelo o destildalo', 'r2'); marcar(sinP); return; }
  var lin = [], n = 0;
  T.rows.forEach(function(r) { if (!r.ON) return; n++;
    var s = mtTilS(r.SERV), eqT = mtTilEqTxt(r.OE), donde = r.ITEM ? ' (' + r.NOMBRE + (r.OBS ? ': ' + r.OBS : '') + ')' : '', cant = Number(r.CANT) || 1;
    if (s.CODIGO === 'TLR-TERCERO') { lin.push({ CLASE: 'TERCERO', ID_OE: r.OE, ID_SERVICIO: s.ID_SERVICIO, ID_ITEM_CHK: r.ITEM || '', DESCRIPCION: ('Trabajo de tercero — ' + eqT + donde).substring(0, 300), CANTIDAD: cant, PRECIO_LISTA: Number(r.PU), PRECIO_UNIT: Number(r.PU), COSTO_UNIT: 0, DESCUENTO_PCT: 0 }); return; }
    lin.push({ CLASE: 'SERVICIO', ID_OE: r.OE, ID_SERVICIO: s.ID_SERVICIO, ID_ARTICULO: s.ID_ARTICULO, ID_ITEM_CHK: r.ITEM || '', DESCRIPCION: (s.NOMBRE + ' — ' + eqT + donde).substring(0, 300), CANTIDAD: cant, PRECIO_LISTA: s.PRECIO, PRECIO_UNIT: Number(r.PU), DESCUENTO_PCT: 0, COSTO_UNIT: Math.round(s.HORAS * MT_.d.COSTO_HORA * 100) / 100 });
    s.RECETA.forEach(function(q) { lin.push({ CLASE: 'REPUESTO', ID_OE: r.OE, ID_SERVICIO: s.ID_SERVICIO, ID_ARTICULO: q.ID_ARTICULO, ID_ITEM_CHK: r.ITEM || '', DESCRIPCION: q.NOMBRE, CANTIDAD: q.CANT * cant, PRECIO_LISTA: q.PRECIO, DESCUENTO_PCT: 0, COSTO_UNIT: q.COSTO }); });
  });
  if (!n) { toast('No hay nada tildado', 'r2'); return; }
  // El servicio elegido para un punto del check list queda guardado: la próxima vez sale solo
  var pares = [], sv0 = MT_.d.SUG_ITEM || {};
  T.rows.forEach(function(r) { if (r.ON && r.ITEM) { var l = sv0[String(r.ITEM)]; l = l ? (l.length === undefined ? [l] : l) : []; if (l.indexOf(Number(r.SERV)) === -1) pares.push({ ITEM: r.ITEM, SERV: r.SERV }); } });
  if (pares.length) gsRun('gsMT_SugAgregar', { PARES: pares }).then(function(x) { if (x && x.ok) pares.forEach(function(p) { var l = sv0[String(p.ITEM)]; l = l ? (l.length === undefined ? [l] : l) : []; l.push(Number(p.SERV)); sv0[String(p.ITEM)] = l; }); }).catch(function() {});
  if (T.agregar) { MT_.lin = (MT_.lin || []).concat(lin); MT_.til = null; mtOrdenVer(); toast(n + (n === 1 ? ' renglón agregado' : ' renglones agregados'), 'g'); return; }
  var b = $id('mt-til-ok'); if (b) b.disabled = true;
  try { var r = await gsRun('gsMT_PresupGuardar', { ID_ORDEN: MT_.ord.ORDEN.ID_ORDEN, LINEAS: lin, DESCUENTO_PCT: 0 });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Presupuesto ' + r.NRO + ' guardado · ' + mtPlata(r.TOTAL) + ' sin IVA ✓', 'g'); MT_.til = null; MT_.lin = null; var id = MT_.ord.ORDEN.ID_ORDEN; await mtRecargar(); await mtAbrir(id);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
function mtOrdenVer() {
  var O = MT_.ord, o = mtOrdenRes(O.ORDEN.ID_ORDEN) || {}, P = O.PRESUP, an = O.ORDEN.ESTADO === 'ANULADA';
  var cerr = ['ANULADA', 'FACTURADA', 'TERMINADA'].indexOf(O.ORDEN.ESTADO) !== -1;
  var h = '<div class="mb3 flex gap2" style="flex-wrap:wrap"><button class="btn btn-s" onclick="MT_.ord=null;mtPintar()">← Volver a la lista de órdenes</button><button class="btn btn-s" onclick="mtImpOrden(' + O.ORDEN.ID_ORDEN + ')">🖨 Orden con check list</button>' + (P ? '<button class="btn btn-s" onclick="mtImpPresup()">🖨 Presupuesto</button>' : '') + '</div>' +
    '<div class="card mb3"><div class="card-hd"><span class="card-title">' + pcEsc(O.ORDEN.NRO) + ' · ' + pcEsc(o.CLIENTE || 'Interno') + '</span>' + mtBadge(O.ORDEN.ESTADO) + '</div><div class="card-body">' +
    '<div class="tdim mb2" style="font-size:13px">' + fmtD(o.FECHA) + ' · Sucursal <b>' + pcEsc(o.SUCURSAL) + '</b>' + (o.SOLICITANTE ? ' · Pidió: <b>' + pcEsc(o.SOLICITANTE) + '</b>' + (o.SOLICITANTE_TEL ? ' (' + pcEsc(o.SOLICITANTE_TEL) + ')' : '') : '') + (o.OBSERVACIONES ? '<br>' + pcEsc(o.OBSERVACIONES) : '') + '</div>' +
    '<label class="fl">Check list de cada equipo</label><div class="mt-eqs mb2">' + O.EQUIPOS.map(function(x) { var e = mtEq(x.ID_EQUIPO), pl = mtPl(x.ID_PLANTILLA), t = 0, r = Object.keys(x.RESP).length, no = 0;
      if (pl) pl.GRUPOS.forEach(function(g) { t += g.ITEMS.length; }); Object.keys(x.RESP).forEach(function(k) { if (pl && x.RESP[k].R === mtMalaResp(mtGrupoDeItem(pl, k))) no++; });
      if (!pl) return O.ORDEN.ESTADO === 'CHECK_LIST' ? '<div class="al" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;width:100%"><b>' + pcEsc(mtEqIdent(e)) + '</b> no tiene check list para su tipo. Elegí cuál usar: <select class="fs" id="mt-oepl-' + x.ID_OE + '" style="max-width:340px">' + mtPlTodas('') + '</select><button class="btn btn-p btn-sm" onclick="mtOePlantilla(' + x.ID_OE + ')">Usar este check list</button></div>' : '<span class="tdim">' + pcEsc(mtEqIdent(e)) + ': sin check list</span>';
      return '<button class="btn ' + (r >= t && t ? 'btn-s' : 'btn-p') + '" onclick="mtAbrirCheck(' + x.ID_OE + ')">✔ ' + pcEsc(mtEqIdent(e)) + ' · ' + r + '/' + t + (no ? ' · ' + no + ' a reparar' : '') + '</button>'; }).join('') + '</div>' + (O.ORDEN.ESTADO === 'CHECK_LIST' ? '<button class="btn btn-s btn-sm" onclick="mtOeAgregar()">＋ Agregar otra unidad del cliente a esta orden</button>' : '') + '</div></div>';
  // Fotos antes / después (20/11/2026)
  h += '<div class="card mb3" id="mt-fotos-card"><div class="card-hd"><span class="card-title">📷 Fotos · antes y después</span></div><div class="card-body" id="mt-fotos"><div class="tdim">Cargando fotos…</div></div></div>';
  // Presupuesto
  h += '<div class="card mb3"><div class="card-hd"><span class="card-title">Presupuesto' + (P ? ' ' + pcEsc(P.NRO) : '') + '</span>' + (P ? mtBadge(P.ESTADO) : '') + '</div><div class="card-body" id="mt-pres">';
  if (MT_.til) { h += mtTilHtml(); setTimeout(function() { if (MT_.til) mtTilTot(); }, 0); }
  else if (MT_.lin) h += mtFaltaStockHtml(MT_.lin) + mtPresEditorHtml();
  else if (!P) h += '<div class="tdim mb2">Todavía no hay presupuesto. Con <b>tildes</b>: ves lo que dio mal y lo que tiene observación, tildás lo que se cobra (cada uno con su servicio codificado) y le ponés el precio. El <b>automático</b> arma solo con lo que dio NO, el servicio sugerido, sus repuestos y los precios de la lista vigente (' + pcEsc(MT_.d.LISTA) + '). Después se puede corregir.</div>' + (an || cerr ? '' : (mtChkFaltaTxt() ? '<div class="al mb2">' + pcEsc(mtChkFaltaTxt()) + '</div>' : '') + '<div class="flex gap2" style="flex-wrap:wrap"><button class="btn btn-p" style="min-height:48px" onclick="mtPresTildes()">☑ Armar el presupuesto con tildes (lo marcado y las observaciones)</button><button class="btn btn-s" style="min-height:48px" onclick="mtPresArmar()">⚙ Armado automático</button></div>');
  else {
    h += (['BORRADOR', 'ENVIADO', 'APROBADO'].indexOf(P.ESTADO) !== -1 ? mtFaltaStockHtml(P.DET) : '') + mtPresTabla(P.DET, true, P.DESCUENTO_PCT) + '<div class="tdim mt2" style="font-size:12px">Fecha ' + fmtD(P.FECHA) + ' · válido ' + P.VALIDEZ + ' días · versión ' + P.VERSION + (P.APROBADO_POR ? ' · aprobó <b>' + pcEsc(P.APROBADO_POR) + '</b> (' + pcEsc(P.MEDIO) + ') el ' + fmtD(P.FECHA_APROB) : '') + (P.MOTIVO ? ' · ' + pcEsc(P.MOTIVO) : '') + '</div>';
    if (!an && !cerr) h += '<div class="flex gap2 mt2" style="flex-wrap:wrap">' +
      ((P.ESTADO === 'BORRADOR' || P.ESTADO === 'ENVIADO' || P.ESTADO === 'RECHAZADO') ? '<button class="btn btn-s" onclick="mtPresCorregir()">✏ Corregir (versión nueva)</button>' : '') +
      (P.ESTADO === 'BORRADOR' ? '<button class="btn btn-s" onclick="mtPresEstado(\'ENVIADO\')">📤 Marcar como enviado al cliente</button>' : '') +
      ((P.ESTADO === 'BORRADOR' || P.ESTADO === 'ENVIADO') ? '<button class="btn btn-p" onclick="mtPresEstado(\'APROBADO\')">✅ El cliente lo aprobó</button><button class="btn btn-d" onclick="mtPresEstado(\'RECHAZADO\')">✖ El cliente no lo aprobó</button>' : '') +
      (P.ESTADO === 'APROBADO' ? '<div class="al" style="flex:1">Aprobado. Abajo, en <b>Trabajo y control final</b>, se reparten las tareas a los mecánicos; con todas controladas se cierra la orden y se hace el remito.</div>' : '') + '</div>';
  }
  h += '</div></div>';
  // Adicionales (lo que apareció de más, que el cliente aprueba aparte) y factura desde los presupuestos aprobados (17/11/2026)
  if (P && P.ESTADO === 'APROBADO' && typeof fprBloque === 'function') { var adh = fprBloque({ ID: O.ORDEN.ID_ORDEN, ESTADO: O.ORDEN.ESTADO, NRO: O.ORDEN.NRO, CLIENTE: o.CLIENTE || '', AMBITO: 'TALLER' }, O.PRESUPS || [], function() { var idO = O.ORDEN.ID_ORDEN; return mtRecargar().then(function() { return mtAbrir(idO); }); }, { soloAdic: true });
    if (adh) h += '<div class="card mb3"><div class="card-hd"><span class="card-title">Adicionales y factura</span></div><div class="card-body">' + adh + '</div></div>'; }
  if (P && P.ESTADO === 'APROBADO' && O.TRAB) h += mtTrabHtml(O, an);
  $id('mt-body').innerHTML = h;
  mtFotosCargar();
}
function mtPresEditorHtml() {
  var L = MT_.lin, tot = 0, d = MT_.d;
  // 20/11/2026 (Anibal): en el celular cada renglón va uno debajo del otro y el precio se escribe sin deslizar al costado
  var cel = window.innerWidth < 700;
  if (cel) {
    var rc = L.map(function(l, i) { var pu = mtPresPuDe(l), sub = Math.round(pu * l.CANTIDAD * 100) / 100; tot += sub; var te = l.CLASE === 'TERCERO', sc = mtSinCargo(l), falta = pu <= 0 && l.CLASE !== 'CLIENTE' && !sc;
      return '<div class="mt-pc' + (falta ? ' falta' : '') + (sc ? ' sc' : '') + '" id="mt-pc-' + i + '"><div class="mt-pc-h"><span class="mt-bd mt-b-x">' + pcEsc(l.CLASE) + '</span> ' + (te || l.CLASE === 'MANUAL' ? '<input class="fi" style="min-width:240px" value="' + pcEsc(l.DESCRIPCION) + '" onchange="MT_.lin[' + i + '].DESCRIPCION=this.value">' : '<b>' + pcEsc(l.DESCRIPCION) + '</b>') + '</div>' +
        '<div class="mt-pc-g"><label>Cantidad<input class="fi tr" inputmode="decimal" value="' + l.CANTIDAD + '" oninput="mtPcVivo(' + i + ',\'CANT\',this.value)"></label>' +
        '<label>Precio sin IVA<input class="fi tr" inputmode="decimal"' + (sc ? ' disabled placeholder="SIN CARGO"' : '') + (falta ? ' placeholder="poné el precio"' : '') + ' data-q="SIN" value="' + (pu ? String(pu).replace('.', ',') : '') + '" oninput="mtPcVivo(' + i + ',\'SIN\',this.value)"></label>' +
        '<label>Precio con IVA<input class="fi tr" inputmode="decimal"' + (sc ? ' disabled placeholder="SIN CARGO"' : '') + ' data-q="CON" value="' + (pu ? String(Math.round(pu * 121) / 100).replace('.', ',') : '') + '" oninput="mtPcVivo(' + i + ',\'CON\',this.value)"></label></div>' +
        '<div class="mt-pc-f"><span>' + (sc ? '<b style="color:#15803d">SIN CARGO</b>' : 'Subtotal sin IVA: <b class="mt-pc-sub">' + mtPlata(sub) + '</b>') + '</span><span class="flex gap2"><button class="btn btn-s btn-sm" onclick="mtPresSinCargo(' + i + ')">' + (sc ? '↺ Poner precio' : '🎁 Sin cargo') + '</button><button class="btn btn-d btn-sm" onclick="MT_.lin.splice(' + i + ',1);mtOrdenVer()">✖ Sacar</button></span></div></div>'; }).join('');
    var fin = Math.round(tot * (1 - (Number(MT_.dg) || 0) / 100) * 100) / 100;
    return '<div class="tdim mb2" style="font-size:13px">Escribí el <b>precio sin IVA</b> o el <b>precio con IVA</b> de cada renglón (el otro se calcula solo). Los que están en rojo no tienen precio. Si algo no se cobra, tocá <b>🎁 Sin cargo</b>.</div>' + (rc || '<div class="tdim">Sin renglones: agregá un servicio o un repuesto.</div>') +
      '<div class="mt-pc-tot" id="mt-pc-tot"><div>Total sin IVA <b>' + mtPlata(fin) + '</b></div><div>Total con IVA <b>' + mtPlata(Math.round(fin * 121) / 100) + '</b></div></div>' +
      '<div class="fg mt2"><label class="fl">Descuento general sobre el total (%)</label><input class="fi tr" id="mt-p-dg" inputmode="decimal" value="' + (Number(MT_.dg) || 0) + '" onchange="MT_.dg=parseFloat(this.value.replace(\',\',\'.\'))||0;mtOrdenVer()"></div>' +
      (MT_.ord.EQUIPOS.length > 1 ? '<div class="fg mt2"><label class="fl">Lo que agregues a mano va al equipo</label><select class="fs" id="mt-p-eq">' + MT_.ord.EQUIPOS.map(function(x) { return '<option value="' + x.ID_OE + '">' + pcEsc(mtEqIdent(mtEq(x.ID_EQUIPO))) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="fg mt2"><label class="fl">＋ Agregar un servicio</label>' + uiBusca('mt-p-sv', { opciones: d.SERVICIOS.map(function(x) { return { v: x.ID_SERVICIO, t: x.NOMBRE, sub: x.SISTEMA + ' · ' + x.CODIGO }; }), sel: [], max: 0, ph: 'Buscá el servicio (' + d.SERVICIOS.length + ')', onchange: 'mtPresAddServSel' }) + '</div>' +
      '<div class="fg"><label class="fl">＋ Agregar un repuesto o insumo</label>' + uiBusca('mt-p-ar', { opciones: d.ARTS.filter(function(a) { return a.T !== 'SERVICIO'; }).map(function(a) { return { v: a.C, t: a.N, sub: a.C + ' · ' + mtPlata(a.P) + ' · stock ' + a.S }; }), sel: [], max: 0, ph: 'Buscá por nombre o código', onchange: 'mtPresAddArtSel' }) + '</div>' +
      '<button class="btn btn-s mb2" onclick="mtPresTildes(1)">☑ Agregar desde el check list</button> ' + '<button class="btn btn-s mb2" onclick="MT_.lin.push({CLASE:\'TERCERO\',ID_OE:mtPresOe(),DESCRIPCION:\'Trabajo de tercero: \',CANTIDAD:1,PRECIO_LISTA:0,COSTO_UNIT:0,DESCUENTO_PCT:0});mtOrdenVer()">＋ Trabajo de tercero</button>' +
      '<div class="flex gap2 mt2"><button class="btn btn-s" onclick="MT_.lin=null;mtOrdenVer()">Cancelar</button><button class="btn btn-p" style="flex:1;min-height:52px;font-size:16px" id="mt-p-ok" onclick="mtPresGuardar()">Guardar presupuesto</button></div>';
  }
  var rows = L.map(function(l, i) { var pl = Number(l.PRECIO_LISTA) || 0, pu = mtPresPuDe(l), sub = Math.round(pu * l.CANTIDAD * 100) / 100; tot += sub; var te = l.CLASE === 'TERCERO';
    var scD = mtSinCargo(l), st = scD ? ' style="width:110px" disabled placeholder="SIN CARGO"' : pu <= 0 && l.CLASE !== 'CLIENTE' ? ' style="width:110px;border-color:#dc2626;background:#fef2f2" placeholder="poné el precio"' : (pl > 0 && pu < pl - 0.005 ? ' style="width:110px;border-color:#d97706;background:#fffbeb" title="Por debajo de la lista"' : ' style="width:110px"');
    return '<tr><td>' + pcEsc(l.CLASE) + '</td><td class="pc-wr">' + (te || l.CLASE === 'MANUAL' ? '<input class="fi" style="min-width:240px" value="' + pcEsc(l.DESCRIPCION) + '" onchange="MT_.lin[' + i + '].DESCRIPCION=this.value">' : pcEsc(l.DESCRIPCION)) + '</td>' + mtStockTd(l) +
      '<td><input class="fi tr" style="width:70px" inputmode="decimal" value="' + l.CANTIDAD + '" onchange="MT_.lin[' + i + '].CANTIDAD=mtNum(this.value);mtOrdenVer()"></td>' +
      '<td class="tr">' + (te ? '<input class="fi tr" style="width:110px" inputmode="decimal" placeholder="Precio" value="' + (pl || '') + '" onchange="mtPresPrecio(' + i + ',\'LISTA\',this.value)"><input class="fi tr mt2" style="width:110px" inputmode="decimal" placeholder="Costo del tercero" value="' + (l.COSTO_UNIT || '') + '" onchange="MT_.lin[' + i + '].COSTO_UNIT=mtNum(this.value);mtPresPrecio(' + i + ',\'LISTA\',Math.round(MT_.lin[' + i + '].COSTO_UNIT*(1+' + (d.MARGEN_TERC || 30) + '/100)*100)/100)">' : (pl ? mtPlata(pl) : '<span class="tdim">sin lista</span>')) + '</td>' +
      '<td><input class="fi tr" inputmode="decimal"' + st + ' value="' + (pu ? String(pu).replace('.', ',') : '') + '" onchange="mtPresPrecio(' + i + ',\'SIN\',this.value)"></td>' +
      '<td><input class="fi tr" inputmode="decimal"' + st + ' value="' + (pu ? String(Math.round(pu * 121) / 100).replace('.', ',') : '') + '" onchange="mtPresPrecio(' + i + ',\'CON\',this.value)"></td>' +
      '<td><input class="fi tr" style="width:64px" inputmode="decimal" value="' + String(Number(l.DESCUENTO_PCT) || 0).replace('.', ',') + '" onchange="mtPresPrecio(' + i + ',\'DTO\',this.value)"></td>' +
      '<td class="tr"><b>' + (scD ? 'SIN CARGO' : mtPlata(sub)) + '</b></td><td><div class="pc-acc"><button class="btn btn-s btn-xs" title="' + (scD ? 'Volver a poner precio' : 'No se cobra') + '" onclick="mtPresSinCargo(' + i + ')">' + (scD ? '↺ Precio' : '🎁 Sin cargo') + '</button><button class="btn btn-d btn-xs" title="Sacar el renglón" onclick="MT_.lin.splice(' + i + ',1);mtOrdenVer()">✖</button></div></td></tr>'; }).join('');
  return '<div class="tdim mb2" style="font-size:12.5px">Precios sin IVA de la lista vigente (' + pcEsc(d.LISTA) + '). Si el precio de lista no sirve, escribí el precio sin IVA o el final con IVA (21%) de cada renglón: el descuento se calcula solo (en amarillo, por debajo de la lista; si queda arriba, el descuento sale negativo). Los trabajos de tercero llevan el costo y el precio se sugiere con +' + (d.MARGEN_TERC || 30) + '%.</div>' +
    '<div class="tw pc-abm mt-lin" data-noimp="1"><table style="font-size:12.5px"><thead><tr><th>Clase</th><th>Descripción</th><th class="tr">Stock</th><th>Cant.</th><th class="tr">Lista s/IVA</th><th>Precio s/IVA</th><th>Final c/IVA</th><th>Desc. %</th><th class="tr">Subtotal s/IVA</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="10" class="tc tdim" style="padding:14px">Sin renglones: agregá un servicio o un repuesto.</td></tr>') +
    mtPresPie(tot, MT_.dg, 8, '<td></td>') + '</tr><tr><td colspan="8" class="tr tdim">Total con IVA</td><td class="tr">' + mtPlata(Math.round(tot * (1 - (Number(MT_.dg) || 0) / 100) * 121) / 100) + '</td><td></td></tr></tbody></table></div>' +
    '<div class="fg mt2" style="max-width:260px"><label class="fl">Descuento general sobre el total (%)</label><input class="fi tr" id="mt-p-dg" inputmode="decimal" value="' + (Number(MT_.dg) || 0) + '" onchange="MT_.dg=parseFloat(this.value.replace(\',\',\'.\'))||0;mtOrdenVer()"></div>' +
    (MT_.ord.EQUIPOS.length > 1 ? '<div class="fg mt2" style="max-width:320px"><label class="fl">Lo que agregues a mano va al equipo</label><select class="fs" id="mt-p-eq">' + MT_.ord.EQUIPOS.map(function(x) { return '<option value="' + x.ID_OE + '">' + pcEsc(mtEqIdent(mtEq(x.ID_EQUIPO))) + '</option>'; }).join('') + '</select></div>' : '') +
    '<div class="pc-fila3 mt2" style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end">' +
    '<div class="fg"><label class="fl">＋ Agregar servicio (con sus repuestos)</label><select class="fs" onchange="mtPresAddServ(this.value);this.value=\'\'"><option value="">— elegí —</option>' + d.SERVICIOS.map(function(s) { return '<option value="' + s.ID_SERVICIO + '">' + pcEsc(s.SISTEMA + ' · ' + s.NOMBRE) + '</option>'; }).join('') + '</select></div>' +
    '<div class="fg"><label class="fl">＋ Agregar repuesto, insumo o cubierta</label><input class="fi" list="mt-arts" placeholder="Escribí código o nombre" onchange="mtPresAddArt(this.value);this.value=\'\'"><datalist id="mt-arts">' + d.ARTS.filter(function(a) { return a.T !== 'SERVICIO'; }).map(function(a) { return '<option value="' + pcEsc(a.C + ' · ' + a.N) + '">' + pcEsc(mtPlata(a.P) + ' · stock ' + a.S) + '</option>'; }).join('') + '</datalist></div>' +
    '<div class="fg"><button class="btn btn-s mb2" onclick="mtPresTildes(1)">☑ Agregar desde el check list</button><button class="btn btn-s" onclick="MT_.lin.push({CLASE:\'TERCERO\',ID_OE:mtPresOe(),DESCRIPCION:\'Trabajo de tercero: \',CANTIDAD:1,PRECIO_LISTA:0,COSTO_UNIT:0,DESCUENTO_PCT:0});mtOrdenVer()">＋ Trabajo de tercero</button></div></div>' +
    '<div class="flex gap2 mt3"><button class="btn btn-s" onclick="MT_.lin=null;mtOrdenVer()">Cancelar</button><button class="btn btn-p" style="flex:1;min-height:48px" id="mt-p-ok" onclick="mtPresGuardar()">Guardar presupuesto</button></div>';
}
