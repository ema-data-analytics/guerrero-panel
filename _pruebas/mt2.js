
// ════════════════════════════════════════════════════════════════
// TALLER Y SERVICIOS A EMPRESAS (05/11/2026, Anibal)
// Órdenes del taller (grilla ABM) · check list OT-TMEC-01 en el celular (mapa con tildes) · presupuesto automático
// desde lo que dio NO (servicio sugerido + su receta, precios de la lista vigente) · aprobación · equipos · catálogo.
// ════════════════════════════════════════════════════════════════
var MT_ = { d: null, vista: 'ord', nueva: false, F: null, FE: null, ord: null, oe: null, pend: {}, tmr: null, lin: null, eqNuevo: false, grAb: {} };
(function() { var st = document.createElement('style');
  st.textContent = '.mt-acc{display:flex;flex-wrap:nowrap;gap:4px}.mt-bd{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}' +
    '.mt-b-g{background:#dcfce7;color:#166534}.mt-b-o{background:#ffedd5;color:#9a3412}.mt-b-b{background:#dbeafe;color:#1e40af}.mt-b-r{background:#fee2e2;color:#991b1b}.mt-b-x{background:#e5e7eb;color:#374151}.mt-b-v{background:#ede9fe;color:#5b21b6}' +
    '.mt-gr{border:1.5px solid var(--border,#e2e8f0);border-radius:12px;margin:0 0 10px;overflow:hidden;background:var(--card,#fff)}' +
    '.mt-gh{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;font-weight:700;font-size:15px}.mt-gh .mt-pg{margin-left:auto;font-size:13px;font-weight:600}.mt-gh.ok{background:#f0fdf4}.mt-gh.no{background:#fff7ed}' +
    '.mt-it{display:flex;align-items:center;gap:8px;padding:9px 12px;border-top:1px solid var(--border,#eef2f7);flex-wrap:wrap}.mt-it .mt-n{flex:1 1 160px;font-size:14px;min-width:0}.mt-es{display:inline-block;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:800;border-radius:6px;padding:1px 6px;margin-right:6px;vertical-align:middle}.mt-it.es{border-left:4px solid #dc2626}.mt-esnota{font-size:12px;color:#b91c1c;flex:1 1 200px}' +
    '.mt-rb{display:flex;gap:6px}.mt-rb button{min-width:54px;min-height:44px;border-radius:10px;border:2px solid #cbd5e1;background:#fff;font-weight:800;font-size:14px;cursor:pointer;color:#334155}' +
    '.mt-rb button.s-OK,.mt-rb button.s-SI.mt-si-ok{background:#16a34a;border-color:#16a34a;color:#fff}.mt-rb button.s-NO,.mt-rb button.s-SI{background:#dc2626;border-color:#dc2626;color:#fff}.mt-rb button.s-NA{background:#64748b;border-color:#64748b;color:#fff}' +
    '.mt-it.r-NO,.mt-it.r-SI{background:#fef2f2}.mt-it.r-OK{background:#f7fef9}.mt-obs{flex:1 1 100%;margin-top:4px}.mt-obs input{width:100%;min-height:40px;font-size:15px}' +
    '.mt-bar{position:sticky;top:0;z-index:5;background:var(--card,#fff);padding:10px 0 8px;border-bottom:1px solid var(--border,#e2e8f0);margin-bottom:10px}' +
    '.mt-prog{height:10px;border-radius:6px;background:#e5e7eb;overflow:hidden;margin-top:6px}.mt-prog>div{height:100%;background:#16a34a}' +
    '.mt-it button:disabled{opacity:.45;cursor:not-allowed}#mt-trab .selb-in{min-width:230px}.mt-eqs{display:flex;gap:8px;flex-wrap:wrap}.mt-eqs button{min-height:44px}.mt-lin td input{min-width:64px}' +
    '.mt-pick{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1.5px solid var(--border,#e2e8f0);border-radius:10px;margin:0 0 8px;cursor:pointer;font-size:14px}.mt-pick input{width:22px;height:22px}.mt-pick:has(input:checked){border-color:#16a34a;background:#f0fdf4}' +
    '@media(max-width:700px){#page-taller .pc-abm td.pc-wr{min-width:190px!important}.mt-rb button{min-width:58px;min-height:48px;font-size:15px}.mt-it .mt-n{flex-basis:100%;font-size:15px}.mt-rb{width:100%;justify-content:flex-end}.mt-gh{font-size:16px;padding:14px}}';
  document.head.appendChild(st); })();
var MT_EST = { PLANIFICADA: ['mt-b-b', 'Planificada (en campo)'], CHECK_LIST: ['mt-b-o', 'Check list'], PRESUPUESTADA: ['mt-b-b', 'Presupuestada'], APROBADA: ['mt-b-g', 'Aprobada'], EN_TRABAJO: ['mt-b-v', 'En trabajo'], TERMINADA: ['mt-b-g', 'Terminada'], FACTURADA: ['mt-b-g', 'Facturada'], ANULADA: ['mt-b-x', 'Anulada'],
  BORRADOR: ['mt-b-o', 'Borrador'], ENVIADO: ['mt-b-b', 'Enviado'], APROBADO: ['mt-b-g', 'Aprobado'], RECHAZADO: ['mt-b-r', 'Rechazado'], VENCIDO: ['mt-b-x', 'Vencido'], ANULADO: ['mt-b-x', 'Anulado'] };
