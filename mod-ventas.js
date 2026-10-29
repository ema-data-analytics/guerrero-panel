
// ═════════ VENTAS (pantalla rehecha 28/10/2026, pedido de Anibal) ═════════
// Ventas de mostrador: cubiertas nuevas, insumos, recapados ya armados, servicios. (Lo que sale de la OS va por producción.)
// Lista con filtros y la grilla de comprobantes (cada línea con sus botones). Botón + : cliente → encabezado (se graba como BORRADOR)
// → renglones (cada uno se graba al agregarlo) → entrega y cobro → Confirmar (recién ahí: número, stock y cuenta corriente).
var _VTA = null, ventaItems = [], _vtaFormas = [];
var VB_ = { f: { desde: '', hasta: '', cli: '', tipo: '', estado: '' }, bor: null, editBd: '' };
var VTA_TIPO_TXT = { FACTURA_A: 'Factura A', FACTURA_B: 'Factura B', PRESUPUESTO: 'Presupuesto', NC_A: 'NC A', NC_B: 'NC B', NC_INTERNA: 'NC interna' };
var COB_FORMA_TXT = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia', TARJETA: 'Tarjeta', CHEQUE_TERCERO: 'Cheque', RETENCION: 'Retención' };
function vEsc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function vNum(v) { var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isNaN(n) ? 0 : n; }
function vR2(n) { return Math.round(n * 100) / 100; }
function vtaCli(id) { return (_VTA && _VTA.CLIENTES || []).filter(function(c) { return String(c.ID_CLIENTE) === String(id); })[0]; }
function vtaArt(id) { return (_VTA && _VTA.ARTICULOS || []).filter(function(a) { return String(a.ID) === String(id); })[0]; }
function vtaArtCod(t) {
  var c = String(t || '').split(' — ')[0].trim().toUpperCase();
  if (!c) return null;
  var arts = _VTA.ARTICULOS || [];
  var a = arts.filter(function(x) { return String(x.CODIGO || '').toUpperCase() === c || String(x.ID) === c; })[0];
  if (a) return a;
  // Muchos artículos no tienen código: se buscan por nombre (exacto, o si una sola parte coincide)
  var n = String(t || '').trim().toUpperCase().replace(/\s+/g, ' ');
  a = arts.filter(function(x) { return String(x.NOMBRE || '').toUpperCase().replace(/\s+/g, ' ') === n; })[0];
  if (a) return a;
  var parte = arts.filter(function(x) { return String(x.NOMBRE || '').toUpperCase().indexOf(n) !== -1; });
  return parte.length === 1 ? parte[0] : null;
}
function vtaArtCuantos(t) { var n = String(t || '').trim().toUpperCase(); return n ? (_VTA.ARTICULOS || []).filter(function(x) { return String(x.NOMBRE || '').toUpperCase().indexOf(n) !== -1; }).length : 0; }
function vbHoy(n) { var d = new Date(Date.now() - (n || 0) * 86400000); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function vbFechaMs(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : 0; }
function vbBorrarCache() { if (typeof _mcDel === 'function') ['ventas_enc', 'ventas_det', 'cta_cte_clientes', 'cobros_enc', 'movimientos_caja', 'cheques', 'bd_articulos', 'vta_borradores', 'vta_borradores_det'].forEach(function(s) { _mcDel(s); }); }

async function renderVentas() {
  var el = $id('page-ventas');
  if (!el) return;
  el.innerHTML = '<div class="content"><div class="tdim tc" style="padding:30px">Cargando…</div></div>';
  try { _VTA = await gsRun('gsVTA_Datos'); }
  catch (e) { el.innerHTML = '<div class="content"><div class="al al-r">No se pudieron cargar las ventas: ' + vEsc(e.message || e) + '</div></div>'; return; }
  if (!VB_.f.desde) { VB_.f.desde = vbHoy(30); VB_.f.hasta = vbHoy(0); }
  if (VB_.bor && VB_.bor.ESTADO === 'BORRADOR') return vbEditor();
  vbLista();
}

// ── Lista de comprobantes ──
function vbLista() {
  var el = $id('page-ventas'); VB_.bor = null;
  var f = VB_.f;
  el.innerHTML =
    '<div class="page-hdr"><div><div class="page-title"><i class="fas fa-shopping-cart" style="color:var(--accent)"></i> Ventas</div>' +
    '<div class="page-sub">Mostrador: cubiertas nuevas, insumos, recapados armados y servicios · Punto de venta ' + vEsc(_VTA.PUNTO_VENTA) + ' (numeración interna hasta la factura electrónica)</div></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-s" style="font-size:15px;padding:10px 14px" onclick="vrFacturar()"><i class="fas fa-file-invoice"></i> Facturar remitos</button>' +
    '<button class="btn btn-s" style="font-size:15px;padding:10px 14px" onclick="vrRemitos()"><i class="fas fa-truck"></i> Remitos de venta</button>' +
    '<button class="btn btn-s" style="font-size:15px;padding:10px 14px" onclick="feAbrir()"><i class="fas fa-qrcode"></i> Factura electrónica</button>' +
    '<button class="btn btn-p" style="font-size:16px;padding:10px 18px" onclick="vbNuevo()"><i class="fas fa-plus"></i> Nuevo comprobante</button></div></div>' +
    '<div class="content"><div class="card mb3"><div class="card-body"><div class="fr" style="align-items:flex-end;flex-wrap:wrap">' +
    '<div class="fg"><label class="fl">Desde</label><input type="date" class="fi" value="' + vEsc(f.desde) + '" onchange="VB_.f.desde=this.value;vbGrilla()"/></div>' +
    '<div class="fg"><label class="fl">Hasta</label><input type="date" class="fi" value="' + vEsc(f.hasta) + '" onchange="VB_.f.hasta=this.value;vbGrilla()"/></div>' +
    '<div class="fg" style="flex:2;min-width:180px"><label class="fl">Cliente o N°</label><input class="fi" value="' + vEsc(f.cli) + '" placeholder="Nombre, CUIT o número" oninput="VB_.f.cli=this.value;clearTimeout(window._vbT);window._vbT=setTimeout(vbGrilla,250)"/></div>' +
    '<div class="fg"><label class="fl">Tipo</label><select class="fs" onchange="VB_.f.tipo=this.value;vbGrilla()">' +
    [['', 'Todos'], ['FACTURA', 'Facturas'], ['PRESUPUESTO', 'Presupuestos'], ['NC', 'Notas de crédito']].map(function(o) { return '<option value="' + o[0] + '"' + (f.tipo === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
    '<div class="fg"><label class="fl">Estado</label><select class="fs" onchange="VB_.f.estado=this.value;vbGrilla()">' +
    [['', 'Todos'], ['CARGA', 'En carga'], ['DEBE', 'Con saldo'], ['COBRADO', 'Cobrados'], ['ANULADA', 'Anulados']].map(function(o) { return '<option value="' + o[0] + '"' + (f.estado === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
    '</div></div></div>' +
    '<div class="card"><div class="card-hd"><span class="card-title">Comprobantes</span><span class="badge b-blue" id="vb-cnt"></span><span class="mono" style="margin-left:auto" id="vb-tot"></span></div>' +
    '<div class="tw"><table><thead><tr><th>Fecha</th><th>N°</th><th>Tipo</th><th>Cliente</th><th class="tr">Total</th><th class="tr">Debe</th><th>Estado</th><th></th></tr></thead><tbody id="vb-body"></tbody></table></div></div></div>';
  vbGrilla();
}
function vbFilas() {
  var f = VB_.f, d0 = vbFechaMs(f.desde), d1 = vbFechaMs(f.hasta) + 86400000 - 1, q = String(f.cli || '').toLowerCase().trim();
  var filas = [];
  (_VTA.BORRADORES || []).forEach(function(b) {
    filas.push({ CARGA: true, ID: b.ID_BOR, FECHA: vbFechaMs(b.FECHA), NRO: 'En carga #' + b.ID_BOR, TIPO: b.TIPO_COMP, TIPO_TXT: b.COMPROBANTE, CLIENTE: b.CLIENTE, CUIT: '', TOTAL: b.TOTAL, SALDO: 0, ESTADO: 'CARGA', RENG: b.RENGLONES });
  });
  (_VTA.VENTAS || []).forEach(function(v) {
    var c = vtaCli(v.CLIENTE), tb = v.TIPO_COMP.indexOf('NC') === 0 ? 'NC' : (v.TIPO_COMP === 'PRESUPUESTO' ? 'PRESUPUESTO' : 'FACTURA');
    filas.push({ CARGA: false, ID: v.ID_VENTA, FECHA: v.FECHA, NRO: v.NRO_COMP, TIPO: tb, TIPO_COMP: v.TIPO_COMP, TIPO_TXT: VTA_TIPO_TXT[v.TIPO_COMP] || v.TIPO_COMP, CLIENTE: c ? c.NOMBRE : String(v.CLIENTE), CUIT: c ? c.CUIT : '',
      TOTAL: v.TOTAL, SALDO: v.SALDO, ESTADO: v.ESTADO === 'ANULADA' ? 'ANULADA' : (tb === 'NC' ? 'NC' : v.ESTADO_COBRO) });
  });
  return filas.filter(function(x) {
    if (!x.CARGA && (x.FECHA < d0 || x.FECHA > d1)) return false;
    if (f.tipo && x.TIPO !== f.tipo) return false;
    if (f.estado === 'CARGA' && !x.CARGA) return false;
    if (f.estado === 'ANULADA' && x.ESTADO !== 'ANULADA') return false;
    if (f.estado === 'COBRADO' && x.ESTADO !== 'COBRADO') return false;
    if (f.estado === 'DEBE' && !(x.SALDO > 0.009 && x.ESTADO !== 'ANULADA')) return false;
    if (q && (x.CLIENTE + ' ' + x.CUIT + ' ' + x.NRO).toLowerCase().indexOf(q) === -1) return false;
    return true;
  }).sort(function(a, b) { return (b.CARGA - a.CARGA) || (b.FECHA - a.FECHA) || (b.ID - a.ID); });
}
function vbGrilla() {
  var tb = $id('vb-body'); if (!tb) return;
  var L = vbFilas(), tot = 0;
  L.forEach(function(x) { if (!x.CARGA && x.ESTADO !== 'ANULADA') tot += x.TIPO === 'NC' ? -x.TOTAL : x.TOTAL; });
  $id('vb-cnt').textContent = L.length; $id('vb-tot').textContent = 'Total ' + fmt(vR2(tot));
  var est = function(x) {
    if (x.CARGA) return '<span class="badge b-orange">EN CARGA · ' + x.RENG + (x.RENG === 1 ? ' renglón' : ' renglones') + '</span>';
    if (x.ESTADO === 'ANULADA') return '<span class="badge b-red">ANULADA</span>';
    if (x.ESTADO === 'NC') return '<span class="badge b-gray">NC</span>';
    return '<span class="badge ' + (x.ESTADO === 'COBRADO' ? 'b-green' : x.ESTADO === 'PARCIAL' ? 'b-warn' : 'b-red') + '">' + vEsc(x.ESTADO) + '</span>';
  };
  tb.innerHTML = !L.length ? '<tr><td colspan="8" class="tc tdim" style="padding:16px">No hay comprobantes con esos filtros.</td></tr>' : L.slice(0, 500).map(function(x) {
    var bt;
    if (x.CARGA) bt = '<button class="btn btn-xs btn-p" onclick="vbAbrir(' + x.ID + ')" title="Seguir cargando / modificar"><i class="fas fa-pen"></i> Seguir</button> ' +
      '<button class="btn btn-xs btn-s" onclick="vbDescartarPedir(' + x.ID + ')" title="Descartar"><i class="fas fa-times"></i></button>';
    else bt = '<button class="btn btn-xs btn-info" onclick="vtaVerDetalle(\'' + x.ID + '\')" title="Ver"><i class="fas fa-eye"></i></button> ' +
      '<button class="btn btn-xs btn-s" onclick="vtaImprimir(\'' + x.ID + '\')" title="Imprimir / PDF"><i class="fas fa-print"></i></button>' +
      (x.ESTADO !== 'ANULADA' && x.TIPO !== 'NC' ? ' <button class="btn btn-xs btn-s" onclick="vbNC(\'' + x.ID + '\')" title="Nota de crédito">NC</button>' : '') +
      (x.ESTADO !== 'ANULADA' ? ' <button class="btn btn-xs btn-s" onclick="vtaAnularPedir(\'' + x.ID + '\')" title="Anular"><i class="fas fa-ban"></i></button>' : '');
    return '<tr' + (x.ESTADO === 'ANULADA' ? ' style="opacity:.55"' : '') + '><td class="mono" style="font-size:12px">' + (x.FECHA ? fmtD(x.FECHA) : '') + '</td><td class="mono" style="font-size:11px">' + vEsc(x.NRO) + '</td>' +
      '<td><span class="badge ' + (x.TIPO === 'NC' ? 'b-warn' : x.TIPO === 'PRESUPUESTO' ? 'b-gray' : 'b-blue') + '" style="font-size:9px">' + vEsc(x.TIPO_TXT) + '</span></td>' +
      '<td style="font-size:12px">' + vEsc(x.CLIENTE) + '</td><td class="mono tr" style="font-weight:700">' + (x.TIPO === 'NC' ? '-' : '') + fmt(x.TOTAL) + '</td>' +
      '<td class="mono tr">' + (x.CARGA || x.TIPO === 'NC' || x.ESTADO === 'ANULADA' ? '' : fmt(x.SALDO)) + '</td><td>' + est(x) + '</td><td style="white-space:nowrap">' + bt + '</td></tr>';
  }).join('');
}

// ── Nuevo / abrir comprobante en carga ──
function vbNuevo() { VB_.bor = { ID_BOR: '', TIPO_COMP: 'FACTURA', FECHA: vbHoy(0), ID_CLIENTE: '', TIPO_ENTREGA: 'MOSTRADOR', OBS: '', ESTADO: 'BORRADOR', LINEAS: [], NETO: 0, IVA_TOTAL: 0, TOTAL: 0 }; VB_.editBd = ''; _vtaFormas = []; vbEditor(); }
function vbNC(idVenta) {
  var v = (_VTA.VENTAS || []).filter(function(x) { return String(x.ID_VENTA) === String(idVenta); })[0]; if (!v) return;
  VB_.bor = { ID_BOR: '', TIPO_COMP: 'NC', FECHA: vbHoy(0), ID_CLIENTE: v.CLIENTE, ID_COMP_ORIGEN: v.ID_VENTA, NC_TIPO: 'DEVOLUCION', OBS: '', ESTADO: 'BORRADOR', LINEAS: [], NETO: 0, IVA_TOTAL: 0, TOTAL: 0 };
  VB_.editBd = ''; _vtaFormas = []; vbEditor();
}
async function vbAbrir(id) {
  try { var r = await gsRun('gsVTB_Ver', id); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo abrir', 'r2'); return; } VB_.bor = r.BOR; VB_.editBd = ''; _vtaFormas = []; vbEditor(); }
  catch (e) { toast(e.message || e, 'r2'); }
}
function vbEditor() {
  var el = $id('page-ventas'), b = VB_.bor, nuevo = !b.ID_BOR, nc = b.TIPO_COMP === 'NC', imp = nc && b.NC_TIPO === 'IMPORTE';
  var cli = vtaCli(b.ID_CLIENTE);
  var titulo = nuevo ? 'Nuevo comprobante' : (b.COMPROBANTE || b.TIPO_COMP) + ' · en carga #' + b.ID_BOR;
  el.innerHTML =
    '<div class="page-hdr"><div><div class="page-title"><i class="fas fa-file-invoice" style="color:var(--accent)"></i> ' + vEsc(titulo) + '</div>' +
    '<div class="page-sub">' + (nuevo ? 'Paso 1: elegí el cliente y grabá el encabezado' : 'Se graba todo a medida que cargás. El número, el stock y la cuenta corriente se aplican al Confirmar.') + '</div></div>' +
    '<button class="btn btn-s" onclick="vbVolver()"><i class="fas fa-arrow-left"></i> Volver a la lista</button></div>' +
    '<div class="content">' +
    // Encabezado
    '<div class="card mb3"><div class="card-hd"><span class="card-title">1 · Encabezado</span>' + (nuevo ? '' : '<span class="badge b-green">Grabado</span>') + '</div><div class="card-body">' +
    '<div class="fr" style="flex-wrap:wrap"><div class="fg"><label class="fl">Tipo *</label><select id="vb-tipo" class="fs" style="font-weight:700" onchange="vbTipoCambio()">' +
    [['FACTURA', 'Factura (A o B según el cliente)'], ['PRESUPUESTO', 'Presupuesto (comprobante X: no va a ARCA)'], ['NC', 'Nota de crédito']].map(function(o) { return '<option value="' + o[0] + '"' + (b.TIPO_COMP === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>' +
    '<div class="fg"><label class="fl">Fecha *</label><input id="vb-fecha" type="date" class="fi" value="' + vEsc(b.FECHA) + '"/></div>' +
    '<div class="fg" id="vb-entrega-w"' + (nc ? ' style="display:none"' : '') + '><label class="fl">Entrega</label><select id="vb-entrega" class="fs"><option value="MOSTRADOR"' + (b.TIPO_ENTREGA !== 'REMITO' ? ' selected' : '') + '>Mostrador — sale del stock al confirmar</option><option value="REMITO"' + (b.TIPO_ENTREGA === 'REMITO' ? ' selected' : '') + '>Con remito — sale del stock al entregar</option></select></div></div>' +
    '<div class="fr" style="flex-wrap:wrap"><div class="fg" style="flex:2;min-width:220px"><label class="fl">Cliente *</label><input id="vb-cli-q" class="fi" placeholder="Buscar por nombre o CUIT…" oninput="vbCliFiltrar()" value=""/>' +
    '<select id="vb-cli" class="fs mt1" onchange="vbCliCambio()"></select></div>' +
    '<div class="fg" style="flex:2;min-width:220px" id="vb-cli-info"></div></div>' +
    '<div id="vb-nc-w"' + (nc ? '' : ' style="display:none"') + '><div class="fr" style="flex-wrap:wrap"><div class="fg" style="flex:2"><label class="fl">Venta a la que se le hace la NC *</label><select id="vb-nc-origen" class="fs"></select></div>' +
    '<div class="fg"><label class="fl">Tipo de NC</label><select id="vb-nc-tipo" class="fs" onchange="vbTipoCambio()"><option value="DEVOLUCION"' + (b.NC_TIPO !== 'IMPORTE' ? ' selected' : '') + '>Devolución de mercadería (vuelve el stock)</option><option value="IMPORTE"' + (b.NC_TIPO === 'IMPORTE' ? ' selected' : '') + '>Por importe</option></select></div></div>' +
    '<div class="fr" id="vb-ncimp-w"' + (imp ? '' : ' style="display:none"') + '><div class="fg" style="flex:2"><label class="fl">Concepto *</label><input id="vb-nc-concepto" class="fi" value="' + vEsc(b.NC_CONCEPTO || '') + '" placeholder="Ej: Bonificación"/></div>' +
    '<div class="fg"><label class="fl">Importe con IVA *</label><input id="vb-nc-importe" type="number" step="0.01" class="fi" value="' + (b.NC_IMPORTE || '') + '"/></div>' +
    '<div class="fg"><label class="fl">IVA %</label><select id="vb-nc-iva" class="fs">' + ['21', '10.5', '0'].map(function(x) { return '<option' + (String(b.NC_IVA || '21') === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div></div></div>' +
    '<div class="fg"><label class="fl">Observaciones</label><input id="vb-obs" class="fi" value="' + vEsc(b.OBS || '') + '" placeholder="Opcional"/></div>' +
    '<button class="btn btn-p" id="vb-enc-ok" onclick="vbGrabarEnc()"><i class="fas fa-save"></i> ' + (nuevo ? 'Grabar encabezado y pasar al detalle' : 'Guardar cambios del encabezado') + '</button></div></div>' +
    (nuevo ? '' : vbDetalleHtml() + vbCobroHtml()) +
    '</div>';
  vbCliFiltrar(b.ID_CLIENTE);
  if (!nuevo) { vbPintarLineas(); if (!(nc)) { if (!_vtaFormas.length) vtaFormaAgregar(); else vtaPintarFormas(); } vbFoco(); }
}
function vbVolver() { VB_.bor = null; renderVentas(); }
function vbCliFiltrar(sel) {
  var q = (($id('vb-cli-q') || {}).value || '').toLowerCase().trim(), s = $id('vb-cli'); if (!s) return;
  var cur = sel !== undefined ? sel : s.value;
  var l = (_VTA.CLIENTES || []).filter(function(c) { return !q || (c.NOMBRE + ' ' + c.CUIT).toLowerCase().indexOf(q) !== -1 || String(c.ID_CLIENTE) === String(cur); }).slice(0, 300);
  s.innerHTML = '<option value="">— Elegir —</option>' + l.map(function(c) { return '<option value="' + c.ID_CLIENTE + '"' + (String(cur) === String(c.ID_CLIENTE) ? ' selected' : '') + '>' + vEsc(c.NOMBRE) + (c.CUIT ? ' · ' + vEsc(c.CUIT) : '') + '</option>'; }).join('');
  vbCliCambio();
}
function vbCliCambio() {
  var c = vtaCli($v('vb-cli')), info = $id('vb-cli-info'), t = $v('vb-tipo');
  if (info) info.innerHTML = !c ? '<div class="tdim" style="padding-top:22px">Elegí el cliente</div>' :
    '<div style="padding-top:18px;font-size:13px"><b>' + vEsc(c.NOMBRE) + '</b><br>' + vEsc(c.COND_NOMBRE || 'Sin condición de IVA') + (c.CUIT ? ' · CUIT ' + vEsc(c.CUIT) : '') +
    (t === 'FACTURA' ? ' · corresponde <b>factura ' + c.LETRA + '</b>' : '') + '<br>Debe: <b>' + fmt((_VTA.VENTAS || []).filter(function(v) { return String(v.CLIENTE) === String(c.ID_CLIENTE) && v.ESTADO !== 'ANULADA'; }).reduce(function(s, v) { return s + v.SALDO; }, 0)) + '</b></div>';
  var o = $id('vb-nc-origen');
  if (o) {
    var b = VB_.bor, vs = c ? (_VTA.VENTAS || []).filter(function(v) { return String(v.CLIENTE) === String(c.ID_CLIENTE) && v.ESTADO !== 'ANULADA' && v.TIPO_COMP.indexOf('NC') !== 0; }) : [];
    o.innerHTML = '<option value="">' + (c ? (vs.length ? '— Elegir —' : 'Este cliente no tiene ventas') : '— Elegí primero el cliente —') + '</option>' +
      vs.map(function(v) { return '<option value="' + v.ID_VENTA + '"' + (String(b.ID_COMP_ORIGEN) === String(v.ID_VENTA) ? ' selected' : '') + '>' + (VTA_TIPO_TXT[v.TIPO_COMP] || v.TIPO_COMP) + ' ' + vEsc(v.NRO_COMP) + ' · ' + fmtD(v.FECHA) + ' · ' + fmt(v.TOTAL) + '</option>'; }).join('');
  }
}
function vbTipoCambio() {
  var t = $v('vb-tipo'), nc = t === 'NC';
  $id('vb-nc-w').style.display = nc ? '' : 'none'; $id('vb-entrega-w').style.display = nc ? 'none' : '';
  $id('vb-ncimp-w').style.display = nc && $v('vb-nc-tipo') === 'IMPORTE' ? '' : 'none';
  vbCliCambio();
}
async function vbGrabarEnc() {
  var b = VB_.bor, d = { ID_BOR: b.ID_BOR || '', TIPO_COMP: $v('vb-tipo'), FECHA: $v('vb-fecha'), ID_CLIENTE: $v('vb-cli'), TIPO_ENTREGA: $v('vb-entrega'), OBS: $v('vb-obs'),
    ID_COMP_ORIGEN: $v('vb-nc-origen'), NC_TIPO: $v('vb-nc-tipo'), NC_IMPORTE: $v('vb-nc-importe'), NC_IVA: $v('vb-nc-iva'), NC_CONCEPTO: $v('vb-nc-concepto') };
  if (!d.ID_CLIENTE) { toast('Elegí el cliente', 'r2'); return; }
  var bt = $id('vb-enc-ok'); bt.disabled = true;
  try {
    var r = await gsRun('gsVTB_Guardar', d);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo grabar', 'r2'); bt.disabled = false; return; }
    VB_.bor = r.BOR; vbBorrarCache(); toast('Encabezado grabado', 'g'); vbEditor();
  } catch (e) { toast(e.message || e, 'r2'); bt.disabled = false; }
}

// ── Detalle ──
function vbDetalleHtml() {
  var b = VB_.bor;
  if (b.TIPO_COMP === 'NC' && b.NC_TIPO === 'IMPORTE') return '<div class="card mb3"><div class="card-hd"><span class="card-title">2 · Detalle</span></div><div class="card-body tdim">La nota de crédito por importe no lleva renglones: el importe va en el encabezado.</div>' + vbPieHtml() + '</div>';
  return '<div class="card mb3"><div class="card-hd"><span class="card-title">2 · Detalle</span><span class="badge b-blue" id="vb-nl"></span></div><div class="card-body">' +
    '<div class="fr" style="flex-wrap:wrap;align-items:flex-end">' +
    '<div class="fg"><label class="fl">Qué</label><select id="vb-l-tipo" class="fs" onchange="vbLTipo()"><option value="ARTICULO">Artículo</option><option value="SERVICIO">Servicio</option></select></div>' +
    '<div class="fg" style="flex:3;min-width:240px" id="vb-l-art-w"><label class="fl">Código o producto</label><input id="vb-l-art" class="fi" list="vb-arts" placeholder="Escribí el código o el nombre" onchange="vbLArt()"/>' +
    '<datalist id="vb-arts">' + (_VTA.ARTICULOS || []).slice(0, 3000).map(function(a) { return '<option value="' + vEsc((a.CODIGO || a.ID) + ' — ' + a.NOMBRE) + '">'; }).join('') + '</datalist></div>' +
    '<div class="fg" style="flex:3;min-width:240px;display:none" id="vb-l-serv-w"><label class="fl">Servicio</label><input id="vb-l-serv" class="fi" placeholder="Ej: Armado y balanceo"/></div>' +
    '<div class="fg" style="max-width:90px"><label class="fl">Cantidad</label><input id="vb-l-cant" type="number" min="1" step="1" class="fi" value="1"/></div>' +
    '<div class="fg" style="max-width:150px"><label class="fl">Precio neto s/IVA</label><input id="vb-l-neto" type="number" step="0.01" class="fi"/></div>' +
    '<div class="fg" style="max-width:90px"><label class="fl">Desc. %</label><input id="vb-l-dto" type="number" step="0.01" min="0" class="fi" value="0"/></div>' +
    '<div class="fg" style="max-width:90px"><label class="fl">IVA %</label><select id="vb-l-iva" class="fs">' + ['21', '10.5', '27', '0'].map(function(x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>' +
    '</div><div class="fr" style="align-items:center;flex-wrap:wrap">' +
    '<label style="display:flex;gap:8px;align-items:center;font-size:13px;cursor:pointer"><input type="checkbox" id="vb-l-sc" onchange="vbLSc()"/> <span><b>Sin cargo</b> (se entrega y no se cobra)</span></label>' +
    '<input id="vb-l-scm" class="fi" style="display:none;max-width:320px" value="parche incluido en el recapado" placeholder="Motivo"/>' +
    '<span id="vb-l-info" class="tdim" style="font-size:12px"></span>' +
    '<button class="btn btn-p" id="vb-l-ok" style="margin-left:auto" onclick="vbGrabarLinea()"><i class="fas fa-check"></i> <span id="vb-l-oktxt">Grabar renglón</span></button>' +
    '<button class="btn btn-s" id="vb-l-cancel" style="display:none" onclick="vbLLimpiar()">Cancelar cambio</button></div>' +
    '<div class="tw mt2"><table style="font-size:13px"><thead><tr><th>Código</th><th>Detalle</th><th class="tr">Cant.</th><th class="tr">Neto u.</th><th class="tr">Desc.</th><th class="tr">IVA</th><th class="tr">Subtotal</th><th></th></tr></thead><tbody id="vb-lineas"></tbody></table></div>' +
    '</div>' + vbPieHtml() + '</div>';
}
function vbPieHtml() { return '<div class="card-hd" style="border-top:1px solid var(--border);gap:22px;justify-content:flex-end;flex-wrap:wrap"><span>Neto <b class="mono" id="vb-neto"></b></span><span>IVA <b class="mono" id="vb-iva"></b></span><span id="vb-perc-w" style="display:none">Percepciones <b class="mono" id="vb-perc"></b></span><span style="font-size:18px">TOTAL <b class="mono" style="color:var(--success)" id="vb-total"></b></span></div>'; }
function vbPintarLineas() {
  var b = VB_.bor, tb = $id('vb-lineas');
  if ($id('vb-neto')) { $id('vb-neto').textContent = fmt(b.NETO); $id('vb-iva').textContent = fmt(b.IVA_TOTAL); $id('vb-total').textContent = fmt(b.TOTAL); }
  if ($id('vb-perc')) { $id('vb-perc').textContent = fmt(b.PERCEPCIONES || 0); $id('vb-perc-w').style.display = b.PERCEPCIONES ? '' : 'none'; }
  if (!tb) return;
  $id('vb-nl').textContent = b.LINEAS.length + (b.LINEAS.length === 1 ? ' renglón' : ' renglones');
  tb.innerHTML = !b.LINEAS.length ? '<tr><td colspan="8" class="tc tdim" style="padding:14px">Todavía no hay renglones: cargá el primero arriba.</td></tr>' : b.LINEAS.map(function(l) {
    var a = l.ID_ARTICULO ? vtaArt(l.ID_ARTICULO) : null;
    return '<tr' + (String(VB_.editBd) === String(l.ID_BD) ? ' style="background:var(--warn-light)"' : '') + '><td class="mono" style="font-size:11px">' + vEsc(a ? (a.CODIGO || a.ID) : (l.TIPO === 'SERVICIO' ? 'Servicio' : '')) + '</td>' +
      '<td>' + vEsc(l.NOMBRE) + (l.SIN_CARGO ? ' <span class="badge b-green">SIN CARGO · ' + vEsc(l.MOTIVO_SC) + '</span>' : '') + '</td><td class="mono tr">' + l.CANT + '</td><td class="mono tr">' + fmt(l.NETO) + '</td>' +
      '<td class="mono tr">' + (l.DTO ? l.DTO + '%' : '') + '</td><td class="tr">' + l.IVA + '%</td><td class="mono tr" style="font-weight:700">' + fmt(l.SUBTOTAL) + '</td>' +
      '<td style="white-space:nowrap"><button class="btn btn-xs btn-s" onclick="vbLEditar(' + l.ID_BD + ')" title="Modificar"><i class="fas fa-pen"></i></button> <button class="btn btn-xs btn-s" onclick="vbLQuitar(' + l.ID_BD + ')" title="Quitar"><i class="fas fa-times"></i></button></td></tr>';
  }).join('');
}
function vbFoco() { var e = $id('vb-l-art'); if (e) { e.focus(); e.onkeydown = function(ev) { if (ev.key === 'Enter') { vbLArt(); $id('vb-l-cant').focus(); } }; } ['vb-l-cant', 'vb-l-neto', 'vb-l-dto'].forEach(function(k) { var x = $id(k); if (x) x.onkeydown = function(ev) { if (ev.key === 'Enter') vbGrabarLinea(); }; }); }
function vbLTipo() { var s = $v('vb-l-tipo') === 'SERVICIO'; $id('vb-l-art-w').style.display = s ? 'none' : ''; $id('vb-l-serv-w').style.display = s ? '' : 'none'; $id('vb-l-info').textContent = ''; }
function vbLSc() { var on = $id('vb-l-sc').checked; $id('vb-l-scm').style.display = on ? '' : 'none'; $id('vb-l-neto').disabled = on; $id('vb-l-dto').disabled = on; }
function vbLArt() {
  var a = vtaArtCod($v('vb-l-art')), inf = $id('vb-l-info');
  if (!a) { var nq = vtaArtCuantos($v('vb-l-art')); inf.textContent = !$v('vb-l-art') ? '' : (nq > 1 ? 'Hay ' + nq + ' productos con ese nombre: elegí uno de la lista' : 'No encontré ese código ni ese nombre'); return; }
  $id('vb-l-art').value = (a.CODIGO || a.ID) + ' — ' + a.NOMBRE;
  if (VB_.bor && VB_.bor.TIPO_COMP === 'NC') { if (!VB_.editBd) $id('vb-l-neto').value = ''; inf.textContent = 'Nota de crédito: si dejás el precio vacío se toma el de la factura ' + (VB_.bor.ORIGEN_NRO || '') + ' (con su descuento y su IVA)'; return; }
  if (!$v('vb-l-neto') || !VB_.editBd) $id('vb-l-neto').value = a.PRECIO_SIN ? vR2(a.PRECIO_SIN) : '';
  $id('vb-l-iva').value = String(a.IVA);
  inf.textContent = (a.PRECIO ? 'Lista: ' + fmt(a.PRECIO) + ' con IVA' : 'Sin precio en la lista vigente') + (['SERVICIO', 'RECAPADO'].indexOf(a.TIPO) !== -1 ? ' · no lleva stock' : ' · stock ' + a.STOCK);
}
function vbLLimpiar() {
  VB_.editBd = ''; ['vb-l-art', 'vb-l-serv', 'vb-l-neto'].forEach(function(k) { if ($id(k)) $id(k).value = ''; }); $id('vb-l-cant').value = '1'; $id('vb-l-dto').value = '0';
  $id('vb-l-sc').checked = false; vbLSc(); $id('vb-l-info').textContent = ''; $id('vb-l-oktxt').textContent = 'Grabar renglón'; $id('vb-l-cancel').style.display = 'none'; vbPintarLineas(); vbFoco();
}
function vbLEditar(idBd) {
  var l = VB_.bor.LINEAS.filter(function(x) { return String(x.ID_BD) === String(idBd); })[0]; if (!l) return;
  VB_.editBd = l.ID_BD; $id('vb-l-tipo').value = l.TIPO; vbLTipo();
  if (l.TIPO === 'ARTICULO') { var a = vtaArt(l.ID_ARTICULO); $id('vb-l-art').value = a ? (a.CODIGO || a.ID) + ' — ' + a.NOMBRE : l.ID_ARTICULO; } else $id('vb-l-serv').value = l.NOMBRE;
  $id('vb-l-cant').value = l.CANT; $id('vb-l-neto').value = l.NETO || ''; $id('vb-l-dto').value = l.DTO; $id('vb-l-iva').value = String(l.IVA);
  $id('vb-l-sc').checked = !!l.SIN_CARGO; vbLSc(); if (l.SIN_CARGO) $id('vb-l-scm').value = l.MOTIVO_SC;
  $id('vb-l-oktxt').textContent = 'Guardar cambio del renglón'; $id('vb-l-cancel').style.display = ''; vbPintarLineas();
}
async function vbGrabarLinea() {
  var tipo = $v('vb-l-tipo'), l = { ID_BD: VB_.editBd || '', TIPO: tipo, CANT: $v('vb-l-cant'), NETO: $v('vb-l-neto'), DTO: $v('vb-l-dto'), IVA: $v('vb-l-iva'), SIN_CARGO: $id('vb-l-sc').checked ? 1 : 0, MOTIVO_SC: $v('vb-l-scm') };
  if (tipo === 'ARTICULO') { var a = vtaArtCod($v('vb-l-art')); if (!a) { toast('Escribí o elegí el código del producto', 'r2'); return; } l.ID_ARTICULO = a.ID; }
  else l.NOMBRE = $v('vb-l-serv');
  var bt = $id('vb-l-ok'); bt.disabled = true;
  try {
    var r = await gsRun('gsVTB_Linea', VB_.bor.ID_BOR, l);
    bt.disabled = false;
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo grabar el renglón', 'r2'); return; }
    VB_.bor = r.BOR; vbLLimpiar(); vtaTotales();
  } catch (e) { bt.disabled = false; toast(e.message || e, 'r2'); }
}
async function vbLQuitar(idBd) {
  try { var r = await gsRun('gsVTB_Quitar', VB_.bor.ID_BOR, idBd); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo quitar', 'r2'); return; } VB_.bor = r.BOR; if (String(VB_.editBd) === String(idBd)) vbLLimpiar(); else vbPintarLineas(); vtaTotales(); }
  catch (e) { toast(e.message || e, 'r2'); }
}

// ── Entrega, cobro y confirmar ──
function vbCobroHtml() {
  var nc = VB_.bor.TIPO_COMP === 'NC';
  return '<div class="card mb3"><div class="card-hd"><span class="card-title">3 · ' + (nc ? 'Confirmar' : 'Cobro y confirmar') + '</span></div><div class="card-body">' +
    (nc ? '<div class="tdim mb2">La nota de crédito descuenta de la cuenta corriente del cliente.</div>' :
      '<div class="sec-div">COBRO AHORA (lo que no se cobra queda en la cuenta corriente)</div><div id="vta-formas"></div>' +
      '<button class="btn btn-s btn-sm" onclick="vtaFormaAgregar()"><i class="fas fa-plus"></i> Agregar forma de cobro</button><div id="vta-cobro-res" class="mt2" style="font-size:13px"></div>') +
    feBannerBor(VB_.bor.FE) +
    '<div class="flex gap2 mt3" style="flex-wrap:wrap"><button class="btn btn-g btn-xl" id="vb-conf" onclick="vbConfirmar()" style="flex:1;justify-content:center"><i class="fas fa-check-double"></i> Confirmar comprobante</button>' +
    '<button class="btn btn-s" onclick="vbDescartarPedir(' + VB_.bor.ID_BOR + ')"><i class="fas fa-times"></i> Descartar</button></div></div></div>';
}
function vtaTotal() { return VB_.bor ? vR2(VB_.bor.TOTAL) : 0; }
function vtaFormaAgregar() { vtaLeerFormas(); _vtaFormas.push({ FORMA: 'EFECTIVO', IMPORTE: '', ID_CAJA: '', DETALLE: '', NRO_CHEQUE: '', BANCO: '', EMISOR: '', CUIT_EMISOR: '', FECHA_COBRO: '', TIPO_CHEQUE: 'IMPRESO' }); vtaPintarFormas(); }
function vtaFormaQuitar(i) { vtaLeerFormas(); _vtaFormas.splice(i, 1); vtaPintarFormas(); }
function vtaLeerFormas() { cobLeerFormas(_vtaFormas, 'vf'); }
function vtaPintarFormas() { cobPintarFormas(_vtaFormas, 'vf', 'vta-formas', 'vtaFormaQuitar', 'vtaFormaRepintar', 'vtaTotales', _VTA.CAJAS); vtaTotales(); }
function vtaFormaRepintar() { vtaLeerFormas(); vtaPintarFormas(); }
function vtaTotales() {
  var tot = vtaTotal(), res = $id('vta-cobro-res'); if (!res) return;
  vtaLeerFormas();
  var cob = vR2(_vtaFormas.reduce(function(s, f) { return s + vNum(f.IMPORTE); }, 0));
  res.innerHTML = cob > tot + 0.01 ? '<span style="color:var(--danger)">Se cobra ' + fmt(cob) + ' y el total es ' + fmt(tot) + '</span>' :
    'Se cobra ahora <b>' + fmt(cob) + '</b> · queda en cuenta corriente <b>' + fmt(vR2(tot - cob)) + '</b>';
}
async function vbConfirmar() {
  var b = VB_.bor, formas = [];
  if (b.TIPO_COMP !== 'NC') { vtaLeerFormas(); formas = cobFormasEnviar(_vtaFormas); }
  if (!(b.TIPO_COMP === 'NC' && b.NC_TIPO === 'IMPORTE') && !b.LINEAS.length) { toast('Agregá al menos un renglón', 'r2'); return; }
  var cob = 0; formas.forEach(function(f) { cob += Number(f.IMPORTE) || 0; });
  var txt = '¿Confirmar ' + (b.COMPROBANTE || b.TIPO_COMP) + ' a ' + (b.CLIENTE || '') + ' por ' + fmt(b.TOTAL) + '?' + (b.TIPO_COMP === 'NC' ? ' Descuenta de la cuenta corriente.' : ' Se cobra ahora ' + fmt(cob) + ' y queda en cuenta corriente ' + fmt(vR2(b.TOTAL - cob)) + '.') + (b.TIPO_COMP === 'NC' ? ' Después no se modifica: si hace falta, se anula.' : ' Después no se modifica: se anula o se hace nota de crédito.');
  if (!(await uiConfirmar(txt, 'Sí, confirmar'))) return;
  var bt = $id('vb-conf'); bt.disabled = true; bt.innerHTML = 'Confirmando…';
  try {
    var r = await gsRun('gsVTB_Confirmar', b.ID_BOR, formas);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo confirmar', 'r2'); bt.disabled = false; bt.innerHTML = '<i class="fas fa-check-double"></i> Confirmar comprobante'; try { var rb = await gsRun('gsVTB_Ver', b.ID_BOR); if (rb && rb.ok) { VB_.bor = rb.BOR; var bn = $id('fe-banner'); if (bn) bn.outerHTML = feBannerBor(VB_.bor.FE); } } catch (e2) {} return; }
    toast((VTA_TIPO_TXT[r.TIPO_COMP] || r.TIPO_COMP) + ' ' + r.NRO_COMP + ' — ' + fmt(r.TOTAL) + (r.CAE ? ' · CAE ' + r.CAE + (r.AMBIENTE !== 'PROD' ? ' (' + r.AMBIENTE + ', sin validez fiscal)' : '') : '') + (r.COBRO ? ' · cobro ' + r.COBRO.NRO_COBRO : '') + ' ✓', 'g');
    if (r.AVISOS) toast(r.AVISOS, 'w');
    vbBorrarCache(); VB_.bor = null; await renderVentas(); vtaImprimir(r.ID_VENTA);
  } catch (e) { toast('Error: ' + (e.message || e), 'r2'); bt.disabled = false; bt.innerHTML = '<i class="fas fa-check-double"></i> Confirmar comprobante'; }
}
function vbDescartarPedir(id) {
  uiPedir('Motivo para descartar el comprobante en carga #' + id + ' (no se graba ningún comprobante)').then(async function(m) {
    if (!m) return;
    try { var r = await gsRun('gsVTB_Descartar', id, m); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo descartar', 'r2'); return; } toast('Descartado', 'g'); vbBorrarCache(); VB_.bor = null; renderVentas(); }
    catch (e) { toast(e.message || e, 'r2'); }
  });
}

// ── Imprimir / PDF del comprobante confirmado ──
async function vtaImprimir(id) {
  try {
    var r = await gsRun('gsVTA_Detalle', id); if (!r || !r.ok) { toast((r && r.error) || 'No encontrado', 'r2'); return; }
    var v = r.VENTA, an = v.ESTADO === 'ANULADA', tit = (VTA_TIPO_TXT[v.TIPO_COMP] || v.TIPO_COMP).toUpperCase();
    if (v.FE && v.FE.CAE) { await feImprimir(r); return; }
    var h = pcEncImp(tit + (v.TIPO_COMP === 'PRESUPUESTO' ? ' (X · no válido como factura)' : ''), v.NRO_COMP, fmtD(v.FECHA)) +
      (an ? '<div style="border:2px solid #b91c1c;color:#b91c1c;font-weight:800;padding:6px 10px;margin:6px 0;text-align:center">ANULADA · ' + vEsc(v.MOTIVO_ANULACION || '') + '</div>' : '') +
      '<div class="dat"><div><b>Cliente</b>' + vEsc(v.CLIENTE) + '</div><div><b>CUIT / DNI</b>' + vEsc(v.CUIT || '—') + '</div><div><b>Fecha</b>' + fmtD(v.FECHA) + '</div><div><b>Entrega</b>' + vEsc(v.TIPO_ENTREGA || '—') + '</div></div>' +
      (v.ORIGEN ? '<div class="nota">Sobre el comprobante ' + vEsc(v.ORIGEN) + '</div>' : '') +
      '<table><thead><tr><th>Detalle</th><th class="n">Cant.</th><th class="n">P. unit. neto</th><th class="n">Desc.</th><th class="n">Neto</th><th class="n">IVA</th><th class="n">Subtotal</th></tr></thead><tbody>' +
      r.ITEMS.map(function(i) { return '<tr><td>' + vEsc(i.NOMBRE) + '</td><td class="n">' + i.CANT + '</td><td class="n">' + fmt(i.PRECIO_U !== undefined ? i.PRECIO_U : (i.CANT ? i.NETO / i.CANT : 0)) + '</td><td class="n">' + (i.DTO ? i.DTO + '%' : '') + '</td><td class="n">' + fmt(i.NETO) + '</td><td class="n">' + fmt(i.IVA) + ' (' + i.IVA_AL + '%)</td><td class="n">' + fmt(i.SUB) + '</td></tr>'; }).join('') +
      '<tr class="tot"><td colspan="6">Neto</td><td class="n">' + fmt(v.NETO) + '</td></tr><tr class="tot"><td colspan="6">IVA</td><td class="n">' + fmt(v.IVA) + '</td></tr>' +
      '<tr class="tot"><td colspan="6"><b>TOTAL</b></td><td class="n"><b>' + fmt(v.TOTAL) + '</b></td></tr></tbody></table>' +
      (v.OBS ? '<div class="nota">Observaciones: ' + vEsc(v.OBS) + '</div>' : '') +
      '<div class="firmas"><div>Vulcan Tread Neumáticos S.R.L.</div><div>Recibí conforme · ' + vEsc(v.CLIENTE) + '<br>Firma, aclaración y DNI</div></div>';
    pcImprimir(tit + ' ' + v.NRO_COMP, h, false);
  } catch (e) { toast('Error: ' + (e.message || e), 'r2'); }
}


// Formas de cobro compartidas con Cobranzas
function cobLeerFormas(arr, p) {
  arr.forEach(function(f, i) {
    ['FORMA', 'IMPORTE', 'ID_CAJA', 'DETALLE', 'NRO_CHEQUE', 'BANCO', 'EMISOR', 'CUIT_EMISOR', 'FECHA_COBRO', 'TIPO_CHEQUE'].forEach(function(k) { var e = $id(p + '-' + k + '-' + i); if (e) f[k] = e.value; });
  });
}
function cobPintarFormas(arr, p, cont, fQuitar, fRepintar, fTot, cajas) {
  var el = $id(cont);
  if (!el) return;
  el.innerHTML = arr.map(function(f, i) {
    var id = function(k) { return p + '-' + k + '-' + i; };
    var h = '<div style="border:1.5px solid var(--border);border-radius:8px;padding:8px;margin-bottom:6px"><div class="fr">' +
      '<div class="fg"><label class="fl">Forma</label><select id="' + id('FORMA') + '" class="fs" onchange="' + fRepintar + '()">' +
      Object.keys(COB_FORMA_TXT).map(function(k) { return '<option value="' + k + '"' + (f.FORMA === k ? ' selected' : '') + '>' + COB_FORMA_TXT[k] + '</option>'; }).join('') + '</select></div>' +
      '<div class="fg"><label class="fl">Importe</label><input id="' + id('IMPORTE') + '" type="number" step="0.01" min="0" class="fi" style="text-align:right" value="' + vEsc(f.IMPORTE) + '" oninput="' + fTot + '()"></div>';
    if (f.FORMA === 'CHEQUE_TERCERO') {
      h += '</div><div class="fr"><div class="fg"><label class="fl">Tipo</label><select id="' + id('TIPO_CHEQUE') + '" class="fs"><option value="IMPRESO"' + (f.TIPO_CHEQUE !== 'ECHEQ' ? ' selected' : '') + '>Impreso</option><option value="ECHEQ"' + (f.TIPO_CHEQUE === 'ECHEQ' ? ' selected' : '') + '>eCheq</option></select></div>' +
        '<div class="fg"><label class="fl">N° *</label><input id="' + id('NRO_CHEQUE') + '" class="fi" value="' + vEsc(f.NRO_CHEQUE) + '"></div>' +
        '<div class="fg"><label class="fl">Banco *</label><input id="' + id('BANCO') + '" class="fi" value="' + vEsc(f.BANCO) + '"></div>' +
        '<div class="fg"><label class="fl">Fecha de cobro *</label><input id="' + id('FECHA_COBRO') + '" type="date" class="fi" value="' + vEsc(f.FECHA_COBRO) + '"></div></div>' +
        '<div class="fr"><div class="fg"><label class="fl">Librador (si no es el cliente)</label><input id="' + id('EMISOR') + '" class="fi" value="' + vEsc(f.EMISOR) + '"></div>' +
        '<div class="fg"><label class="fl">CUIT librador</label><input id="' + id('CUIT_EMISOR') + '" class="fi" value="' + vEsc(f.CUIT_EMISOR) + '"></div>';
    } else if (f.FORMA === 'RETENCION') {
      h += '<div class="fg" style="flex:2"><label class="fl">Retención y N° de certificado *</label><input id="' + id('DETALLE') + '" class="fi" value="' + vEsc(f.DETALLE) + '" placeholder="Ej: IIBB Salta cert. 1234"></div>';
    } else {
      var esBco = f.FORMA !== 'EFECTIVO', cjs = (cajas || []).filter(function(c) { return esBco ? c.TIPO === 'BANCO' : c.TIPO !== 'BANCO'; });
      h += '<div class="fg"><label class="fl">' + (esBco ? 'Entra en la cuenta del banco' : 'Entra en la caja') + '</label><select id="' + id('ID_CAJA') + '" class="fs"><option value="">' + (cjs.length ? '— Elegir —' : (esBco ? 'No hay cuenta de banco cargada' : 'No hay caja')) + '</option>' +
        cjs.map(function(c) { return '<option value="' + c.ID_CAJA + '"' + (String(f.ID_CAJA) === String(c.ID_CAJA) ? ' selected' : '') + '>' + vEsc(c.CAJA_DESC) + '</option>'; }).join('') + '</select></div>' +
        '<div class="fg"><label class="fl">Detalle</label><input id="' + id('DETALLE') + '" class="fi" value="' + vEsc(f.DETALLE) + '" placeholder="' + (f.FORMA === 'EFECTIVO' ? 'Opcional' : 'N° de operación') + '"></div>';
    }
    return h + '</div><div style="text-align:right"><button class="btn btn-xs btn-s" onclick="' + fQuitar + '(' + i + ')"><i class="fas fa-times"></i> Quitar</button></div></div>';
  }).join('');
}
function cobFormasEnviar(arr) {
  return arr.filter(function(f) { return vNum(f.IMPORTE) > 0; }).map(function(f) {
    return { FORMA: f.FORMA, IMPORTE: vR2(vNum(f.IMPORTE)), ID_CAJA: f.ID_CAJA, DETALLE: f.DETALLE, NRO_CHEQUE: f.NRO_CHEQUE, BANCO: f.BANCO, EMISOR: f.EMISOR, CUIT_EMISOR: f.CUIT_EMISOR, FECHA_COBRO: f.FECHA_COBRO, TIPO_CHEQUE: f.TIPO_CHEQUE };
  });
}


// ── Ver y anular ──
async function vtaVerDetalle(id) {
  try {
    var r = await gsRun('gsVTA_Detalle', id);
    if (!r || !r.ok) { toast((r && r.error) || 'No encontrado', 'r2'); return; }
    var v = r.VENTA;
    showModal('<div class="mh"><span class="mt">' + (VTA_TIPO_TXT[v.TIPO_COMP] || v.TIPO_COMP) + ' ' + vEsc(v.NRO_COMP) + (v.ESTADO === 'ANULADA' ? ' — ANULADA' : '') + '</span><button class="mc" onclick="closeModal()">×</button></div>' +
      '<div class="mb2"><div class="fr mb3"><div><span class="tdim" style="font-size:11px">FECHA</span><div class="mono" style="font-weight:700">' + fmtD(v.FECHA) + '</div></div>' +
      '<div><span class="tdim" style="font-size:11px">CLIENTE</span><div style="font-weight:700">' + vEsc(v.CLIENTE) + (v.CUIT ? ' · ' + vEsc(v.CUIT) : '') + '</div></div>' +
      '<div><span class="tdim" style="font-size:11px">CARGÓ</span><div>' + vEsc(v.USUARIO || '—') + '</div></div></div>' +
      (v.ORIGEN ? '<div class="mb2">Sobre <b>' + vEsc(v.ORIGEN) + '</b></div>' : '') +
      '<div class="tw"><table style="font-size:12px"><thead><tr><th>Detalle</th><th class="tr">Cant.</th><th class="tr">Neto</th><th class="tr">IVA</th><th class="tr">Subtotal</th></tr></thead><tbody>' +
      r.ITEMS.map(function(i) { return '<tr><td>' + vEsc(i.NOMBRE) + '</td><td class="mono tr">' + i.CANT + '</td><td class="mono tr">' + fmt(i.NETO) + '</td><td class="mono tr">' + fmt(i.IVA) + ' (' + i.IVA_AL + '%)</td><td class="mono tr" style="font-weight:700">' + fmt(i.SUB) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="flex jb mt2"><span class="tdim">Neto</span><span class="mono">' + fmt(v.NETO) + '</span></div><div class="flex jb"><span class="tdim">IVA</span><span class="mono">' + fmt(v.IVA) + '</span></div>' +
      '<div class="flex jb" style="font-weight:700;font-size:15px"><span>TOTAL</span><span class="mono">' + fmt(v.TOTAL) + '</span></div>' +
      (v.TIPO_COMP.indexOf('NC') !== 0 ? '<div class="flex jb"><span>Debe</span><span class="mono" style="font-weight:700">' + fmt(v.SALDO) + '</span></div>' : '') +
      (r.COBROS.length ? '<div class="sec-div mt2">COBROS</div>' + r.COBROS.map(function(c) { return '<div class="flex jb" style="font-size:12px' + (c.ESTADO === 'ANULADO' ? ';opacity:.5' : '') + '"><span>' + vEsc(c.NRO) + ' · ' + fmtD(c.FECHA) + (c.ESTADO === 'ANULADO' ? ' (anulado)' : '') + '</span><span class="mono">' + fmt(c.IMPORTE) + '</span></div>'; }).join('') : '') +
      (r.NCS.length ? '<div class="sec-div mt2">NOTAS DE CRÉDITO</div>' + r.NCS.map(function(n) { return '<div class="flex jb" style="font-size:12px' + (n.ESTADO === 'ANULADA' ? ';opacity:.5' : '') + '"><span>' + (VTA_TIPO_TXT[n.TIPO] || n.TIPO) + ' ' + vEsc(n.NRO) + (n.ESTADO === 'ANULADA' ? ' (anulada)' : '') + '</span><span class="mono">' + fmt(n.TOTAL) + '</span></div>'; }).join('') : '') +
      (v.ESTADO === 'ANULADA' ? '<div class="al al-r mt2">Anulada: ' + vEsc(v.MOTIVO_ANULACION) + '</div>' : '') + (v.OBS ? '<div class="tdim mt2" style="font-size:12px">' + vEsc(v.OBS) + '</div>' : '') +
      '</div><div class="mf"><button class="btn btn-s" onclick="vtaImprimir(\'' + v.ID_VENTA + '\')"><i class="fas fa-print"></i> Imprimir / PDF</button><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>', 'md-lg');
  } catch (e) { toast('Error: ' + (e.message || e), 'r2'); }
}
function vtaAnularPedir(id) {
  var v = (_VTA.VENTAS || []).filter(function(x) { return String(x.ID_VENTA) === String(id); })[0];
  if (!v) return;
  showModal('<div class="mh"><span class="mt">Anular ' + (VTA_TIPO_TXT[v.TIPO_COMP] || v.TIPO_COMP) + ' ' + vEsc(v.NRO_COMP) + '</span><button class="mc" onclick="closeModal()">×</button></div>' +
    '<div class="mb2"><div class="al al-w mb3">Vuelve el stock, se revierte la cuenta corriente y, si se cobró en el momento, se anula ese cobro (el dinero sale de la caja y el cheque recibido queda anulado). No se puede si tiene NC o cobros posteriores vigentes.</div>' +
    '<div class="fg"><label class="fl">Motivo *</label><input id="vta-an-mot" class="fi"></div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-d" id="vta-an-btn" onclick="vtaAnular(\'' + id + '\')"><i class="fas fa-ban"></i> Anular</button></div>');
}
async function vtaAnular(id) {
  var m = ($v('vta-an-mot') || '').trim();
  if (!m) { toast('Escribí el motivo', 'r2'); return; }
  var b = $id('vta-an-btn'); if (b) b.disabled = true;
  try {
    var r = await gsRun('gsVTA_Anular', id, m);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo anular', 'r2'); if (b) b.disabled = false; return; }
    toast(r.NRO_COMP + ' anulado ✓', 'g');
    if (typeof _mcDel === 'function') ['ventas_enc', 'cta_cte_clientes', 'cobros_enc', 'movimientos_caja', 'cheques', 'bd_articulos'].forEach(function(s) { _mcDel(s); });
    closeModal(); renderVentas();
  } catch (e) { toast('Error: ' + (e.message || e), 'r2'); if (b) b.disabled = false; }
}
// ═════════ REMITOS Y FACTURACIÓN DESDE REMITOS (28/10/2026) ═════════
// Facturar remitos: el cliente → sus remitos sin facturar (de producción y de venta) → se tildan → se arma la factura en carga y se abre para revisarla y confirmarla.
// Remitos de venta: mercadería que sale sin orden de servicio (incluye recapadas propias); el stock sale al entregar y después se factura.
var VR_ = { cli: '', pend: null, rem: { ID_CLIENTE: '', ITEMS: [], OBS: '' } };
function vrCliOpts(sel) { return '<option value="">— Elegir cliente —</option>' + (_VTA.CLIENTES || []).map(function(c) { return '<option value="' + c.ID_CLIENTE + '"' + (String(sel) === String(c.ID_CLIENTE) ? ' selected' : '') + '>' + vEsc(c.NOMBRE) + (c.CUIT ? ' · ' + vEsc(c.CUIT) : '') + '</option>'; }).join(''); }
function vrFecha(ms) { if (!ms) return ''; var d = new Date(Number(ms)); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
function vrPlata(n) { return '$ ' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function vrFacturar() {
  showModal('<div class="mh"><span class="mt"><i class="fas fa-file-invoice" style="color:var(--accent)"></i> Facturar remitos</span><button class="mc" onclick="closeModal()">×</button></div>' +
    '<div class="mb2"><div class="fg"><label class="fl">Cliente</label><select class="fs" id="vr-cli" onchange="vrPend()" style="font-size:16px">' + vrCliOpts(VR_.cli) + '</select></div>' +
    '<div class="tdim" style="font-size:13px;margin:6px 0 10px">Se listan los remitos que todavía no están en una factura: los de producción (se factura el servicio de cada cubierta terminada; las devueltas sin trabajo no se cobran) y los remitos de venta.</div>' +
    '<div id="vr-pend"></div></div>' +
    '<div class="mf"><select class="fs" id="vr-tipo" style="max-width:170px"><option value="FACTURA">Factura</option><option value="PRESUPUESTO">Presupuesto</option></select>' +
    '<button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="vr-ok" onclick="vrArmar()" disabled><i class="fas fa-check"></i> Armar la factura</button></div>', 'md-lg');
  if (VR_.cli) vrPend();
}
async function vrPend() {
  var id = $v('vr-cli'), el = $id('vr-pend'), ok = $id('vr-ok'); VR_.cli = id; VR_.pend = null; if (ok) ok.disabled = true;
  if (!id) { el.innerHTML = ''; return; }
  el.innerHTML = '<div class="tdim tc" style="padding:16px">Buscando remitos…</div>';
  try {
    var r = await gsRun('gsFP_Pendientes', id);
    if (!r || !r.ok) { el.innerHTML = '<div class="al al-r">' + vEsc((r && r.error) || 'No se pudo') + '</div>'; return; }
    VR_.pend = r.REMITOS;
    if (!r.REMITOS.length) { el.innerHTML = '<div class="al al-b">Este cliente no tiene remitos pendientes de facturar.</div>'; return; }
    el.innerHTML = '<div class="tw"><table><thead><tr><th></th><th>Remito</th><th>Fecha</th><th>Qué se factura</th><th class="tr">Neto</th></tr></thead><tbody>' + r.REMITOS.map(function(x, i) {
      var neto = 0; x.LINEAS.forEach(function(l) { neto += Number(l.NETO || 0) * Number(l.CANT || 0); });
      var sinP = x.SIN_PRECIO.length, nada = !x.LINEAS.length;
      return '<tr><td><input type="checkbox" class="vr-chk" data-i="' + i + '"' + (sinP || nada ? ' disabled' : '') + ' onchange="vrMarcar()" style="width:20px;height:20px"/></td>' +
        '<td><b>' + vEsc(x.NRO) + '</b><div class="tdim" style="font-size:12px">' + (x.ORIGEN === 'PC_REMITO' ? 'Producción' : 'Venta') + '</div></td><td>' + vrFecha(x.FECHA) + '</td><td>' +
        (nada ? '<span class="tdim">Solo cubiertas devueltas sin trabajo: no hay nada para cobrar</span>' : x.LINEAS.map(function(l) { return '<div>' + vEsc(l.CANT) + ' × ' + vEsc(l.NOMBRE) + (l.NETO ? ' · ' + vrPlata(l.NETO) : ' · <b style="color:var(--danger)">sin precio en la lista</b>') + (l.MARCAS ? '<div class="tdim" style="font-size:12px">' + vEsc(l.MARCAS.join(', ')) + '</div>' : '') + '</div>'; }).join('')) +
        (x.DEVUELTAS ? '<div class="tdim" style="font-size:12px">' + x.DEVUELTAS + ' devuelta' + (x.DEVUELTAS === 1 ? '' : 's') + ' sin cargo</div>' : '') +
        (sinP ? '<div style="color:var(--danger);font-size:12px">Falta el precio en la lista vigente: no se puede facturar todavía</div>' : '') + '</td>' +
        '<td class="tr mono">' + (nada ? '' : vrPlata(neto)) + '</td></tr>';
    }).join('') + '</tbody></table></div><div class="tr mono" style="margin-top:8px;font-size:15px" id="vr-tot"></div>';
  } catch (e) { el.innerHTML = '<div class="al al-r">' + vEsc(e.message || e) + '</div>'; }
}
function vrMarcar() {
  var sel = [], neto = 0;
  document.querySelectorAll('.vr-chk:checked').forEach(function(c) { var x = VR_.pend[+c.dataset.i]; sel.push(x); x.LINEAS.forEach(function(l) { neto += Number(l.NETO || 0) * Number(l.CANT || 0); }); });
  $id('vr-ok').disabled = !sel.length;
  $id('vr-tot').innerHTML = sel.length ? sel.length + ' remito' + (sel.length === 1 ? '' : 's') + ' · neto ' + vrPlata(neto) + ' + IVA' : '';
}
async function vrArmar() {
  var sel = []; document.querySelectorAll('.vr-chk:checked').forEach(function(c) { var x = VR_.pend[+c.dataset.i]; sel.push({ ORIGEN: x.ORIGEN, ID: x.ID, NRO: x.NRO }); });
  if (!sel.length) return;
  var b = $id('vr-ok'); b.disabled = true;
  try {
    var r = await gsRun('gsFP_Facturar', { ID_CLIENTE: VR_.cli, TIPO_COMP: $v('vr-tipo'), REMITOS: sel });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); b.disabled = false; return; }
    closeModal(); toast('Factura armada con ' + r.REMITOS.join(', ') + ': revisala y confirmala', 'g');
    if (typeof vbBorrarCache === 'function') vbBorrarCache();
    vbAbrir(r.ID_BOR);
  } catch (e) { toast(e.message || e, 'r2'); b.disabled = false; }
}
// ── Remitos de venta ──
async function vrRemitos() {
  var html = '<div class="mh"><span class="mt"><i class="fas fa-truck" style="color:var(--accent)"></i> Remitos de venta</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2" id="vr-rl"><div class="tdim tc" style="padding:16px">Cargando…</div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button><button class="btn btn-p" onclick="vrNuevo()"><i class="fas fa-plus"></i> Nuevo remito</button></div>';
  showModal(html, 'md-lg');
  try {
    var r = await gsRun('gsFP_RemitosVenta'); var el = $id('vr-rl');
    if (!r || !r.ok) { el.innerHTML = '<div class="al al-r">' + vEsc((r && r.error) || 'No se pudo') + '</div>'; return; }
    if (!r.REMITOS.length) { el.innerHTML = '<div class="al al-b">Todavía no hay remitos de venta. Con «Nuevo remito» se entrega mercadería sin factura y se factura después.</div>'; return; }
    el.innerHTML = '<div class="tw"><table><thead><tr><th>Remito</th><th>Fecha</th><th>Cliente</th><th>Qué se entregó</th><th>Estado</th><th></th></tr></thead><tbody>' + r.REMITOS.map(function(x) {
      var est = x.ESTADO === 'ANULADO' ? '<span class="badge b-red">Anulado</span>' : (x.FACTURA ? '<span class="badge b-green">' + vEsc(x.FACTURA) + '</span>' : '<span class="badge b-yellow">Sin facturar</span>');
      return '<tr><td><b>' + vEsc(x.NRO) + '</b></td><td>' + vrFecha(x.FECHA) + '</td><td>' + vEsc(x.CLIENTE) + '</td><td>' + x.ITEMS.map(function(i) { return vEsc(i.CANT) + ' × ' + vEsc(i.NOMBRE); }).join('<br>') + '</td><td>' + est + '</td>' +
        '<td>' + (x.ESTADO !== 'ANULADO' && !x.FACTURA ? '<button class="btn btn-s btn-sm" onclick="vrAnular(' + x.ID_REMITO + ',\'' + vEsc(x.NRO) + '\')">Anular</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  } catch (e) { toast(e.message || e, 'r2'); }
}
function vrNuevo() {
  VR_.rem = { ID_CLIENTE: VR_.cli || '', ITEMS: [], OBS: '' }; closeModal();
  showModal('<div class="mh"><span class="mt"><i class="fas fa-truck" style="color:var(--accent)"></i> Nuevo remito de venta</span><button class="mc" onclick="closeModal()">×</button></div>' +
    '<div class="mb2"><div class="fg"><label class="fl">Cliente</label><select class="fs" id="vr-rcli" style="font-size:16px">' + vrCliOpts(VR_.rem.ID_CLIENTE) + '</select></div>' +
    '<div class="fr" style="align-items:flex-end;gap:8px;flex-wrap:wrap"><div class="fg" style="flex:3;min-width:200px"><label class="fl">Código o nombre del producto</label><input class="fi" id="vr-art" list="vr-arts" placeholder="Ej.: NK.0001 o 295/80R22.5" style="font-size:16px"/></div>' +
    '<div class="fg" style="width:90px"><label class="fl">Cantidad</label><input class="fi" id="vr-cant" type="number" min="1" step="1" value="1" style="font-size:16px"/></div>' +
    '<button class="btn btn-s" onclick="vrAgregar()"><i class="fas fa-plus"></i> Agregar</button></div>' +
    '<datalist id="vr-arts">' + (_VTA.ARTICULOS || []).filter(function(a) { return Number(a.STOCK) > 0; }).slice(0, 2000).map(function(a) { return '<option value="' + vEsc(a.CODIGO || a.ID) + ' — ' + vEsc(a.NOMBRE) + '"></option>'; }).join('') + '</datalist>' +
    '<div id="vr-items" style="margin-top:10px"></div>' +
    '<div class="fg" style="margin-top:10px"><label class="fl">Observación</label><input class="fi" id="vr-obs" placeholder="Opcional"/></div>' +
    '<div class="tdim" style="font-size:13px">El stock sale al grabar el remito. Después se factura desde «Facturar remitos».</div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="vr-rok" onclick="vrGrabar()"><i class="fas fa-check"></i> Grabar remito</button></div>', 'md-lg');
  vrPintarItems();
}
function vrAgregar() {
  var t = ($v('vr-art') || '').split(' — ')[0].trim(), a = vtaArtCod(t), cant = parseInt($v('vr-cant'), 10);
  if (!a) { toast(vtaArtCuantos(t) > 1 ? 'Hay varios productos con ese nombre: elegí uno de la lista' : 'No encontré ese código ni ese nombre', 'r2'); return; }
  if (!(cant > 0)) { toast('Cantidad no válida', 'r2'); return; }
  if (Number(a.STOCK) < cant) { toast(a.NOMBRE + ': hay ' + Number(a.STOCK) + ' en stock', 'r2'); return; }
  VR_.rem.ITEMS.push({ ID_ARTICULO: a.ID, NOMBRE: a.NOMBRE, CODIGO: a.CODIGO, CANT: cant });
  $id('vr-art').value = ''; $id('vr-cant').value = 1; vrPintarItems(); $id('vr-art').focus();
}
function vrPintarItems() {
  var el = $id('vr-items'); if (!el) return;
  el.innerHTML = VR_.rem.ITEMS.length ? '<div class="tw"><table><thead><tr><th>Código</th><th>Producto</th><th class="tr">Cant.</th><th></th></tr></thead><tbody>' + VR_.rem.ITEMS.map(function(i, k) {
    return '<tr><td class="mono">' + vEsc(i.CODIGO || '') + '</td><td>' + vEsc(i.NOMBRE) + '</td><td class="tr">' + i.CANT + '</td><td><button class="btn btn-s btn-sm" onclick="VR_.rem.ITEMS.splice(' + k + ',1);vrPintarItems()">Quitar</button></td></tr>'; }).join('') + '</tbody></table></div>'
    : '<div class="tdim" style="font-size:13px">Todavía no agregaste productos.</div>';
}
async function vrGrabar() {
  var cli = $v('vr-rcli'); if (!cli) { toast('Elegí el cliente', 'r2'); return; }
  if (!VR_.rem.ITEMS.length) { toast('Agregá al menos un producto', 'r2'); return; }
  var b = $id('vr-rok'); b.disabled = true;
  try {
    var r = await gsRun('gsFP_RemitoVenta', { ID_CLIENTE: cli, OBS: $v('vr-obs'), ITEMS: VR_.rem.ITEMS.map(function(i) { return { ID_ARTICULO: i.ID_ARTICULO, CANT: i.CANT }; }) });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); b.disabled = false; return; }
    VR_.cli = cli; closeModal(); toast('Remito ' + r.NRO_REMITO + ' grabado: salió del stock', 'g');
    if (typeof vbBorrarCache === 'function') vbBorrarCache();
    _VTA = await gsRun('gsVTA_Datos'); vrRemitos();
  } catch (e) { toast(e.message || e, 'r2'); b.disabled = false; }
}
async function vrAnular(id, nro) {
  var m = await uiPedir('Motivo de la anulación del remito ' + nro + ' (la mercadería vuelve al stock):', { obligatorio: true }); if (m === null) return;
  try {
    var r = await gsRun('gsFP_RemitoVentaAnular', id, m);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Remito ' + nro + ' anulado: volvió al stock', 'g'); if (typeof vbBorrarCache === 'function') vbBorrarCache();
    _VTA = await gsRun('gsVTA_Datos'); vrRemitos();
  } catch (e) { toast(e.message || e, 'r2'); }
}

// ═════════ FACTURA ELECTRÓNICA (ARCA) — 29/10/2026 ═════════
// El CAE lo pide el servidor al confirmar. Acá: estado del envío en la carga, impresión con CAE y QR, y la configuración.
var FE_ = { cfg: null, tab: 'comp' };
var FE_EST_COLOR = { REGISTRADO: 'var(--success)', AUTORIZADO: '#b45309', PENDIENTE: '#b45309', ERROR: 'var(--danger)', RECHAZADO: 'var(--danger)', ANULADO: '#6b7280' };
function feBannerBor(fe) {
  if (!fe || ['PENDIENTE', 'ERROR', 'AUTORIZADO', 'RECHAZADO'].indexOf(fe.ESTADO) === -1) return '<div id="fe-banner"></div>';
  var rojo = fe.ESTADO === 'RECHAZADO' || fe.ESTADO === 'ERROR';
  var txt = fe.ESTADO === 'RECHAZADO' ? 'ARCA rechazó este comprobante: ' + vEsc(fe.ERRORES || '') + '. Corregí lo que indica y confirmá de nuevo.' :
    (fe.ESTADO === 'AUTORIZADO' ? 'ARCA ya lo autorizó (' + vEsc(fe.NRO_COMP) + ', CAE ' + vEsc(fe.CAE) + ') pero falta grabarlo: tocá Confirmar.' :
    'Se envió a ARCA y no se supo el resultado' + (fe.ERRORES ? ' (' + vEsc(fe.ERRORES) + ')' : '') + ': tocá Confirmar. Antes de pedir otro número el sistema se fija si ARCA ya lo autorizó.');
  return '<div id="fe-banner" style="margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid ' + (rojo ? 'var(--danger)' : '#d97706') + ';background:' + (rojo ? 'rgba(220,38,38,.08)' : 'rgba(217,119,6,.08)') + ';font-size:13px"><i class="fas fa-' + (rojo ? 'circle-xmark' : 'triangle-exclamation') + '"></i> ' + txt + '</div>';
}
async function feLibQR() { if (typeof qrcode === 'undefined') await new Promise(function(ok, mal) { var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; sc.onload = ok; sc.onerror = mal; document.head.appendChild(sc); }); }
function feQRsvg(txt, tam) { var q = qrcode(0, 'M'); q.addData(txt); q.make(); return q.createSvgTag({ cellSize: Math.max(2, Math.floor((tam || 120) / (q.getModuleCount() + 8))), margin: 4, scalable: true }); }
function feF(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); return m ? m[3] + '/' + m[2] + '/' + m[1] : (d || ''); }
function feCuitF(c) { c = String(c || '').replace(/\D/g, ''); return c.length === 11 ? c.slice(0, 2) + '-' + c.slice(2, 10) + '-' + c.slice(10) : c; }
async function feImprimir(r) {
  var v = r.VENTA, fe = v.FE, an = v.ESTADO === 'ANULADA', esB = fe.LETRA === 'B', nc = /^NC/.test(v.TIPO_COMP);
  var tit = (nc ? 'NOTA DE CRÉDITO' : 'FACTURA'), qr = '';
  try { if (fe.QR) { await feLibQR(); qr = feQRsvg(fe.QR, 120); } } catch (e) { qr = ''; }
  var prueba = fe.AMBIENTE !== 'PROD';
  var nro = String(v.NRO_COMP || '').split('-'), em = fe.EMISOR;
  var h = '<style>.fe-cab{display:grid;grid-template-columns:1fr 90px 1fr;border:2px solid #111}.fe-cab>div{padding:8px 10px}.fe-l{border-left:2px solid #111;border-right:2px solid #111;text-align:center}' +
      '.fe-l b{display:block;font-size:40px;line-height:44px}.fe-l small{font-size:10px}.fe-k{font-size:10px;color:#444}.fe-k b{color:#111}.fe-rec{border:1px solid #111;border-top:0;padding:6px 10px;display:grid;grid-template-columns:1fr 1fr;gap:2px 14px;font-size:11px;margin-bottom:8px}' +
      '.fe-pie{display:flex;gap:14px;align-items:center;border:1px solid #111;padding:8px 10px;margin-top:10px}.fe-pie svg{width:110px;height:110px}.fe-ley{font-size:10px;border:1px solid #999;padding:6px 8px;margin-top:6px}' +
      '.fe-agua{border:3px solid #b91c1c;color:#b91c1c;font-weight:800;text-align:center;padding:6px;margin-bottom:6px;font-size:14px}</style>' +
    (prueba ? '<div class="fe-agua">COMPROBANTE DE PRUEBA (' + vEsc(fe.AMBIENTE) + ') · SIN VALIDEZ FISCAL</div>' : '') +
    (an ? '<div class="fe-agua">ANULADA · ' + vEsc(v.MOTIVO_ANULACION || '') + '</div>' : '') +
    '<div class="fe-cab"><div><div style="font-size:16px;font-weight:800">' + vEsc(em.RAZON_SOCIAL) + '</div><div class="fe-k">' + vEsc(em.DOMICILIO || 'Salta') + '</div><div class="fe-k"><b>' + vEsc(em.COND_IVA) + '</b></div></div>' +
    '<div class="fe-l"><b>' + vEsc(fe.LETRA) + '</b><small>COD. ' + String(fe.COD_CBTE).padStart(3, '0') + '</small></div>' +
    '<div><div style="font-size:16px;font-weight:800">' + tit + '</div><div class="fe-k">Punto de venta: <b>' + vEsc(nro[0] || '') + '</b> · Comp. N°: <b>' + vEsc(nro[1] || '') + '</b></div><div class="fe-k">Fecha de emisión: <b>' + fmtD(v.FECHA) + '</b></div>' +
    '<div class="fe-k">CUIT: <b>' + vEsc(feCuitF(em.CUIT)) + '</b> · IIBB: <b>' + vEsc(em.IIBB || '—') + '</b></div><div class="fe-k">Inicio de actividades: <b>' + vEsc(feF(em.INICIO_ACT) || '—') + '</b></div></div></div>' +
    '<div class="fe-rec"><div><span class="fe-k">Cliente:</span> <b>' + vEsc(v.CLIENTE) + '</b></div><div><span class="fe-k">CUIT / DNI:</span> <b>' + vEsc(v.CUIT || '—') + '</b></div>' +
    '<div><span class="fe-k">Condición frente al IVA:</span> <b>' + vEsc(fe.RECEPTOR_COND) + '</b></div><div><span class="fe-k">Domicilio:</span> ' + vEsc(v.DOMICILIO || '—') + '</div>' +
    '<div><span class="fe-k">Condición de venta:</span> ' + (v.SALDO > 0 ? 'Cuenta corriente' : 'Contado') + '</div><div>' + (v.ORIGEN ? '<span class="fe-k">Comprobante asociado:</span> ' + vEsc(v.ORIGEN) : '') + '</div></div>' +
    '<table><thead><tr><th>Detalle</th><th class="n">Cant.</th><th class="n">' + (esB ? 'P. unit.' : 'P. unit. neto') + '</th><th class="n">Desc.</th>' + (esB ? '' : '<th class="n">Neto</th><th class="n">IVA</th>') + '<th class="n">Subtotal</th></tr></thead><tbody>' +
    r.ITEMS.map(function(i) { var pu = i.PRECIO_U !== undefined ? i.PRECIO_U : (i.CANT ? i.NETO / i.CANT : 0); if (esB) pu = vR2(pu * (1 + i.IVA_AL / 100));
      return '<tr><td>' + vEsc(i.NOMBRE) + '</td><td class="n">' + i.CANT + '</td><td class="n">' + fmt(pu) + '</td><td class="n">' + (i.DTO ? i.DTO + '%' : '') + '</td>' + (esB ? '' : '<td class="n">' + fmt(i.NETO) + '</td><td class="n">' + fmt(i.IVA) + ' (' + i.IVA_AL + '%)</td>') + '<td class="n">' + fmt(esB ? i.SUB : i.NETO) + '</td></tr>'; }).join('') +
    (esB ? '' : '<tr class="tot"><td colspan="6">Importe neto gravado</td><td class="n">' + fmt(v.NETO) + '</td></tr><tr class="tot"><td colspan="6">IVA</td><td class="n">' + fmt(v.IVA) + '</td></tr>') +
    (fe.IMPUESTOS || []).map(function(t) { return '<tr class="tot"><td colspan="' + (esB ? 4 : 6) + '">' + vEsc(t.NOMBRE) + '</td><td class="n">' + fmt(t.MONTO) + '</td></tr>'; }).join('') +
    '<tr class="tot"><td colspan="' + (esB ? 4 : 6) + '"><b>IMPORTE TOTAL</b></td><td class="n"><b>' + fmt(v.TOTAL) + '</b></td></tr></tbody></table>' +
    (fe.LEYENDAS || []).map(function(l) { return '<div class="fe-ley">' + vEsc(l) + '</div>'; }).join('') +
    (v.OBS ? '<div class="nota">Observaciones: ' + vEsc(v.OBS) + '</div>' : '') +
    '<div class="fe-pie">' + (qr || '') + '<div><div style="font-size:12px"><b>CAE N°:</b> ' + vEsc(fe.CAE) + '</div><div style="font-size:12px"><b>Vencimiento del CAE:</b> ' + vEsc(feF(fe.CAE_VTO)) + '</div>' +
    '<div class="fe-k" style="margin-top:4px">Comprobante autorizado por ARCA' + (prueba ? ' — PRUEBA, SIN VALIDEZ FISCAL' : '') + '</div></div></div>';
  pcImprimir(tit + ' ' + fe.LETRA + ' ' + v.NRO_COMP, h, false);
}

// ── Ventana de factura electrónica: comprobantes, configuración y ARCA ──
async function feAbrir(tab) {
  FE_.tab = tab || FE_.tab || 'comp';
  try { FE_.cfg = await gsRun('gsFE_Config'); } catch (e) { toast(e.message || e, 'r2'); return; }
  var p = {}; (FE_.cfg.PARAM || []).forEach(function(x) { p[x.CLAVE] = x.VALOR; });
  var tabs = [['comp', 'Comprobantes'], ['cfg', 'Configuración'], ['arca', 'Conexión con ARCA']];
  var amb = p.AMBIENTE, ambTxt = { NO: 'Apagada (numeración interna)', SIMULADO: 'SIMULADO · prueba sin ARCA', HOMO: 'HOMOLOGACIÓN de ARCA (sin validez fiscal)', PROD: 'PRODUCCIÓN' }[amb] || amb;
  showModal('<div class="mh"><h3><i class="fas fa-qrcode"></i> Factura electrónica</h3><button class="btn btn-s btn-sm" onclick="closeModal()"><i class="fas fa-times"></i></button></div><div class="mb">' +
    '<div style="padding:8px 12px;border-radius:8px;margin-bottom:10px;background:' + (amb === 'PROD' ? 'rgba(22,163,74,.1)' : 'rgba(217,119,6,.1)') + ';font-size:13px">Modo: <b>' + vEsc(ambTxt) + '</b>' + (p.CUIT ? ' · CUIT ' + vEsc(feCuitF(p.CUIT)) : ' · sin CUIT cargado') + '</div>' +
    '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">' + tabs.map(function(t) { return '<button class="btn ' + (FE_.tab === t[0] ? 'btn-p' : 'btn-s') + ' btn-sm" onclick="feAbrir(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') + '</div>' +
    '<div id="fe-cuerpo">Cargando…</div></div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>', 'md-lg');
  if (FE_.tab === 'comp') feTabComp(); else if (FE_.tab === 'cfg') feTabCfg(p); else feTabArca(p);
}
async function feTabComp() {
  var c = $id('fe-cuerpo');
  try {
    var r = await gsRun('gsFE_Lista', {});
    var f = r.filas || [];
    if (!f.length) { c.innerHTML = '<div class="tdim">Todavía no se envió ningún comprobante.</div>'; return; }
    c.innerHTML = '<div style="overflow:auto"><table class="tbl" style="width:100%;font-size:13px"><thead><tr><th>Fecha</th><th>Comprobante</th><th>Cliente</th><th class="r">Total</th><th>CAE</th><th>Estado</th><th></th></tr></thead><tbody>' +
      f.map(function(x) { return '<tr><td>' + fmtD(x.FECHA) + '</td><td>' + vEsc(x.TIPO) + ' ' + vEsc(x.NRO_COMP || '(sin número)') + '<div class="tdim" style="font-size:11px">' + vEsc(x.AMBIENTE) + (x.INTENTOS > 1 ? ' · ' + x.INTENTOS + ' intentos' : '') + '</div></td><td>' + vEsc(x.CLIENTE) + '</td><td class="r mono">' + fmt(x.TOTAL) + '</td>' +
        '<td class="mono" style="font-size:12px">' + vEsc(x.CAE || '') + (x.CAE_VTO ? '<div class="tdim">vence ' + vEsc(feF(x.CAE_VTO)) + '</div>' : '') + '</td><td><b style="color:' + (FE_EST_COLOR[x.ESTADO] || 'inherit') + '">' + vEsc(x.ESTADO) + '</b>' +
        (x.ERRORES ? '<div style="font-size:11px;color:var(--danger);max-width:260px">' + vEsc(x.ERRORES) + '</div>' : '') + (x.OBS ? '<div class="tdim" style="font-size:11px;max-width:260px">' + vEsc(x.OBS) + '</div>' : '') + '</td>' +
        '<td>' + (x.ID_VENTA ? '<button class="btn btn-xs btn-s" onclick="vtaImprimir(\'' + x.ID_VENTA + '\')" title="Imprimir"><i class="fas fa-print"></i></button>' : (['PENDIENTE', 'ERROR', 'AUTORIZADO', 'RECHAZADO'].indexOf(x.ESTADO) !== -1 ? '<button class="btn btn-xs btn-s" onclick="closeModal();vbAbrir(' + x.ID_BOR + ')">Abrir carga</button>' : '')) + '</td></tr>'; }).join('') +
      '</tbody></table></div>';
  } catch (e) { c.innerHTML = '<div style="color:var(--danger)">' + vEsc(e.message || e) + '</div>'; }
}
function feTabCfg(p) {
  var ed = FE_.cfg.ADMIN;
  $id('fe-cuerpo').innerHTML = (ed ? '' : '<div class="tdim mb2">Solo un administrador puede cambiar estos datos.</div>') +
    (FE_.cfg.PARAM || []).map(function(x) {
      var inp = x.CLAVE === 'AMBIENTE' ? '<select id="fe-p-AMBIENTE" class="inp"' + (ed ? '' : ' disabled') + '>' + ['NO', 'SIMULADO', 'HOMO', 'PROD'].map(function(o) { return '<option' + (o === x.VALOR ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>' :
        '<input id="fe-p-' + x.CLAVE + '" class="inp" value="' + vEsc(x.VALOR) + '"' + (ed ? '' : ' disabled') + '>';
      return '<div style="display:grid;grid-template-columns:180px 1fr;gap:8px;align-items:center;margin-bottom:8px"><label style="font-weight:600;font-size:13px">' + vEsc(x.CLAVE.replace(/_/g, ' ')) + '</label><div>' + inp + '<div class="tdim" style="font-size:11px">' + vEsc(x.DESCRIPCION) + '</div></div></div>';
    }).join('') +
    '<div class="sec-div">PUNTOS DE VENTA (por sucursal)</div>' + (FE_.cfg.PV || []).map(function(s) { return '<div style="font-size:13px">' + vEsc(s.NOMBRE) + ': <b>' + (s.PV ? String(s.PV).padStart(5, '0') : 'sin punto de venta') + '</b></div>'; }).join('') +
    '<div class="tdim" style="font-size:11px;margin-bottom:8px">Tienen que estar dados de alta en ARCA como "RECE / Factura electrónica – Web Services". Se cambian en Sucursales.</div>' +
    (ed ? '<button class="btn btn-g" onclick="feGuardarCfg()"><i class="fas fa-save"></i> Guardar</button>' : '');
}
async function feGuardarCfg() {
  var l = (FE_.cfg.PARAM || []).map(function(x) { return { CLAVE: x.CLAVE, VALOR: $v('fe-p-' + x.CLAVE) }; });
  var amb = $v('fe-p-AMBIENTE');
  if (amb === 'PROD' && !(await uiConfirmar('Vas a pasar a PRODUCCIÓN: desde ahora cada factura que se confirme se informa a ARCA con validez fiscal y no se puede anular (solo nota de crédito). ¿Seguir?', 'Sí, producción'))) return;
  try { var r = await gsRun('gsFE_GuardarParam', l); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo guardar', 'r2'); return; } toast(r.CAMBIOS.length ? 'Guardado: ' + r.CAMBIOS.join(' · ') : 'Sin cambios', 'g'); feAbrir('cfg'); }
  catch (e) { toast(e.message || e, 'r2'); }
}
function feTabArca(p) {
  var ed = FE_.cfg.ADMIN, b = function(acc, txt, ic) { return '<button class="btn btn-s btn-sm" onclick="feArca(\'' + acc + '\')"' + (ed ? '' : ' disabled') + '><i class="fas fa-' + ic + '"></i> ' + txt + '</button>'; };
  $id('fe-cuerpo').innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">Ambiente para estas pruebas: <select id="fe-a-amb" class="inp" style="width:auto"><option value="HOMO">Homologación</option><option value="PROD">Producción</option></select></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">' + b('dummy', 'Estado de ARCA', 'heart-pulse') + b('estado', 'Certificado cargado', 'id-card') + b('login', 'Probar conexión con el certificado', 'plug') + b('ultimo', 'Último número autorizado', 'hashtag') + b('param', 'Condiciones IVA (tabla ARCA)', 'table') + '</div>' +
    '<div class="sec-div">CERTIFICADO</div><ol style="font-size:13px;margin:0 0 8px 18px;padding:0">' +
    '<li>Cargá y guardá el CUIT en Configuración.</li><li>Tocá <b>Generar pedido de certificado</b>: el sistema crea la clave (queda guardada cifrada en el servidor) y te da el texto del pedido.</li>' +
    '<li>Homologación: en ARCA con clave fiscal → Administrador de Relaciones → adherí <b>WSASS – Autogestión Certificados Homologación</b>. En WSASS: <b>Nuevo certificado</b>, pegá el pedido y descargá el certificado. Después <b>Crear autorización a servicio</b>: el servicio <b>wsfe</b> para el CUIT de la empresa.</li>' +
    '<li>Producción: Administración de Certificados Digitales (clave fiscal de la S.R.L.) y delegar <b>wsfe</b> en el Administrador de Relaciones.</li><li>Pegá acá abajo el certificado y tocá <b>Cargar certificado</b>. Después <b>Probar conexión</b>.</li></ol>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">' + b('csr', 'Generar pedido de certificado', 'key') + '</div>' +
    '<textarea id="fe-a-csr" class="inp" rows="4" readonly placeholder="Acá aparece el pedido de certificado para copiar" style="font-family:monospace;font-size:11px"></textarea>' +
    '<textarea id="fe-a-cert" class="inp mt2" rows="4" placeholder="Pegá el certificado que te dio ARCA (-----BEGIN CERTIFICATE----- …)" style="font-family:monospace;font-size:11px"></textarea>' +
    '<div class="mt2">' + b('cert', 'Cargar certificado', 'upload') + '</div><div id="fe-a-res" class="mt2" style="font-size:13px"></div>';
}
async function feArca(acc) {
  var d = { AMBIENTE: $v('fe-a-amb') }, out = $id('fe-a-res');
  if (acc === 'cert') { d.CERT = $v('fe-a-cert'); if (!d.CERT) { toast('Pegá el certificado', 'r2'); return; } }
  if (acc === 'ultimo') { var pv = await uiPedir('Punto de venta (número)', ''); if (!pv) return; d.PV = pv; var tp = await uiPedir('Tipo de comprobante: 1 Factura A · 6 Factura B · 3 NC A · 8 NC B', '1'); if (!tp) return; d.TIPO = tp; }
  if (acc === 'csr' && !(await uiConfirmar('Se genera una clave nueva para ' + (d.AMBIENTE === 'PROD' ? 'PRODUCCIÓN' : 'homologación') + '. Si ya había un certificado cargado para ese ambiente deja de servir y hay que pedir otro a ARCA. ¿Seguir?', 'Sí, generar'))) return;
  out.innerHTML = 'Consultando a ARCA…';
  try {
    var r = await gsRun('gsFE_Arca', acc, d);
    if (!r || !r.ok) { out.innerHTML = '<span style="color:var(--danger)">' + vEsc((r && r.error) || 'Error') + '</span>'; return; }
    var x = r.r;
    if (acc === 'csr') { $id('fe-a-csr').value = x.csr; out.innerHTML = '<span style="color:var(--success)">Pedido de certificado generado: copialo y pegalo en ARCA.</span> <button class="btn btn-xs btn-s" onclick="navigator.clipboard.writeText($v(\'fe-a-csr\'));toast(\'Copiado\',\'g\')">Copiar</button>'; return; }
    if (acc === 'dummy') { out.innerHTML = 'Servidores de ARCA: aplicación <b>' + vEsc(x.app) + '</b> · base <b>' + vEsc(x.db) + '</b> · autenticación <b>' + vEsc(x.auth) + '</b>'; return; }
    if (acc === 'estado') { var c = x.cred; out.innerHTML = !c ? 'No hay pedido ni certificado para este ambiente.' : (c.tiene_cert ? '<span style="color:var(--success)">Certificado cargado</span> · válido del ' + fmtD(c.cert_desde) + ' al ' + fmtD(c.cert_hasta) : 'Hay pedido de certificado generado, falta cargar el certificado de ARCA.') + (x.ta_vence ? ' · ticket vigente hasta ' + vEsc(String(x.ta_vence)) : ''); if (c && c.csr) $id('fe-a-csr').value = c.csr; return; }
    if (acc === 'cert') { out.innerHTML = '<span style="color:var(--success)">Certificado cargado</span> · CUIT ' + vEsc(feCuitF(x.cuit)) + ' · válido hasta ' + fmtD(x.hasta) + ' · emitido por ' + vEsc(x.emisor); return; }
    if (acc === 'login') { out.innerHTML = '<span style="color:var(--success)">Conexión correcta con ARCA</span> · ticket vigente hasta ' + vEsc(String(x.vence)); return; }
    if (acc === 'ultimo') { out.innerHTML = 'Último número autorizado: <b>' + vEsc(String(x)) + '</b>'; return; }
    if (acc === 'param') { var l = (x.datos && x.datos.CondicionIvaReceptor) ? [].concat(x.datos.CondicionIvaReceptor) : []; out.innerHTML = l.length ? '<table class="tbl" style="font-size:12px"><tr><th>Id</th><th>Condición</th><th>Clase</th></tr>' + l.map(function(c) { return '<tr><td>' + vEsc(c.Id) + '</td><td>' + vEsc(c.Desc) + '</td><td>' + vEsc(c.Cmp_Clase) + '</td></tr>'; }).join('') + '</table>' : '<pre style="font-size:11px;white-space:pre-wrap">' + vEsc(JSON.stringify(x, null, 1)) + '</pre>'; return; }
  } catch (e) { out.innerHTML = '<span style="color:var(--danger)">' + vEsc(e.message || e) + '</span>'; }
}