function mtMalaResp(g) { return g && g.RESP === 'SI_NO_NA' ? 'SI' : 'NO'; }
function mtGrupoDeItem(pl, id) { var r = null; pl.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(i) { if (i.ID === Number(id)) r = g; }); }); return r; }
function mtBadge(e) { var x = MT_EST[e] || ['mt-b-x', e || '—']; return '<span class="mt-bd ' + x[0] + '">' + pcEsc(x[1]) + '</span>'; }
function mtPlata(n) { return '$ ' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function mtBtn(cls, txt, js, tit) { return typeof pcBtnAbm === 'function' ? pcBtnAbm(cls, txt, js, tit) : '<button class="btn ' + cls + ' btn-xs" onclick="' + js + '">' + txt + '</button>'; }
function mtPuede(acc) { return typeof tienePermiso === 'function' ? tienePermiso('VENTAS', acc) : true; }
function mtTit() { return { ord: MT_.amb === 'planta' ? 'Órdenes de reparación de máquinas propias' : 'Órdenes del taller (clientes)', eq: 'Unidades y máquinas', cat: 'Catálogo de servicios del taller', chk: 'Check lists (qué revisa el mecánico)', mp: 'Mantenimiento de máquinas de planta' }[MT_.vista] || 'Taller'; }
function mtGrupo() { return MT_.vista === 'mp' || MT_.amb === 'planta' && MT_.vista === 'ord' ? 'Planta' : (MT_.vista === 'eq' ? 'Servicios a empresas' : 'Taller'); }
async function renderTaller() {
  var el = $id('page-taller'); if (!el) return;
  if (window._menuAcc && String(window._menuAcc).indexOf('mt-') === 0) { MT_.vista = String(window._menuAcc).substring(3); MT_.amb = MT_.vista === 'mp' ? 'planta' : (MT_.vista === 'ord' ? 'cli' : (MT_.amb || 'cli')); MT_.nueva = false; MT_.ord = null; MT_.oe = null; MT_.eqNuevo = false; window._menuAcc = ''; }
  el.innerHTML = '<div class="mb3" style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span id="mt-tit" style="font-size:20px;font-weight:800">🔧 ' + mtTit() + '</span><span class="tdim" style="font-size:13px">' + mtGrupo() + '</span></div><div id="mt-body"><div class="tdim" style="padding:20px">Cargando…</div></div>';
  await mtRecargar();
}
async function mtRecargar() {
  try { var r = await gsRun('gsMT_Datos'); if (!r || !r.ok) { $id('mt-body').innerHTML = '<div class="al">' + pcEsc((r && r.error) || 'No se pudo cargar') + '</div>'; return; } MT_.d = r; }
  catch (e) { $id('mt-body').innerHTML = '<div class="al">' + pcEsc(e.message) + '</div>'; return; }
  mtPintar();
}
function mtPintar() {
  var pt = $id('mt-tit'); if (pt) pt.textContent = '🔧 ' + mtTit(); var pg = pt && pt.nextElementSibling; if (pg) pg.textContent = mtGrupo();
  if (MT_.vista === 'eq') return mtEquipos();
  if (MT_.vista === 'cat') return mtCatalogo();
  if (MT_.vista === 'chk') return mtChkEd();
  if (MT_.vista === 'mp') return mpPintar();
  if (MT_.oe) return mtCheck();
  if (MT_.ord) return mtOrdenVer();
  if (MT_.nueva) return mtNueva();
  mtOrdenes();
}
function mtOpt(l, v) { return l.map(function(x) { return '<option value="' + pcEsc(x[0]) + '"' + (String(v) === String(x[0]) ? ' selected' : '') + '>' + pcEsc(x[1]) + '</option>'; }).join(''); }
// ── ÓRDENES: grilla ABM ──
function mtOrdenes() {
  var d = MT_.d, F = MT_.F = MT_.F || { q: '', suc: '', est: 'VIG', desde: '', hasta: '', pag: 0 };
  var sucs = {}; d.ORDENES.forEach(function(o) { if (o.SUCURSAL) sucs[o.SUCURSAL] = 1; });
  $id('mt-body').innerHTML = '<div class="card mb3"><div class="card-hd"><span class="card-title">' + (MT_.amb === 'planta' ? '<button class="btn btn-s btn-sm" onclick="MT_.vista=\'mp\';MT_.F=null;mtPintar()">← Mantenimiento de planta</button> 🔧 Órdenes de reparación de máquinas propias' : 'Órdenes del taller (clientes)') + ' · ' + pcEsc(d.SUC.NOMBRE) + '</span>' + '<span class="flex gap2" style="flex-wrap:wrap"><button class="btn btn-s btn-sm" onclick="mtImpChkBlanco()" title="Para marcar a mano cuando no hay batería o señal, y después pasarlo al sistema">🖨 Check list en blanco</button>' + (mtPuede('AGREGAR') ? '<button class="btn btn-p btn-sm" onclick="MT_.nueva=true;MT_.N=null;mtPintar()">＋ Nueva orden del taller</button>' : '') + '</span></div><div class="card-body">' +
    '<div class="pc-otf"><div class="fg" style="grid-column:span 2"><label class="fl">Buscar</label><input class="fi" placeholder="N° de orden, cliente, dominio, quién la pidió" value="' + pcEsc(F.q) + '" oninput="MT_.F.q=this.value;MT_.F.pag=0;mtOrdGrilla()"></div>' +
    '<div class="fg"><label class="fl">Sucursal</label><select class="fs" onchange="MT_.F.suc=this.value;MT_.F.pag=0;mtOrdGrilla()">' + mtOpt([['', 'Todas']].concat(Object.keys(sucs).sort().map(function(s) { return [s, s]; })), F.suc) + '</select></div>' +
    '<div class="fg"><label class="fl">Estado</label><select class="fs" onchange="MT_.F.est=this.value;MT_.F.pag=0;mtOrdGrilla()">' + mtOpt([['VIG', 'Vigentes'], ['', 'Todas'], ['CHECK_LIST', 'En check list'], ['PRESUPUESTADA', 'Presupuestadas'], ['APROBADA', 'Aprobadas'], ['PLANIFICADA', 'Planificadas (en campo)'], ['EN_TRABAJO', 'En trabajo'], ['TERMINADA', 'Terminadas'], ['ANULADA', 'Anuladas']], F.est) + '</select></div>' +
    '<div class="fg"><label class="fl">Desde</label><input class="fi" type="date" value="' + F.desde + '" onchange="MT_.F.desde=this.value;MT_.F.pag=0;mtOrdGrilla()"></div>' +
    '<div class="fg"><label class="fl">Hasta</label><input class="fi" type="date" value="' + F.hasta + '" onchange="MT_.F.hasta=this.value;MT_.F.pag=0;mtOrdGrilla()"></div>' +
    '<div class="fg" style="align-self:end"><button class="btn btn-s" onclick="MT_.F=null;mtPintar()">Limpiar filtros</button></div></div>' +
    '<div id="mt-og" class="mt2"></div></div></div>';
  mtOrdGrilla();
}
function mtOrdGrilla() {
  var d = MT_.d, F = MT_.F, el = $id('mt-og'); if (!el) return;
  var q = String(F.q || '').toUpperCase().trim().split(/\s+/).filter(Boolean);
  var dd = F.desde ? new Date(F.desde + 'T00:00:00').getTime() : 0, dh = F.hasta ? new Date(F.hasta + 'T23:59:59').getTime() : 0;
  var pl = MT_.amb === 'planta';
  var l = d.ORDENES.filter(function(o) {
    if (pl ? (!o.TIPO || o.TIPO === 'SERVICIO_CLIENTE') : (o.TIPO && o.TIPO !== 'SERVICIO_CLIENTE')) return false;
    if (F.est === 'VIG' && o.ESTADO === 'ANULADA') return false;
    if (F.est && F.est !== 'VIG' && o.ESTADO !== F.est) return false;
    if (F.suc && o.SUCURSAL !== F.suc) return false;
    var f = +new Date(o.FECHA); if (dd && f < dd) return false; if (dh && f > dh) return false;
    if (q.length) { var t = [o.NRO, o.CLIENTE, o.SOLICITANTE, o.OBSERVACIONES, o.EQUIPOS.map(function(e) { return e.DOMINIO + ' ' + e.EQUIPO; }).join(' ')].join(' ').toUpperCase(); if (!q.every(function(w) { return t.indexOf(w) !== -1; })) return false; }
    return true;
  }).sort(function(a, b) { return b.ID_ORDEN - a.ID_ORDEN; });
  var por = 50, pags = Math.max(1, Math.ceil(l.length / por)); if (F.pag >= pags) F.pag = pags - 1; var desde = F.pag * por;
  el.innerHTML = '<div class="tdim mb2" style="font-size:13px"><b>' + l.length + '</b> orden' + (l.length === 1 ? '' : 'es') + (pags > 1 ? ' · página ' + (F.pag + 1) + ' de ' + pags : '') + '</div>' +
    '<div class="tw pc-abm mt-ordt" data-noimp="1"><table style="font-size:12.5px"><thead><tr><th>Acciones</th><th>Orden y estado</th><th>Cliente y equipo</th><th>Presupuesto</th><th>Check list</th><th>Sucursal</th></tr></thead><tbody>' +
    (l.length ? l.slice(desde, desde + por).map(function(o) {
      var an = o.ESTADO === 'ANULADA', r = 0, t = 0, no = 0; o.EQUIPOS.forEach(function(e) { r += e.RESP; t += e.TOTAL; no += e.NO; });
      // 20/11/2026 (Anibal): los botones van primero (en el celular se ven sin deslizar) y después las columnas que más importan
      return '<tr' + (an ? ' style="opacity:.6"' : '') + '><td><div class="mt-acc6">' + mtBtn('btn-s', '👁 Ver', 'mtAbrir(' + o.ID_ORDEN + ')', 'Ver la orden, el check list y el presupuesto') + mtBtn('btn-s', '🖨 PDF', 'mtImpOrden(' + o.ID_ORDEN + ')', 'PDF de la orden con el check list (imprimir o guardar)') +
          (o.PRESUP ? mtBtn('btn-s', '🧾 Presupuesto', 'mtImpPresupDe(' + o.ID_ORDEN + ')', 'PDF del presupuesto') : '<span></span>') +
          mtBtn('btn-s', '📲 WhatsApp', 'mtWhats(' + o.ID_ORDEN + ')', 'Mandar un WhatsApp a quien pidió la orden') +
          (an ? '' : mtBtn('btn-s', '✏ Modificar', 'mtOrdEditar(' + o.ID_ORDEN + ')', 'Cambiar quién la pidió, teléfono u observaciones') + (mtPuede('ANULAR') && o.ESTADO !== 'FACTURADA' ? mtBtn('btn-d', '✖ Anular', 'mtOrdAnular(' + o.ID_ORDEN + ')', 'Anular la orden') : '')) + '</div></td>' +
        '<td class="mono"><b>' + pcEsc(o.NRO) + '</b><div class="tdim" style="font-family:inherit">' + fmtD(o.FECHA) + '</div><div style="font-family:inherit;margin-top:3px">' + mtBadge(o.ESTADO) + '</div>' + (an && o.MOTIVO_ANULACION ? '<div class="pc-nota" style="font-family:inherit">' + pcEsc(o.MOTIVO_ANULACION.slice(0, 80)) + '</div>' : '') + '</td>' +
        '<td class="pc-wr"><b>' + pcEsc(o.CLIENTE || 'Interno') + '</b><div class="tdim">' + o.EQUIPOS.map(function(e) { return pcEsc((e.IDENT || e.DOMINIO || '—') + ' ' + e.EQUIPO); }).join('<br>') + '</div>' + (o.SOLICITANTE ? '<div class="pc-nota tdim">Pidió: ' + pcEsc(o.SOLICITANTE) + '</div>' : '') + '</td>' +
        '<td>' + (o.PRESUP ? pcEsc(o.PRESUP.NRO) + '<br>' + mtBadge(o.PRESUP.ESTADO) + ' ' + mtPlata(o.PRESUP.TOTAL) : '<span class="tdim">—</span>') + '</td>' +
        '<td>' + r + '/' + t + (no ? ' · <b style="color:#dc2626">' + no + ' NO</b>' : '') + '</td>' +
        '<td>' + pcEsc(o.SUCURSAL) + '</td></tr>';
    }).join('') : '<tr><td colspan="6" class="tc tdim" style="padding:16px">No hay órdenes con esos filtros.</td></tr>') + '</tbody></table></div>' +
    (pags > 1 ? '<div class="flex gap2 mt2" style="justify-content:center"><button class="btn btn-s btn-sm"' + (F.pag ? '' : ' disabled') + ' onclick="MT_.F.pag--;mtOrdGrilla()">‹ Anterior</button><span style="align-self:center">' + (F.pag + 1) + ' / ' + pags + '</span><button class="btn btn-s btn-sm"' + (F.pag < pags - 1 ? '' : ' disabled') + ' onclick="MT_.F.pag++;mtOrdGrilla()">Siguiente ›</button></div>' : '');
}
// PDF del presupuesto desde la lista (20/11/2026)
async function mtImpPresupDe(id) { var r = await gsRun('gsMT_Orden', id); if (!r || !r.ok || !r.PRESUP) { toast((r && r.error) || 'La orden no tiene presupuesto', 'r2'); return; } var ant = MT_.ord; MT_.ord = r; try { mtImpPresup(); } finally { MT_.ord = ant; } }
// WhatsApp a quien pidió la orden, con el mensaje armado (el PDF se adjunta a mano)
function mtWhats(id) { var o = mtOrdenRes(id); if (!o) return; var t = String(o.SOLICITANTE_TEL || '').replace(/\D/g, ''); if (!t) { toast('La orden no tiene teléfono: cargalo en ✏ Modificar', 'r2'); return; }
  t = t.replace(/^0+/, ''); if (t.indexOf('54') !== 0) t = '549' + t;
  var eq = o.EQUIPOS.map(function(e) { return (e.IDENT || e.DOMINIO || '') + ' ' + e.EQUIPO; }).join(', '), est = (MT_EST[o.ESTADO] || [0, o.ESTADO])[1];
  var m = 'Hola' + (o.SOLICITANTE ? ' ' + o.SOLICITANTE : '') + ', te escribimos de Vulcan Tread por la orden ' + o.NRO + ' (' + eq + '). Estado: ' + est + '.' + (o.PRESUP ? ' Presupuesto ' + o.PRESUP.NRO + ': ' + mtPlata(o.PRESUP.TOTAL) + ' sin IVA.' : '');
  window.open('https://wa.me/' + t + '?text=' + encodeURIComponent(m), '_blank'); }
function mtOrdEditar(id) {
  var o = MT_.d.ORDENES.filter(function(x) { return x.ID_ORDEN === id; })[0]; if (!o) return;
  showModal('<div class="mh"><span class="mt">✏ Modificar ' + pcEsc(o.NRO) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="fg"><label class="fl">Quién la pidió (en el cliente o la sucursal)</label><input class="fi" id="mt-oe-sol" value="' + pcEsc(o.SOLICITANTE) + '"></div>' +
    '<div class="fg"><label class="fl">Teléfono</label><input class="fi" id="mt-oe-tel" inputmode="tel" value="' + pcEsc(o.SOLICITANTE_TEL) + '"></div>' +
    '<div class="fg"><label class="fl">Observaciones</label><input class="fi" id="mt-oe-obs" value="' + pcEsc(o.OBSERVACIONES) + '"></div>' +
    '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="mt-oe-ok" onclick="mtOrdEditarOk(' + id + ')">Guardar cambios</button></div>');
}
async function mtOrdEditarOk(id) {
  var b = $id('mt-oe-ok'); b.disabled = true;
  try { var r = await gsRun('gsMT_OrdenEditar', { ID_ORDEN: id, SOLICITANTE: $v('mt-oe-sol'), SOLICITANTE_TEL: $v('mt-oe-tel'), OBSERVACIONES: $v('mt-oe-obs') });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } closeModal(); toast('Orden modificada ✓', 'g'); await mtRecargar();
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
async function mtOrdAnular(id) {
  var m = await uiPedir('¿Por qué se anula la orden del taller? Su presupuesto también queda anulado.', { obligatorio: true }); if (m === null) return;
  var r = await gsRun('gsMT_OrdenAnular', id, m); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast('Orden anulada ✓', 'g'); MT_.ord = null; await mtRecargar();
}
// ── NUEVA ORDEN (dentro de la misma ventana) ──
// Listas para elegir (nada escrito a mano)
var MT_PIDE = ['Service completo', 'Revisión antes de viaje', 'Frenos', 'Luces y sistema eléctrico', 'Neumáticos', 'Suspensión', 'Motor', 'Pérdida de aire', 'Pérdida de aceite o líquido', 'Ruido o vibración', 'Ejes y mazas'];
var MT_FALLAS = ['Gastado', 'Roto', 'Pierde', 'No funciona', 'Falta', 'Flojo', 'Bajo nivel', 'Sucio'];
// Las marcas y modelos salen del catálogo (Flota y cubiertas → Marcas / Modelos de vehículos)
function mtChips(lista, sel, js) { return '<div class="mt-chips">' + lista.map(function(x, i) { var on = sel.indexOf(x) !== -1; return '<button type="button" class="mt-chip' + (on ? ' on' : '') + '" onclick="' + js + '(' + i + ')">' + (on ? '✔ ' : '') + pcEsc(x) + '</button>'; }).join('') + '</div>'; }
(function() { var st = document.createElement('style'); st.textContent = '.mt-chips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 10px}.mt-chip{min-height:42px;padding:6px 14px;border-radius:22px;border:2px solid #cbd5e1;background:#fff;font-weight:700;font-size:14px;cursor:pointer;color:#334155}.mt-chip.on{background:#1d4ed8;border-color:#1d4ed8;color:#fff}.mt-cli{display:flex;align-items:center;gap:10px;padding:12px;border:2px solid #16a34a;border-radius:12px;background:#f0fdf4;margin-bottom:10px}.mt-res{max-height:260px;overflow:auto;margin-bottom:10px}.mt-bar.pegada{box-shadow:0 -60px 0 0 var(--card,#fff)}.mt-pc{border:1.5px solid var(--border,#e2e8f0);border-radius:12px;padding:10px 12px;margin:0 0 10px;background:var(--card,#fff)}.mt-pc.falta{border-color:#dc2626;background:#fef2f2}.mt-pc.sc{border-color:#16a34a;background:#f0fdf4}.mt-pc-h{font-size:14px;line-height:1.35}.mt-pc-g{display:grid;grid-template-columns:70px 1fr 1fr;gap:8px;margin-top:8px}.mt-pc-g label{font-size:11.5px;color:var(--dim,#64748b);display:flex;flex-direction:column;gap:3px}.mt-pc-g input{min-height:44px;font-size:16px;width:100%;min-width:0}.mt-pc-f{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;font-size:13.5px}.mt-pc-tot{border-top:2px solid var(--border,#e2e8f0);padding-top:8px;margin-top:4px;font-size:15px;display:flex;flex-direction:column;gap:2px;align-items:flex-end}@media(max-width:700px){#page-taller .mt-ordt td.pc-wr{min-width:120px!important;max-width:150px;white-space:normal}.mt-ordt td,.mt-ordt th{padding-left:4px!important;padding-right:4px!important}.mt-ordt td.mono{font-size:11.5px}.mt-ordt .mt-bd{white-space:normal}}.mt-acc6{display:grid;grid-template-columns:repeat(3,auto);gap:3px;justify-content:start}.mt-acc6 .btn{margin:0}.mt-obs .uib{margin:4px 0 0}.mt-obs .uib-res{position:static;max-height:240px}.mt-fo-w{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:10px 12px}.mt-fo-th{display:flex;flex-wrap:wrap;gap:8px}.mt-fo-i{position:relative;width:132px}.mt-fo-i img{width:132px;height:100px;object-fit:cover;border-radius:8px;background:#e2e8f0;cursor:zoom-in;display:block}.mt-fo-p{font-size:10.5px;color:var(--dim,#64748b);line-height:1.25;margin-top:2px}.mt-fo-x{position:absolute;top:4px;right:4px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(15,23,42,.7);color:#fff;font-size:13px;cursor:pointer}@media(max-width:700px){.mt-fo-w{grid-template-columns:1fr;padding:8px}.mt-fo-i,.mt-fo-i img{width:calc(50vw - 40px)}.mt-fo-i img{height:calc((50vw - 40px)*.75)}}'; document.head.appendChild(st); })();
function mtTop() { var m = document.querySelector('main'); if (m) m.scrollTop = 0; window.scrollTo(0, 0); }
function mtNueva() {
  var d = MT_.d, pl = MT_.amb === 'planta';
  var N = MT_.N = MT_.N || { tipo: pl ? '' : 'SERVICIO_CLIENTE', cli: '', eqs: {}, km: {}, q: '', pide: [], sol: '', tel: '' };
  if (!pl) N.tipo = 'SERVICIO_CLIENTE'; else if (N.tipo === 'SERVICIO_CLIENTE') N.tipo = '';
  var c = N.cli ? d.CLIENTES.filter(function(x) { return String(x.ID) === String(N.cli); })[0] : null;
  var eqs = d.EQUIPOS.filter(function(e) { return e.ESTADO !== 'BAJA' && (pl ? !e.ID_CLIENTE : String(e.ID_CLIENTE) === String(N.cli)); });
  var tipoN = {}; d.TIPOS.forEach(function(t) { tipoN[t.ID_TIPO] = t.NOMBRE; });
  var h = '<div class="mb3"><button class="btn btn-s" onclick="MT_.nueva=false;MT_.N=null;mtPintar()">← Volver a la lista de órdenes</button></div>' +
    '<div class="card mb3"><div class="card-hd"><span class="card-title">' + (pl ? '＋ Nueva orden de reparación · máquina propia' : '＋ Nueva orden del taller · cliente') + ' · ' + pcEsc(d.SUC.NOMBRE) + '</span></div><div class="card-body">';
  var n = 1;
  if (pl) {
    h += '<label class="fl">' + (n++) + '. Tipo de trabajo</label>' + uiBusca('mt-n-tipo', { opciones: [{ v: 'PREVENTIVO', t: 'Preventivo' }, { v: 'CORRECTIVO', t: 'Correctivo' }, { v: 'ROTURA', t: 'Rotura' }], sel: N.tipo ? [N.tipo] : [], max: 0, obligatorio: true, onchange: 'mtNTipoSet' });
  } else {
    h += '<label class="fl">' + (n++) + '. Cliente</label>';
    if (c) h += '<div class="mt-cli"><div style="flex:1"><b>' + pcEsc(c.NOMBRE) + '</b><div class="tdim" style="font-size:12px">' + pcEsc([c.CUIT, c.LOCALIDAD].filter(Boolean).join(' · ')) + '</div></div><button class="btn btn-s btn-sm" onclick="MT_.N.cli=\'\';MT_.N.eqs={};mtNueva()">Cambiar</button></div>';
    else {
      var q = String(N.q || '').toUpperCase().trim(), res = q.length < 2 ? [] : d.CLIENTES.filter(function(x) { return (x.NOMBRE + ' ' + x.CUIT).toUpperCase().indexOf(q) !== -1; }).slice(0, 30);
      h += '<input class="fi mb2" id="mt-n-q" placeholder="Buscá el cliente: escribí 2 letras del nombre o el CUIT" value="' + pcEsc(N.q || '') + '" oninput="MT_.N.q=this.value;mtNBuscar()" autocomplete="off"><div class="mt-res" id="mt-n-res">' + mtNRes(res, q) + '</div>';
    }
  }
  if (pl || c) {
    h += '<label class="fl">' + (n++) + '. ' + (pl ? 'Máquinas que entran' : 'Equipos que entran') + ' <span class="tdim">(cada uno con su check list; los km vienen del último registro)</span></label>';
    if (eqs.length > 6) h += '<input class="fi mb2" id="mt-n-eqq" autocomplete="off" placeholder="Buscá el equipo: dominio, marca, modelo o tipo (' + eqs.length + ')" value="' + pcEsc(N.eqq || '') + '" oninput="MT_.N.eqq=this.value;mtNEqFiltro(this.value)">';
    h += '<div id="mt-n-eqs">' + (eqs.length ? eqs.map(function(e) { var ck = !!N.eqs[e.ID_EQUIPO];
        return '<label class="mt-pick" data-t="' + pcEsc((mtEqIdent(e) + ' ' + (tipoN[e.ID_TIPO] || '') + ' ' + e.MARCA + ' ' + e.MODELO).toUpperCase()) + '"' + (ck ? ' data-ck="1"' : '') + '><input type="checkbox"' + (ck ? ' checked' : '') + ' onchange="MT_.N.eqs[' + e.ID_EQUIPO + ']=this.checked;if(this.checked&&!MT_.N.km[' + e.ID_EQUIPO + '])MT_.N.km[' + e.ID_EQUIPO + ']=' + (e.KM_HS || 0) + ';mtNueva()"><div style="flex:1"><b>' + pcEsc(mtEqIdent(e)) + '</b> · ' + pcEsc(tipoN[e.ID_TIPO] || '') + ' · ' + pcEsc(e.MARCA + ' ' + e.MODELO) + '</div>' +
          (ck ? '<input class="fi" style="width:120px;flex:0 0 120px" inputmode="numeric" title="Km / horas de hoy (precargado con el último)" value="' + pcEsc(N.km[e.ID_EQUIPO] || '') + '" onclick="event.preventDefault()" oninput="MT_.N.km[' + e.ID_EQUIPO + ']=this.value">' : (e.KM_HS ? '<span class="tdim" style="font-size:12px">' + Number(e.KM_HS).toLocaleString('es-AR') + ' km</span>' : '')) + '</label>'; }).join('') : '<div class="tdim mb2">' + (pl ? 'No hay máquinas propias cargadas.' : 'Este cliente no tiene equipos cargados.') + '</div>') + '</div>' +
      '<button class="btn btn-s btn-sm mb3" onclick="mtEqForm(null,true)">＋ Equipo nuevo</button>';
    if (!pl) {
      var sols = []; if (c && c.CONTACTO) sols.push(c.CONTACTO); sols.push('Chofer'); sols.push('Encargado de flota');
      if (!N.sol && c && c.CONTACTO) { N.sol = c.CONTACTO; }
      if (!N.tel && c && c.TEL) { N.tel = c.TEL; }
      h += '<label class="fl">' + (n++) + '. Quién la pide</label>' + uiBusca('mt-n-sol', { opciones: sols, sel: N.sol ? [N.sol] : [], otro: true, max: 0, ph: 'Buscá o escribí quién la pide', onchange: 'mtNSolSet' }) +
        '<div class="tdim mb2" style="font-size:13px">Teléfono: <b>' + pcEsc(N.tel || '—') + '</b> <button class="btn btn-s btn-xs" onclick="mtNTel()">Cambiar</button></div>';
    }
    var pide = MT_PIDE.slice(); (d.SERVICIOS || []).forEach(function(sv) { if (sv.NOMBRE && pide.indexOf(sv.NOMBRE) === -1) pide.push(sv.NOMBRE); });
    h += '<label class="fl">' + (n++) + '. Qué ' + (pl ? 'hay que hacer' : 'pide') + ' <span class="tdim">(elegí todos los que correspondan; si no está, escribilo y tocá «Agregar»)</span></label>' +
      uiBusca('mt-n-pide', { opciones: pide, sel: N.pide, multi: true, otro: true, max: 0, ph: 'Buscá el trabajo: frenos, service, luces… (' + pide.length + ' opciones)', onchange: 'mtNPideSet' }) +
      '<button class="btn btn-p mt2" style="min-height:52px;width:100%;font-size:16px" id="mt-n-ok" onclick="mtNuevaOk()">Crear la orden y empezar el check list</button>';
  }
  h += '</div></div>';
  $id('mt-body').innerHTML = h;
  if (N.eqq) mtNEqFiltro(N.eqq);
}
function mtNRes(res, q) {
  if (q.length < 2) return '<div class="tdim" style="font-size:13px">Escribí al menos 2 letras.</div>';
  if (!res.length) return '<div class="al">No hay clientes con «' + pcEsc(q) + '». Si es nuevo, dalo de alta en Clientes.</div>';
  return res.map(function(x) { return '<div class="mt-pick" onclick="MT_.N.cli=' + x.ID + ';MT_.N.q=\'\';MT_.N.eqs={};MT_.N.sol=\'\';MT_.N.tel=\'\';mtNueva()"><div style="flex:1"><b>' + pcEsc(x.NOMBRE) + '</b><div class="tdim" style="font-size:12px">' + pcEsc([x.CUIT, x.LOCALIDAD].filter(Boolean).join(' · ')) + '</div></div><span>›</span></div>'; }).join('');
}
function mtNBuscar() { var q = String(MT_.N.q || '').toUpperCase().trim(); var res = q.length < 2 ? [] : MT_.d.CLIENTES.filter(function(x) { return (x.NOMBRE + ' ' + x.CUIT).toUpperCase().indexOf(q) !== -1; }).slice(0, 30); $id('mt-n-res').innerHTML = mtNRes(res, q); }
function mtNEqFiltro(v) { var w = String(v || '').toUpperCase().trim().split(/\s+/).filter(Boolean); document.querySelectorAll('#mt-n-eqs .mt-pick').forEach(function(el) { var t = el.getAttribute('data-t') || ''; el.style.display = (el.getAttribute('data-ck') || w.every(function(k) { return t.indexOf(k) !== -1; })) ? '' : 'none'; }); }
function mtNTipoSet(sel) { MT_.N.tipo = sel[0] || ''; }
function mtNSolSet(sel) { MT_.N.sol = sel[0] || ''; }
function mtNPideSet(sel) { MT_.N.pide = sel; }
async function mtNTel() { var v = await uiPedir('Teléfono de contacto', { obligatorio: true }); if (v === null) return; MT_.N.tel = v.trim(); mtNueva(); }
async function mtNuevaOk() {
  var N = MT_.N, eqs = Object.keys(N.eqs).filter(function(k) { return N.eqs[k]; }).map(Number);
  if (!N.tipo) { toast('Elegí el tipo de trabajo', 'r2'); return; }
  if (N.tipo === 'SERVICIO_CLIENTE' && !N.cli) { toast('Elegí el cliente', 'r2'); return; }
  if (!eqs.length) { toast('Tildá al menos un equipo', 'r2'); return; }
  if (!N.pide.length) { toast('Elegí qué pide', 'r2'); return; }
  var b = $id('mt-n-ok'); b.disabled = true;
  try { var r = await gsRun('gsMT_OrdenCrear', { TIPO: N.tipo, ID_CLIENTE: N.cli, EQUIPOS: eqs, KM: N.km, SOLICITANTE: N.sol || '', SOLICITANTE_TEL: N.tel || '', OBSERVACIONES: N.pide.join(' · ') });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Orden ' + r.NRO + ' creada ✓', 'g'); MT_.nueva = false; MT_.N = null; await mtRecargar(); await mtAbrir(r.ID_ORDEN);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
// ── VER ORDEN: equipos con su check list + presupuesto ──
async function mtAbrir(id) {
  try { var r = await gsRun('gsMT_Orden', id); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } MT_.ord = r; MT_.lin = null; MT_.dg = 0; mtPintar(); mtTop(); }
  catch (e) { toast(e.message, 'r2'); }
}
// Qué falta del check list en la orden abierta (el presupuesto se arma con todo revisado)
function mtChkFaltaTxt() { var out = []; (MT_.ord.EQUIPOS || []).forEach(function(x) { var pl = mtPl(x.ID_PLANTILLA); if (!pl) return; var f = 0, fe = 0; pl.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(i) { if (!x.RESP[i.ID]) { f++; if (i.ESENCIAL) fe++; } }); }); if (f) out.push(mtEqIdent(mtEq(x.ID_EQUIPO)) + ': faltan ' + f + (fe ? ' (' + fe + ' esenciales)' : '')); }); return out.length ? 'Falta completar el check list. ' + out.join(' · ') : ''; }
function mtOrdenRes(id) { return MT_.d.ORDENES.filter(function(x) { return x.ID_ORDEN === id; })[0]; }
function mtEq(id) { return MT_.d.EQUIPOS.filter(function(e) { return e.ID_EQUIPO === id; })[0] || {}; }
function mtPl(id) { return MT_.d.PLANTILLAS.filter(function(p) { return p.ID_PLANTILLA === id; })[0]; }
function mtOrdenVer() {
  var O = MT_.ord, o = mtOrdenRes(O.ORDEN.ID_ORDEN) || {}, P = O.PRESUP, an = O.ORDEN.ESTADO === 'ANULADA';
  var cerr = ['ANULADA', 'FACTURADA', 'TERMINADA'].indexOf(O.ORDEN.ESTADO) !== -1;
  var h = '<div class="mb3 flex gap2" style="flex-wrap:wrap"><button class="btn btn-s" onclick="MT_.ord=null;mtPintar()">← Volver a la lista de órdenes</button><button class="btn btn-s" onclick="mtImpOrden(' + O.ORDEN.ID_ORDEN + ')">🖨 Orden con check list</button>' + (P ? '<button class="btn btn-s" onclick="mtImpPresup()">🖨 Presupuesto</button>' : '') + '</div>' +
    '<div class="card mb3"><div class="card-hd"><span class="card-title">' + pcEsc(O.ORDEN.NRO) + ' · ' + pcEsc(o.CLIENTE || 'Interno') + '</span>' + mtBadge(O.ORDEN.ESTADO) + '</div><div class="card-body">' +
    '<div class="tdim mb2" style="font-size:13px">' + fmtD(o.FECHA) + ' · Sucursal <b>' + pcEsc(o.SUCURSAL) + '</b>' + (o.SOLICITANTE ? ' · Pidió: <b>' + pcEsc(o.SOLICITANTE) + '</b>' + (o.SOLICITANTE_TEL ? ' (' + pcEsc(o.SOLICITANTE_TEL) + ')' : '') : '') + (o.OBSERVACIONES ? '<br>' + pcEsc(o.OBSERVACIONES) : '') + '</div>' +
    '<label class="fl">Check list de cada equipo</label><div class="mt-eqs mb2">' + O.EQUIPOS.map(function(x) { var e = mtEq(x.ID_EQUIPO), pl = mtPl(x.ID_PLANTILLA), t = 0, r = Object.keys(x.RESP).length, no = 0;
      if (pl) pl.GRUPOS.forEach(function(g) { t += g.ITEMS.length; }); Object.keys(x.RESP).forEach(function(k) { if (pl && x.RESP[k].R === mtMalaResp(mtGrupoDeItem(pl, k))) no++; });
      if (!pl) return O.ORDEN.ESTADO === 'CHECK_LIST' ? '<div class="al" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;width:100%"><b>' + pcEsc(mtEqIdent(e)) + '</b> no tiene check list para su tipo. Elegí cuál usar: <select class="fs" id="mt-oepl-' + x.ID_OE + '" style="max-width:340px">' + mtPlTodas('') + '</select><button class="btn btn-p btn-sm" onclick="mtOePlantilla(' + x.ID_OE + ')">Usar este check list</button></div>' : '<span class="tdim">' + pcEsc(mtEqIdent(e)) + ': sin check list</span>';
      return '<button class="btn ' + (r >= t && t ? 'btn-s' : 'btn-p') + '" onclick="mtAbrirCheck(' + x.ID_OE + ')">✔ ' + pcEsc(mtEqIdent(e)) + ' · ' + pcEsc(mtEqTipo(e).toUpperCase()) + ' · ' + r + '/' + t + (no ? ' · ' + no + ' a reparar' : '') + '</button>' + (mtEqCfg(e) ? '<button class="btn btn-s" onclick="mtRuedas(' + x.ID_OE + ')">🛞 Ruedas y alineación · ' + pcEsc(mtEqIdent(e)) + ' · ' + Object.keys(x.RUEDAS || {}).length + '/' + mtEqCfg(e).POS.length + '</button>' : '') + (['ANULADA', 'FACTURADA', 'TERMINADA'].indexOf(O.ORDEN.ESTADO) === -1 ? '<button class="btn btn-s" onclick="mtFotoLeer(' + x.ID_OE + ')">📷 Leer hoja con foto · ' + pcEsc(mtEqIdent(e)) + '</button>' : ''); }).join('') + '</div>' + (O.ORDEN.ESTADO === 'CHECK_LIST' ? '<button class="btn btn-s btn-sm" onclick="mtOeAgregar()">＋ Agregar otra unidad del cliente a esta orden</button>' : '') + '</div></div>';
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
// ── FOTOS ANTES / DESPUÉS de cada equipo de la orden (20/11/2026). Se guardan con la orden; una cargada por error se saca (queda el rastro) ──
var MT_FOTOS_IMG = {};
async function mtFotosCargar() {
  var c = $id('mt-fotos'); if (!c || !MT_.ord) return;
  var idO = MT_.ord.ORDEN.ID_ORDEN, r;
  try { r = await asImg('vt_ot_fotos', { tok: SES.token, nord: idO }); } catch (e) { r = { ok: false, error: e.message }; }
  c = $id('mt-fotos'); if (!c || !MT_.ord || MT_.ord.ORDEN.ID_ORDEN !== idO) return;
  if (!r || !r.ok) { c.innerHTML = '<div class="al">No se pudieron traer las fotos: ' + pcEsc((r && r.error) || '') + '</div>'; return; }
  MT_.fotos = r.fotos || [];
  var an = MT_.ord.ORDEN.ESTADO === 'ANULADA', eqs = MT_.ord.EQUIPOS || [], h = '<div class="tdim mb2" style="font-size:13px">Sacá la foto <b>antes</b> de tocar el equipo (cómo llegó, la pieza que se cambia) y <b>después</b> (cómo quedó, la pieza nueva). Quedan guardadas en la orden con la fecha y quién las cargó.</div>';
  eqs.forEach(function(x) {
    var e = mtEq(x.ID_EQUIPO);
    h += '<div class="mt-gr mb2"><div class="mt-gh" style="cursor:default">🚛 ' + pcEsc(mtEqIdent(e)) + mtEqTipoBd(e) + ' <span class="tdim" style="font-weight:500;font-size:13px">' + pcEsc((e.MARCA || '') + ' ' + (e.MODELO || '')) + '</span></div><div class="mt-fo-w">';
    ['ANTES', 'DESPUES'].forEach(function(m) {
      var fs = MT_.fotos.filter(function(f) { return f.momento === m && (String(f.oe || '') === String(x.ID_OE) || (!f.oe && eqs.length === 1)); });
      h += '<div class="mt-fo-col"><div style="font-weight:700;margin-bottom:6px">' + (m === 'ANTES' ? 'Antes' : 'Después') + ' <span class="tdim" style="font-weight:400">(' + fs.length + ')</span></div><div class="mt-fo-th">' +
        fs.map(function(f) { return '<div class="mt-fo-i"><img id="mt-fo-' + f.id + '" alt="" onclick="mtFotoVer(' + f.id + ')"><div class="mt-fo-p">' + mtHora(f.creado) + ' · ' + pcEsc(f.usuario || '') + '</div>' + (an ? '' : '<button class="mt-fo-x" title="Sacar esta foto (cargada por error)" onclick="mtFotoSacar(' + f.id + ')">✖</button>') + '</div>'; }).join('') +
        (fs.length ? '' : '<div class="tdim" style="font-size:13px">Sin fotos</div>') + '</div>' +
        (an ? '' : '<label class="btn btn-p" style="min-height:46px;margin-top:8px;display:inline-flex;align-items:center;gap:6px;cursor:pointer">📷 Agregar foto ' + (m === 'ANTES' ? 'antes' : 'después') + '<input type="file" accept="image/*" multiple style="display:none" onchange="mtFotoSubir(this,' + x.ID_OE + ',\'' + m + '\')"></label>') + '</div>';
    });
    h += '</div></div>';
  });
  if (!eqs.length) h += '<div class="tdim">La orden no tiene equipos.</div>';
  c.innerHTML = h;
  MT_.fotos.forEach(function(f) { mtFotoMini(f.id); });
}
async function mtFotoDato(id) {
  if (MT_FOTOS_IMG[id]) return MT_FOTOS_IMG[id];
  var r = await asImg('vt_as_img_get', { tok: SES.token, nid: Number(id) });
  if (r && r.ok) MT_FOTOS_IMG[id] = r.data;
  return MT_FOTOS_IMG[id] || '';
}
async function mtFotoMini(id) { try { var d = await mtFotoDato(id), im = $id('mt-fo-' + id); if (im && d) im.src = d; } catch (e) {} }
async function mtFotoVer(id) {
  var d = await mtFotoDato(id); if (!d) { toast('No se pudo abrir la foto', 'r2'); return; }
  var ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;cursor:zoom-out';
  ov.onclick = function() { ov.remove(); }; ov.innerHTML = '<img src="' + d + '" style="max-width:100%;max-height:100%;border-radius:8px">'; document.body.appendChild(ov);
}
function mtFotoLeer(f) {
  return new Promise(function(ok, mal) { var rd = new FileReader(); rd.onerror = function() { mal(new Error('No se pudo leer la foto')); }; rd.onload = function() { var im = new Image(); im.onerror = function() { mal(new Error('El archivo no es una foto')); }; im.onload = function() { var d = asComprimir(im, 1400, 0.72); if (d.length > 590000) d = asComprimir(im, 1100, 0.6); ok(d); }; im.src = rd.result; }; rd.readAsDataURL(f); });
}
async function mtFotoSubir(inp, idOe, momento) {
  var fs = Array.prototype.slice.call(inp.files || []); if (!fs.length || !MT_.ord) return;
  var idO = MT_.ord.ORDEN.ID_ORDEN, bien = 0, lbl = inp.parentNode; if (lbl) lbl.style.opacity = '.6';
  for (var i = 0; i < fs.length; i++) {
    toast('Subiendo foto ' + (i + 1) + ' de ' + fs.length + '…', 'w');
    try { var d = await mtFotoLeer(fs[i]); var r = await asImg('vt_ot_foto_put', { tok: SES.token, nord: idO, noe: idOe, momento: momento, data: d });
      if (r && r.ok) { MT_FOTOS_IMG[r.id] = d; bien++; } else toast((r && r.error) || 'No se pudo subir la foto', 'r2');
    } catch (e) { toast(e.message, 'r2'); }
  }
  inp.value = ''; if (lbl) lbl.style.opacity = '';
  if (bien) toast(bien + ' foto' + (bien === 1 ? '' : 's') + ' guardada' + (bien === 1 ? '' : 's') + ' ✓', 'g');
  mtFotosCargar();
}
async function mtFotoSacar(id) {
  if (!(await uiConfirmar('¿Sacar esta foto de la orden? (cargada por error; queda registrado quién la sacó)', 'Sí, sacarla'))) return;
  try { var r = await asImg('vt_ot_foto_anular', { tok: SES.token, nid: Number(id) }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Foto sacada', 'g'); mtFotosCargar(); } catch (e) { toast(e.message, 'r2'); }
}
// ── TRABAJO Y CONTROL FINAL: una tarea por servicio aprobado; mecánico, empecé / terminé y control OK o rechazo ──
var MT_TRAB_EST = { PENDIENTE: ['mt-b-o', 'Para hacer'], EN_CURSO: ['mt-b-v', 'Haciéndose'], TERMINADO: ['mt-b-b', 'Terminada: falta control'], OK: ['mt-b-g', 'Control OK'], RECHAZADO: ['mt-b-r', 'Rechazada: rehacer'] };
function mtMin(m) { m = Math.round(Number(m) || 0); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60 ? (m % 60) + ' min' : ''); }
function mtHora(ms) { if (!ms) return ''; var d = new Date(Number(ms)); return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
function mtTrabHtml(O, an) {
  var T = O.TRAB, tr = T.TRABAJOS || [], est = O.ORDEN.ESTADO, ed = est === 'EN_TRABAJO' && mtPuede('EDITAR'), nok = tr.filter(function(t) { return t.ESTADO === 'OK'; }).length;
  var h = '<div class="card mb3" id="mt-trab"><div class="card-hd"><span class="card-title">Trabajo y control final</span>' + (tr.length ? '<span class="mt-bd ' + (nok === tr.length ? 'mt-b-g' : 'mt-b-o') + '">' + nok + ' de ' + tr.length + ' con control OK</span>' : '') + '</div><div class="card-body">';
  if (!tr.length) {
    h += '<div class="tdim mb2">Se arma una tarea por cada servicio aprobado (si el presupuesto solo tiene repuestos, una por equipo). Después a cada tarea se le elige el mecánico, él marca <b>Empecé</b> y <b>Terminé</b>, y el encargado hace el <b>control final</b>: OK o rechazo para rehacer.</div>' +
      (est === 'APROBADA' && !an && mtPuede('AGREGAR') ? '<button class="btn btn-p" style="min-height:48px" id="mt-tr-armar" onclick="mtTrabArmar()">🛠 Armar el trabajo</button>' : '');
    return h + '</div></div>';
  }
  h += '<div class="mt-prog mb3"><div style="width:' + Math.round(nok * 100 / tr.length) + '%"></div></div>';
  var porEq = {}, orden = [];
  tr.forEach(function(t) { var k = String(t.ID_OE || 0); if (!porEq[k]) { porEq[k] = []; orden.push(k); } porEq[k].push(t); });
  var cpsYa = false;
  orden.forEach(function(k) {
    var x = O.EQUIPOS.filter(function(q) { return String(q.ID_OE) === k; })[0], e = x ? mtEq(x.ID_EQUIPO) : null;
    var reps = (T.REPUESTOS || []).filter(function(r) { return String(r.ID_OE || 0) === k; });
    h += '<div class="mt-gr"><div class="mt-gh" style="cursor:default">' + (e ? '🚛 ' + pcEsc(mtEqIdent(e)) + mtEqTipoBd(e) + ' <span class="tdim" style="font-weight:500;font-size:13px">' + pcEsc((e.MARCA || '') + ' ' + (e.MODELO || '')) + '</span>' : 'General') + '</div>';
    porEq[k].forEach(function(t) { h += mtTrabFila(t, T, ed); });
    if (reps.length) h += '<div class="mt-it" style="background:#f8fafc;font-size:13px"><div class="mt-n"><b>Repuestos del presupuesto</b> (se descuentan del stock al cerrar la orden): ' + reps.map(function(r) { return pcEsc(r.DESCRIPCION) + ' × ' + r.CANTIDAD + (r.CLASE === 'CLIENTE' ? ' (los trae el cliente)' : ''); }).join(' · ') + '</div></div>';
    var cps = T.COMPRAS || [];
    if (cps.length && !cpsYa) { cpsYa = true; h += '<div class="mt-it" style="background:#eff6ff;font-size:13px"><div class="mt-n"><b>Comprado para esta orden:</b> ' + cps.map(function(c) { return pcEsc(c.NOMBRE) + ' × ' + String(c.CANTIDAD).replace('.', ',') + ' <span class="tdim">(factura ' + pcEsc(c.FACTURA) + ')</span>' + (c.COBRO ? ' <b>· ' + (c.COBRO === 'COBRAR' ? 'se cobra' : 'sin cargo') + '</b>' : ''); }).join(' · ') + '<div class="tdim" style="font-size:12px">Si no está en el presupuesto ni anotado en una tarea, al cerrar se elige si se cobra o va sin cargo.</div></div></div>'; }
    h += '</div>';
  });
  if (ed) h += '<div class="flex gap2 mt2" style="flex-wrap:wrap;align-items:center"><select class="fs" id="mt-tr-eq" style="max-width:220px">' + O.EQUIPOS.map(function(x) { return '<option value="' + x.ID_OE + '">' + pcEsc(mtEqIdent(mtEq(x.ID_EQUIPO))) + '</option>'; }).join('') + '</select><button class="btn btn-s" onclick="mtTrabAgregar()">＋ Agregar una tarea que apareció</button></div>';
  if (est === 'EN_TRABAJO' && !an) { var SX = T.SALIDA;   // salida al cliente desde la orden del taller (servicios punto 7)
    h += '<div class="mt-it" style="background:#f8fafc;font-size:13px;margin-top:10px"><div class="mt-n"><b>🚚 Salida al cliente</b> <span class="tdim">(si el mecánico va a la base del cliente con herramientas o repuestos)</span><div class="mt2">' +
      (!SX ? (mtPuede('AGREGAR') ? '<button class="btn btn-s" style="min-height:44px" onclick="mtSalida()">🚚 Registrar la salida</button>' : '<span class="tdim">Sin salida.</span>') :
        SX.ESTADO === 'EN_CURSO' ? '<b>' + pcEsc(SX.NRO) + '</b> está afuera · <button class="btn btn-p" style="min-height:44px" onclick="mtRegreso()">↩ Registrar el regreso</button>' :
        '<b>' + pcEsc(SX.NRO) + '</b> volvió · <button class="btn btn-s btn-xs" onclick="mtSalidaVer()">Ver la salida</button>') + '</div></div></div>';
    if (nok === tr.length) h += '<div class="al mt3" style="background:#f0fdf4;border-color:#86efac">Todas las tareas tienen control OK. Al cerrar se hace el remito con lo aprobado (los repuestos descuentan stock) y después se factura desde el presupuesto (botón Facturar).</div>' + (typeof flpCerrarDesde === 'function' && mtPuede('AGREGAR') ? '<button class="btn btn-p mt2" style="min-height:52px;width:100%;font-size:16px" onclick="flpCerrarDesde(' + O.ORDEN.ID_ORDEN + ')">✅ Cerrar la orden y hacer el remito</button>' : '');
    else h += '<div class="tdim mt3" style="font-size:13px">La orden se cierra cuando todas las tareas tengan control OK (faltan ' + (tr.length - nok) + ').</div>';
  }
  return h + '</div></div>';
}
async function mtSalidaCargar() { var r = await gsRun('gsMT_Plan', MT_.ord.ORDEN.ID_ORDEN); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return false; } FLP_.v = r; FLP_.desdeTaller = MT_.ord.ORDEN.ID_ORDEN; return true; }
async function mtSalida() { if (await mtSalidaCargar()) flpSalida(); }
async function mtRegreso() { if (await mtSalidaCargar()) flpRegreso(); }
async function mtSalidaVer() { if (await mtSalidaCargar()) { FLP_.desdeTaller = 0; flpVer(MT_.ord.ORDEN.ID_ORDEN); } }
function mtTrabFila(t, T, ed) {
  var x = MT_TRAB_EST[t.ESTADO] || ['mt-b-x', t.ESTADO], b = '';
  var sel = '<select class="fs" style="max-width:200px;min-height:42px" onchange="mtTrabAcc(' + t.ID_TRAB + ',\'ASIGNAR\',this.value)"' + (ed && t.ESTADO !== 'OK' && t.ESTADO !== 'EN_CURSO' ? '' : ' disabled') + '><option value="">— quién la hace —</option>' + (T.MECANICOS || []).map(function(m) { return '<option value="' + m.ID + '"' + (m.ID === t.ID_EMPLEADO ? ' selected' : '') + '>' + pcEsc(m.N) + (m.P ? ' · ' + pcEsc(m.P.toLowerCase()) : '') + '</option>'; }).join('') + '</select>';
  if (ed) {
    if (t.ESTADO === 'PENDIENTE' || t.ESTADO === 'RECHAZADO') b += '<button class="btn btn-p" style="min-height:44px" onclick="mtTrabAcc(' + t.ID_TRAB + ',\'EMPEZAR\')"' + (t.ID_EMPLEADO ? '' : ' disabled title="Primero elegí quién la hace"') + '>▶ Empecé</button>';
    if (t.ESTADO === 'EN_CURSO') b += '<button class="btn btn-p" style="min-height:44px" onclick="mtTrabAcc(' + t.ID_TRAB + ',\'TERMINAR\')">⏹ Terminé</button>';
    if (t.ESTADO === 'TERMINADO') b += '<button class="btn btn-p" style="min-height:44px;background:#16a34a;border-color:#16a34a" onclick="mtTrabAcc(' + t.ID_TRAB + ',\'OK\')">✔ Control OK</button><button class="btn btn-d" style="min-height:44px" onclick="mtTrabAcc(' + t.ID_TRAB + ',\'RECHAZAR\')">✖ Rechazar</button>';
    if (t.ESTADO === 'PENDIENTE' && t.INTENTOS <= 1 && !t.MINUTOS) b += '<button class="btn btn-s btn-xs" onclick="mtTrabAcc(' + t.ID_TRAB + ',\'ANULAR\')" title="Sacar la tarea (no se hace)">Sacar</button>';
  }
  var inf = [];
  if (t.ESTADO === 'EN_CURSO') inf.push('empezó ' + mtHora(t.INICIO));
  if (t.MINUTOS) inf.push('tiempo ' + mtMin(t.MINUTOS));
  if (t.OBS) inf.push('nota: ' + pcEsc(t.OBS));
  if (t.ESTADO === 'OK') inf.push('controló ' + pcEsc(t.CONTROL_POR) + ' ' + mtHora(t.CONTROL_FECHA) + (t.CONTROL_OBS ? ' · ' + pcEsc(t.CONTROL_OBS) : ''));
  if (t.ESTADO === 'RECHAZADO') inf.push('<b style="color:#b91c1c">rechazó ' + pcEsc(t.CONTROL_POR) + ': ' + pcEsc(t.CONTROL_OBS) + '</b>');
  if (t.INTENTOS > 1) inf.push('vez ' + t.INTENTOS);
  // repuestos usados de más (no estaban en el presupuesto): al cerrar la orden se elige cobrar o sin cargo
  var rx = (T.EXTRAS || []).filter(function(r) { return r.ID_TRAB === t.ID_TRAB; });
  var rxh = rx.length ? '<div style="margin-top:6px;font-size:13px;background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:6px 8px"><b>Repuestos que usó y no estaban en el presupuesto:</b>' + rx.map(function(r) { return '<div class="flex gap2" style="align-items:flex-start;margin-top:4px">' + (ed && !r.ID_REMITO ? '<button class="btn btn-s btn-xs" style="flex:0 0 auto" onclick="mtRexSacar(' + t.ID_TRAB + ',' + r.ID_REX + ')">Sacar</button>' : '') + '<span style="flex:1;min-width:0">' + pcEsc(r.NOMBRE) + ' × ' + String(r.CANTIDAD).replace('.', ',') + (r.OBS ? ' <span class="tdim">· ' + pcEsc(r.OBS) + '</span>' : '') + (r.COBRO ? ' <b style="color:' + (r.COBRO === 'COBRAR' ? '#1d4ed8' : '#15803d') + '">· ' + (r.COBRO === 'COBRAR' ? 'se cobra' : 'sin cargo') + '</b>' : ' <span class="tdim">· al cerrar se elige cobrar o sin cargo</span>') + '</span></div>'; }).join('') + '</div>' : '';
  if (ed && t.ESTADO !== 'PENDIENTE') b += '<button class="btn btn-s" style="min-height:44px" onclick="mtRexAgregar(' + t.ID_TRAB + ')" title="Un repuesto que no estaba en el presupuesto">＋ Repuesto que usé</button>';
  return '<div class="mt-it' + (t.ESTADO === 'OK' ? ' r-OK' : t.ESTADO === 'RECHAZADO' ? ' r-NO' : '') + '" data-trab="' + t.ID_TRAB + '"><div class="mt-n"><b>' + pcEsc(t.DESCRIPCION) + '</b> <span class="mt-bd ' + x[0] + '">' + pcEsc(x[1]) + '</span>' + (inf.length ? '<div class="tdim" style="font-size:12.5px;margin-top:3px">' + inf.join(' · ') + '</div>' : '') + rxh + '</div>' + sel + '<div class="flex gap2" style="flex-wrap:wrap">' + b + '</div></div>';
}
async function mtTrabRecargar() { var id = MT_.ord.ORDEN.ID_ORDEN; await mtRecargar(); await mtAbrir(id); var el = $id('mt-trab'); if (el) el.scrollIntoView({ block: 'start' }); }
async function mtTrabArmar() {
  var b = $id('mt-tr-armar'); if (b) b.disabled = true;
  try { var r = await gsRun('gsMT_TrabArmar', MT_.ord.ORDEN.ID_ORDEN); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast(r.N + ' tarea' + (r.N === 1 ? '' : 's') + ' para hacer ✓', 'g'); await mtTrabRecargar();
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
async function mtTrabAcc(id, acc, v) {
  var d = { ID_TRAB: id, ACCION: acc };
  if (acc === 'ASIGNAR') { if (!v) return; d.ID_EMPLEADO = v; }
  if (acc === 'TERMINAR') { var n = await uiPedir('Terminé. ¿Algo para anotar? (podés dejarlo vacío)', {}); if (n === null) return; d.OBS = n; }
  if (acc === 'RECHAZAR') { var m = await uiPedir('¿Qué está mal? (vuelve al mecánico para rehacerla)', { obligatorio: true }); if (m === null) return; d.OBS = m; }
  if (acc === 'ANULAR') { var a = await uiPedir('¿Por qué se saca esta tarea?', { obligatorio: true }); if (a === null) return; d.OBS = a; }
  try { var r = await gsRun('gsMT_TrabAccion', d); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast({ ASIGNAR: 'Mecánico asignado ✓', EMPEZAR: 'Empezada ✓', TERMINAR: 'Terminada: falta el control ✓', OK: 'Control OK ✓', RECHAZAR: 'Rechazada: vuelve al mecánico', ANULAR: 'Tarea sacada' }[acc], acc === 'RECHAZAR' ? 'r2' : 'g'); await mtTrabRecargar();
  } catch (e) { toast(e.message, 'r2'); }
}
// ＋ Repuesto que usé: el mecánico anota un repuesto que no estaba en el presupuesto (se descuenta del stock al cerrar la orden)
var MT_REX_ = { trab: 0, art: '' };
function mtRexAgregar(idTrab) {
  MT_REX_ = { trab: idTrab, art: '' };
  var ops = (MT_.d.ARTS || []).filter(function(a) { return a.T !== 'SERVICIO'; }).map(function(a) { return { v: String(a.I), t: a.N, sub: (a.C ? a.C + ' · ' : '') + 'stock ' + a.S }; });
  showModal('<div class="mh"><span class="mt">＋ Repuesto que usé</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2" style="font-size:14px">' +
    '<div class="tdim mb2">Para un repuesto que <b>no estaba en el presupuesto</b>. Se descuenta del stock y va al remito cuando se cierra la orden; ahí se elige si se cobra o va sin cargo.</div>' +
    '<div class="fg"><label class="fl">Repuesto *</label>' + uiBusca('mt-rex-a', { opciones: ops, max: 0, sel: [], ph: 'Escribí el nombre o el código (' + ops.length + ')', onchange: 'mtRexArt' }) + '</div>' +
    '<div class="fg mt2"><label class="fl">Cantidad *</label><input class="fi" id="mt-rex-c" inputmode="decimal" value="1" style="max-width:140px"></div>' +
    '<div class="fg mt2"><label class="fl">Nota (para qué, por qué)</label><input class="fi" id="mt-rex-o" placeholder="opcional"></div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="mt-rex-ok" onclick="mtRexOk()">Anotar</button></div>');
}
function mtRexArt(sel) { MT_REX_.art = sel && sel.length ? sel[0] : ''; }
async function mtRexOk() {
  if (!MT_REX_.art) { toast('Elegí el repuesto', 'r2'); return; }
  var b = $id('mt-rex-ok'); b.disabled = true; b.textContent = 'Guardando…';
  try { var r = await gsRun('gsMT_TrabAccion', { ID_TRAB: MT_REX_.trab, ACCION: 'REPUESTO', ID_ARTICULO: MT_REX_.art, CANTIDAD: $v('mt-rex-c'), OBS: $v('mt-rex-o') }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    closeModal(); toast('Repuesto anotado ✓' + (r.STOCK <= 0 ? ' · ojo: el sistema dice que no hay stock' : ''), r.STOCK <= 0 ? 'r2' : 'g'); await mtTrabRecargar();
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) { b.disabled = false; b.textContent = 'Anotar'; } }
}
async function mtRexSacar(idTrab, idRex) {
  var m = await uiPedir('¿Por qué se saca este repuesto? (no se usó, se anotó mal…)', { obligatorio: true }); if (m === null) return;
  try { var r = await gsRun('gsMT_TrabAccion', { ID_TRAB: idTrab, ACCION: 'REP_SACAR', ID_REX: idRex, OBS: m }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Repuesto sacado', 'g'); await mtTrabRecargar();
  } catch (e) { toast(e.message, 'r2'); }
}
async function mtTrabAgregar() {
  var oe = $v('mt-tr-eq'), ds = await uiPedir('¿Qué hay que hacer? (tarea nueva que apareció al trabajar)', { obligatorio: true }); if (ds === null) return;
  try { var r = await gsRun('gsMT_TrabAccion', { ACCION: 'AGREGAR', ID_ORDEN: MT_.ord.ORDEN.ID_ORDEN, ID_OE: oe, DESCRIPCION: ds }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Tarea agregada ✓', 'g'); await mtTrabRecargar();
  } catch (e) { toast(e.message, 'r2'); }
}
function mtStockDe(idArt) { if (!idArt) return null; var a = MT_.d.ARTS.filter(function(x) { return x.I === Number(idArt); })[0]; if (a) return a.S; var s = null; MT_.d.SERVICIOS.forEach(function(sv) { sv.RECETA.forEach(function(r) { if (r.ID_ARTICULO === Number(idArt)) s = r.STOCK; }); }); return s; }
function mtStockTd(l) { if (l.CLASE !== 'REPUESTO' && l.CLASE !== 'INSUMO') return '<td class="tr tdim">—</td>'; var s = mtStockDe(l.ID_ARTICULO); if (s === null) return '<td class="tr tdim">?</td>'; var falta = s < l.CANTIDAD; return '<td class="tr" style="font-weight:700;color:' + (falta ? '#dc2626' : '#16a34a') + '" title="Stock actual (solo en pantalla)">' + s + '</td>'; }
// Filas del pie: subtotal de renglones, descuento general (si hay) y total sin IVA (igual que el total guardado del presupuesto)
function mtPresPie(tot, dg, cols, extra) {
  var dgv = Number(dg) || 0, fin = Math.round(tot * (1 - dgv / 100) * 100) / 100;
  return (dgv ? '<tr><td colspan="' + cols + '" class="tr">Subtotal</td><td class="tr">' + mtPlata(tot) + '</td>' + (extra || '') + '</tr><tr><td colspan="' + cols + '" class="tr">Descuento general ' + String(dgv).replace('.', ',') + '%</td><td class="tr">− ' + mtPlata(Math.round((tot - fin) * 100) / 100) + '</td>' + (extra || '') + '</tr>' : '') +
    '<tr><td colspan="' + cols + '" class="tr"><b>Total sin IVA</b></td><td class="tr"><b>' + mtPlata(fin) + '</b></td>';
}
// 20/11/2026 (Anibal): aviso de repuestos que faltan comprar (lo que pide el presupuesto contra el stock de hoy)
function mtFaltaStock(lin) { var nec = {}, ord = []; (lin || []).forEach(function(l) { if ((l.CLASE === 'REPUESTO' || l.CLASE === 'INSUMO') && Number(l.ID_ARTICULO) > 0) { var k = String(l.ID_ARTICULO); if (!nec[k]) { nec[k] = 0; ord.push(k); } nec[k] += Number(l.CANTIDAD) || 0; } });
  var arts = {}; ((MT_.d && MT_.d.ARTS) || []).forEach(function(a) { arts[String(a.I)] = a; });
  return ord.map(function(k) { var a = arts[k] || {}, hay = Number(a.S) || 0; return { N: a.N || ('Artículo ' + k), C: a.C || '', NEC: nec[k], HAY: hay }; }).filter(function(x) { return x.HAY < x.NEC - 1e-9; }); }
function mtFaltaStockHtml(lin) { var f = mtFaltaStock(lin); if (!f.length) return '';
  return '<div style="border:2px solid #ea7317;background:#fff7ed;border-radius:10px;padding:10px 12px;margin:0 0 10px;font-size:13.5px;line-height:1.5"><b>⚠ Faltan comprar</b> (no alcanza el stock):<ul style="margin:4px 0 0;padding-left:18px">' +
    f.map(function(x) { return '<li><b>' + pcEsc(x.N) + '</b>' + (x.C ? ' <span class="tdim mono">' + pcEsc(x.C) + '</span>' : '') + ': se necesitan ' + x.NEC + ', hay ' + x.HAY + ' → comprar <b>' + Math.round((x.NEC - x.HAY) * 1000) / 1000 + '</b></li>'; }).join('') +
    '</ul><div class="tdim" style="font-size:12px;margin-top:4px">Cargá la compra antes de cerrar la orden: sin stock no se puede cerrar.</div></div>'; }
function mtPresTabla(det, soloVer, dg) {
  if (window.innerWidth < 700) { var tt = 0; var hc = det.map(function(l) { tt += l.SUBTOTAL; return '<div class="mt-pc"><div class="mt-pc-h"><span class="mt-bd mt-b-x">' + pcEsc(l.CLASE) + '</span> <b>' + pcEsc(l.DESCRIPCION) + '</b></div><div class="mt-pc-f"><span>' + (mtSinCargo(l) ? l.CANTIDAD + ' × sin cargo' : l.CANTIDAD + ' × ' + mtPlata(mtPresPuDe(l)) + ' sin IVA') + '</span><b>' + (mtSinCargo(l) ? 'SIN CARGO' : mtPlata(l.SUBTOTAL)) + '</b></div></div>'; }).join('');
    var ff = Math.round(tt * (1 - (Number(dg) || 0) / 100) * 100) / 100;
    return hc + '<div class="mt-pc-tot">' + (Number(dg) ? '<div>Descuento general ' + String(dg).replace('.', ',') + '%</div>' : '') + '<div>Total sin IVA <b>' + mtPlata(ff) + '</b></div><div>Total con IVA <b>' + mtPlata(Math.round(ff * 121) / 100) + '</b></div></div>'; }
  var tot = 0, ve = MT_.d.VE_COSTO, cos = 0;
  var cls = { SERVICIO: 'mt-b-b', REPUESTO: 'mt-b-g', INSUMO: 'mt-b-v', TERCERO: 'mt-b-o', CLIENTE: 'mt-b-x' };
  var rows = det.map(function(l) { tot += l.SUBTOTAL; cos += (l.COSTO_UNIT || 0) * l.CANTIDAD;
    return '<tr><td><span class="mt-bd ' + (cls[l.CLASE] || 'mt-b-x') + '">' + pcEsc(l.CLASE) + '</span></td><td class="pc-wr">' + pcEsc(l.DESCRIPCION) + '</td>' + mtStockTd(l) + '<td class="tr">' + l.CANTIDAD + '</td><td class="tr">' + mtPlata(mtPresPuDe(l)) + (Math.abs(mtPresPuDe(l) - (Number(l.PRECIO_LISTA) || 0)) >= 0.005 && l.PRECIO_LISTA ? '<div class="tdim" style="font-size:11px">lista ' + mtPlata(l.PRECIO_LISTA) + '</div>' : '') + '</td><td class="tr">' + (l.DESCUENTO_PCT > 0 ? String(l.DESCUENTO_PCT).replace('.', ',') + '%' : '') + '</td><td class="tr"><b>' + mtPlata(l.SUBTOTAL) + '</b></td>' + (ve ? '<td class="tr tdim">' + mtPlata((l.COSTO_UNIT || 0) * l.CANTIDAD) + '</td>' : '') + '</tr>'; }).join('');
  return '<div class="tw pc-abm" data-noimp="1"><table style="font-size:12.5px"><thead><tr><th>Clase</th><th>Descripción</th><th class="tr">Stock</th><th class="tr">Cant.</th><th class="tr">Precio s/IVA</th><th class="tr">Desc.</th><th class="tr">Subtotal</th>' + (ve ? '<th class="tr">Costo</th>' : '') + '</tr></thead><tbody>' + rows +
    mtPresPie(tot, dg, 6, ve ? '<td></td>' : '') + (ve ? (function() { var fin = Math.round(tot * (1 - (Number(dg) || 0) / 100) * 100) / 100; return '<td class="tr tdim">' + mtPlata(cos) + (fin ? ' · margen ' + Math.round((fin - cos) / fin * 100) + '%' : '') + '</td>'; })() : '') + '</tr></tbody></table></div>';
}
async function mtPresArmar() {
  try { var r = await gsRun('gsMT_PresupSugerido', MT_.ord.ORDEN.ID_ORDEN); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    if (!r.LINEAS.length) toast('El check list no tiene nada en NO: agregá a mano lo que haga falta', 'b');
    MT_.lin = r.LINEAS; mtOrdenVer();
  } catch (e) { toast(e.message, 'r2'); }
}
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
    h += '<div class="card mb3"><div class="card-hd"><span class="card-title">' + pcEsc(mtEqIdent(e)) + ' · ' + pcEsc(mtEqTipo(e).toUpperCase()) + ' · ' + pcEsc((e.MARCA || '') + ' ' + (e.MODELO || '')) + '</span></div><div class="card-body" style="padding-top:6px">' +
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
function mtPresCorregir() { MT_.lin = MT_.ord.PRESUP.DET.map(function(l) { var c = {}; Object.keys(l).forEach(function(k) { c[k] = l[k]; }); if (Number(c.DESCUENTO_PCT) >= 100 && !(Number(c.PRECIO_UNIT) > 0)) c.SIN_CARGO = 1; return c; }); MT_.dg = Number(MT_.ord.PRESUP.DESCUENTO_PCT) || 0; mtOrdenVer(); }
function mtNum(v) { var t = String(v == null ? '' : v).replace(/[\s$]/g, ''); if (t.indexOf(',') > -1) t = t.replace(/\./g, '').replace(',', '.'); else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, ''); var x = parseFloat(t); return isNaN(x) ? 0 : x; }
function mtSinCargo(l) { return !!(l && (Number(l.SIN_CARGO) === 1 || l.SIN_CARGO === true || (Number(l.DESCUENTO_PCT) >= 100 && !(Number(l.PRECIO_UNIT) > 0)))); }
// Marca o saca «Sin cargo» en un renglón del presupuesto (20/11/2026)
function mtPresSinCargo(i) { var l = MT_.lin[i]; if (!l) return; if (mtSinCargo(l)) { l.SIN_CARGO = 0; l.DESCUENTO_PCT = 0; l.PRECIO_UNIT = ''; } else { l.SIN_CARGO = 1; l.PRECIO_UNIT = 0; l.DESCUENTO_PCT = 100; } mtOrdenVer(); }
function mtPresPuDe(l) { var pl = Number(l.PRECIO_LISTA) || 0; return l.PRECIO_UNIT !== undefined && l.PRECIO_UNIT !== null && l.PRECIO_UNIT !== '' ? Number(l.PRECIO_UNIT) || 0 : Math.round(pl * (1 - (Number(l.DESCUENTO_PCT) || 0) / 100) * 100) / 100; }
// Cambia el precio de un renglón: q = 'SIN' (precio s/IVA), 'CON' (final c/IVA 21%), 'DTO' (descuento %), 'LISTA' (precio de un tercero). Precio y descuento quedan siempre de acuerdo.
function mtPresPrecio(i, q, v) {
  var l = MT_.lin[i], x = mtNum(v), pl = Number(l.PRECIO_LISTA) || 0, pu;
  if (q === 'DTO') { l.DESCUENTO_PCT = x; l.PRECIO_UNIT = Math.round(pl * (1 - x / 100) * 100) / 100; }
  else if (q === 'LISTA') { l.PRECIO_LISTA = x; l.PRECIO_UNIT = Math.round(x * (1 - (Number(l.DESCUENTO_PCT) || 0) / 100) * 100) / 100; }
  else { pu = q === 'CON' ? Math.round(x / 1.21 * 100) / 100 : x; l.PRECIO_UNIT = pu; if (pl > 0) l.DESCUENTO_PCT = Math.round((1 - pu / pl) * 10000) / 100; else { l.PRECIO_LISTA = pu; l.DESCUENTO_PCT = 0; } }
  mtOrdenVer();
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
function mtPresOe() { var el = $id('mt-p-eq'); if (el) return Number(el.value) || ''; return MT_.ord.EQUIPOS.length === 1 ? MT_.ord.EQUIPOS[0].ID_OE : ''; }
function mtPresEqTxt(oe) { var x = MT_.ord.EQUIPOS.filter(function(q) { return String(q.ID_OE) === String(oe); })[0]; return x ? ' — ' + mtEqIdent(mtEq(x.ID_EQUIPO)) : ''; }
function mtPresAddServ(id) {
  var s = MT_.d.SERVICIOS.filter(function(x) { return String(x.ID_SERVICIO) === String(id); })[0]; if (!s) return;
  if (s.CODIGO === 'TLR-TERCERO') { MT_.lin.push({ CLASE: 'TERCERO', ID_OE: mtPresOe(), ID_SERVICIO: s.ID_SERVICIO, DESCRIPCION: 'Trabajo de tercero: ', CANTIDAD: 1, PRECIO_LISTA: 0, COSTO_UNIT: 0, DESCUENTO_PCT: 0 }); mtOrdenVer(); return; }
  var oe = mtPresOe(); MT_.lin.push({ CLASE: 'SERVICIO', ID_OE: oe, ID_SERVICIO: s.ID_SERVICIO, ID_ARTICULO: s.ID_ARTICULO, DESCRIPCION: s.NOMBRE + mtPresEqTxt(oe), CANTIDAD: 1, PRECIO_LISTA: s.PRECIO, DESCUENTO_PCT: 0, COSTO_UNIT: Math.round(s.HORAS * MT_.d.COSTO_HORA * 100) / 100 });
  s.RECETA.forEach(function(r) { MT_.lin.push({ CLASE: 'REPUESTO', ID_OE: oe, ID_SERVICIO: s.ID_SERVICIO, ID_ARTICULO: r.ID_ARTICULO, DESCRIPCION: r.NOMBRE, CANTIDAD: r.CANT, PRECIO_LISTA: r.PRECIO, DESCUENTO_PCT: 0, COSTO_UNIT: r.COSTO }); });
  mtOrdenVer();
}
// Mientras escribe el precio en el celular: se actualiza el otro precio, el subtotal y el total sin redibujar (así no se pierde el toque en «Guardar»)
function mtPcVivo(i, q, v) {
  var l = MT_.lin[i], x = mtNum(v), pl = Number(l.PRECIO_LISTA) || 0, c = $id('mt-pc-' + i); if (!l || !c) return;
  if (q === 'CANT') l.CANTIDAD = x;
  else { l.SIN_CARGO = 0; var pu = q === 'CON' ? Math.round(x / 1.21 * 100) / 100 : x; l.PRECIO_UNIT = pu; if (pl > 0) l.DESCUENTO_PCT = Math.round((1 - pu / pl) * 10000) / 100; else { l.PRECIO_LISTA = pu; l.DESCUENTO_PCT = 0; }
    var otro = c.querySelector('input[data-q="' + (q === 'CON' ? 'SIN' : 'CON') + '"]'); if (otro) otro.value = pu ? String(q === 'CON' ? pu : Math.round(pu * 121) / 100).replace('.', ',') : ''; }
  var pu2 = mtPresPuDe(l); c.classList.toggle('falta', pu2 <= 0 && l.CLASE !== 'CLIENTE' && !mtSinCargo(l)); var sb = c.querySelector('.mt-pc-sub'); if (sb) sb.textContent = mtPlata(Math.round(pu2 * l.CANTIDAD * 100) / 100);
  var tot = 0; MT_.lin.forEach(function(z) { tot += Math.round(mtPresPuDe(z) * z.CANTIDAD * 100) / 100; }); var fin = Math.round(tot * (1 - (Number(MT_.dg) || 0) / 100) * 100) / 100;
  var t = $id('mt-pc-tot'); if (t) t.innerHTML = '<div>Total sin IVA <b>' + mtPlata(fin) + '</b></div><div>Total con IVA <b>' + mtPlata(Math.round(fin * 121) / 100) + '</b></div>';
}
function mtPresAddServSel(sel) { if (sel.length) mtPresAddServ(sel[0]); }
function mtPresAddArtSel(sel) { if (!sel.length) return; var a = MT_.d.ARTS.filter(function(x) { return x.C === sel[0]; })[0]; if (a) mtPresAddArt(a.C + ' · ' + a.N); }
function mtPresAddArt(v) {
  var c = String(v || '').split(' · ')[0], a = MT_.d.ARTS.filter(function(x) { return x.C === c; })[0]; if (!a) { if (v) toast('No encontré ese artículo en la lista vigente', 'r2'); return; }
  MT_.lin.push({ CLASE: /QUIMICOS/.test(a.R) ? 'INSUMO' : 'REPUESTO', ID_OE: mtPresOe(), ID_ARTICULO: a.I, DESCRIPCION: a.N, CANTIDAD: 1, PRECIO_LISTA: a.P, DESCUENTO_PCT: 0 }); mtOrdenVer();
}
async function mtPresGuardar() {
  var b = $id('mt-p-ok'); b.disabled = true;
  try { var r = await gsRun('gsMT_PresupGuardar', { ID_ORDEN: MT_.ord.ORDEN.ID_ORDEN, LINEAS: MT_.lin, DESCUENTO_PCT: Number(MT_.dg) || 0 });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Presupuesto ' + r.NRO + ' guardado · ' + mtPlata(r.TOTAL) + ' sin IVA ✓', 'g'); MT_.lin = null; var id = MT_.ord.ORDEN.ID_ORDEN; await mtRecargar(); await mtAbrir(id);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
async function mtPresEstado(est) {
  var P = MT_.ord.PRESUP, d = { ID_PRESUP: P.ID_PRESUP, ESTADO: est };
  if (est === 'APROBADO') { var q = await uiPedir('¿Quién lo aprobó en el cliente? (nombre y cómo: WhatsApp, mail, firmado)', { obligatorio: true }); if (q === null) return; d.APROBADO_POR = q; d.MEDIO = /mail/i.test(q) ? 'MAIL' : /firm/i.test(q) ? 'FIRMADO' : 'WHATSAPP'; }
  if (est === 'RECHAZADO') { var m = await uiPedir('¿Por qué no lo aprobó?', { obligatorio: true }); if (m === null) return; d.MOTIVO = m; }
  try { var r = await gsRun('gsMT_PresupEstado', d); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast({ ENVIADO: 'Marcado como enviado ✓', APROBADO: 'Presupuesto aprobado ✓', RECHAZADO: 'Presupuesto rechazado' }[est], 'g'); var id = MT_.ord.ORDEN.ID_ORDEN; await mtRecargar(); await mtAbrir(id);
  } catch (e) { toast(e.message, 'r2'); }
}
// ── CHECK LIST (celular o tablet): mapa con tildes. Cada toque se guarda solo. ──
// Todos los check lists (para un tipo que no tiene uno propio), agrupados por tipo
function mtPlTodas(sel) { var tip = {}; (MT_.d.TIPOS || []).forEach(function(t) { tip[String(t.ID_TIPO)] = t.NOMBRE; });
  return '<option value="">— elegí el check list —</option>' + MT_.d.PLANTILLAS.slice().sort(function(a, b) { return a.ID_TIPO - b.ID_TIPO || (a.NOMBRE < b.NOMBRE ? -1 : 1); }).map(function(p) { return '<option value="' + p.ID_PLANTILLA + '"' + (String(p.ID_PLANTILLA) === String(sel || '') ? ' selected' : '') + '>' + pcEsc((tip[String(p.ID_TIPO)] ? tip[String(p.ID_TIPO)] + ' · ' : '') + p.NOMBRE) + '</option>'; }).join(''); }
// Agregar otra unidad del mismo cliente con la orden en check list (24/11/2026: camión y acoplado en la misma orden)
async function mtOeAgregar() {
  var O = MT_.ord, o = mtOrdenRes(O.ORDEN.ID_ORDEN) || {}, cli = String(O.ORDEN.ID_CLIENTE || o.ID_CLIENTE || ''), ya = O.EQUIPOS.map(function(x) { return String(x.ID_EQUIPO); });
  var ops = MT_.d.EQUIPOS.filter(function(e) { return String(e.ID_CLIENTE) === cli && ya.indexOf(String(e.ID_EQUIPO)) === -1 && e.ESTADO !== 'BAJA'; }).map(function(e) { return [e.ID_EQUIPO, mtEqIdent(e) + ' · ' + (e.MARCA || '') + ' ' + (e.MODELO || '')]; });
  if (!ops.length) { toast('El cliente no tiene otra unidad cargada: dala de alta en Unidades y máquinas', 'w'); return; }
  var id = await uiElegir('¿Qué unidad agregás a la orden?', ops); if (id === null || id === undefined) return;
  try { var r = await gsRun('gsMT_OrdenEquipoAgregar', { ID_ORDEN: O.ORDEN.ID_ORDEN, ID_EQUIPO: Number(id) }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Unidad agregada a la orden ✓', 'g'); var io = O.ORDEN.ID_ORDEN; await mtRecargar(); await mtAbrir(io);
  } catch (e) { toast(e.message || e, 'r2'); }
}
async function mtOePlantilla(idOe) { var v = $v('mt-oepl-' + idOe); if (!v) { toast('Elegí el check list', 'r2'); return; }
  try { var r = await gsRun('gsMT_OrdenPlantilla', { ID_OE: idOe, ID_PLANTILLA: v }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Check list asignado ✓', 'g'); var id = MT_.ord.ORDEN.ID_ORDEN; await mtRecargar(); await mtAbrir(id); mtAbrirCheck(idOe);
  } catch (e) { toast(e.message, 'r2'); } }
function mtAbrirCheck(idOe) { MT_.oe = idOe; MT_.pend = {}; MT_.grAb = {}; mtPintar(); mtTop(); }
function mtOeAct() { return MT_.ord.EQUIPOS.filter(function(x) { return x.ID_OE === MT_.oe; })[0]; }
function mtCheck() {
  var x = mtOeAct(), e = mtEq(x.ID_EQUIPO), pl = mtPl(x.ID_PLANTILLA), O = MT_.ord.ORDEN;
  var bloq = ['ANULADA', 'FACTURADA', 'TERMINADA'].indexOf(O.ESTADO) !== -1;
  if (!pl) { $id('mt-body').innerHTML = '<div class="al">Este equipo no tiene check list para su tipo. Elegí cuál usar:</div><div class="flex gap2 mt2" style="flex-wrap:wrap"><select class="fs" id="mt-oepl-' + x.ID_OE + '" style="max-width:360px">' + mtPlTodas('') + '</select><button class="btn btn-p" onclick="mtOePlantilla(' + x.ID_OE + ')">Usar este check list</button></div><button class="btn btn-s mt2" onclick="MT_.oe=null;mtPintar()">← Volver</button>'; return; }
  var t = 0, r = 0, no = 0, te = 0, re = 0; pl.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(i) { t++; if (i.ESENCIAL) te++; var v = x.RESP[i.ID]; if (v) { r++; if (i.ESENCIAL) re++; if (v.R === mtMalaResp(g)) no++; } }); });
  var h = '<div class="mt-bar"><div class="flex gap2" style="align-items:center;flex-wrap:wrap"><button class="btn btn-s" onclick="mtCheckSalir()">← Volver a la orden</button><div style="flex:1;min-width:150px"><b style="font-size:16px">' + pcEsc(mtEqIdent(e)) + '</b> · ' + pcEsc(e.MARCA + ' ' + e.MODELO) + '<div class="tdim" style="font-size:12px">' + pcEsc(O.NRO) + ' · ' + pcEsc(pl.CODIGO) + ' ' + pcEsc(pl.NOMBRE) + '</div>' + mtCubTxt(e, 'div') + '</div>' +
    '<div style="text-align:right"><b>' + r + '/' + t + '</b>' + (te ? '<div style="font-size:12px;color:' + (re < te ? '#b91c1c' : '#15803d') + '">Esenciales ' + re + '/' + te + '</div>' : '') + (no ? ' · <b style="color:#dc2626">' + no + ' a reparar</b>' : '') + '<div class="tdim" style="font-size:11px" id="mt-gs">' + (Object.keys(MT_.pend).length ? 'Guardando…' : 'Guardado') + '</div></div></div>' +
    '<div class="mt-prog"><div style="width:' + (t ? Math.round(r / t * 100) : 0) + '%"></div></div></div>' +
    (bloq ? '<div class="al mb2">La orden está ' + pcEsc(O.ESTADO.toLowerCase()) + ': el check list se ve pero no se cambia.</div>' : '') +
    (te && !bloq ? '<div class="tdim mb2" style="font-size:13px">Se revisa <b>todo</b>. Los ítems <span class="mt-es">ESENCIAL</span> (seguridad) se contestan uno por uno; en el resto, si está todo bien, podés marcar el grupo entero con un toque.</div>' : '') +
    '<div class="fg"><label class="fl">Km / horas del equipo hoy <span class="tdim">(precargado con el último registro)</span></label><input class="fi" inputmode="numeric" style="max-width:200px" value="' + (x.KM_HS || e.KM_HS || '') + '"' + (bloq ? ' disabled' : '') + ' onchange="mtChkKm(this.value)"></div>';
  pl.GRUPOS.forEach(function(g) {
    var gr = 0, gno = 0, pe = 0, pn = 0; g.ITEMS.forEach(function(i) { var v = x.RESP[i.ID]; if (v) { gr++; if (v.R === mtMalaResp(g)) gno++; } else if (i.ESENCIAL) pe++; else pn++; });
    var comp = gr === g.ITEMS.length, ab = MT_.grAb[g.ID_GRUPO] !== undefined ? MT_.grAb[g.ID_GRUPO] : !comp;
    var ops = g.RESP === 'SI_NO_NA' ? [['SI', 'SÍ'], ['NO', 'NO'], ['NA', 'N/A']] : [['OK', 'OK'], ['NO', 'NO'], ['NA', 'N/A']];
    h += '<div class="mt-gr"><div class="mt-gh' + (comp ? (gno ? ' no' : ' ok') : '') + '" onclick="MT_.grAb[' + g.ID_GRUPO + ']=' + (ab ? 'false' : 'true') + ';mtCheck()"><span>' + (comp ? (gno ? '⚠' : '✅') : '◻') + '</span><span>' + pcEsc(g.NOMBRE) + '</span><span class="mt-pg">' + gr + '/' + g.ITEMS.length + (gno ? ' · ' + gno + ' ✖' : '') + (pe ? ' · <span style="color:#b91c1c">' + pe + ' esenc.</span>' : '') + ' ' + (ab ? '▾' : '▸') + '</span></div>';
    if (ab) {
      if (!bloq && g.RESP !== 'SI_NO_NA' && (pn || pe)) h += '<div class="mt-it" style="justify-content:flex-end">' + (pe ? '<span class="mt-esnota">' + pe + ' esencial' + (pe > 1 ? 'es' : '') + ': contestalo' + (pe > 1 ? 's' : '') + ' uno por uno</span>' : '') + (pn ? '<button class="btn btn-s btn-sm" onclick="mtChkTodo(' + g.ID_GRUPO + ')">✔ ' + (pe ? 'El resto' : 'Lo que falta') + ' de este grupo: todo OK (' + pn + ')</button>' : '') + '</div>';
      g.ITEMS.filter(function(i) { return i.ESENCIAL; }).concat(g.ITEMS.filter(function(i) { return !i.ESENCIAL; })).forEach(function(i) { var v = x.RESP[i.ID] || {}, mal = v.R === mtMalaResp(g);
        h += '<div class="mt-it' + (i.ESENCIAL ? ' es' : '') + (v.R ? ' r-' + (mal ? 'NO' : v.R) : '') + '"><div class="mt-n">' + (i.ESENCIAL ? '<span class="mt-es">ESENCIAL</span>' : '') + pcEsc(i.NOMBRE) + '</div><div class="mt-rb">' + ops.map(function(o) {
          return '<button' + (bloq ? ' disabled' : '') + ' class="' + (v.R === o[0] ? 's-' + (o[0] === mtMalaResp(g) ? 'NO' : (o[0] === 'NA' ? 'NA' : 'OK')) : '') + '" onclick="mtChkSet(' + i.ID + ',\'' + o[0] + '\')">' + o[1] + '</button>'; }).join('') + '</div>' +
          (mal ? '<div class="mt-obs"><div class="tdim" style="font-size:12px">¿Qué tiene? (se pasa al presupuesto)</div>' + (bloq ? '<b>' + pcEsc(v.OBS || '—') + '</b>' : uiBusca('mt-f-' + i.ID, { opciones: MT_FALLAS, sel: String(v.OBS || '').split(', ').filter(Boolean), multi: true, otro: true, max: 0, ph: 'Buscá o escribí qué tiene (pierde, roto, gastado…)', onchange: 'mtChkFallaSet' })) + '</div>' : '') + '</div>'; });
    }
    h += '</div>';
  });
  h += '<div class="fg mt2"><label class="fl">Observaciones del equipo</label><input class="fi" value="' + pcEsc(x.OBSERVACIONES || '') + '"' + (bloq ? ' disabled' : '') + ' onchange="mtChkObsEq(this.value)"></div>' +
    '<button class="btn btn-p mt2" style="width:100%;min-height:52px;font-size:16px" onclick="mtCheckSalir()">' + (r >= t ? '✅ Listo: volver a la orden y armar el presupuesto' : 'Guardar y volver a la orden (faltan ' + (t - r) + (te - re ? ', ' + (te - re) + ' esenciales' : '') + ')') + '</button>';
  var sc = document.querySelector('main') || document.scrollingElement, y = sc.scrollTop; $id('mt-body').innerHTML = h; sc.scrollTop = y; mtBarPegada();
}
function mtBarPegada() { var sc = document.querySelector('main'), b = document.querySelector('.mt-bar'); if (!sc || !b) return; var pad = parseFloat(getComputedStyle(sc).paddingTop) || 0; b.classList.toggle('pegada', b.getBoundingClientRect().top <= sc.getBoundingClientRect().top + pad + 1 && sc.scrollTop > 0); if (!sc._mtb) { sc._mtb = 1; sc.addEventListener('scroll', mtBarPegada, { passive: true }); } }
function mtChkSet(id, v) { var x = mtOeAct(), a = x.RESP[id] || {}, g = mtGrupoDeItem(mtPl(x.ID_PLANTILLA), id); x.RESP[id] = { R: v, OBS: v === mtMalaResp(g) ? (a.OBS || '') : '' }; MT_.pend[id] = 1; mtCheck(); mtChkProg(); }
async function mtChkFalla(id, k) { var x = mtOeAct(); if (!x.RESP[id]) return; var L = String(x.RESP[id].OBS || '').split(', ').filter(Boolean);
  if (k >= MT_FALLAS.length) { var v = await uiPedir('¿Qué tiene? (otra falla)', { obligatorio: true }); if (v === null) return; L.push(v.trim()); }
  else { var f = MT_FALLAS[k], j = L.indexOf(f); if (j === -1) L.push(f); else L.splice(j, 1); }
  x.RESP[id].OBS = L.join(', '); MT_.pend[id] = 1; mtCheck(); mtChkProg(); }
// 20/11/2026 (Anibal): «¿Qué tiene?» con lista desplegable de búsqueda (no botones); lo elegido o escrito se guarda solo
function mtChkFallaSet(sel, uid) { var id = Number(String(uid).replace('mt-f-', '')), x = mtOeAct(); if (!x || !x.RESP[id]) return; x.RESP[id].OBS = sel.join(', '); MT_.pend[id] = 1; mtChkProg(); }
function mtChkObs(id, t) { var x = mtOeAct(); if (!x.RESP[id]) return; x.RESP[id].OBS = t; MT_.pend[id] = 1; mtChkProg(); }
function mtChkTodo(idG) { var x = mtOeAct(), pl = mtPl(x.ID_PLANTILLA); pl.GRUPOS.forEach(function(g) { if (g.ID_GRUPO !== idG) return; g.ITEMS.forEach(function(i) { if (!x.RESP[i.ID] && !i.ESENCIAL) { x.RESP[i.ID] = { R: 'OK', OBS: '' }; MT_.pend[i.ID] = 1; } }); }); var gq = pl.GRUPOS.filter(function(g) { return g.ID_GRUPO === idG; })[0]; MT_.grAb[idG] = gq.ITEMS.some(function(i) { return !x.RESP[i.ID]; }); mtCheck(); mtChkProg(); }
function mtChkKm(v) { MT_.km = v; MT_.pend._km = 1; mtChkProg(); }
function mtChkObsEq(v) { MT_.obsEq = v; MT_.pend._obs = 1; mtChkProg(); }
function mtChkProg() { if (MT_.tmr) clearTimeout(MT_.tmr); var g = $id('mt-gs'); if (g) g.textContent = 'Guardando…'; MT_.tmr = setTimeout(mtChkGuardar, 1200); }
async function mtChkGuardar() {
  MT_.tmr = null; var x = mtOeAct(); if (!x) return;
  var ks = Object.keys(MT_.pend); if (!ks.length) return; MT_.pend = {};
  var d = { ID_ORDEN: MT_.ord.ORDEN.ID_ORDEN, ID_OE: x.ID_OE, RESP: ks.filter(function(k) { return k.charAt(0) !== '_'; }).map(function(k) { return { ID: Number(k), R: x.RESP[k].R, OBS: x.RESP[k].OBS || '' }; }) };
  if (ks.indexOf('_km') !== -1) { d.KM_HS = MT_.km; x.KM_HS = MT_.km; }
  if (ks.indexOf('_obs') !== -1) { d.OBS_EQ = MT_.obsEq; x.OBSERVACIONES = MT_.obsEq; }
  // Sin señal: lo marcado queda guardado en el teléfono (misma cola que la flota) y se envía solo cuando vuelve
  var desc = 'Check list ' + MT_.ord.ORDEN.NRO + ' · ' + mtEqIdent(mtEq(x.ID_EQUIPO)) + ' (' + d.RESP.length + ' respuesta' + (d.RESP.length === 1 ? '' : 's') + ')';
  try { var r = typeof flEnviar === 'function' ? await flEnviar('gsMT_ChkGuardar', d, desc) : await gsRun('gsMT_ChkGuardar', d); var g = $id('mt-gs');
    if (r && r.COLA) { MT_.cola = 1; if (g) g.innerHTML = '<b style="color:#b45309">📵 Sin señal: guardado en el teléfono</b>'; return; }
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo guardar el check list', 'r2'); ks.forEach(function(k) { MT_.pend[k] = 1; }); if (g) g.textContent = 'Sin guardar'; return; }
    if (g && !Object.keys(MT_.pend).length) g.textContent = 'Guardado ✓';
  } catch (e) { ks.forEach(function(k) { MT_.pend[k] = 1; }); toast('Sin conexión: se vuelve a intentar', 'r2'); MT_.tmr = setTimeout(mtChkGuardar, 5000); }
}
function mtColaListo() { if (!MT_.cola || typeof flqLeer !== 'function') return; if (flqLeer().some(function(q) { return q.FN === 'gsMT_ChkGuardar'; })) return; MT_.cola = 0; var g = $id('mt-gs'); if (g) g.textContent = 'Guardado ✓ (se envió al volver la señal)'; }
function mtSinSenal() { return typeof navigator !== 'undefined' && navigator.onLine === false; }
async function mtCheckSalir() {
  if (MT_.tmr) { clearTimeout(MT_.tmr); MT_.tmr = null; }
  await mtChkGuardar(); if (Object.keys(MT_.pend).length) return;
  if (MT_.cola) {
    if (mtSinSenal()) { toast('Sin señal: lo marcado quedó guardado en el teléfono y se envía solo cuando vuelva. Podés seguir marcando.', 'w'); return; }
    if (typeof flqEnviarTodo === 'function') await flqEnviarTodo(true);
    if (typeof flqLeer === 'function' && flqLeer().some(function(q) { return q.FN === 'gsMT_ChkGuardar'; })) { toast('Todavía hay respuestas del check list sin enviar: esperá la señal', 'w'); return; }
    MT_.cola = 0;
  }
  var id = MT_.ord.ORDEN.ID_ORDEN; MT_.oe = null; await mtRecargar(); await mtAbrir(id);
}
// ── PDF: orden con el check list (formato OT-TMEC-01) y presupuesto ──
// Check list en blanco: se imprime antes, el mecánico lo marca a mano (sin batería o sin señal) y después se pasa al sistema en la orden
function mtChkTablaImp(pl, resp) {
  resp = resp || {};
  var c = '<table class="det"><thead><tr><th style="width:6%">N°</th><th style="width:49%">Ítem</th><th class="ck">OK/SÍ</th><th class="ck">NO</th><th class="ck">N/A</th><th>Observación</th></tr></thead><tbody>';
  pl.GRUPOS.forEach(function(g) { c += '<tr><td colspan="6" style="background:#f3f4f6;font-weight:700">' + pcEsc(g.NOMBRE) + '</td></tr>';
    g.ITEMS.forEach(function(i) { var v = (resp[i.ID] || {}).R || ''; c += '<tr><td style="font-family:monospace;font-size:10px">' + i.ID + '</td><td>' + pcEsc(i.NOMBRE) + (i.ESENCIAL ? ' <b>*</b>' : '') + '</td><td class="ck">' + (v === 'OK' || v === 'SI' ? '✔' : '☐') + '</td><td class="ck">' + (v === 'NO' ? '✖' : '☐') + '</td><td class="ck">' + (v === 'NA' ? '—' : '☐') + '</td><td>' + pcEsc((resp[i.ID] || {}).OBS || '') + '</td></tr>'; }); });
  return c + '</tbody></table>';
}
// Hoja de ruedas y alineación por eje (24/11/2026, Anibal: el check list impreso tiene que traer cada rueda de la unidad según su configuración de ejes)
var MT_RU_EST = { OK: '✓ OK', R: 'R · recapar', V: 'V · vulcanizar', C: 'C · cambiar', NA: 'N/A' };
function mtRuedasPos(c) { var ub = { EXT: 'exterior', INT: 'interior', UNICA: '' }, fn = { DIRECCION: 'dirección', TRACCION: 'tracción', LIBRE: 'libre' }, out = [];
  c.EJES.slice().sort(function(a, b) { return a.NRO - b.NRO; }).forEach(function(x) {
    c.POS.filter(function(p) { return String(p.ID_EJE) === String(x.ID) && !p.AUX; }).sort(function(a, b) { return a.X - b.X; }).forEach(function(p, k) { out.push({ POS: p.COD, EJE: x.NRO, FN: fn[x.FUNCION] || '', PRIM: !k, POSICION: (p.LADO === 'I' ? 'Izquierda' : 'Derecha') + (ub[p.UB] ? ' ' + ub[p.UB] : '') }); }); });
  c.POS.filter(function(p) { return p.AUX; }).forEach(function(p) { out.push({ POS: p.COD, EJE: '', FN: '', PRIM: true, AUX: 1, POSICION: 'Auxilio ' + p.COD }); });
  return out; }
function mtRuedasImp(e, x) {
  var c = mtEqCfg(e); if (!c || !c.EJES || !c.EJES.length) return '';
  var R = (x && x.RUEDAS) || {}, A = (x && x.ALIN) || {}, fn = { DIRECCION: 'dirección', TRACCION: 'tracción', LIBRE: 'libre' };
  var h = '<h2>Ruedas · ' + pcEsc(c.NOMBRE) + '</h2><table class="det"><thead><tr><th style="width:7%">Eje</th><th style="width:7%">Código</th><th style="width:13%">Posición</th><th style="width:14%">Estado</th><th style="width:14%">Marca grabada</th><th style="width:12%">Medida</th><th class="n" style="width:8%">Dibujo mm</th><th class="n" style="width:8%">Presión lb</th><th>Observación</th></tr></thead><tbody>';
  mtRuedasPos(c).forEach(function(p) { var v = R[p.POS] || {};
    h += '<tr><td>' + (p.AUX ? 'Auxilio' : (p.PRIM ? '<b>' + p.EJE + '</b> <span style="font-size:9px">' + pcEsc(p.FN) + '</span>' : '')) + '</td><td style="font-family:monospace;font-size:10px">' + pcEsc(p.POS) + '</td><td>' + pcEsc(p.AUX ? 'Auxilio' : p.POSICION) + '</td><td style="height:20px">' + (v.EST ? '<b>' + pcEsc(MT_RU_EST[v.EST] || '') + '</b>' : '<span style="color:#999;font-size:10px;letter-spacing:1px">OK · R · V · C · N/A</span>') + '</td><td>' + pcEsc(v.MARCA || '') + '</td><td>' + pcEsc(v.MEDIDA || '') + '</td><td class="n">' + pcEsc(v.DIBUJO || '') + '</td><td class="n">' + pcEsc(v.PRESION || '') + '</td><td>' + pcEsc(v.OBS || '') + '</td></tr>'; });
  h += '</tbody></table><div style="font-size:9.5px;margin-top:2px">Estado: ✓ OK · R recapar · V vulcanizar · C cambiar · N/A no corresponde</div><h2>Alineación por eje</h2><table class="det"><thead><tr><th style="width:12%">Eje</th><th>Medida antes (paralelismo / escuadra)</th><th>Medida después</th><th class="ck">OK</th><th>Observación</th></tr></thead><tbody>';
  c.EJES.slice().sort(function(a, b) { return a.NRO - b.NRO; }).forEach(function(j) { var v = A[String(j.NRO)] || {}; h += '<tr><td><b>' + j.NRO + '</b> <span style="font-size:9px">' + pcEsc(fn[j.FUNCION] || '') + '</span></td><td style="height:22px">' + pcEsc(v.ANTES || '') + '</td><td>' + pcEsc(v.DESPUES || '') + '</td><td class="ck">' + (v.OK ? '☑' : '☐') + '</td><td>' + pcEsc(v.OBS || '') + '</td></tr>'; });
  return h + '</tbody></table>';
}
// ── Cargar en el sistema la hoja de ruedas y la alineación de cada unidad (25/11/2026, Anibal) ──
function mtRuedas(oe) {
  var x = MT_.ord.EQUIPOS.filter(function(q) { return String(q.ID_OE) === String(oe); })[0]; if (!x) return; var e = mtEq(x.ID_EQUIPO), c = mtEqCfg(e); if (!c) { toast('La unidad no tiene configuración de ejes', 'r2'); return; }
  var R = x.RUEDAS || {}, A = x.ALIN || {};
  MT_.ru = { oe: oe, rows: mtRuedasPos(c).map(function(p) { var v = R[p.POS] || {}; return { POS: p.POS, EJE: p.EJE, FN: p.FN, PRIM: p.PRIM, AUX: p.AUX, POSICION: p.POSICION, EST: v.EST || '', MARCA: v.MARCA || '', MEDIDA: v.MEDIDA || '', DIBUJO: v.DIBUJO || '', PRESION: v.PRESION || '', OBS: v.OBS || '' }; }),
    al: c.EJES.slice().sort(function(a, b) { return a.NRO - b.NRO; }).map(function(j) { var v = A[String(j.NRO)] || {}; return { EJE: j.NRO, ANTES: v.ANTES || '', DESPUES: v.DESPUES || '', OK: v.OK ? 1 : 0, OBS: v.OBS || '' }; }), tit: mtEqIdent(e) + ' · ' + mtEqTipo(e) };
  showModal('<div class="mh"><span class="mt">🛞 Ruedas y alineación · ' + pcEsc(MT_.ru.tit) + '</span><button class="mc" onclick="closeModal()">×</button></div><div id="mt-ru-b"></div>', 'md-lg'); mtRuedasPintar();
}
function mtRuSet(k, f, v) { var r = MT_.ru.rows[k]; if (r) r[f] = v; }
function mtRuEst(k, v) { var r = MT_.ru.rows[k]; r.EST = r.EST === v ? '' : v; var g = $id('mt-ru-e-' + k); if (g) g.innerHTML = mtRuEstBtns(k); }
function mtRuEstBtns(k) { var r = MT_.ru.rows[k], col = { OK: '#16a34a', R: '#dc2626', V: '#ea580c', C: '#7c3aed', NA: '#6b7280' };
  return ['OK', 'R', 'V', 'C', 'NA'].map(function(v) { var on = r.EST === v; return '<button type="button" onclick="mtRuEst(' + k + ',\'' + v + '\')" style="min-width:32px;min-height:34px;padding:0 5px;border-radius:8px;border:2px solid ' + col[v] + ';background:' + (on ? col[v] : '#fff') + ';color:' + (on ? '#fff' : col[v]) + ';font-weight:700;cursor:pointer">' + (v === 'OK' ? '✓' : v === 'NA' ? 'N/A' : v) + '</button>'; }).join(' '); }
function mtRuTodas() { var m = String($v('mt-ru-am') || '').trim().toUpperCase(), p = String($v('mt-ru-ap') || '').trim(), soloOk = $id('mt-ru-ao') && $id('mt-ru-ao').checked;
  MT_.ru.rows.forEach(function(r) { if (m && !r.MEDIDA) r.MEDIDA = m; if (p && !r.PRESION && r.EST !== 'NA') r.PRESION = p; if (soloOk && !r.EST) r.EST = 'OK'; }); mtRuedasPintar(); toast('Completado ✓', 'g'); }
function mtRuedasPintar() {
  var b = $id('mt-ru-b'); if (!b) return; var T = MT_.ru, inp = function(k, f, w, ph, im) { return '<input class="fi" style="min-height:36px;padding:5px 7px' + (w ? ';max-width:' + w : '') + '"' + (im ? ' inputmode="decimal"' : '') + ' placeholder="' + (ph || '') + '" value="' + pcEsc(T.rows[k][f]) + '" oninput="mtRuSet(' + k + ',\'' + f + '\',this.value)">'; };
  var css = '<style>.mt-rg{display:grid;grid-template-columns:120px 170px minmax(70px,1fr) minmax(70px,1fr) 58px 58px minmax(90px,1.2fr);gap:6px;align-items:center;padding:6px 2px;border-bottom:1px solid #e5e7eb;font-size:13px}.mt-rg.hd{font-size:11px;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #d1d5db}.mt-rl{display:none;font-size:11px;color:#6b7280}@media(max-width:800px){.mt-rg{grid-template-columns:1fr 1fr}.mt-rg.hd{display:none}.mt-rg .w2{grid-column:1 / span 2}.mt-rl{display:block}}</style>';
  var h = css + '<div class="mb2" style="background:#f8fbff;border:1px solid #bfdbfe;border-radius:10px;padding:8px 10px;font-size:13px"><b>Para completar rápido:</b> <span style="display:inline-flex;gap:6px;flex-wrap:wrap;align-items:center">medida <input class="fi" id="mt-ru-am" style="width:130px;min-height:34px" placeholder="ej.: 295/80R22.5"> presión lb <input class="fi" id="mt-ru-ap" style="width:80px;min-height:34px" inputmode="decimal"> <label style="display:flex;gap:4px;align-items:center"><input type="checkbox" id="mt-ru-ao"> las que no marcaste quedan ✓ OK</label> <button class="btn btn-s btn-sm" onclick="mtRuTodas()">Aplicar a las vacías</button></span></div>' +
    '<div class="tdim mb2" style="font-size:12.5px">Estado de cada rueda: <b style="color:#16a34a">✓</b> OK · <b style="color:#dc2626">R</b> recapar · <b style="color:#ea580c">V</b> vulcanizar · <b style="color:#7c3aed">C</b> cambiar · N/A no corresponde (ej.: no tiene auxilio).</div>' +
    '<div class="mt-rg hd"><span>Eje</span><span>Estado</span><span>Marca grabada</span><span>Medida</span><span>Dibujo mm</span><span>Presión lb</span><span>Observación</span></div>';
  T.rows.forEach(function(r, k) { h += '<div class="mt-rg"><div class="w2"><b>' + (r.AUX ? 'Auxilio ' + pcEsc(r.POS) : 'Eje ' + r.EJE + ' · ' + pcEsc(r.POSICION)) + '</b>' + (r.FN ? ' <span class="tdim" style="font-size:11px">' + pcEsc(r.FN) + '</span>' : '') + '</div>' +
      '<div class="w2" id="mt-ru-e-' + k + '" style="display:flex;gap:4px;flex-wrap:wrap">' + mtRuEstBtns(k) + '</div>' +
      '<label><span class="mt-rl">Marca grabada</span>' + inp(k, 'MARCA', '', '') + '</label><label><span class="mt-rl">Medida</span>' + inp(k, 'MEDIDA', '', '') + '</label>' +
      '<label><span class="mt-rl">Dibujo mm</span>' + inp(k, 'DIBUJO', '', '', 1) + '</label><label><span class="mt-rl">Presión lb</span>' + inp(k, 'PRESION', '', '', 1) + '</label>' +
      '<label class="w2" style="grid-column:auto"><span class="mt-rl">Observación</span>' + inp(k, 'OBS', '', '') + '</label></div>'; });
  h += '<div class="fl mt3">Alineación por eje</div><div class="tw"><table style="font-size:13px"><thead><tr><th>Eje</th><th>Medida antes (paralelismo / escuadra)</th><th>Medida después</th><th>OK</th><th>Observación</th></tr></thead><tbody>' +
    T.al.map(function(a, k) { return '<tr><td><b>' + a.EJE + '</b></td><td><input class="fi" value="' + pcEsc(a.ANTES) + '" oninput="MT_.ru.al[' + k + '].ANTES=this.value"></td><td><input class="fi" value="' + pcEsc(a.DESPUES) + '" oninput="MT_.ru.al[' + k + '].DESPUES=this.value"></td><td class="tc"><input type="checkbox" style="width:22px;height:22px"' + (a.OK ? ' checked' : '') + ' onchange="MT_.ru.al[' + k + '].OK=this.checked?1:0"></td><td><input class="fi" value="' + pcEsc(a.OBS) + '" oninput="MT_.ru.al[' + k + '].OBS=this.value"></td></tr>'; }).join('') + '</tbody></table></div>' +
    '<div class="flex gap2 mt3"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" style="flex:1;min-height:48px" id="mt-ru-ok" onclick="mtRuedasGuardar()">💾 Guardar ruedas y alineación</button></div>';
  b.innerHTML = h;
}
async function mtRuedasGuardar() {
  var b = $id('mt-ru-ok'); if (b) b.disabled = true; var T = MT_.ru;
  try { var r = await gsRun('gsMT_RuedasGuardar', { ID_OE: T.oe, RUEDAS: T.rows.map(function(x) { return { POS: x.POS, EJE: x.EJE, POSICION: x.POSICION, EST: x.EST, MARCA: x.MARCA, MEDIDA: x.MEDIDA, DIBUJO: x.DIBUJO, PRESION: x.PRESION, OBS: x.OBS }; }), ALIN: T.al });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Ruedas y alineación guardadas ✓', 'g'); closeModal(); var id = MT_.ord.ORDEN.ID_ORDEN; await mtAbrir(id);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
// ── Leer con foto el check list en papel (25/11/2026, Anibal): Gemini (la misma clave gratis de «Audios a texto») lee las hojas,
// se revisa lo leído y recién ahí se graba. Nada se graba sin revisar.
function mtFotoLeer(oe) {
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = function() { var fs = Array.prototype.slice.call(inp.files || []); if (fs.length) mtFotoProcesar(oe, fs); };
  inp.click();
}
function mtFotoAchicar(f) {
  return new Promise(function(ok, mal) { var u = URL.createObjectURL(f), im = new Image();
    im.onload = function() { var mx = 2000, w = im.width, h = im.height, k = Math.min(1, mx / Math.max(w, h)), cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u); var d = cv.toDataURL('image/jpeg', 0.85); ok({ url: d, b64: d.slice(d.indexOf(',') + 1) }); };
    im.onerror = function() { URL.revokeObjectURL(u); mal(new Error('No se pudo abrir la imagen ' + (f.name || ''))); }; im.src = u; });
}
function mtFotoClaveModal(oe, fs) {
  showModal('<div class="mh"><span class="mt">Clave de Google (Gemini)</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2" style="font-size:13.5px">Para leer las fotos se usa la misma clave gratis de Google que en «Audios a texto». En este navegador todavía no está cargada. Pegala acá (la sacás con tu Gmail en aistudio.google.com/apikey); queda guardada solo en este navegador.' +
    '<input class="fi mt2" id="mt-fk" type="password" autocomplete="off" placeholder="Pegá la clave de Google"></div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="mt-fk-ok">Guardar y leer</button></div>');
  $id('mt-fk-ok').onclick = function() { var v = String($v('mt-fk') || '').replace(/\s+/g, ''); if (v.length < 20) { toast('La clave está incompleta', 'r2'); return; } audClaveSet(v); closeModal(); mtFotoProcesar(oe, fs); };
}
async function mtFotoProcesar(oe, fs) {
  if (typeof audClave !== 'function') { toast('Falta el módulo de Audios a texto en esta página', 'r2'); return; }
  var k = audClave(); if (!k) { mtFotoClaveModal(oe, fs); return; }
  var x = MT_.ord.EQUIPOS.filter(function(q) { return String(q.ID_OE) === String(oe); })[0]; if (!x) return;
  var e = mtEq(x.ID_EQUIPO), pl = mtPl(x.ID_PLANTILLA), c = mtEqCfg(e);
  showModal('<div class="mh"><span class="mt">📷 Leyendo ' + fs.length + (fs.length === 1 ? ' hoja' : ' hojas') + ' · ' + pcEsc(mtEqIdent(e)) + '</span></div><div class="mb2" id="mt-fl-est" style="font-size:14px">Preparando las fotos…</div>');
  var est = function(t) { var el = $id('mt-fl-est'); if (el) el.innerHTML = t; };
  try {
    var imgs = []; for (var i = 0; i < fs.length; i++) imgs.push(await mtFotoAchicar(fs[i]));
    var items = []; if (pl) pl.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(it) { items.push(it.ID + ' | ' + g.NOMBRE + ' | ' + it.NOMBRE + ' | respuestas válidas: ' + (mtMalaResp(g) === 'SI' ? 'SI, NO, NA' : 'OK, NO, NA')); }); });
    var pos = c ? mtRuedasPos(c).map(function(p) { return p.POS + ' | ' + (p.AUX ? 'Auxilio' : 'Eje ' + p.EJE + ' ' + p.POSICION); }) : [];
    var prompt = 'Sos un asistente que transcribe check lists de un taller mecánico escritos a mano sobre una planilla impresa. Las imágenes son las hojas de la unidad ' + mtEqIdent(e) + ' (' + mtEqTipo(e) + ') de la orden ' + MT_.ord.ORDEN.NRO + '.\n' +
      'Cada renglón del check list tiene un N° (columna N°) y casilleros OK/SÍ, NO, N/A y una columna Observación. Lista de renglones (N° | grupo | nombre | respuestas válidas):\n' + items.join('\n') + '\n' +
      (pos.length ? 'Hoja de ruedas: cada rueda tiene un Código, el estado se marca encerrando o escribiendo OK (o tilde), R (recapar), V (vulcanizar), C (cambiar) o N/A; además marca grabada, medida, dibujo mm, presión lb y observación. Códigos:\n' + pos.join('\n') + '\nAlineación por eje: medida antes, medida después, OK (tilde) y observación.\n' : '') +
      'Reglas: transcribí SOLO lo que está marcado o escrito; no inventes. Un tilde o cruz en el casillero OK/SÍ es OK (o SI si las válidas son SI, NO, NA); en NO es NO; en N/A es NA. Si un renglón tiene observación escrita pero ningún casillero marcado, poné r vacío y la observación. Si algo no se lee con seguridad, no lo pongas y agregalo en "dudas" con el N° o el código. Copiá las observaciones tal como están escritas (corregí solo ortografía obvia). En "trabajos" poné el texto de trabajos realizados o pedidos que esté escrito fuera de las tablas.\n' +
      'Respondé SOLO con JSON con esta forma: {"respuestas":[{"id":440,"r":"OK","obs":""}],"ruedas":[{"pos":"E1-IE","est":"R","marca":"","medida":"","dibujo":"","presion":"","obs":""}],"alineacion":[{"eje":1,"ok":1,"antes":"","despues":"","obs":""}],"trabajos":"","dudas":[""]}';
    var parts = [{ text: prompt }]; imgs.forEach(function(im) { parts.push({ inline_data: { mime_type: 'image/jpeg', data: im.b64 } }); });
    var cuerpo = JSON.stringify({ contents: [{ role: 'user', parts: parts }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } });
    est('Pidiendo a Google que lea las hojas…');
    var mods = await audGoogleModelos(k), j = null, ult = null;
    for (var m = 0; m < Math.min(mods.length, 4) && !j; m++) {
      est('Leyendo con ' + pcEsc(mods[m]) + '… (puede tardar unos segundos)');
      try { var rr = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(mods[m]) + ':generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': k }, body: cuerpo });
        var jj = await rr.json(); if (!rr.ok) throw audErrGoogle(rr.status, jj); j = jj; } catch (er) { ult = er; if (er && er.st === 400 && /API key/i.test(er.message)) break; }
    }
    if (!j) throw ult || new Error('Google no respondió');
    var txt = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(function(p) { return p.text || ''; }).join('');
    var d; try { d = JSON.parse(txt.replace(/^```(json)?\s*/i, '').replace(/```\s*$/, '')); } catch (er2) { throw new Error('Google no devolvió una lectura válida. Probá con una foto más derecha y con buena luz.'); }
    MT_.fl = { oe: oe, imgs: imgs.map(function(im) { return im.url; }), d: d };
    mtFotoRevisar();
  } catch (er) { closeModal(); toast((er && er.txt) || (er && er.message) || 'No se pudo leer', 'r2'); }
}
function mtFotoRevisar() {
  var F = MT_.fl, x = MT_.ord.EQUIPOS.filter(function(q) { return String(q.ID_OE) === String(F.oe); })[0], e = mtEq(x.ID_EQUIPO), pl = mtPl(x.ID_PLANTILLA), c = mtEqCfg(e), d = F.d || {};
  var info = {}; if (pl) pl.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(it) { info[String(it.ID)] = { n: it.NOMBRE, si: mtMalaResp(g) === 'SI' }; }); });
  var resp = (d.respuestas || []).filter(function(r) { return info[String(r.id)] && (r.r || r.obs); }).map(function(r) { var v = String(r.r || '').toUpperCase(); if (v === 'SÍ') v = 'SI'; if (['OK', 'NO', 'NA', 'SI'].indexOf(v) === -1) v = ''; if (v === 'SI' && !info[String(r.id)].si) v = 'OK'; if (v === 'OK' && info[String(r.id)].si) v = 'SI'; return { ID: Number(r.id), R: v, OBS: String(r.obs || ''), ON: 1 }; });
  var posOk = {}; if (c) mtRuedasPos(c).forEach(function(p) { posOk[p.POS] = p; });
  var rue = (d.ruedas || []).filter(function(r) { return posOk[String(r.pos || '').toUpperCase()]; }).map(function(r) { var v = String(r.est || '').toUpperCase().replace('✓', 'OK').replace('N/A', 'NA'); if (['OK', 'R', 'V', 'C', 'NA'].indexOf(v) === -1) v = ''; return { POS: String(r.pos).toUpperCase(), EST: v, MARCA: String(r.marca || ''), MEDIDA: String(r.medida || ''), DIBUJO: String(r.dibujo || '').replace(/[^\d.,]/g, ''), PRESION: String(r.presion || '').replace(/[^\d.,]/g, ''), OBS: String(r.obs || ''), ON: 1 }; });
  var ali = (d.alineacion || []).filter(function(a) { return Number(a.eje) > 0; }).map(function(a) { return { EJE: Number(a.eje), OK: Number(a.ok) ? 1 : 0, ANTES: String(a.antes || ''), DESPUES: String(a.despues || ''), OBS: String(a.obs || ''), ON: 1 }; });
  F.resp = resp; F.rue = rue; F.ali = ali; F.trab = String(d.trabajos || ''); F.dudas = (d.dudas || []).filter(function(z) { return String(z || '').trim(); });
  var selR = function(k, v, si) { return '<select class="fs" style="min-height:34px" onchange="MT_.fl.resp[' + k + '].R=this.value"><option value="">—</option>' + (si ? ['SI', 'NO', 'NA'] : ['OK', 'NO', 'NA']).map(function(o) { return '<option' + (o === v ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>'; };
  var h = '<div class="mh"><span class="mt">📷 Revisá lo leído · ' + pcEsc(mtEqIdent(e)) + ' · ' + pcEsc(mtEqTipo(e)) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2" style="font-size:13px">' +
    '<div class="al al-b mb2">Esto es lo que Google leyó de la foto. <b>Controlalo contra el papel</b>, corregí lo que esté mal y destildá lo que no quieras grabar. Nada se graba hasta que toques «Grabar lo revisado».</div>' +
    '<div class="flex gap2 mb2" style="flex-wrap:wrap">' + F.imgs.map(function(u, i) { return '<a href="' + u + '" target="_blank" title="Ver la hoja ' + (i + 1) + ' grande"><img src="' + u + '" style="height:110px;border:1px solid #cbd5e1;border-radius:6px"></a>'; }).join('') + '</div>' +
    (F.dudas.length ? '<div class="al mb2" style="background:#fffbeb;border-color:#f59e0b"><b>⚠ No se leyó con seguridad:</b> ' + F.dudas.map(pcEsc).join(' · ') + '</div>' : '') +
    '<div class="fl">Check list (' + resp.length + ' renglones leídos de ' + Object.keys(info).length + ')</div><div class="tw"><table style="font-size:12.5px"><thead><tr><th></th><th>N°</th><th>Renglón</th><th>Leído</th><th>Observación</th><th>Hoy en el sistema</th></tr></thead><tbody>' +
    (resp.length ? resp.map(function(r, k) { var cur = x.RESP[String(r.ID)] || {}, dif = cur.R && (cur.R !== r.R || (cur.OBS || '') !== r.OBS);
      return '<tr' + (dif ? ' style="background:#fff7ed"' : '') + '><td><input type="checkbox" checked onchange="MT_.fl.resp[' + k + '].ON=this.checked?1:0"></td><td class="mono">' + r.ID + '</td><td>' + pcEsc(info[String(r.ID)].n) + '</td><td>' + selR(k, r.R, info[String(r.ID)].si) + '</td><td><input class="fi" style="min-height:34px;min-width:160px" value="' + pcEsc(r.OBS) + '" oninput="MT_.fl.resp[' + k + '].OBS=this.value"></td><td class="tdim">' + (cur.R ? pcEsc(cur.R) + (cur.OBS ? ' · ' + pcEsc(cur.OBS) : '') : 'sin cargar') + '</td></tr>'; }).join('') : '<tr><td colspan="6" class="tc tdim">No se leyó ningún renglón del check list.</td></tr>') + '</tbody></table></div>';
  if (c) {
    h += '<div class="fl mt3">Ruedas (' + rue.length + ' leídas)</div><div class="tw"><table style="font-size:12.5px"><thead><tr><th></th><th>Código</th><th>Estado</th><th>Marca grabada</th><th>Medida</th><th>Dibujo</th><th>Presión</th><th>Observación</th></tr></thead><tbody>' +
      (rue.length ? rue.map(function(r, k) { var f = function(c2, w) { return '<input class="fi" style="min-height:34px;max-width:' + w + '" value="' + pcEsc(r[c2]) + '" oninput="MT_.fl.rue[' + k + '].' + c2 + '=this.value">'; };
        return '<tr><td><input type="checkbox" checked onchange="MT_.fl.rue[' + k + '].ON=this.checked?1:0"></td><td class="mono">' + pcEsc(r.POS) + '</td><td><select class="fs" style="min-height:34px" onchange="MT_.fl.rue[' + k + '].EST=this.value"><option value="">—</option>' + ['OK', 'R', 'V', 'C', 'NA'].map(function(o) { return '<option value="' + o + '"' + (o === r.EST ? ' selected' : '') + '>' + (MT_RU_EST[o] || o) + '</option>'; }).join('') + '</select></td><td>' + f('MARCA', '120px') + '</td><td>' + f('MEDIDA', '120px') + '</td><td>' + f('DIBUJO', '70px') + '</td><td>' + f('PRESION', '70px') + '</td><td>' + f('OBS', '200px') + '</td></tr>'; }).join('') : '<tr><td colspan="8" class="tc tdim">No se leyó la hoja de ruedas.</td></tr>') + '</tbody></table></div>';
    if (ali.length) h += '<div class="fl mt3">Alineación</div><div class="tw"><table style="font-size:12.5px"><thead><tr><th></th><th>Eje</th><th>Antes</th><th>Después</th><th>OK</th><th>Observación</th></tr></thead><tbody>' + ali.map(function(a, k) { return '<tr><td><input type="checkbox" checked onchange="MT_.fl.ali[' + k + '].ON=this.checked?1:0"></td><td>' + a.EJE + '</td><td><input class="fi" value="' + pcEsc(a.ANTES) + '" oninput="MT_.fl.ali[' + k + '].ANTES=this.value"></td><td><input class="fi" value="' + pcEsc(a.DESPUES) + '" oninput="MT_.fl.ali[' + k + '].DESPUES=this.value"></td><td><input type="checkbox"' + (a.OK ? ' checked' : '') + ' onchange="MT_.fl.ali[' + k + '].OK=this.checked?1:0"></td><td><input class="fi" value="' + pcEsc(a.OBS) + '" oninput="MT_.fl.ali[' + k + '].OBS=this.value"></td></tr>'; }).join('') + '</tbody></table></div>';
  }
  h += '<div class="fg mt3"><label class="fl">Trabajos escritos en la hoja (van a «Observaciones de la unidad», máx. 300 letras)</label><textarea class="fi" rows="2" oninput="MT_.fl.trab=this.value">' + pcEsc(F.trab || x.OBSERVACIONES || '') + '</textarea></div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar (no graba nada)</button><button class="btn btn-p" id="mt-fl-ok" onclick="mtFotoGrabar()">💾 Grabar lo revisado</button></div>';
  if (!F.trab) F.trab = x.OBSERVACIONES || '';
  showModal(h, 'md-lg');
}
async function mtFotoGrabar() {
  var F = MT_.fl, b = $id('mt-fl-ok'); if (b) b.disabled = true;
  try {
    var resp = F.resp.filter(function(r) { return r.ON && r.R; }).map(function(r) { return { ID: r.ID, R: r.R, OBS: r.OBS }; });
    var r1 = await gsRun('gsMT_ChkGuardar', { ID_ORDEN: MT_.ord.ORDEN.ID_ORDEN, ID_OE: F.oe, RESP: resp, OBS_EQ: String(F.trab || '').substring(0, 300) });
    if (!r1 || !r1.ok) { toast((r1 && r1.error) || 'No se pudo grabar el check list', 'r2'); return; }
    var rue = F.rue.filter(function(r) { return r.ON; }), ali = F.ali.filter(function(a) { return a.ON; }), r2 = null;
    if (rue.length || ali.length) {
      var x = MT_.ord.EQUIPOS.filter(function(q) { return String(q.ID_OE) === String(F.oe); })[0], c = mtEqCfg(mtEq(x.ID_EQUIPO)), pm = {}; if (c) mtRuedasPos(c).forEach(function(p) { pm[p.POS] = p; });
      r2 = await gsRun('gsMT_RuedasGuardar', { ID_OE: F.oe, RUEDAS: rue.map(function(r) { var p = pm[r.POS] || {}; return { POS: r.POS, EJE: p.EJE, POSICION: p.POSICION, EST: r.EST, MARCA: r.MARCA, MEDIDA: r.MEDIDA, DIBUJO: r.DIBUJO, PRESION: r.PRESION, OBS: r.OBS }; }), ALIN: ali });
      if (!r2 || !r2.ok) { toast('El check list se grabó, pero las ruedas no: ' + ((r2 && r2.error) || 'error'), 'r2'); return; }
    }
    toast('Grabado: ' + resp.length + ' renglones del check list' + (r2 ? ' · ' + r2.RUEDAS + ' ruedas · ' + r2.EJES + ' ejes' : '') + ' ✓', 'g');
    closeModal(); MT_.fl = null; var id = MT_.ord.ORDEN.ID_ORDEN; await mtAbrir(id);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
function mtTrabManoImp(varias) {
  var c = '<h2>Trabajos y repuestos para presupuestar</h2><table class="det"><thead><tr><th style="width:' + (varias ? 40 : 55) + '%">Trabajo o repuesto (ej.: desarme y arme de cubierta)</th>' + (varias ? '<th style="width:15%">Unidad</th>' : '') + '<th class="n" style="width:10%">Cant.</th><th>Observación</th></tr></thead><tbody>';
  for (var k = 0; k < (varias ? 10 : 8); k++) c += '<tr><td style="height:26px"></td>' + (varias ? '<td></td>' : '') + '<td></td><td></td></tr>';
  return c + '</tbody></table>';
}
async function mtImpChkBlanco() {
  var tip = {}; (MT_.d.TIPOS || []).forEach(function(t) { tip[String(t.ID_TIPO)] = t.NOMBRE; });
  var ops = MT_.d.PLANTILLAS.slice().sort(function(a, b) { return a.ID_TIPO - b.ID_TIPO || (a.NOMBRE < b.NOMBRE ? -1 : 1); }).map(function(p) { return [p.ID_PLANTILLA, (tip[String(p.ID_TIPO)] || '') + ' · ' + p.NOMBRE]; });
  var id = await uiElegir('¿Qué check list imprimís en blanco?', ops); if (id === null || id === undefined) return;
  var pl = mtPl(Number(id)); if (!pl) { toast('No encontré ese check list', 'r2'); return; }
  var c = pcEncImp('Check list en blanco · para completar a mano', pl.CODIGO, 'Después se carga en el sistema, en la orden del taller') +
    '<table style="margin:6px 0 10px"><tbody><tr>' + ['Fecha', 'Cliente', 'Patente / interno'].map(function(k) { return '<td style="height:34px;width:33%"><b style="font-size:9px;color:#555;text-transform:uppercase">' + k + '</b></td>'; }).join('') + '</tr><tr>' + ['Km u horas', 'Pidió', 'Mecánico'].map(function(k) { return '<td style="height:34px"><b style="font-size:9px;color:#555;text-transform:uppercase">' + k + '</b></td>'; }).join('') + '</tr></tbody></table>' +
    '<h2>' + pcEsc(pl.CODIGO + ' · ' + pl.NOMBRE) + '</h2><div class="nota">Marcá una opción por ítem. Los marcados con * son esenciales. Si algo dio NO, anotá qué tiene en Observación.</div>' + mtChkTablaImp(pl) + mtTrabManoImp() +
    '<div class="firmas"><div>Mecánico</div><div>Cliente / chofer</div><div>Cargado en el sistema (quién y cuándo)</div></div>';
  pcImprimir('Check list ' + pl.CODIGO, c);
}
async function mtImpOrden(id) {
  var r = MT_.ord && MT_.ord.ORDEN.ID_ORDEN === id ? MT_.ord : await gsRun('gsMT_Orden', id); if (!r || !r.ok) { toast('No se pudo', 'r2'); return; }
  var o = mtOrdenRes(id) || {}, c = '';
  c += pcEncImp('Orden del taller · Check list', r.ORDEN.NRO, o.SUCURSAL ? 'Sucursal ' + o.SUCURSAL : '') +
    '<div class="dat"><div><b>Cliente</b>' + pcEsc(o.CLIENTE || 'Interno') + '</div><div><b>Fecha</b>' + fmtD(o.FECHA) + '</div><div><b>Pidió</b>' + pcEsc(o.SOLICITANTE || '—') + '</div><div><b>Estado</b>' + pcEsc((MT_EST[r.ORDEN.ESTADO] || [0, r.ORDEN.ESTADO])[1]) + '</div></div>' + (o.OBSERVACIONES ? '<div class="nota">' + pcEsc(o.OBSERVACIONES) + '</div>' : '');
  var kq = 0; r.EQUIPOS.forEach(function(x) { var e = mtEq(x.ID_EQUIPO), pl = mtPl(x.ID_PLANTILLA); if (!pl) return;
    c += (kq++ ? '<div style="page-break-before:always"></div>' : '') + '<div style="border:2px solid #111;padding:4px 8px;margin:8px 0 4px;font-size:12px;font-weight:700">' + pcEsc(r.ORDEN.NRO) + ' · UNIDAD ' + pcEsc(mtEqIdent(e)) + ' · ' + pcEsc(mtEqTipo(e).toUpperCase()) + ' · ID ' + x.ID_OE + ' — marcá con una cruz o tilde dentro del casillero; en ruedas encerrá OK, R, V, C o N/A</div><h2>' + pcEsc(pl.CODIGO + ' · ' + pl.NOMBRE) + ' — ' + pcEsc(mtEqIdent(e)) + ' · ' + pcEsc(mtEqTipo(e).toUpperCase()) + ' · ' + pcEsc(e.MARCA + ' ' + e.MODELO) + (x.KM_HS ? ' · ' + Number(x.KM_HS).toLocaleString('es-AR') + ' km/h' : '') + '</h2>' + mtCubTxt(e, 'p') + mtChkTablaImp(pl, x.RESP);
    c += (x.OBSERVACIONES ? '<div class="nota">Observaciones: ' + pcEsc(x.OBSERVACIONES) + '</div>' : '') + (r.ORDEN.ESTADO === 'CHECK_LIST' || Object.keys(x.RUEDAS || {}).length || Object.keys(x.ALIN || {}).length ? mtRuedasImp(e, x) : ''); });
  if (r.ORDEN.ESTADO === 'CHECK_LIST') c += mtTrabManoImp(r.EQUIPOS.length > 1);
  if (r.TRAB && r.TRAB.TRABAJOS && r.TRAB.TRABAJOS.length) {
    c += '<h2>Trabajo y control final</h2><table class="det"><thead><tr><th style="width:38%">Tarea</th><th>Equipo</th><th>Mecánico</th><th class="n">Tiempo</th><th>Control final</th></tr></thead><tbody>' +
      r.TRAB.TRABAJOS.map(function(t) { var x = r.EQUIPOS.filter(function(q) { return q.ID_OE === t.ID_OE; })[0];
        return '<tr><td>' + pcEsc(t.DESCRIPCION) + (t.OBS ? '<div style="font-size:10px">' + pcEsc(t.OBS) + '</div>' : '') + '</td><td>' + (x ? pcEsc(mtEqIdent(mtEq(x.ID_EQUIPO))) : '') + '</td><td>' + pcEsc(t.EMPLEADO || '—') + '</td><td class="n">' + (t.MINUTOS ? mtMin(t.MINUTOS) : '') + '</td><td>' + pcEsc((MT_TRAB_EST[t.ESTADO] || [0, t.ESTADO])[1]) + (t.CONTROL_POR ? ' · ' + pcEsc(t.CONTROL_POR) + ' ' + mtHora(t.CONTROL_FECHA) : '') + (t.CONTROL_OBS ? ' · ' + pcEsc(t.CONTROL_OBS) : '') + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  c += '<div class="firmas"><div>Mecánico</div><div>Control final</div><div>Cliente / chofer</div></div>';
  pcImprimir(r.ORDEN.NRO, c);
}
function mtImpPresup() {
  var r = MT_.ord, P = r.PRESUP, o = mtOrdenRes(r.ORDEN.ID_ORDEN) || {}; if (!P) return;
  var tot = 0, c = pcEncImp('Presupuesto de taller', P.NRO, o.SUCURSAL ? 'Sucursal ' + o.SUCURSAL : '') +
    '<div class="dat"><div><b>Cliente</b>' + pcEsc(o.CLIENTE || 'Interno') + '</div><div><b>Fecha</b>' + fmtD(P.FECHA) + '</div><div><b>Válido</b>' + P.VALIDEZ + ' días</div><div><b>Orden</b>' + pcEsc(r.ORDEN.NRO) + '</div>' +
    '<div><b>Equipos</b>' + o.EQUIPOS.map(function(e) { return pcEsc(e.DOMINIO + ' ' + e.EQUIPO); }).join(' · ') + '</div></div>' +
    '<table class="det"><thead><tr><th style="width:52%">Descripción</th><th class="n">Cant.</th><th class="n">Precio s/IVA</th><th class="n">Desc.</th><th class="n">Subtotal</th></tr></thead><tbody>' +
    P.DET.map(function(l) { tot += l.SUBTOTAL; return (mtSinCargo(l) ? '<tr><td>' + pcEsc(l.DESCRIPCION) + '</td><td class="n">' + l.CANTIDAD + '</td><td class="n" colspan="2"><b>Sin cargo</b></td><td class="n">' + mtPlata(0) + '</td></tr>' : '<tr><td>' + pcEsc(l.DESCRIPCION) + '</td><td class="n">' + l.CANTIDAD + '</td><td class="n">' + mtPlata(l.PRECIO_LISTA) + '</td><td class="n">' + (l.DESCUENTO_PCT ? l.DESCUENTO_PCT + '%' : '') + '</td><td class="n">' + mtPlata(l.SUBTOTAL) + '</td></tr>'); }).join('') +
    (Number(P.DESCUENTO_PCT) ? '<tr><td colspan="4" class="n">Subtotal</td><td class="n">' + mtPlata(tot) + '</td></tr><tr><td colspan="4" class="n">Descuento general ' + String(P.DESCUENTO_PCT).replace('.', ',') + '%</td><td class="n">− ' + mtPlata(Math.round((tot - Math.round(tot * (1 - P.DESCUENTO_PCT / 100) * 100) / 100) * 100) / 100) + '</td></tr>' : '') +
    '<tr class="tot"><td colspan="4" class="n"><b>Total sin IVA</b></td><td class="n"><b>' + mtPlata(Math.round(tot * (1 - (Number(P.DESCUENTO_PCT) || 0) / 100) * 100) / 100) + '</b></td></tr></tbody></table>' +
    '<div class="nota">Precios sin IVA. Los repuestos se confirman al momento del trabajo según disponibilidad. Trabajos adicionales que aparezcan al desarmar se presupuestan aparte.</div>' +
    '<div class="firmas"><div>Vulcan Tread Neumáticos</div><div>Aprobación del cliente</div></div>';
  pcImprimir(P.NRO, c);
}
// ── EQUIPOS: grilla ABM ──
function mtEquipos() {
  var d = MT_.d, F = MT_.FE = MT_.FE || { q: '', tipo: '', est: 'ACTIVO' };
  if (MT_.eqNuevo) { mtEqFormPagina(); return; }
  $id('mt-body').innerHTML = '<div class="card mb3"><div class="card-hd"><span class="card-title">Equipos de clientes y máquinas propias</span>' + (mtPuede('AGREGAR') ? '<button class="btn btn-p btn-sm" onclick="mtEqForm(null,false)">＋ Nuevo equipo</button>' : '') + '</div><div class="card-body">' +
    '<div class="pc-otf"><div class="fg" style="grid-column:span 3"><label class="fl">Buscar</label><input class="fi" placeholder="Dominio, interno, marca, modelo, cliente" value="' + pcEsc(F.q) + '" oninput="MT_.FE.q=this.value;mtEqGrilla()"></div>' +
    '<div class="fg"><label class="fl">Tipo</label><select class="fs" onchange="MT_.FE.tipo=this.value;mtEqGrilla()">' + mtOpt([['', 'Todos']].concat(d.TIPOS.map(function(t) { return [t.ID_TIPO, t.NOMBRE]; })), F.tipo) + '</select></div>' +
    '<div class="fg"><label class="fl">Estado</label><select class="fs" onchange="MT_.FE.est=this.value;mtEqGrilla()">' + mtOpt([['ACTIVO', 'Activos'], ['', 'Todos'], ['BAJA', 'De baja']], F.est) + '</select></div>' +
    '<div class="fg" style="align-self:end"><button class="btn btn-s" onclick="MT_.FE=null;mtPintar()">Limpiar filtros</button></div></div><div id="mt-eg" class="mt2"></div></div></div>';
  mtEqGrilla();
}
function mtEqGrilla() {
  var d = MT_.d, F = MT_.FE, el = $id('mt-eg'); if (!el) return;
  var tn = {}; d.TIPOS.forEach(function(t) { tn[t.ID_TIPO] = t.NOMBRE; });
  var q = String(F.q || '').toUpperCase().trim().split(/\s+/).filter(Boolean);
  var l = d.EQUIPOS.filter(function(e) { if (F.tipo && String(e.ID_TIPO) !== String(F.tipo)) return false; if (F.est && e.ESTADO !== F.est) return false;
    if (q.length) { var t = [e.CODIGO, e.DOMINIO, e.INTERNO, e.MARCA, e.MODELO, e.CLIENTE, e.CHASIS].join(' ').toUpperCase(); if (!q.every(function(w) { return t.indexOf(w) !== -1; })) return false; } return true; });
  el.innerHTML = '<div class="tdim mb2" style="font-size:13px"><b>' + l.length + '</b> equipo' + (l.length === 1 ? '' : 's') + '</div><div class="tw pc-abm" data-noimp="1"><table style="font-size:12.5px"><thead><tr><th>Código</th><th>Dominio</th><th>Tipo</th><th>Marca y modelo</th><th>Año</th><th class="tr">Km / horas</th><th>Cliente</th><th>Órdenes</th><th>Acciones</th></tr></thead><tbody>' +
    (l.length ? l.map(function(e) { var n = d.ORDENES.filter(function(o) { return o.ESTADO !== 'ANULADA' && o.EQUIPOS.some(function(x) { return x.ID_EQUIPO === e.ID_EQUIPO; }); }).length;
      return '<tr' + (e.ESTADO === 'BAJA' ? ' style="opacity:.6"' : '') + '><td class="mono">' + pcEsc(e.CODIGO) + '</td><td><b>' + pcEsc(e.DOMINIO || '—') + '</b>' + (e.INTERNO ? ' · int. ' + pcEsc(e.INTERNO) : '') + '</td><td>' + pcEsc(tn[e.ID_TIPO] || '') + '</td><td class="pc-wr">' + pcEsc(e.MARCA + ' ' + e.MODELO) + (!e.ID_MODELO && e.MARCA && e.ID_TIPO !== 3 ? ' <span style="color:#b91c1c;font-size:12px;font-weight:700">· falta el modelo</span>' : '') + '</td><td>' + (e.ANIO || '') + '</td><td class="tr">' + (e.KM_HS ? Number(e.KM_HS).toLocaleString('es-AR') : '') + '</td><td class="pc-wr">' + pcEsc(e.CLIENTE || 'Propio') + '</td><td>' + n + '</td>' +
        '<td><div class="pc-acc">' + mtBtn('btn-s', '👁 Ver', 'mtEqVer(' + e.ID_EQUIPO + ')', 'Datos y órdenes del equipo') + (mtPuede('EDITAR') ? mtBtn('btn-s', '✏ Modificar', 'mtEqForm(' + e.ID_EQUIPO + ',false)') : '') + '</div></td></tr>'; }).join('')
      : '<tr><td colspan="9" class="tc tdim" style="padding:16px">No hay equipos con esos filtros.</td></tr>') + '</tbody></table></div>';
}
// Cubiertas del equipo: tipo y medidas (se ven en la ficha, en el check list y en el PDF)
function mtEqIdent(e) { return (e && (e.IDENT || e.DOMINIO || e.CODIGO)) || ''; }
// Qué es cada unidad (25/11/2026, Anibal): «Acoplado 4 ejes», «Camión 4x2 (2 ejes)»; si no tiene configuración, el tipo
function mtEqCfg(e) { return e && e.ID_CONFIG ? mtFL().CONFIGS.filter(function(x) { return String(x.ID) === String(e.ID_CONFIG); })[0] : null; }
function mtEqTipo(e) { if (!e) return ''; var c = mtEqCfg(e); if (c && c.NOMBRE) return c.NOMBRE; var t = (MT_.d.TIPOS || []).filter(function(x) { return x.ID_TIPO === e.ID_TIPO; })[0]; return t ? t.NOMBRE : ''; }
function mtEqTipoBd(e) { var t = mtEqTipo(e); return t ? ' <span class="mt-bd mt-b-b" style="font-size:12px">' + pcEsc(t.toUpperCase()) + '</span>' : ''; }
function mtCubTxt(e, tag) {
  if (!e || (!e.CUB_TIPO && !e.CUB_MED_DEL && !e.CUB_MED_TRAS)) return '';
  var t = 'Cubiertas: ' + (e.CUB_TIPO ? '<b>' + (e.CUB_TIPO === 'MACIZA' ? 'macizas' : 'inflables') + '</b>' : '') + (e.CUB_MED_DEL ? ' · delantera <b>' + pcEsc(e.CUB_MED_DEL) + '</b>' : '') + (e.CUB_MED_TRAS ? ' · trasera <b>' + pcEsc(e.CUB_MED_TRAS) + '</b>' : '');
  return '<' + tag + ' style="font-size:13px">' + t + '</' + tag + '>';
}
function mtEqVer(id) {
  var e = mtEq(id), d = MT_.d, os = d.ORDENES.filter(function(o) { return o.EQUIPOS.some(function(x) { return x.ID_EQUIPO === id; }); });
  showModal('<div class="mh"><span class="mt">' + pcEsc((mtEqIdent(e)) + ' · ' + e.MARCA + ' ' + e.MODELO) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2" style="font-size:13.5px">' +
    '<div>Código <b>' + pcEsc(e.CODIGO) + '</b> · Chasis ' + pcEsc(e.CHASIS || '—') + ' · Año ' + (e.ANIO || '—') + ' · ' + (e.KM_HS ? Number(e.KM_HS).toLocaleString('es-AR') + ' km/h' : '') + '</div><div>Cliente: <b>' + pcEsc(e.CLIENTE || 'Propio') + '</b></div>' + mtCubTxt(e, 'div') + (e.OBSERVACIONES ? '<div class="tdim">' + pcEsc(e.OBSERVACIONES) + '</div>' : '') +
    (function() { var c = mtFL().CONFIGS.filter(function(x) { return String(x.ID) === String(e.ID_CONFIG); })[0]; return c && typeof flDibujo === 'function' ? '<h4 class="mt2">Mapa de ruedas · ' + pcEsc(c.NOMBRE) + '</h4><div class="fl-map">' + flDibujo(c.EJES, c.POS, { ancho: 240 }) + '</div>' : ''; })() + '<h4 class="mt2">Órdenes</h4>' + (os.length ? os.map(function(o) { return '<div>' + pcEsc(o.NRO) + ' · ' + fmtD(o.FECHA) + ' · ' + mtBadge(o.ESTADO) + (o.PRESUP ? ' · ' + mtPlata(o.PRESUP.TOTAL) : '') + '</div>'; }).join('') : '<div class="tdim">Sin órdenes.</div>') +
    '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>');
}
// ── Unidad: marca y modelo del catálogo, subtipo, configuración de ejes y base del cliente (Flota y cubiertas, 13/11) ──
function mtFL() { return MT_.d.FL || { MARCAS: [], MODELOS: [], SUBTIPOS: [], CONFIGS: [], BASES: [] }; }
function mtOps(L, sel, vacio) { return '<option value="">' + vacio + '</option>' + L.map(function(x) { return '<option value="' + x.V + '"' + (x.P !== undefined ? ' data-p="' + x.P + '"' : '') + (String(x.V) === String(sel || '') ? ' selected' : '') + '>' + pcEsc(x.T) + '</option>'; }).join(''); }
// Check lists del tipo: si hay más de uno (máquinas de planta) se elige el de la máquina; si hay uno solo, va ese
function mtEqPlOpts(tipo, sel) { var L = MT_.d.PLANTILLAS.filter(function(p) { return Number(p.ID_TIPO) === Number(tipo); }).sort(function(a, b) { return (/-GE$/.test(b.CODIGO) ? 1 : 0) - (/-GE$/.test(a.CODIGO) ? 1 : 0); });
  if (!L.length) return mtPlTodas(sel).replace('— elegí el check list —', '— este tipo no tiene check list propio: elegí uno —');
  if (L.length === 1) return '<option value="">' + pcEsc(L[0].NOMBRE) + '</option>';
  return L.map(function(p) { return '<option value="' + p.ID_PLANTILLA + '"' + (String(p.ID_PLANTILLA) === String(sel || '') ? ' selected' : '') + '>' + pcEsc(p.NOMBRE) + '</option>'; }).join(''); }
function mtEqLlenar(keep) {
  var f = mtFL(), t = Number($v('mt-e-tipo')), mar = $v('mt-e-mar'), cli = $v('mt-e-cli');
  var put = function(id, html) { var s = $id(id); if (!s) return; var v = keep ? s.value : ''; s.innerHTML = html; if (v && Array.prototype.some.call(s.options, function(o) { return o.value === v; })) s.value = v; if (s.__selb && typeof s.__selb.refrescar === 'function') s.__selb.refrescar(); };
  // marcas: solo las que tienen modelos de este tipo (más la ya elegida); una marca nueva se agrega con ＋
  var conMod = {}; f.MODELOS.forEach(function(m) { if (m.A && m.TIPO === t) conMod[String(m.P)] = 1; });
  var sm = $id('mt-e-mar'); if (sm) { var mv = sm.value || (keep ? String(MT_.eqF.ID_MARCA_V || '') : ''); var mC = f.MARCAS.filter(function(x) { return x.A && (conMod[String(x.V)] || String(x.V) === String(mv)); }), mO = f.MARCAS.filter(function(x) { return x.A && !conMod[String(x.V)] && String(x.V) !== String(mv); });
    sm.innerHTML = mtOps(mC, mv, '— elegí la marca —') + (mO.length ? '<optgroup label="' + (mC.length ? 'Otras marcas (sin modelos de este tipo todavía)' : 'Marcas (todavía no hay modelos de este tipo: elegí la marca y agregá el modelo con ＋)') + '">' + mO.map(function(x) { return '<option value="' + x.V + '">' + pcEsc(x.T) + '</option>'; }).join('') + '</optgroup>' : ''); if (sm.__selb && typeof sm.__selb.refrescar === 'function') sm.__selb.refrescar(); mar = sm.value; }
  put('mt-e-mod', mtOps(f.MODELOS.filter(function(m) { return m.A && m.TIPO === t && String(m.P) === String(mar); }), keep ? MT_.eqF.ID_MODELO : '', mar ? '— no lo sé todavía (completar después) —' : '— primero la marca —'));
  put('mt-e-sub', mtOps(f.SUBTIPOS.filter(function(x) { return x.A && x.TIPO === t; }), keep ? MT_.eqF.ID_SUBTIPO : '', '— sin subtipo —'));
  put('mt-e-cfg', mtOps(f.CONFIGS.filter(function(c) { return c.ACTIVO && c.ID_TIPO === t; }).map(function(c) { return { V: c.ID, T: c.NOMBRE }; }), keep ? MT_.eqF.ID_CONFIG : '', '— sin configuración de ejes —'));
  put('mt-e-base', mtOps(f.BASES.filter(function(b) { return b.A && String(b.P) === String(cli); }), keep ? MT_.eqF.ID_BASE : '', cli ? '— sin base —' : '— elegí el cliente —'));
  mtEqDibujo();
}
function mtEqDibujo() { var el = $id('mt-e-map'); if (!el) return; var c = mtFL().CONFIGS.filter(function(x) { return String(x.ID) === String($v('mt-e-cfg')); })[0];
  el.innerHTML = c && typeof flDibujo === 'function' ? flDibujo(c.EJES, c.POS, { ancho: 210 }) : '<div class="tdim" style="padding:14px;font-size:13px">Elegí la configuración de ejes para ver el mapa de ruedas.</div>'; }
function mtEqSubCambio() { var s = mtFL().SUBTIPOS.filter(function(x) { return String(x.V) === String($v('mt-e-sub')); })[0]; if (s && s.CFG && !$v('mt-e-cfg')) { $id('mt-e-cfg').value = String(s.CFG); mtEqDibujo(); } }
function mtEqTipoCambio() { var pls = $id('mt-e-pl'); if (pls) pls.innerHTML = mtEqPlOpts($v('mt-e-tipo'), ''); var w = $id('mt-e-dom-w'), sinPat = [3, 4].indexOf(Number($v('mt-e-tipo'))) !== -1; if (w) w.style.display = sinPat ? 'none' : ''; if (sinPat && $id('mt-e-dom')) $id('mt-e-dom').value = ''; mtEqLlenar(false); }
// ＋ marca o modelo nuevo: se da de alta en el catálogo (con su código) y queda elegido
async function mtEqNuevaMarca() { var n = await uiPedir('Marca nueva (queda en el catálogo de marcas de vehículos)', { obligatorio: true }); if (n === null) return;
  var r = await gsRun('gsCB_CatGuardar', { TABLA: 'mv_marcas', NOMBRE: n }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  mtFL().MARCAS.push({ V: r.ID, T: n.toUpperCase(), A: 1 }); var s = $id('mt-e-mar'); s.innerHTML = mtOps(mtFL().MARCAS.filter(function(x) { return x.A; }), r.ID, '— elegí la marca —'); if (s.__selb && s.__selb.refrescar) s.__selb.refrescar(); mtEqLlenar(false); toast('Marca agregada ✓ ' + r.CODIGO, 'g'); }
async function mtEqNuevoModelo() { var mar = $v('mt-e-mar'), t = $v('mt-e-tipo'); if (!mar) { toast('Elegí primero la marca', 'r2'); return; }
  var n = await uiPedir('Modelo nuevo de esta marca, para este tipo de unidad', { obligatorio: true }); if (n === null) return;
  var r = await gsRun('gsCB_CatGuardar', { TABLA: 'mv_modelos', ID_MARCA_V: mar, NOMBRE: n, ID_TIPO: t }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  mtFL().MODELOS.push({ V: r.ID, T: n.toUpperCase(), P: Number(mar), TIPO: Number(t), A: 1 }); MT_.eqF.ID_MODELO = r.ID; mtEqLlenar(true); $id('mt-e-mod').value = String(r.ID); toast('Modelo agregado ✓ ' + r.CODIGO, 'g'); }
function mtEqForm(id, desdeOrden) {
  var e = id ? mtEq(id) : { ID_TIPO: 1, ID_CLIENTE: desdeOrden && MT_.N ? MT_.N.cli : '' }, d = MT_.d, f = mtFL();
  MT_.eqF = { ID_MODELO: e.ID_MODELO || '', ID_SUBTIPO: e.ID_SUBTIPO || '', ID_CONFIG: e.ID_CONFIG || '', ID_BASE: e.ID_BASE || '' };
  var cli = d.CLIENTES.slice().sort(function(a, b) { return a.NOMBRE < b.NOMBRE ? -1 : 1; });
  var viejo = id && !e.ID_MODELO && e.MARCA && !e.ID_MARCA_V ? '<div class="fl-ayu" style="color:#9a3412">Antes decía: ' + pcEsc(e.MARCA + ' ' + e.MODELO) + '</div>' : '';
  showModal('<div class="mh"><span class="mt">' + (id ? '✏ Modificar ' + pcEsc(e.CODIGO) : '＋ Nuevo equipo') + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="pc-fila3" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<div class="fg"><label class="fl">Tipo *</label><select class="fs" id="mt-e-tipo" onchange="mtEqTipoCambio()">' + mtOpt(d.TIPOS.map(function(t) { return [t.ID_TIPO, t.NOMBRE]; }), e.ID_TIPO) + '</select></div>' +
    '<div class="fg"><label class="fl">Subtipo</label><select class="fs" id="mt-e-sub" onchange="mtEqSubCambio()"></select></div>' +
    '<div class="fg"><label class="fl">Cliente (vacío = máquina propia)</label><select class="fs" id="mt-e-cli" data-filtro onchange="mtEqLlenar(false)"><option value="">— propio —</option>' + cli.map(function(c) { return '<option value="' + c.ID + '"' + (String(c.ID) === String(e.ID_CLIENTE) ? ' selected' : '') + '>' + pcEsc(c.NOMBRE) + '</option>'; }).join('') + '</select></div>' +
    '<div class="fg"><label class="fl">Base del cliente</label><select class="fs" id="mt-e-base"></select></div>' +
    '<div class="fg" id="mt-e-dom-w"' + ([3, 4].indexOf(Number(e.ID_TIPO)) !== -1 ? ' style="display:none"' : '') + '><label class="fl">Dominio (patente) <span class="tdim">· obligatoria en camión, acoplado, camioneta, auto y colectivo; la maquinaria sin patente va con N° interno o serie</span></label><input class="fi" id="mt-e-dom" style="text-transform:uppercase" value="' + pcEsc(e.DOMINIO || '') + '"></div>' +
    '<div class="fg"><label class="fl">N° interno</label><input class="fi" id="mt-e-int" value="' + pcEsc(e.INTERNO || '') + '"></div>' +
    '<div class="fg"><label class="fl">Marca * <button type="button" class="btn btn-s btn-xs" onclick="mtEqNuevaMarca()" title="Agregar una marca al catálogo">＋</button></label><select class="fs" id="mt-e-mar" data-filtro onchange="mtEqLlenar(false)">' + mtOps(f.MARCAS.filter(function(x) { return x.A || String(x.V) === String(e.ID_MARCA_V); }), e.ID_MARCA_V, '— elegí la marca —') + '</select>' + viejo + '</div>' +
    '<div class="fg"><label class="fl">Modelo <button type="button" class="btn btn-s btn-xs" onclick="mtEqNuevoModelo()" title="Agregar un modelo al catálogo">＋</button></label><select class="fs" id="mt-e-mod"></select></div>' +
    '<div class="fg"><label class="fl">Año</label><select class="fs" id="mt-e-anio"><option value="">—</option>' + (function() { var o = '', y = new Date().getFullYear() + 1; for (; y >= 1980; y--) o += '<option' + (Number(e.ANIO) === y ? ' selected' : '') + '>' + y + '</option>'; return o; })() + '</select></div>' +
    '<div class="fg"><label class="fl">Km / horas</label><input class="fi" id="mt-e-km" inputmode="numeric" value="' + (e.KM_HS || '') + '"></div>' +
    '<div class="fg" style="grid-column:1/-1"><label class="fl">Configuración de ejes (mapa de ruedas)</label><div style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:10px;align-items:start"><select class="fs" id="mt-e-cfg" onchange="mtEqDibujo()"></select><div class="fl-map" id="mt-e-map"></div></div></div>' +
    '<div class="fg" id="mt-e-pl-w" style="grid-column:1/-1"><label class="fl">Check list</label><select class="fs" id="mt-e-pl">' + mtEqPlOpts(e.ID_TIPO, e.ID_PLANTILLA) + '</select></div>' +
    '<div class="fg"><label class="fl">Tipo de cubierta</label><select class="fs" id="mt-e-cubt">' + mtOpt([['', '—'], ['INFLABLE', 'Inflable (con aire)'], ['MACIZA', 'Maciza']], e.CUB_TIPO || '') + '</select></div>' +
    '<div class="fg"><label class="fl">Medida cubierta delantera</label><input class="fi" id="mt-e-cubd" style="text-transform:uppercase" placeholder="Ej.: 28X9-15" value="' + pcEsc(e.CUB_MED_DEL || '') + '"></div>' +
    '<div class="fg"><label class="fl">Medida cubierta trasera <span class="tdim">(si es distinta)</span></label><input class="fi" id="mt-e-cubr" style="text-transform:uppercase" value="' + pcEsc(e.CUB_MED_TRAS || '') + '"></div>' +
    '<div class="fg" style="grid-column:1/-1"><label class="fl">Chasis / N° de serie</label><input class="fi" id="mt-e-cha" value="' + pcEsc(e.CHASIS || '') + '"></div>' +
    '<div class="fg" style="grid-column:1/-1"><label class="fl">Observaciones</label><input class="fi" id="mt-e-obs" value="' + pcEsc(e.OBSERVACIONES || '') + '"></div></div>' +
    '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="mt-e-ok" onclick="mtEqGuardar(' + (id || 0) + ',' + (desdeOrden ? 1 : 0) + ')">Guardar</button></div>');
  mtEqLlenar(true);
}
async function mtEqGuardar(id, desdeOrden) {
  var b = $id('mt-e-ok'); b.disabled = true;
  try { var r = await gsRun('gsMT_EquipoGuardar', { ID_EQUIPO: id || '', ID_TIPO: $v('mt-e-tipo'), ID_SUBTIPO: $v('mt-e-sub'), ID_CLIENTE: $v('mt-e-cli'), ID_BASE: $v('mt-e-base'), DOMINIO: $v('mt-e-dom'), INTERNO: $v('mt-e-int'), ID_MODELO: $v('mt-e-mod'), ID_MARCA_V: $v('mt-e-mar'), ID_CONFIG: $v('mt-e-cfg'), ANIO: $v('mt-e-anio'), KM_HS: $v('mt-e-km'), CHASIS: $v('mt-e-cha'), OBSERVACIONES: $v('mt-e-obs'), CUB_TIPO: $v('mt-e-cubt'), CUB_MED_DEL: $v('mt-e-cubd'), CUB_MED_TRAS: $v('mt-e-cubr'), ID_PLANTILLA: $v('mt-e-pl') });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    closeModal(); toast('Equipo guardado ✓', 'g');
    if (desdeOrden && MT_.N) { MT_.N.eqs[r.ID_EQUIPO] = true; if (!MT_.N.cli && MT_.N.tipo === 'SERVICIO_CLIENTE') MT_.N.cli = $v('mt-e-cli'); }
    await mtRecargar();
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
function mtEqFormPagina() { MT_.eqNuevo = false; mtEquipos(); }
// ── CATÁLOGO: servicios, horas, precio y receta de repuestos ──
// ── EDITOR DE CHECK LIST (24/11/2026, Anibal: «que todo quede simple para que se agreguen las cosas nuevas» que indica el mecánico) ──
var MTK_ = { d: null, pl: null, desac: false };
async function mtChkEd(recargar) {
  var b = $id('mt-body'); if (!b) return;
  if (!MTK_.d || recargar) { b.innerHTML = '<div class="tdim">Cargando check lists…</div>'; try { var r = await gsRun('gsMT_ChkEditor'); if (!r || !r.ok) { b.innerHTML = '<div class="al">' + pcEsc((r && r.error) || 'No se pudo') + '</div>'; return; } MTK_.d = r; } catch (e) { b.innerHTML = '<div class="al">' + pcEsc(e.message) + '</div>'; return; } }
  var L = MTK_.d.PLANTILLAS; if (!MTK_.pl || !L.some(function(p) { return p.ID_PLANTILLA === MTK_.pl; })) MTK_.pl = (L[0] || {}).ID_PLANTILLA;
  var p = L.filter(function(x) { return x.ID_PLANTILLA === MTK_.pl; })[0], ed = mtPuede('EDITAR');
  var h = '<div class="card mb3"><div class="card-body"><div class="tdim mb2" style="font-size:13px">Elegí el check list y agregá lo que te indique el mecánico. <b>Esencial</b> = sin contestarlo no se puede armar el presupuesto. Lo que no sirve se <b>desactiva</b> (no se borra: los check list ya hechos guardan su respuesta).</div>' +
    '<div class="flex gap2" style="flex-wrap:wrap;align-items:center"><select class="fs" style="max-width:520px;min-height:44px;font-size:15px" onchange="MTK_.pl=Number(this.value);mtChkEd()">' + L.map(function(x) { return '<option value="' + x.ID_PLANTILLA + '"' + (x.ID_PLANTILLA === MTK_.pl ? ' selected' : '') + '>' + pcEsc(x.TIPO + ' · ' + x.NOMBRE.replace(/^Check list de (revisión de )?/i, '')) + '</option>'; }).join('') + '</select>' +
    '<label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox"' + (MTK_.desac ? ' checked' : '') + ' onchange="MTK_.desac=this.checked;mtChkEd()"> ver desactivados</label></div>';
  if (!p) { b.innerHTML = h + '<div class="al mt2">No hay check lists.</div></div></div>'; return; }
  h += '<div class="tdim mt2" style="font-size:12.5px">' + pcEsc(p.CODIGO) + (p.SUBTIPOS.length ? ' · se usa para: <b>' + pcEsc(p.SUBTIPOS.join(', ')) + '</b>' : '') + ' · ' + p.UNIDADES + ' unidad' + (p.UNIDADES === 1 ? '' : 'es') + ' lo tienen asignado</div></div></div>';
  p.GRUPOS.forEach(function(g, gi) {
    var its = g.ITEMS.filter(function(i) { return i.ACTIVO || MTK_.desac; }), act = g.ITEMS.filter(function(i) { return i.ACTIVO; }).length;
    h += '<div class="card mb3"><div class="card-hd" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
      (ed ? '<button class="btn btn-s btn-xs" title="Subir el grupo" onclick="mtChkMov(\'GRUPO\',' + g.ID_GRUPO + ',-1)"' + (gi ? '' : ' disabled') + '>↑</button><button class="btn btn-s btn-xs" title="Bajar el grupo" onclick="mtChkMov(\'GRUPO\',' + g.ID_GRUPO + ',1)"' + (gi < p.GRUPOS.length - 1 ? '' : ' disabled') + '>↓</button><button class="btn btn-s btn-xs" title="Cambiar el nombre del grupo" onclick="mtChkGrNom(' + g.ID_GRUPO + ')">✏</button>' : '') +
      '<span class="card-title">' + pcEsc(g.NOMBRE) + '</span><span class="tdim" style="font-size:12px">' + act + ' ítem' + (act === 1 ? '' : 's') + (g.RESP === 'SI_NO_NA' ? ' · se contesta Sí / No / N/A' : ' · se contesta OK / NO / N/A') + '</span></div><div class="card-body" style="padding:0">';
    its.forEach(function(i, ii) {
      h += '<div class="mt-it" style="' + (i.ACTIVO ? '' : 'opacity:.55;background:#f8fafc') + '">' + (ed ? '<span style="display:flex;gap:4px;flex-wrap:nowrap">' +
        (i.ACTIVO ? '<button class="btn btn-s btn-xs" title="Subir" onclick="mtChkMov(\'ITEM\',' + i.ID + ',-1)"' + (ii ? '' : ' disabled') + '>↑</button><button class="btn btn-s btn-xs" title="Bajar" onclick="mtChkMov(\'ITEM\',' + i.ID + ',1)"' + (ii < its.length - 1 ? '' : ' disabled') + '>↓</button><button class="btn btn-s btn-xs" title="Corregir el texto" onclick="mtChkItNom(' + i.ID + ')">✏</button>' +
          '<button class="btn btn-xs ' + (i.ESENCIAL ? 'btn-p' : 'btn-s') + '" title="Esencial: sin contestarlo no se arma el presupuesto" onclick="mtChkItEsen(' + i.ID + ')">' + (i.ESENCIAL ? '★ Esencial' : '☆ Esencial') + '</button><button class="btn btn-s btn-xs" style="color:#b91c1c" onclick="mtChkItAct(' + i.ID + ',0)">Desactivar</button>'
          : '<button class="btn btn-s btn-xs" onclick="mtChkItAct(' + i.ID + ',1)">Volver a activar</button>') + '</span>' : '') +
        '<span class="mt-n">' + pcEsc(i.NOMBRE) + (i.ESENCIAL ? ' <span class="mt-es">*</span>' : '') + (i.ACTIVO ? '' : ' <span class="tdim">(desactivado)</span>') + '</span></div>';
    });
    if (ed) h += '<div class="mt-it" style="background:#f8fafc"><input class="fi" id="mtk-n-' + g.ID_GRUPO + '" placeholder="＋ Ítem nuevo en «' + pcEsc(g.NOMBRE) + '» (qué se revisa)" style="flex:1 1 260px;min-height:44px;font-size:15px" onkeydown="if(event.key===\'Enter\')mtChkItAdd(' + g.ID_GRUPO + ')">' +
      '<label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="mtk-e-' + g.ID_GRUPO + '"> Esencial</label><button class="btn btn-p" onclick="mtChkItAdd(' + g.ID_GRUPO + ')">Agregar</button></div>';
    h += '</div></div>';
  });
  if (ed) h += '<div class="card mb3"><div class="card-body flex gap2" style="flex-wrap:wrap;align-items:center"><input class="fi" id="mtk-gn" placeholder="＋ Grupo nuevo (por ejemplo: Sistema hidráulico)" style="flex:1 1 260px;min-height:44px;font-size:15px">' +
    '<select class="fs" id="mtk-gr" style="max-width:260px"><option value="OK_NO_NA">Se contesta OK / NO / N/A</option><option value="SI_NO_NA">Se contesta Sí / No / N/A (Sí = hay que hacer algo)</option></select><button class="btn btn-p" onclick="mtChkGrAdd()">Agregar grupo</button></div></div>';
  b.innerHTML = h;
}
function mtChkItem(id) { var r = null; (MTK_.d.PLANTILLAS || []).forEach(function(p) { p.GRUPOS.forEach(function(g) { g.ITEMS.forEach(function(i) { if (i.ID === id) r = i; }); }); }); return r; }
async function mtChkRun(fn, args, ok) {
  try { var r = await gsRun.apply(null, [fn].concat(args)); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return false; } if (ok) toast(ok, 'g'); var y = window.scrollY; await mtChkEd(true); window.scrollTo(0, y); return true; }
  catch (e) { toast(e.message || e, 'r2'); return false; }
}
async function mtChkItAdd(idG) { var v = ($v('mtk-n-' + idG) || '').trim(); if (v.length < 3) { toast('Escribí qué se revisa', 'r2'); return; } var e = $id('mtk-e-' + idG); await mtChkRun('gsMT_ChkItemGuardar', [{ ID_GRUPO: idG, NOMBRE: v, ESENCIAL: e && e.checked ? 1 : 0 }], 'Ítem agregado ✓'); }
async function mtChkItNom(id) { var i = mtChkItem(id); if (!i) return; var v = await uiPedir('Corregir el ítem', { obligatorio: true, valor: i.NOMBRE }); if (v === null || v.trim() === i.NOMBRE) return; await mtChkRun('gsMT_ChkItemGuardar', [{ ID: id, NOMBRE: v, ESENCIAL: i.ESENCIAL }], 'Corregido ✓'); }
async function mtChkItEsen(id) { var i = mtChkItem(id); if (!i) return; await mtChkRun('gsMT_ChkItemGuardar', [{ ID: id, NOMBRE: i.NOMBRE, ESENCIAL: i.ESENCIAL ? 0 : 1 }], i.ESENCIAL ? 'Ya no es esencial' : 'Marcado esencial ✓'); }
async function mtChkItAct(id, a) { var i = mtChkItem(id); if (!i) return; if (!a && !(await uiConfirmar('¿Desactivar «' + i.NOMBRE + '»? Deja de salir en los check list nuevos; los ya hechos guardan su respuesta.', 'Desactivar'))) return; await mtChkRun('gsMT_ChkItemActivo', [id, a], a ? 'Activado ✓' : 'Desactivado'); }
async function mtChkMov(t, id, dir) { await mtChkRun('gsMT_ChkMover', [t, id, dir]); }
async function mtChkGrNom(id) { var g = null; MTK_.d.PLANTILLAS.forEach(function(p) { p.GRUPOS.forEach(function(x) { if (x.ID_GRUPO === id) g = x; }); }); if (!g) return; var v = await uiPedir('Nombre del grupo', { obligatorio: true, valor: g.NOMBRE }); if (v === null || v.trim() === g.NOMBRE) return; await mtChkRun('gsMT_ChkGrupoGuardar', [{ ID: id, NOMBRE: v }], 'Grupo corregido ✓'); }
async function mtChkGrAdd() { var v = ($v('mtk-gn') || '').trim(); if (v.length < 3) { toast('Escribí el nombre del grupo', 'r2'); return; } await mtChkRun('gsMT_ChkGrupoGuardar', [{ ID_PLANTILLA: MTK_.pl, NOMBRE: v, RESP: $v('mtk-gr') }], 'Grupo agregado ✓: ahora agregale los ítems'); }
function mtCatalogo() {
  var d = MT_.d, F = MT_.FC = MT_.FC || { q: '', sis: '' };
  var sis = {}; d.SERVICIOS.forEach(function(s) { sis[s.SISTEMA] = 1; });
  $id('mt-body').innerHTML = '<div class="card mb3"><div class="card-hd"><span class="card-title">Catálogo de servicios del taller</span></div><div class="card-body">' +
    '<div class="tdim mb2" style="font-size:12.5px">Tarifa de venta: <b>' + mtPlata(d.TARIFA) + '</b> la hora (sin IVA)' + (d.VE_COSTO ? ' · costo hora del mecánico: <b>' + mtPlata(d.COSTO_HORA) + '</b> (' + pcEsc(d.COSTO_HORA_TXT) + ')' : '') + ' · precios de la lista ' + pcEsc(d.LISTA) + '. Los precios se cambian en «Lista de precios»; los repuestos e insumos de cada servicio, en la configuración del taller.</div>' +
    '<div class="pc-otf"><div class="fg" style="grid-column:span 4"><label class="fl">Buscar</label><input class="fi" placeholder="Servicio o repuesto" value="' + pcEsc(F.q) + '" oninput="MT_.FC.q=this.value;mtCatGrilla()"></div>' +
    '<div class="fg" style="grid-column:span 2"><label class="fl">Sistema</label><select class="fs" onchange="MT_.FC.sis=this.value;mtCatGrilla()">' + mtOpt([['', 'Todos']].concat(Object.keys(sis).sort().map(function(s) { return [s, s]; })), F.sis) + '</select></div></div><div id="mt-cg" class="mt2"></div></div></div>';
  mtCatGrilla();
}
function mtCatGrilla() {
  var d = MT_.d, F = MT_.FC, el = $id('mt-cg'); if (!el) return;
  var q = String(F.q || '').toUpperCase().trim();
  var l = d.SERVICIOS.filter(function(s) { if (F.sis && s.SISTEMA !== F.sis) return false; if (q && (s.NOMBRE + ' ' + s.CODIGO + ' ' + s.RECETA.map(function(r) { return r.NOMBRE; }).join(' ')).toUpperCase().indexOf(q) === -1) return false; return true; });
  el.innerHTML = '<div class="tdim mb2" style="font-size:13px"><b>' + l.length + '</b> servicios</div><div class="tw pc-abm" data-noimp="1"><table style="font-size:12.5px"><thead><tr><th>Código</th><th>Sistema</th><th>Servicio</th><th class="tr">Horas</th><th class="tr">Mano de obra</th><th>Repuestos e insumos que usa</th><th class="tr">Total sugerido</th></tr></thead><tbody>' +
    l.map(function(s) { var rt = 0; s.RECETA.forEach(function(r) { rt += r.PRECIO * r.CANT; });
      return '<tr><td class="mono">' + pcEsc(s.CODIGO) + '</td><td>' + pcEsc(s.SISTEMA) + '</td><td class="pc-wr"><b>' + pcEsc(s.NOMBRE) + '</b></td><td class="tr">' + s.HORAS + '</td><td class="tr">' + mtPlata(s.PRECIO) + '</td><td class="pc-wr">' + (s.RECETA.length ? s.RECETA.map(function(r) { return r.CANT + ' × ' + pcEsc(r.NOMBRE) + ' <span class="tdim">' + mtPlata(r.PRECIO) + (r.STOCK > 0 ? '' : ' · sin stock') + '</span>'; }).join('<br>') : '<span class="tdim">—</span>') + '</td><td class="tr"><b>' + mtPlata(s.PRECIO + rt) + '</b></td></tr>'; }).join('') + '</tbody></table></div>';
}
// ════════════════════════════════════════════════════════════════
// MANTENIMIENTO DE MÁQUINAS DE PLANTA (10/11/2026): cada máquina con su plan (qué, cómo, cuándo),
// lo que toca hoy y lo vencido, registro con un toque (quién y cuándo), historial y cumplimiento.
// ════════════════════════════════════════════════════════════════
var MP_FR = { DIARIO: 'Diario', SEMANAL: 'Semanal', QUINCENAL: 'Cada 15 días', MENSUAL: 'Mensual', TRIMESTRAL: 'Cada 3 meses', SEMESTRAL: 'Cada 6 meses', ANUAL: 'Anual' };
var MP_PER = { DIARIO: 1, SEMANAL: 7, QUINCENAL: 15, MENSUAL: 30, TRIMESTRAL: 90, SEMESTRAL: 180, ANUAL: 365 };
(function() { var st = document.createElement('style');
  st.textContent = '.mp-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.mp-tabs button{min-height:44px}.mp-kp{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}.mp-kp>div{flex:1 1 120px;border:1.5px solid var(--border,#e2e8f0);border-radius:12px;padding:10px 12px;background:var(--card,#fff)}.mp-kp b{display:block;font-size:24px}' +
    '.mp-kp .r b{color:#dc2626}.mp-kp .o b{color:#d97706}.mp-kp .g b{color:#16a34a}.mp-como{flex:1 1 100%;font-size:13px;color:var(--text2,#475569);background:#f8fafc;border-radius:8px;padding:6px 8px;margin-top:2px}' +
    '.mp-meta{flex:1 1 100%;font-size:12px;color:var(--text2,#64748b)}.mp-ven{color:#dc2626;font-weight:700}.mp-hoy{color:#d97706;font-weight:700}.mp-chip{display:inline-block;font-size:11px;font-weight:700;border-radius:6px;padding:1px 6px;margin-right:6px;background:#e0e7ff;color:#3730a3}';
  document.head.appendChild(st); })();
function mpUsr() { return (typeof SES !== 'undefined' && SES) ? (SES.usuario || '') : ''; }
function mpF(ms) { return ms ? new Date(Number(ms)).toLocaleDateString('es-AR') : '—'; }
async function mpCargar() {
  try { var r = await gsRun('gsMT_MP_Datos'); if (!r || !r.ok) { $id('mt-body').innerHTML = '<div class="al">' + pcEsc((r && r.error) || 'No se pudo cargar') + '</div>'; return false; } MT_.mp.d = r; mpIndice(); return true; }
  catch (e) { $id('mt-body').innerHTML = '<div class="al">' + pcEsc(e.message) + '</div>'; return false; }
}
function mpIndice() {
  var M = MT_.mp, ix = {};
  M.d.EQUIPOS.forEach(function(e) { if (e.TIPO) e.TIPO = e.TIPO.charAt(0).toUpperCase() + e.TIPO.slice(1); ix[e.ID_EQUIPO] = { e: e, c: [], ven: 0, hoy: 0, falla: 0, rev: 0 }; });
  M.d.CTRLS.forEach(function(c) { var x = ix[c.ID_EQUIPO]; if (!x) return; x.c.push(c); if (c.EST === 'VENCIDO') x.ven++; else if (c.EST === 'HOY') x.hoy++; if (c.FALLA) x.falla++; if (c.REVISAR) x.rev++; });
  Object.keys(ix).forEach(function(k) { ix[k].c.sort(function(a, b) { return a.ORDEN - b.ORDEN; }); });
  M.ix = ix;
}
async function mpPintar() {
  var M = MT_.mp = MT_.mp || { tab: 'hoy', eq: null, todo: false, mias: false, planEq: 0, hist: null };
  if (!M.d) { $id('mt-body').innerHTML = '<div class="tdim">Cargando las máquinas…</div>'; if (!(await mpCargar())) return; }
  var tabs = '<div class="mp-tabs">' + [['hoy', '🗓 Controles de hoy'], ['plan', '📋 Plan de cada máquina'], ['cum', '📊 Cumplimiento'], ['ord', '🔧 Órdenes de reparación']].map(function(t) {
    return '<button class="btn ' + (M.tab === t[0] ? 'btn-p' : 'btn-s') + '" onclick="' + (t[0] === 'ord' ? 'MT_.amb=\'planta\';MT_.vista=\'ord\';MT_.F=null;MT_.nueva=false;MT_.ord=null;mtPintar()' : 'MT_.mp.tab=\'' + t[0] + '\';MT_.mp.eq=null;mpPintar()') + '">' + t[1] + '</button>'; }).join('') +
    '<button class="btn btn-s" title="Volver a leer" onclick="MT_.mp.d=null;mpPintar()">↻</button></div>';
  if (M.tab === 'plan') return mpPlan(tabs);
  if (M.tab === 'cum') return mpCum(tabs);
  if (M.eq) return mpMaquina();
  mpHoy(tabs);
}
// ── HOY: máquinas con controles vencidos o que tocan hoy ──
function mpHoy(tabs) {
  var M = MT_.mp, ven = 0, hoy = 0, fal = [], usr = mpUsr(), hayResp = false;
  var lista = Object.keys(M.ix).map(function(k) { return M.ix[k]; }).filter(function(x) { if (x.e.RESP) hayResp = true; ven += x.ven; hoy += x.hoy; x.c.forEach(function(c) { if (c.FALLA) fal.push({ x: x, c: c }); }); return true; });
  var ver = lista.filter(function(x) { return (x.ven + x.hoy) > 0 && (!M.mias || x.e.RESP === usr); }).sort(function(a, b) { return (b.ven - a.ven) || (b.hoy - a.hoy) || String(a.e.TIPO).localeCompare(b.e.TIPO); });
  var h = tabs + '<div class="mp-kp"><div class="r"><b>' + ven + '</b>controles vencidos</div><div class="o"><b>' + hoy + '</b>para hacer hoy</div><div class="r"><b>' + fal.length + '</b>con falla</div></div>' +
    (hayResp ? '<label class="mb2" style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox"' + (M.mias ? ' checked' : '') + ' onchange="MT_.mp.mias=this.checked;mpPintar()" style="width:20px;height:20px"> Solo las máquinas a mi cargo</label>' : '');
  if (fal.length) h += '<div class="card mb3"><div class="card-hd"><span class="card-title" style="color:#dc2626">⚠ Controles que dieron mal</span></div><div class="card-body">' + fal.map(function(f) {
    return '<div class="mt-it r-NO"><div class="mt-n"><b>' + pcEsc(f.x.e.IDENT) + '</b> · ' + pcEsc(f.x.e.TIPO) + '<br>' + pcEsc(f.c.NOMBRE) + ': <b>' + pcEsc(f.c.ULT_OBS || '') + '</b><div class="mp-meta">' + mpF(f.c.ULT) + ' · ' + pcEsc(f.c.ULT_POR || '') + '</div></div>' +
      (mtPuede('AGREGAR') ? '<button class="btn btn-s btn-sm" onclick="mpOrden(' + f.c.ID_CTRL + ')">🔧 Abrir orden de taller</button>' : '') + '</div>'; }).join('') + '</div></div>';
  h += '<div class="card"><div class="card-hd"><span class="card-title">Máquinas con controles para hacer</span></div><div class="card-body">' +
    (ver.length ? ver.map(function(x) {
      return '<div class="mt-pick" onclick="MT_.mp.eq=' + x.e.ID_EQUIPO + ';MT_.mp.todo=false;mpPintar()"><div style="flex:1"><b>' + pcEsc(x.e.IDENT) + '</b> · ' + pcEsc(x.e.TIPO) + '<div class="tdim" style="font-size:12px">' + pcEsc([x.e.MARCA, x.e.MODELO].filter(Boolean).join(' ')) + (x.e.RESP ? ' · a cargo de ' + pcEsc(x.e.RESP) : '') + '</div></div>' +
        (x.ven ? '<span class="mt-bd mt-b-r">' + x.ven + ' vencidos</span> ' : '') + (x.hoy ? '<span class="mt-bd mt-b-o">' + x.hoy + ' hoy</span>' : '') + '<span>›</span></div>'; }).join('')
      : '<div class="al" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534">✅ Todo al día' + (M.mias ? ' en tus máquinas' : '') + '.</div>') + '</div></div>';
  $id('mt-body').innerHTML = h;
}
// ── UNA MÁQUINA: sus controles para hacer, con el cómo a la vista ──
function mpMaquina() {
  var M = MT_.mp, x = M.ix[M.eq]; if (!x) { M.eq = null; return mpPintar(); }
  var pend = x.c.filter(function(c) { return c.EST !== 'AL_DIA'; }).sort(function(a, b) { return ((b.EST === 'VENCIDO') - (a.EST === 'VENCIDO')) || (b.ESENCIAL - a.ESENCIAL) || (a.ORDEN - b.ORDEN); });
  var aldia = x.c.filter(function(c) { return c.EST === 'AL_DIA'; });
  var comunes = pend.filter(function(c) { return !c.ESENCIAL; }).length;
  var h = '<div class="mt-bar"><div class="flex gap2" style="align-items:center;flex-wrap:wrap"><button class="btn btn-s" onclick="MT_.mp.eq=null;mpPintar()">← Volver</button><div style="flex:1;min-width:160px"><b style="font-size:16px">' + pcEsc(x.e.IDENT) + '</b> · ' + pcEsc(x.e.TIPO) +
    '<div class="tdim" style="font-size:12px">' + pcEsc([x.e.CODIGO, x.e.MARCA, x.e.MODELO].filter(Boolean).join(' · ')) + (x.e.RESP ? ' · a cargo de ' + pcEsc(x.e.RESP) : '') + '</div></div>' +
    '<div style="text-align:right"><b>' + pend.length + '</b> para hacer' + (x.ven ? '<div class="mp-ven" style="font-size:12px">' + x.ven + ' vencidos</div>' : '') + '</div></div></div>';
  if (x.falla && mtPuede('AGREGAR')) h += '<div class="al mb2">Esta máquina tiene ' + x.falla + ' control(es) que dieron mal. <button class="btn btn-s btn-sm" onclick="mpOrden(' + x.c.filter(function(c) { return c.FALLA; })[0].ID_CTRL + ')">🔧 Abrir orden de taller</button></div>';
  if (!pend.length) h += '<div class="al mb2" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534">✅ No tiene controles pendientes hoy.</div>';
  else {
    h += '<div class="tdim mb2" style="font-size:13px">Tocá <b>OK</b>, <b>NO</b> (si da mal: escribís qué tiene) o <b>N/A</b>. Cada toque queda guardado con tu usuario y la hora. Los <span class="mt-es">ESENCIAL</span> se contestan uno por uno.</div>';
    if (comunes && mtPuede('AGREGAR')) h += '<div class="mt-it" style="justify-content:flex-end"><button class="btn btn-s btn-sm" onclick="mpTodoOk()">✔ Lo demás está todo OK (' + comunes + ', sin los esenciales)</button></div>';
    h += '<div class="mt-gr">' + pend.map(mpItem).join('') + '</div>';
  }
  if (aldia.length) h += '<button class="btn btn-s mt2 mb2" onclick="MT_.mp.todo=!MT_.mp.todo;mpPintar()">' + (M.todo ? '▾ Ocultar' : '▸ Ver') + ' los que están al día (' + aldia.length + ')</button>' + (M.todo ? '<div class="mt-gr">' + aldia.map(mpItem).join('') + '</div>' : '');
  var sc = document.querySelector('main') || document.scrollingElement, y = sc.scrollTop; $id('mt-body').innerHTML = h; sc.scrollTop = y;
}
function mpItem(c) {
  var est = c.EST === 'VENCIDO' ? '<span class="mp-ven">Vencido hace ' + c.ATRASO + ' día' + (c.ATRASO === 1 ? '' : 's') + '</span>' : (c.EST === 'HOY' ? '<span class="mp-hoy">Toca hoy</span>' : 'Próximo: ' + mpF(c.PROX));
  var ult = c.ULT ? 'Último: ' + mpF(c.ULT) + ' · ' + pcEsc(c.ULT_POR || '') + ' · ' + pcEsc(c.ULT_RES === 'NA' ? 'N/A' : c.ULT_RES) + (c.ULT_OBS ? ' (' + pcEsc(c.ULT_OBS) + ')' : '') : 'Nunca se hizo';
  var puede = mtPuede('AGREGAR');
  return '<div class="mt-it' + (c.ESENCIAL ? ' es' : '') + (c.FALLA ? ' r-NO' : '') + '"><div class="mt-n">' + (c.ESENCIAL ? '<span class="mt-es">ESENCIAL</span>' : '') + '<b>' + pcEsc(c.NOMBRE) + '</b></div>' +
    (puede ? '<div class="mt-rb"><button onclick="mpReg(' + c.ID_CTRL + ',\'OK\')">OK</button><button onclick="mpReg(' + c.ID_CTRL + ',\'NO\')">NO</button><button onclick="mpReg(' + c.ID_CTRL + ',\'NA\')">N/A</button></div>' : '') +
    (c.COMO ? '<div class="mp-como"><b>Cómo:</b> ' + pcEsc(c.COMO) + '</div>' : '') +
    '<div class="mp-meta"><span class="mp-chip">' + pcEsc(MP_FR[c.FRECUENCIA] || c.FRECUENCIA) + '</span>' + est + ' · ' + ult + '</div></div>';
}
function mpMarcar(c, r, obs) { c.ULT = Date.now(); c.ULT_RES = r; c.ULT_POR = mpUsr(); c.ULT_OBS = obs || ''; c.FALLA = r === 'NO' ? 1 : 0; c.EST = 'AL_DIA'; c.ATRASO = 0; c.PROX = MT_.mp.d.HOY + (MP_PER[c.FRECUENCIA] || 7) * 86400000; }
async function mpReg(id, r) {
  var c = MT_.mp.d.CTRLS.filter(function(x) { return x.ID_CTRL === id; })[0]; if (!c) return;
  var obs = '';
  if (r === 'NO') { obs = await uiPedir('¿Qué tiene? «' + c.NOMBRE + '» (queda en el historial de la máquina)', { obligatorio: true, ayuda: 'Ej.: pierde aire en la unión de abajo' }); if (obs === null) return; }
  try { var res = await gsRun('gsMT_MP_Registrar', { REGS: [{ ID_CTRL: id, R: r, OBS: obs }] }); if (!res || !res.ok) { toast((res && res.error) || 'No se pudo guardar', 'r2'); return; } }
  catch (e) { toast(e.message, 'r2'); return; }
  mpMarcar(c, r, obs); mpIndice(); toast(r === 'NO' ? 'Anotado: da mal ✓' : 'Guardado ✓', r === 'NO' ? 'r2' : 'g'); mpPintar();
}
async function mpTodoOk() {
  var x = MT_.mp.ix[MT_.mp.eq], l = x.c.filter(function(c) { return c.EST !== 'AL_DIA' && !c.ESENCIAL; }); if (!l.length) return;
  try { var res = await gsRun('gsMT_MP_Registrar', { REGS: l.map(function(c) { return { ID_CTRL: c.ID_CTRL, R: 'OK', OBS: '' }; }) }); if (!res || !res.ok) { toast((res && res.error) || 'No se pudo guardar', 'r2'); return; } }
  catch (e) { toast(e.message, 'r2'); return; }
  l.forEach(function(c) { mpMarcar(c, 'OK', ''); }); mpIndice(); toast(l.length + ' controles en OK ✓', 'g'); mpPintar();
}
// Un control que dio mal abre una orden de taller (correctivo) para esa máquina
function mpOrden(idCtrl) {
  var c = MT_.mp.d.CTRLS.filter(function(x) { return x.ID_CTRL === idCtrl; })[0]; if (!c) return;
  MT_.vista = 'ord'; MT_.amb = 'planta'; MT_.ord = null; MT_.oe = null; MT_.nueva = true;
  MT_.N = { tipo: 'CORRECTIVO', cli: '', eqs: {}, km: {}, q: '', pide: ['Falla en control: ' + c.NOMBRE + (c.ULT_OBS ? ' (' + c.ULT_OBS + ')' : '')], sol: mpUsr(), tel: '' };
  MT_.N.eqs[c.ID_EQUIPO] = true; MT_.N.km[c.ID_EQUIPO] = 0; mtPintar(); mtTop();
}
// ── PLAN DE CADA MÁQUINA: qué, cómo y cuándo; se cambia para esa máquina sola ──
function mpPlan(tabs) {
  var M = MT_.mp, eqs = Object.keys(M.ix).map(function(k) { return M.ix[k].e; }).sort(function(a, b) { return String(a.TIPO).localeCompare(b.TIPO) || String(a.IDENT).localeCompare(b.IDENT); });
  if (!M.planEq && eqs.length) M.planEq = eqs[0].ID_EQUIPO;
  var x = M.ix[M.planEq], ed = mtPuede('EDITAR');
  var h = tabs + '<div class="fg"><label class="fl">Máquina</label><select class="fs" data-filtro onchange="MT_.mp.planEq=Number(this.value);MT_.mp.hist=null;mpPintar()">' +
    eqs.map(function(e) { return '<option value="' + e.ID_EQUIPO + '"' + (e.ID_EQUIPO === M.planEq ? ' selected' : '') + '>' + pcEsc(e.TIPO + ' · ' + e.IDENT + ' · ' + [e.MARCA, e.MODELO].filter(Boolean).join(' ')) + '</option>'; }).join('') + '</select></div>';
  if (!x) { $id('mt-body').innerHTML = h + '<div class="al">No hay máquinas de planta cargadas.</div>'; return; }
  h += '<div class="card mb3"><div class="card-hd"><span class="card-title">' + pcEsc(x.e.IDENT) + ' · ' + pcEsc(x.e.TIPO) + '</span><span class="tdim" style="font-size:13px">' + x.c.length + ' controles</span></div><div class="card-body">' +
    '<div class="mb2" style="font-size:14px">A cargo de: <b>' + pcEsc(x.e.RESP || 'sin asignar') + '</b> ' + (ed ? '<button class="btn btn-s btn-xs" onclick="mpResp()">Cambiar</button>' : '') + '</div>' +
    (x.rev ? '<div class="al mb2">' + x.rev + ' controles son una <b>propuesta inicial</b> (qué, cómo y cada cuánto). Revisalos con planta, corregí lo que no corresponda y marcá el plan como revisado. ' + (ed ? '<button class="btn btn-s btn-sm" onclick="mpRevisado()">✔ Plan revisado</button>' : '') + '</div>' : '') +
    (ed ? '<button class="btn btn-p btn-sm mb2" onclick="mpCtrlForm(0)">＋ Agregar control a esta máquina</button>' : '') +
    '<div class="tw"><table><thead><tr><th>Qué se controla</th><th>Cómo se hace</th><th>Cada cuánto</th><th>Último</th><th>Próximo</th>' + (ed ? '<th></th>' : '') + '</tr></thead><tbody>' +
    x.c.map(function(c) { return '<tr><td>' + (c.ESENCIAL ? '<span class="mt-es">ESENCIAL</span>' : '') + pcEsc(c.NOMBRE) + (c.REVISAR ? ' <span class="tdim" style="font-size:11px">(a revisar)</span>' : '') + '<div class="tdim" style="font-size:11px">' + pcEsc(c.GRUPO) + '</div></td><td style="min-width:220px;font-size:13px">' + pcEsc(c.COMO || '—') + '</td><td>' + pcEsc(MP_FR[c.FRECUENCIA] || c.FRECUENCIA) + '</td>' +
      '<td style="font-size:12px">' + (c.ULT ? mpF(c.ULT) + '<br>' + pcEsc(c.ULT_POR) + ' · ' + pcEsc(c.ULT_RES === 'NA' ? 'N/A' : c.ULT_RES) : '—') + '</td><td style="font-size:12px">' + (c.EST === 'VENCIDO' ? '<span class="mp-ven">Vencido (' + c.ATRASO + ' d)</span>' : c.EST === 'HOY' ? '<span class="mp-hoy">Hoy</span>' : mpF(c.PROX)) + '</td>' +
      (ed ? '<td><div class="mt-acc">' + mtBtn('btn-s', '✏️', 'mpCtrlForm(' + c.ID_CTRL + ')', 'Cambiar') + mtBtn('btn-s', '🚫', 'mpCtrlBaja(' + c.ID_CTRL + ')', 'Sacar del plan') + '</div></td>' : '') + '</tr>'; }).join('') + '</tbody></table></div></div></div>' +
    '<div class="card"><div class="card-hd"><span class="card-title">Historial de la máquina</span>' + (M.hist ? '' : '<button class="btn btn-s btn-sm" onclick="mpHist()">Ver historial</button>') + '</div><div class="card-body" id="mp-hist">' + (M.hist ? mpHistHtml(M.hist) : '<div class="tdim" style="font-size:13px">Qué se le hizo, cuándo y quién.</div>') + '</div></div>';
  $id('mt-body').innerHTML = h;
}
function mpHistHtml(l) {
  if (!l.length) return '<div class="tdim">Todavía no tiene controles registrados.</div>';
  return '<div class="tw"><table><thead><tr><th>Fecha</th><th>Control</th><th>Resultado</th><th>Quién</th></tr></thead><tbody>' + l.map(function(r) {
    return '<tr' + (r.RES === 'NO' ? ' style="background:#fef2f2"' : '') + '><td>' + new Date(r.FECHA).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) + '</td><td>' + pcEsc(r.CONTROL) + '</td><td><b>' + pcEsc(r.RES === 'NA' ? 'N/A' : r.RES) + '</b>' + (r.OBS ? ' · ' + pcEsc(r.OBS) : '') + '</td><td>' + pcEsc(r.POR) + '</td></tr>'; }).join('') + '</tbody></table></div>';
}
async function mpHist() { try { var r = await gsRun('gsMT_MP_Historial', MT_.mp.planEq); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } MT_.mp.hist = r.REGS; mpPintar(); } catch (e) { toast(e.message, 'r2'); } }
async function mpCtrlForm(id) {
  var M = MT_.mp, c = id ? M.d.CTRLS.filter(function(x) { return x.ID_CTRL === id; })[0] : null;
  var nom = await uiPedir(id ? 'Qué se controla' : 'Nuevo control: ¿qué se controla?', { obligatorio: true, valor: c ? c.NOMBRE : '' }); if (nom === null) return;
  var como = await uiPedir('Cómo se hace (para que cualquiera lo pueda hacer)', { valor: c ? c.COMO : '', ayuda: 'Ej.: abrir la purga de abajo hasta que salga solo aire' }); if (como === null) return;
  var fr = await uiElegir('¿Cada cuánto se hace?', Object.keys(MP_FR).map(function(k) { return [k, MP_FR[k] + (c && c.FRECUENCIA === k ? ' (actual)' : '')]; })); if (fr === null) return;
  var es = await uiElegir('¿Es esencial (seguridad: se contesta uno por uno)?', [['1', 'Sí, esencial' + (c && c.ESENCIAL ? ' (actual)' : '')], ['0', 'No' + (c && !c.ESENCIAL ? ' (actual)' : '')]]); if (es === null) return;
  try { var r = await gsRun('gsMT_MP_CtrlGuardar', { ID_CTRL: id || '', ID_EQUIPO: M.planEq, NOMBRE: nom, COMO: como, FRECUENCIA: fr, ESENCIAL: Number(es) });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Control guardado ✓', 'g'); M.d = null; mpPintar(); } catch (e) { toast(e.message, 'r2'); }
}
async function mpCtrlBaja(id) {
  var c = MT_.mp.d.CTRLS.filter(function(x) { return x.ID_CTRL === id; })[0]; if (!c) return;
  if (!(await uiConfirmar('¿Sacar «' + c.NOMBRE + '» del plan de esta máquina? Su historial queda guardado.', 'Sacar del plan'))) return;
  try { var r = await gsRun('gsMT_MP_CtrlBaja', id); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Sacado del plan ✓', 'g'); MT_.mp.d = null; mpPintar(); } catch (e) { toast(e.message, 'r2'); }
}
async function mpRevisado() {
  if (!(await uiConfirmar('¿Marcar el plan de esta máquina como revisado con planta?', 'Sí, revisado'))) return;
  try { var r = await gsRun('gsMT_MP_Revisado', MT_.mp.planEq); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Plan revisado ✓', 'g'); MT_.mp.d = null; mpPintar(); } catch (e) { toast(e.message, 'r2'); }
}
async function mpResp() {
  var M = MT_.mp, us = M.d.USUARIOS || [], v;
  if (us.length) { v = await uiElegir('¿Quién está a cargo de esta máquina?', us.map(function(u) { return [u.USUARIO, u.NOMBRE + ' (' + u.USUARIO + ')']; }).concat([['', 'Nadie (sin asignar)']])); if (v === null) return; }
  else { v = await uiPedir('Usuario a cargo de esta máquina (vacío = sin asignar)', { valor: M.ix[M.planEq].e.RESP }); if (v === null) return; }
  try { var r = await gsRun('gsMT_MP_Resp', { ID_EQUIPO: M.planEq, RESP: v }); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Responsable guardado ✓', 'g'); M.d = null; mpPintar(); } catch (e) { toast(e.message, 'r2'); }
}
// ── CUMPLIMIENTO: se ve en un minuto si se está usando ──
function mpCum(tabs) {
  var M = MT_.mp, tot = 0, ok = 0, ven = 0;
  var filas = Object.keys(M.ix).map(function(k) { var x = M.ix[k], n = x.c.length, al = n - x.ven - x.hoy; tot += n; ok += al; ven += x.ven;
    var ult = 0; x.c.forEach(function(c) { if (c.ULT && c.ULT > ult) ult = c.ULT; }); return { x: x, n: n, pct: n ? Math.round(al / n * 100) : 100, ult: ult }; }).sort(function(a, b) { return a.pct - b.pct || b.x.ven - a.x.ven; });
  var pct = tot ? Math.round(ok / tot * 100) : 100, col = pct >= 90 ? 'g' : pct >= 70 ? 'o' : 'r';
  var h = tabs + '<div class="tdim mb2" style="font-size:13px">«Al día» es lo que se hizo dentro de su plazo. Lo que toca hoy y todavía no se hizo, y lo vencido, no cuentan.</div><div class="mp-kp"><div class="' + col + '"><b>' + pct + '%</b>de los controles al día</div><div class="r"><b>' + ven + '</b>controles vencidos</div><div><b>' + (M.d.PERSONAS || []).reduce(function(a, p) { return a + p.CONTROLES; }, 0) + '</b>controles hechos en 30 días</div></div>' +
    '<div class="card mb3"><div class="card-hd"><span class="card-title">Por máquina</span><span class="tdim" style="font-size:12px">las peores arriba</span></div><div class="card-body"><div class="tw"><table><thead><tr><th>Máquina</th><th>Tipo</th><th>A cargo de</th><th>Al día</th><th>Vencidos</th><th>Con falla</th><th>Último control</th></tr></thead><tbody>' +
    filas.map(function(f) { var c = f.pct >= 90 ? '#16a34a' : f.pct >= 70 ? '#d97706' : '#dc2626';
      return '<tr style="cursor:pointer" onclick="MT_.mp.tab=\'hoy\';MT_.mp.eq=' + f.x.e.ID_EQUIPO + ';mpPintar()"><td><b>' + pcEsc(f.x.e.IDENT) + '</b><div class="tdim" style="font-size:11px">' + pcEsc([f.x.e.MARCA, f.x.e.MODELO].filter(Boolean).join(' ')) + '</div></td><td>' + pcEsc(f.x.e.TIPO) + '</td><td>' + pcEsc(f.x.e.RESP || '—') + '</td><td><b style="color:' + c + '">' + f.pct + '%</b></td><td>' + (f.x.ven || '') + '</td><td>' + (f.x.falla ? '<b style="color:#dc2626">' + f.x.falla + '</b>' : '') + '</td><td>' + (f.ult ? mpF(f.ult) : '<span class="mp-ven">nunca</span>') + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>' +
    '<div class="card"><div class="card-hd"><span class="card-title">Por persona (últimos 30 días)</span></div><div class="card-body">' +
    ((M.d.PERSONAS || []).length ? '<div class="tw"><table><thead><tr><th>Usuario</th><th>Controles hechos</th><th>Días que controló</th></tr></thead><tbody>' + M.d.PERSONAS.map(function(p) { return '<tr><td>' + pcEsc(p.USUARIO) + '</td><td>' + p.CONTROLES + '</td><td>' + p.DIAS + '</td></tr>'; }).join('') + '</tbody></table></div>'
      : '<div class="al">Nadie registró controles en los últimos 30 días.</div>') + '</div></div>';
  $id('mt-body').innerHTML = h;
}
