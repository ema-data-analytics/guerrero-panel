
// ================================================================
// PRODUCCIÓN POR CUBIERTA — recepción con marca grabada, armado de OT
// de autoclave, registro por estación (previsto vs real), reemplazos
// autorizados, tiempos del encargado, herramental por pieza y costo.
// ================================================================
var PC_ = { d: null, tab: 'cascos', filas: [], sel: {}, ot: null, fEspera: '', kf: [], kcli: '', ocli: '', otr: {}, mk: {}, dsel: {}, fDiario: 'TODOS' };
(function() { if (document.getElementById('pc-estilos-form')) return; var st = document.createElement('style'); st.id = 'pc-estilos-form';
  st.textContent = '.pc-fila3{display:grid;grid-template-columns:minmax(220px,2fr) minmax(170px,1fr) minmax(150px,1fr);gap:12px;align-items:start}' +
    '.pc-fila4{display:grid;grid-template-columns:minmax(220px,2fr) minmax(170px,1fr) minmax(150px,1fr) minmax(180px,2fr);gap:12px;align-items:start}' +
    '@media(max-width:820px){.pc-fila3,.pc-fila4{grid-template-columns:1fr}}' +
    '.pc-fila3 .fl,.pc-fila4 .fl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pc-nro-op{display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap}.pc-nro-op button{flex:1;min-width:120px;min-height:40px;border:1.5px solid var(--border);border-radius:9px;background:var(--surface,#fff);color:var(--text);font-weight:600;font-size:13px}.pc-nro-op button.on{border-color:var(--accent,#2563eb);background:#eff6ff;color:#1e3a8a}.pc-nro-auto{display:flex;align-items:center;white-space:nowrap;font-weight:700;background:var(--surface2,#f1f5f9);cursor:default}' +
    '#pc-h-tcub td.mono,#pc-h-tot td.mono,#pc-h-tos td.mono,#pc-h-tcub td:first-child,#pc-h-tot td:nth-child(2){white-space:nowrap}' +
    '.pc-celda{display:flex;align-items:center;gap:4px;white-space:nowrap}#pc-k-t td{vertical-align:middle}#pc-k-t .fi,#pc-k-t .fs{height:38px;box-sizing:border-box}' +
    '#pc-k-t{min-width:0!important;width:100%}#pc-k-t thead{display:none}#pc-k-t tr{display:grid;grid-template-columns:64px repeat(4,minmax(0,1fr));gap:8px 12px;padding:12px 0;border-bottom:2px solid var(--border,#e2e8f0)}#pc-k-t td:nth-child(2){display:none}#pc-k-t td:nth-child(1){order:1}#pc-k-t td:nth-child(4){order:2}#pc-k-t td:nth-child(3){order:3}#pc-k-t td:nth-child(6){order:4}#pc-k-t td:nth-child(8){order:5}#pc-k-t td:nth-child(10){order:6;align-self:end}#pc-k-t td:nth-child(5){order:7}#pc-k-t td:nth-child(7){order:8}#pc-k-t td:nth-child(9){order:9}#pc-k-t td:nth-child(1){font-size:18px;font-weight:700}#pc-k-t td{display:block;border:0;padding:0;min-width:0}#pc-k-t td[data-l]:before{content:attr(data-l);display:block;font-size:11px;font-weight:600;color:var(--text3,#64748b);margin-bottom:3px}#pc-k-t .fi,#pc-k-t .fs{width:100%!important;min-width:0!important}#pc-k-t .pc-celda .fi{flex:1}#pc-k-t td:last-child:empty{visibility:hidden}' +
    '@media(max-width:820px){#pc-k-t tr{grid-template-columns:1fr 1fr}#pc-k-t td:nth-child(10){order:10}}' +
    '#pc-k-err .al{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}';
  document.head.appendChild(st); })();
var PC_EST_TXT = { EN_ESPERA: 'En espera', EN_OT: 'En OT', TERMINADA: 'Terminada', RECHAZADA: 'Rechazada', ENTREGADA: 'Entregada', ANULADA: 'Anulada',
  PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', RETIRADA: 'Retirada', ARMADA: 'Armada', CERRADA: 'Cerrada', REPROCESO: 'Reproceso: espera otra carga', REPROCESADA: 'Reprocesada' };
var PC_EST_COL = { EN_ESPERA: 'b-orange', EN_OT: 'b-blue', TERMINADA: 'b-green', RECHAZADA: 'b-red', ANULADA: 'b-gray', PENDIENTE: 'b-gray', EN_PROCESO: 'b-blue', RETIRADA: 'b-gray', ARMADA: 'b-orange', CERRADA: 'b-green', REPROCESO: 'b-orange', REPROCESADA: 'b-gray' };
function pcNroOS(id) { var o = ((PC_.d && PC_.d.ots) || []).filter(function(x) { return String(x.ID_OT) === String(id); })[0]; return o ? o.NRO_OT : String(id); }

function pcEsc(s) { return String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function pcBadge(e) { return '<span class="badge ' + (PC_EST_COL[e] || 'b-gray') + '" style="font-size:10px">' + pcEsc(PC_EST_TXT[e] || e) + '</span>'; }
function pcPuede(a) { return typeof tienePermiso === 'function' ? tienePermiso('PRODUCCION', a) : true; }
function pcLineaDeTipo(tipo) { var t = (PC_.d.tipos || []).filter(function(x) { return x.TIPO === tipo; })[0]; return t ? t.LINEA : ''; }
function pcRecetaDe(tipo, medida, trabajo, banda, marca) {
  var k = function(m) { return String(m || '').toUpperCase().replace(/\s+/g, '').replace(/\./g, ',').replace(/[*X\/]/g, '-'); };
  var mk = function(m) { return String(m || '').toUpperCase().replace(/\s+/g, ' ').trim(); }, mc = mk(marca);
  // Igual que el servidor (pcReceta_): primero la variante de la marca de la cubierta (si hay), después la general; dentro de cada una: medida y después MEDIDA = TODAS
  var marcas = mc ? [mc, ''] : [''];
  for (var i = 0; i < marcas.length; i++) {
    var rs = PC_.d.recetas.filter(function(r) { return mk(r.MARCA) === marcas[i] && r.TIPO === tipo && k(r.MEDIDA) === k(medida) && r.TRABAJO === trabajo; });
    if (!rs.length) rs = PC_.d.recetas.filter(function(r) { return mk(r.MARCA) === marcas[i] && r.TIPO === tipo && k(r.MEDIDA) === 'TODAS' && r.TRABAJO === trabajo; });
    var x = rs.filter(function(r) { return banda && r.ID_BANDA === banda; })[0] || rs.filter(function(r) { return !r.ID_BANDA; })[0];
    if (x) return x;
  }
  return null;
}

async function renderProdCub() {
  var el = $id('page-produccion-cubiertas'); if (!el) return;
  el.innerHTML = '<div class="card"><div class="card-body tdim">Cargando...</div></div>';
  try { PC_.d = await gsRun('gsPC_Datos'); } catch (e) { el.innerHTML = '<div class="al al-r">' + pcEsc(e.message) + '</div>'; return; }
  pcPintar();
}
async function pcRecargar() { PC_.d = await gsRun('gsPC_Datos'); PC_.hd = null; pcPintar(); }

function pcPintar() {
  var el = $id('page-produccion-cubiertas'), d = PC_.d;
  var n = function(e) { return d.cubiertas.filter(function(c) { return c.ESTADO === e; }).length; };
  var abiertas = d.ots.filter(function(o) { return o.ESTADO === 'ARMADA' || o.ESTADO === 'EN_PROCESO'; }).length;
  var nNuevos = (d.cascos || []).filter(function(k) { return k.ESTADO === 'NUEVO'; }).length;
  var nDev = d.cubiertas.filter(function(c) { return c.ESTADO === 'RECHAZADA' && !c.FECHA_DEVOLUCION; }).length;
  if (PC_.tab === 'armar' || PC_.tab === 'ots') PC_.tab = 'os';
  var tabs = [['cascos', '1 · Carga de cascos'], ['otrab', '2 · Órdenes de trabajo' + (nNuevos ? ' (' + nNuevos + ' cascos sin orden)' : '')], ['os', '3 · Órdenes de servicio (' + abiertas + ' en línea' + (n('EN_ESPERA') ? ' · ' + n('EN_ESPERA') + ' esperando' : '') + ')'], ['entregas', '4 · Entregas (remitos)'],
    ['rech', 'Rechazadas' + (nDev ? ' (' + nDev + ' a devolver)' : '')], ['costos', 'Costos'], ['herramental', 'Herramental y herramientas'], ['alarmas', '⚠ Alarmas'], ['hist', 'Historial'], ['config', 'Configuración'], ['pesaje', '⚖ Pesaje y medición'], ['plan', '📅 Plan de mañana']];
  el.innerHTML = '<div class="page-hd"><div><div class="page-title">Producción por cubierta</div><div class="page-sub">Cada cubierta con su marca grabada: recepción, carga de autoclave, estaciones, insumos reales y costo.</div></div>' +
    '<div class="flex gap2 no-print"><input class="fi" id="pc-marca-q" placeholder="Buscar marca..." style="width:170px"/><button class="btn btn-s" onclick="pcHistorial($v(\'pc-marca-q\'))"><i class="fas fa-search"></i> Vida de la cubierta</button><button class="btn btn-p" onclick="pcAyuda(pcAyudaClave())">❓ Ayuda</button></div></div>' +
    (document.body.classList.contains('modo-cascos') ? '<div class="flex gap2 mb3" style="flex-wrap:wrap;align-items:center"><b style="font-size:20px;flex:1">' + (PC_.foco ? PC_.foco[1] + ' ' + PC_.foco[2] : '📥 Recibir cascos') + '</b>' + (PC_.tab === 'cascos' ? '<button class="btn btn-s" onclick="mvAbrir(\'documentos\')">📄 Documentos</button>' : '') + '</div>' : '') +
    '<div class="tabs mb3">' + tabs.map(function(t) { var on = PC_.tab === t[0] || (t[0] === 'herramental' && PC_.tab === 'equipos'); return '<div class="tab' + (on ? ' active' : '') + '" onclick="PC_.tab=\'' + (t[0] === 'herramental' ? (PC_.herrSub || 'herramental') : t[0]) + '\';pcPintar()">' + t[1] + '</div>'; }).join('') + '</div>' +
    // Una sola pestaña para todo lo que no es insumo: las piezas del autoclave y las herramientas de las estaciones
    (PC_.tab === 'herramental' || PC_.tab === 'equipos' ? '<div class="flex gap2 mb3" style="flex-wrap:wrap;row-gap:8px">' + [['herramental', 'Inner y envelope del autoclave (piezas con usos)'], ['equipos', 'Herramientas de las estaciones y entregas al personal']].map(function(x) { return '<button class="btn ' + (PC_.tab === x[0] ? 'btn-p' : 'btn-s') + '" onclick="PC_.tab=PC_.herrSub=\'' + x[0] + '\';pcPintar()">' + x[1] + '</button>'; }).join('') + '</div>' : '') +
    '<div id="pc-body"></div>';
  $id('pc-marca-q').addEventListener('keydown', function(e) { if (e.key === 'Enter') pcHistorial(this.value); });
  ({ recepcion: pcRecepcion, cascos: pcCascos, otrab: pcOTrab, rech: pcRechazadas, armar: pcOS, ots: pcOS, os: pcOS, entregas: pcEntregas, costos: pcCostos, herramental: pcHerramental, equipos: pcEquipos, alarmas: pcAlarmas, hist: pcHist, config: pcConfig, pesaje: pcPesaje, plan: pcPlan })[PC_.tab]();
}

// ================================================================
// 1. CARGA DE CASCOS (por cliente, cada casco con su N° interno)
// ================================================================
function pcCasVacio() { var ant = PC_.kf.length ? PC_.kf[PC_.kf.length - 1] : null; return { TIPO: ant ? ant.TIPO : '', DOT: '', MEDIDA: ant ? ant.MEDIDA : '', MARCA_FAB: ant ? ant.MARCA_FAB : '', OBSERVACIONES: '', TRABAJO: ant ? ant.TRABAJO : 'RECAPADO' }; }
// Cuántas cubiertas esperan para entrar a la línea (para saber cuándo se completa una carga del autoclave)
function pcAvisoLinea() {
  var d = PC_.d, esp = d.cubiertas.filter(function(c) { return c.ESTADO === 'EN_ESPERA'; });
  return '<div class="al al-b mb3" style="font-size:13px">' + d.lineas.filter(function(l) { return l.ACTIVO != 0; }).map(function(l) {
    var n = esp.filter(function(c) { return pcLineaDeTipo(c.TIPO) === l.LINEA; }).length, cap = +l.CAPACIDAD || 15;
    return '<b>' + pcEsc(l.LINEA) + ':</b> ' + n + ' cubierta' + (n === 1 ? '' : 's') + ' esperando · ' + (n >= cap ? '<b>alcanza para ' + Math.floor(n / cap) + ' carga' + (n >= 2 * cap ? 's' : '') + ' de ' + cap + '</b>' : 'faltan ' + (cap - n) + ' para completar una carga de ' + cap);
  }).join('<br>') + '<div class="tdim" style="font-size:12px;margin-top:4px">Cada boleta (cliente) es una orden de trabajo. En "3 · Orden de servicio" se juntan las de todos los clientes en una carga.</div></div>';
}
// Marca grabada que va a tomar cada casco (3 letras del cliente + 6 cifras). La definitiva la da el servidor al grabar.
function pcDotNorm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function pcCasAuto() {
  var c = PC_.d.clientes.filter(function(x) { return String(x.ID_CLIENTE) === String(PC_.kcli); })[0];
  // Marca grabada que va a tomar cada casco (la asigna el servidor al grabar con la misma regla)
  if (!c) { PC_.kf.forEach(function(f) { f._MK = ''; }); return; }
  var nom = ((c.APELLIDO || '') + ' ' + (c.NOMBRE || '')).trim() || c.NOMBRE_FANTASIA || '';
  var pref = (String(nom).toUpperCase().replace(/[^A-Z]/g, '') + 'XXX').slice(0, 3), rx = new RegExp('^' + pref + '(\\d{6})$'), max = 0;
  var ver = function(v) { var m = rx.exec(pcDotNorm(v)); if (m) max = Math.max(max, parseInt(m[1], 10)); };
  (PC_.d.cascos || []).forEach(function(k) { ver(k.MARCA); ver(k.DOT); });
  (PC_.d.cubiertas || []).forEach(function(k) { ver(k.MARCA); });
  PC_.kf.forEach(function(f) { max++; f._MK = pref + String(max).padStart(6, '0'); });
}
function pcNroOTrab(id) { var o = (PC_.d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(id); })[0]; return o ? o.NRO : ''; }
function pcCliId(v) { return String(v || '').split(' — ')[0].trim(); }
function pcCliList() { return '<datalist id="pc-clientes">' + PC_.d.clientes.map(function(c) { return '<option value="' + pcEsc(c.ID_CLIENTE + ' — ' + c.NOMBRE) + '">'; }).join('') + '</datalist>'; }
function pcCliTxt(id) { var c = PC_.d.clientes.filter(function(x) { return String(x.ID_CLIENTE) === String(id); })[0]; return c ? c.ID_CLIENTE + ' — ' + c.NOMBRE : ''; }
// Medidas por tipo: al elegir CAMION solo se ven las de camión; al elegir AGRICOLA, las agrícolas
function pcMedDeTipo(tipo, med) { var dl = document.getElementById(pcMedKey(tipo)), k = function(m) { return String(m || '').toUpperCase().replace(/\s+/g, '').replace(/\./g, ',').replace(/[*X\/]/g, '-'); }; if (!dl) return false; var x = k(med); return [].some.call(dl.options, function(o) { return k(o.value) === x; }); }
function pcMedKey(tipo) { return 'pc-medidas-' + String(tipo || 'X').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function pcMedidasList() {
  var d = PC_.d, por = {}, todas = {};
  var add = function(tipo, m) { m = String(m || '').trim(); if (!m || m.toUpperCase() === 'TODAS') return; var k = pcMedKey(tipo); por[k] = por[k] || {}; por[k][m] = true; todas[m] = true; };
  (d.tipos || []).forEach(function(t) { var lin = pcLineaDeTipo(t.TIPO); (d.medidas || []).forEach(function(m) { if (m.LINEA === lin) add(t.TIPO, m.MEDIDA); }); });
  d.recetas.forEach(function(r) { add(r.TIPO, r.MEDIDA); });
  var dl = function(id, o) { return '<datalist id="' + id + '">' + Object.keys(o).sort().map(function(x) { return '<option value="' + pcEsc(x) + '">'; }).join('') + '</datalist>'; };
  return dl('pc-medidas', todas) + Object.keys(por).map(function(k) { return dl(k, por[k]); }).join('');
}
// ── Impresión: abre una hoja lista para imprimir o "Guardar como PDF" ──
// Vista previa de impresión: en una ventana aparte; si el navegador la bloquea, dentro del sistema en pantalla completa.
// Desde la vista previa: Imprimir, Guardar PDF (en "Destino" se elige "Guardar como PDF") o Cerrar (vuelve a la misma pantalla).
function pcImprimir(titulo, cuerpo, apaisado) {
  var css = 'body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:18px;font-size:12px;background:#fff}h1{font-size:18px;margin:0}h2{font-size:14px;margin:14px 0 6px}' +
    '.enc{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px}.emp{font-size:11px;color:#444}' +
    '.dat{display:grid;grid-template-columns:repeat(4,auto);gap:4px 18px;margin:8px 0 12px}.dat b{display:block;font-size:10px;color:#555;text-transform:uppercase}' +
    'table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:5px 6px;text-align:left;vertical-align:top}th{background:#eee;font-size:10px;text-transform:uppercase}' +
    'table.res,table.det{table-layout:fixed}table.res th,table.res td{font-size:9.5px;padding:3px 4px;word-wrap:break-word}table.det th,table.det td{font-size:10px;padding:3px 5px;word-wrap:break-word}.n{text-align:right;white-space:nowrap}tr.tot td{background:#f3f4f6}' +
    '.ck{width:22px;text-align:center}.firmas{display:flex;gap:40px;margin-top:40px}.firmas div{flex:1;border-top:1px solid #111;padding-top:4px;text-align:center;font-size:11px}' +
    '.nota{font-size:10px;color:#555;margin-top:8px}.barra{position:sticky;top:0;background:#f3f4f6;border:1px solid #ddd;border-radius:8px;padding:8px;margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
    '.barra button{font-size:14px;padding:8px 14px;border-radius:6px;border:1px solid #bbb;background:#fff;cursor:pointer}.barra .p{background:#1d4ed8;color:#fff;border-color:#1d4ed8}.barra span{font-size:12px;color:#555}' +
    '@page{size:A4 ' + (apaisado ? 'landscape' : 'portrait') + ';margin:8mm}' +
    '@media print{.noimp{display:none}body{margin:0;font-size:11px}#doc{width:auto!important}tr,.firmas,.enc{page-break-inside:avoid;break-inside:avoid}thead{display:table-header-group}}' +
    '#doc{max-width:' + (apaisado ? 1062 : 718) + 'px;margin:0 auto}';
  // Guardar PDF: arma el archivo en el navegador y lo descarga (no pasa por el cuadro de impresión)
  var archivo = String(titulo || 'documento').replace(/[^A-Za-z0-9\- ]/g, '').replace(/\s+/g, '_') + '.pdf';
  var js = '<scr' + 'ipt>' +
    'var PDFB=null;' + '\n' +
    'function pdfCargar(fn){if(window.html2pdf){fn();return;}var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";s.onload=fn;s.onerror=function(){alert("No se pudo cargar el generador de PDF (sin internet)");var bs=document.querySelectorAll(".barra button");for(var i=0;i<bs.length;i++)bs[i].disabled=false;};document.head.appendChild(s);}' + '\n' +
    'function pdfOpc(){return {margin:8,filename:"' + archivo + '",image:{type:"jpeg",quality:0.95},html2canvas:{scale:2,backgroundColor:"#ffffff"},pagebreak:{mode:["css","legacy"],avoid:["tr",".firmas",".enc"]},jsPDF:{unit:"mm",format:"a4",orientation:"' + (apaisado ? 'landscape' : 'portrait') + '"}};}' + '\n' +
    'function pdfConAncho(fn){var el=document.getElementById("doc"),ant=el.style.cssText;el.style.cssText="width:' + (apaisado ? 1040 : 700) + 'px;max-width:none;margin:0;font-size:11px";return fn(el).then(function(r){el.style.cssText=ant;return r;},function(e){el.style.cssText=ant;throw e;});}' + '\n' +
    'function guardarPDF(b){b.disabled=true;b.textContent="Armando el PDF...";var fin=function(){b.disabled=false;b.textContent="📄 Guardar PDF";};pdfCargar(function(){pdfConAncho(function(el){return html2pdf().set(pdfOpc()).from(el).save();}).then(fin,fin);});}' + '\n' +
    'function pdfMandar(b){var f=new File([PDFB],"' + archivo + '",{type:"application/pdf"});navigator.share({files:[f],title:"' + String(titulo || '').replace(/["\\]/g, '') + '"}).then(function(){PDFB=null;b.textContent="📤 Compartir";},function(e){if(e&&e.name==="AbortError"){PDFB=null;b.textContent="📤 Compartir";return;}b.textContent="📤 Tocá de nuevo para enviar";});}' + '\n' +
    'function compartirPDF(b){' + '\n' +
    'if(PDFB){pdfMandar(b);return;}' + '\n' +
    'b.disabled=true;b.textContent="Armando el PDF...";' + '\n' +
    'pdfCargar(function(){pdfConAncho(function(el){return html2pdf().set(pdfOpc()).from(el).outputPdf("blob");}).then(function(blob){b.disabled=false;PDFB=blob;var f=new File([blob],"' + archivo + '",{type:"application/pdf"});' + '\n' +
    'if(!(navigator.canShare&&navigator.canShare({files:[f]}))){PDFB=null;b.textContent="📤 Compartir";alert("Este aparato no deja compartir archivos. Usá Guardar PDF.");return;}' + '\n' +
    'pdfMandar(b);},function(){b.disabled=false;b.textContent="📤 Compartir";});});}' + '\n' +
    '</scr' + 'ipt>';
  var barra = '<div class="barra noimp"><button class="p" onclick="window.print()">🖨 Imprimir</button><button onclick="guardarPDF(this)">📄 Guardar PDF</button><button id="btn-comp" onclick="compartirPDF(this)" style="display:none">📤 Compartir</button>' +
    '<button onclick="if(window.parent&&window.parent!==window&&window.parent.pcCerrarVista){window.parent.pcCerrarVista()}else{window.close()}">✕ Cerrar</button>' +
    '<span>El PDF se descarga como ' + pcEsc(archivo) + '</span></div>';
  var html = '<!doctype html><html><head><meta charset="utf-8"><title>' + pcEsc(titulo) + '</title><style>' + css + '</style>' + js + '</head><body>' + barra + '<div id="doc">' + cuerpo + '</div><scr' + 'ipt>if(navigator.share){document.getElementById("btn-comp").style.display="";}</scr' + 'ipt></body></html>';
  var w = null;
  try { w = window.open('', '_blank', 'width=950,height=900'); } catch (e) { w = null; }
  if (w && w.document) { w.document.write(html); w.document.close(); try { w.focus(); } catch (e2) {} return; }
  // Ventana bloqueada: vista previa dentro del sistema
  pcCerrarVista();
  var ov = document.createElement('div'); ov.id = 'pc-vista';
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:stretch;justify-content:center;padding:12px';
  ov.innerHTML = '<iframe allow="web-share" style="flex:1;max-width:1000px;border:0;border-radius:10px;background:#fff"></iframe>';
  document.body.appendChild(ov);
  var fd = ov.querySelector('iframe').contentWindow.document; fd.open(); fd.write(html); fd.close();
}
// ── AYUDA: qué hace cada botón de cada pantalla ──
var PC_AYUDA = [["general", "Producción por cubierta · cómo se trabaja", "El circuito tiene 3 pasos y después las estaciones: 1) se cargan los cascos de la boleta del cliente → queda la orden de trabajo (OT). 2) Si hace falta, se arma la OT de cascos sueltos. 3) Se juntan 15 cubiertas de distintos clientes en una orden de servicio (OS) y entran a la línea. Cada cubierta pasa por las 10 estaciones en la tablet.", [["Buscar marca… + Vida de la cubierta", "Escribí la marca grabada (ej. CHA000001) y te muestra todo lo que le pasó a esa cubierta: cliente, OT, estaciones, insumos, costo."], ["Pestañas 1 · 2 · 3", "Son los pasos en orden. El número entre paréntesis dice cuántas cosas hay pendientes."], ["❓ Ayuda", "Muestra esta explicación de la pantalla donde estás."], ["Atrás (navegador o tablet)", "Vuelve a la pestaña anterior. Si hay una ventana abierta, la cierra. No te saca del sistema."], ["Celular / tablet de los operarios", "Los operarios entran con su usuario y van directo a las estaciones (sin menú). Link: ema-data-analytics.github.io/guerrero-panel/?puesto=1 · en el celular: Agregar a pantalla de inicio."]]], ["cascos", "1 · Carga de cascos (la boleta del cliente)", "Acá se pasa la boleta en papel que trae el cliente. Al grabar se crea sola la orden de trabajo (OT) de ese cliente.", [["Cliente", "Elegí el cliente de la lista (escribí parte del nombre)."], ["N° de boleta", "El número de la boleta de papel. No se puede repetir: si ya está cargada, avisa en rojo."], ["Tipo / Medida / Marca / Trabajo", "Se eligen de las listas. Al agregar otro casco copia los datos del anterior."], ["DOT / N° interno", "Lo pone el sistema solo (3 letras del cliente + número). Se puede cambiar."], ["Otro casco", "Agrega una fila más."], ["✕ (en la fila)", "Borra esa fila antes de grabar."], ["Grabar boleta", "Graba los cascos y crea la OT del cliente."], ["Imprimir la orden de trabajo", "Aparece después de grabar: abre la OT para imprimir o guardar en PDF y entregar al cliente."], ["Anular (cascos anteriores)", "Anula un casco cargado por error."]]], ["otrab", "2 · Órdenes de trabajo", "Lista las OT en curso (una por boleta). Si quedaron cascos sin orden, aparecen arriba por cliente.", [["Botón con el nombre del cliente (n)", "Cascos de ese cliente que no tienen OT todavía: tocá para armarla."], ["Grabar orden de trabajo", "Crea la OT con los cascos tildados."], ["🖨", "Imprime esa OT."], ["Anular", "Anula la OT (los cascos quedan sin orden)."]]], ["armar", "3 · Orden de servicio (juntar las 15)", "Acá se eligen las cubiertas que entran juntas a la línea (tope 15 en camiones). Pueden ser de distintos clientes.", [["Buscar", "Escribí cliente, OT o boleta: te sugiere y filtra la lista."], ["Casilla de cada cubierta", "Tildá las que entran. Titular = va seguro. Suplente = entra si falla una titular."], ["Casilla del encabezado", "Tilda todas las que se ven, hasta completar el tope."], ["Ver todas", "Saca el filtro y muestra todas las que esperan."], ["Destildar todo", "Saca todas las marcas."], ["Responsable", "Quién arma la carga (sale de la lista de empleados). Es obligatorio."], ["Crear orden de servicio", "Crea la OS con las tildadas. Después se imprime la hoja de carga."]]], ["ots", "Órdenes de servicio abiertas", "Solo las abiertas (armadas o en proceso). Las cerradas y anuladas están en Historial.", [["Abrir", "Entra a la OS: ves cada cubierta y en qué estación está."], ["Imprimir", "Si está armada: hoja de carga con casillas 1 a 10 para tildar a mano. Si ya avanzó o está cerrada: informe completo con insumos, tiempos y costos."]]], ["ot", "Detalle de una orden de servicio", "Cada fila es una cubierta; cada columna una estación. Tocá una celda para ver o cargar ese paso.", [["Celda de estación", "✓ = hecha · ACÁ ESTÁ = la que sigue · tocá para ver el registro o cargarlo desde la PC."], ["Tiempos", "Corrige los minutos de cada estación."], ["Imprimir", "Hoja de carga o informe de la OS (ver arriba)."], ["Terminar", "Da por terminada la cubierta (pasó todo) y calcula su costo."], ["Rechazar", "La cubierta no sirve: pide el motivo y queda para devolver al cliente."], ["A titular", "Una suplente pasa a titular (cuando falló una titular)."], ["Sacar", "Saca la cubierta de la OS: vuelve a espera para otra carga."], ["Costo", "Muestra el costo de esa cubierta: insumos, herramental, gastos."], ["Cerrar OT", "Cierra la OS cuando todas están terminadas o rechazadas."], ["Anular OT", "Anula la OS con motivo: las cubiertas vuelven a espera."]]], ["rech", "Rechazadas", "Cubiertas que no se pudieron recapar.", [["Marcar devueltas al cliente", "Marca como entregadas al cliente las cubiertas rechazadas que ya se llevó."]]], ["costos", "Costos", "Costo real de cada cubierta terminada: insumos, herramental, mano de obra y gastos del mes.", [["Excel", "Descarga la planilla de costos."], ["Prorratear gastos fijos del mes", "Reparte los gastos fijos del mes (sueldos, luz, alquiler…) entre las cubiertas hechas. Se hace una vez a fin de mes."]]], ["herramental", "Herramental (inner / envelope)", "Las piezas que se reutilizan en el autoclave, cada una con su número y cuántos usos le quedan.", [["Dar de alta", "Carga piezas nuevas (código y cantidad)."], ["Dar de baja", "Saca de uso una pieza rota o gastada."], ["Reactivar", "Vuelve a poner en uso una pieza dada de baja."]]], ["equipos", "Herramientas y consumibles", "Control de herramientas de cada estación y de lo que se entrega al personal.", [["Herramientas", "Lista por estación. Nueva herramienta = agregar una."], ["Entregas y control semanal", "Entregar = registrar lo que se le da a un empleado. Controlar = revisar el sábado si está todo."], ["Faltantes y roturas", "Decidir = si el motivo vale (no se cobra) o no vale (se le cobra al responsable)."], ["Cargos al personal", "Lo que hay que descontar. ✓ Descontado cuando se descontó del sueldo."], ["Servicios externos", "Nueva salida = algo que se manda a arreglar afuera. Registrar regreso = cuando vuelve."], ["Consumibles por estación", "Agregar / Quitar qué consumibles usa cada estación y cada cuántas cubiertas se cambian."]]], ["alarmas", "⚠ Alarmas", "Todo lo que necesita atención: stock bajo, herramientas sin control, servicios externos atrasados, consumos fuera de lo normal.", [["Actualizar", "Vuelve a revisar las alarmas."]]], ["hist", "Historial", "Todo lo anterior: cubiertas, órdenes de trabajo y órdenes de servicio cerradas o anuladas.", [["Cubiertas / Órdenes de trabajo / Órdenes de servicio", "Elegí qué querés ver."], ["Buscar", "Filtra por cliente, OT, boleta, DOT o marca."], ["🖨 / Abrir", "Imprimir la OT o abrir la OS para verla."]]], ["config", "Configuración", "Ajustes de la producción (solo encargados).", [["Encargados: Agregar / Activar / Desactivar", "Quién es encargado de cada línea (puede autorizar, corregir tiempos y cerrar)."], ["Parámetros: Guardar", "Cada ajuste tiene su explicación al lado. Cambiá el valor y tocá Guardar en esa fila."], ["Motivos de rechazo: Agregar / ✎", "La lista de motivos que se eligen al rechazar una cubierta."]]], ["impresion", "Vista de impresión", "Se abre al tocar Imprimir en cualquier orden.", [["🖨 Imprimir", "Manda a la impresora. La orden de servicio sale apaisada."], ["📄 Guardar PDF", "Descarga el PDF directo (no abre el cuadro de impresión)."], ["✕ Cerrar", "Cierra y volvés a la misma pantalla. También con Atrás."]]], ["puesto", "Puesto de estación (tablet)", "Pantalla del operario. Cada tablet queda fija en una estación (o \"Recorro todas\" para el operador de turno).", [["Elegir la carga", "Al entrar, si hay varias órdenes de servicio abiertas, elegís cuál controlar. Se ven solo sus cubiertas. Cambiar carga para pasar a otra."], ["⏱ Trabajos en curso", "Las cubiertas que alguien empezó y no confirmó, con quién y cuánto tiempo lleva. Tocá una para volver y apretar TERMINÉ."], ["¿Quién hace este trabajo?", "Al tocar EMPEZAR elegís el nombre del operario de la lista. Con un solo celular trabajan varios: cada uno queda con su reloj."], ["Operario", "Tocá y poné tu nombre: queda registrado en cada paso que confirmes."], ["Cambiar estación", "Cambia la estación de esta tablet."], ["Herramientas / Se rompió · Me falta", "Control de herramientas o avisar una rotura o faltante."], ["Retirar consumibles", "Sacar del depósito un consumible (pincel, disco…)."], ["Tocar una cubierta", "Abre su ficha en la estación que le toca."], ["▶ EMPEZAR / ■ TERMINÉ", "Marca el tiempo del trabajo. El reloj queda guardado aunque salgas, cierres la app o se apague el celular. ↺ Cero borra el tiempo si se tocó por error."], ["📦 Retirar lo que voy a usar", "Saca del stock los insumos antes de trabajar. Lo que sobre lo decidís al confirmar: vuelve al depósito o queda en la estación."], ["Lo que sobre: ↩ Vuelve al depósito / 📍 Queda en la estación", "Elegís qué pasa con lo que retiraste y no usaste. Si queda en la estación, se usa primero en la próxima cubierta (no hace falta retirarlo de nuevo)."], ["📍 Hay material guardado en esta estación / ↩ Devolver al depósito", "Muestra lo que quedó guardado de cubiertas anteriores. Con Devolver al depósito vuelve todo al stock (por ejemplo al terminar el turno)."], ["Devolver todo", "Devuelve todo lo retirado (si no se hizo el trabajo)."], ["✓ Igual a receta", "Usaste lo que dice la receta."], ["↺ Usé otro / Usé otro insumo", "Usaste otro insumo en lugar del de la receta."], ["No se usó / No es de acá", "Ese insumo no se usó en esta cubierta o no corresponde a esta estación."], ["♻ Saqué banda para reutilizar", "Entra al stock la banda que se sacó, como reutilizada."], ["⊘ No pasa por esta estación", "Esta cubierta no necesita este paso (con motivo)."], ["⚠ Hubo una falla", "Registra una falla en el paso."], ["✓ Confirmar paso", "Graba el paso: descuenta insumos y pasa a la estación siguiente."], ["Inspección: Apta / No apta", "En la estación 1: apta (elegís banda nueva o ♻ reutilizada, parches, extras) o no apta (motivo)."], ["Autoclave: Ubicar en orden / ▶ Empieza / ■ Terminó la cocción", "Se cocina la carga completa junta: todas las cubiertas de la orden tienen que haber pasado la estación 7. Cada cubierta usa su inner y su envelope, que quedan ocupados hasta que sale del autoclave."], ["Salir", "Cierra la sesión del aparato."], ["← Otra cubierta / ← Volver", "Vuelve a la lista."]]], ["precios", "Precios cubiertas nuevas (vendedores)", "Lista de precios de todas las cubiertas nuevas con las promos vigentes. Pensada para el celular: se busca por medida y se manda el precio por WhatsApp.", [["Promos (tarjetas de arriba)", "Cada promo vigente con su detalle y fechas. Tocá una para ver solo las medidas que entran. Tocá de nuevo para sacar el filtro."], ["Buscador", "Escribí la medida como quieras: 295 80 22.5, 2958022, 175/70R13. También marca, diseño o código. Se puede combinar: wanli 295."], ["Rubros: Todos / Auto / Camioneta / Camión / Agrícola / Industrial", "Muestra solo ese tipo de cubierta."], ["Marcas", "Muestra solo esa marca. Todas las marcas saca el filtro."], ["Lista: 10% · 15% · 20% · 25% · 30% (camión y agrícola)", "Aparece cuando hay cubiertas de camión o agrícolas. Elegí la lista y todos los precios, la cotización y el PDF pasan a esa lista. Todos los precios son con IVA incluido."], ["Precio grande", "Precio de venta con IVA incluido. En camión y agrícola, el de la lista elegida."], ["Recuadro de promo en la cubierta", "6x2: si la medida es del Grupo G (se compran 6) o del Grupo Ch (van de regalo) y cuántas quedan. Oferta o descuento: el precio final con IVA."], ["Cód.", "El código del artículo en el sistema (el mismo que se usa al vender)."], ["➕ Agregar a cotización", "Suma esa cubierta a la cotización. Se pueden elegir varias medidas y marcas: abajo aparece la barra con la cantidad y el total."], ["Ver y mandar (barra de abajo)", "Abre la cotización: se cambia la cantidad con − y +, se pone el nombre del cliente y se manda."], ["💬 Mandar texto por WhatsApp", "Manda todas las cubiertas elegidas en un solo mensaje, con cantidades, subtotales y total."], ["📄 Armar PDF → 📤 Enviar PDF", "Arma una cotización en PDF con el logo de Vulcan. Cuando dice Enviar PDF, tocalo y elegí WhatsApp. ⬇ Descargar PDF lo guarda en el celular."], ["📤 Mandar esta", "Manda solo esa cubierta por WhatsApp."], ["Al volver de WhatsApp", "La lista queda igual: misma búsqueda, mismos filtros y la cotización armada."], ["📄 Listas PDF (arriba)", "Elegí el rubro y sale la lista completa con el logo: Armar PDF → Enviar PDF (WhatsApp), Descargar PDF o Imprimir. Camión y agrícola salen con las 5 listas. Todo con IVA incluido."], ["Ver más", "La lista muestra de a 40. Tocá para ver las siguientes."], ["Celular de los vendedores", "Link directo: ema-data-analytics.github.io/guerrero-panel/?precios=1 · en el celular: Agregar a pantalla de inicio. Entra con su usuario y va directo a la lista."]]]];
function pcAyudaSec(x) {
  return '<h2 style="margin:14px 0 4px">' + pcEsc(x[1]) + '</h2><p style="margin:0 0 6px;color:#444">' + pcEsc(x[2]) + '</p><table><thead><tr><th style="width:34%">Botón</th><th>Qué hace</th></tr></thead><tbody>' +
    x[3].map(function(b) { return '<tr><td><b>' + pcEsc(b[0]) + '</b></td><td>' + pcEsc(b[1]) + '</td></tr>'; }).join('') + '</tbody></table>';
}
// Recorrido guiado sobre la pantalla real: se ilumina cada botón y un globo explica qué hace
var PC_TOUR = {"general": [["", "Bienvenido: así se trabaja", "Este es el camino de cada cubierta, de punta a punta:<div style=\"display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;margin:6px 0\"><span style=\"background:#fde68a;padding:6px 8px;border-radius:6px\">📄 Boleta del cliente</span>➜<span style=\"background:#bfdbfe;padding:6px 8px;border-radius:6px\">1 · Carga de cascos<br><small>queda la OT</small></span>➜<span style=\"background:#c7d2fe;padding:6px 8px;border-radius:6px\">3 · Orden de servicio<br><small>15 cubiertas</small></span>➜<span style=\"background:#bbf7d0;padding:6px 8px;border-radius:6px\">🛠 10 estaciones<br><small>en la tablet</small></span>➜<span style=\"background:#e9d5ff;padding:6px 8px;border-radius:6px\">✓ Terminada<br><small>con su costo</small></span></div>Te voy a mostrar cada parte de la pantalla. Usá <b>Siguiente ▶</b>."], ["tab:0", "Paso 1 · Carga de cascos", "Acá se pasa la <b>boleta en papel</b> que trae el cliente. Al grabar se crea sola su <b>orden de trabajo (OT)</b>."], ["tab:1", "Paso 2 · Órdenes de trabajo", "Las OT de cada cliente. Si quedaron cascos sin orden, aparecen acá para asignarlos."], ["tab:2", "Paso 3 · Orden de servicio", "Acá se <b>juntan 15 cubiertas</b> (de distintos clientes) que entran juntas a la línea y al autoclave."], ["tab:3", "Órdenes de servicio abiertas", "Las cargas que están en la línea. Desde acá se abren para ver en qué estación está cada cubierta y se imprimen."], ["tab:4", "Rechazadas", "Cubiertas que no se pudieron recapar y hay que devolver al cliente."], ["tab:5", "Costos", "Cuánto costó realmente cada cubierta terminada."], ["tab:6", "Herramental y herramientas", "Dos partes: los <b>inner y envelope</b> del autoclave (cada uno con su número y usos) y las <b>herramientas de las estaciones</b> (lo que se entrega al personal, roturas y faltantes)."], ["tab:7", "Alarmas", "Todo lo que necesita atención: stock bajo, herramientas sin control, cosas atrasadas."], ["tab:8", "Historial", "Todo lo terminado, cerrado o anulado. Para buscar algo viejo."], ["tab:9", "Configuración", "Ajustes de la producción. Solo para encargados."], ["#pc-marca-q", "Buscar una cubierta", "Escribí la <b>marca grabada</b> (por ejemplo CHA000001) y tocá <b>Vida de la cubierta</b>: ves todo lo que le pasó."], ["[onclick^=\"pcAyuda\"]", "Ayuda", "Cuando no sepas qué hacer, tocá acá: te explica <b>la pestaña donde estás</b>, botón por botón."]], "cascos": [["", "Paso 1 · Carga de cascos", "Pasás la boleta de papel del cliente. Al final tocás <b>Grabar boleta</b> y queda hecha su orden de trabajo.<div style=\"display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;margin:6px 0\"><span style=\"background:#fde68a;padding:6px 8px;border-radius:6px\">📄 Boleta del cliente</span>➜<span style=\"background:#bfdbfe;padding:6px 8px;border-radius:6px\">1 · Carga de cascos<br><small>queda la OT</small></span>➜<span style=\"background:#c7d2fe;padding:6px 8px;border-radius:6px\">3 · Orden de servicio<br><small>15 cubiertas</small></span>➜<span style=\"background:#bbf7d0;padding:6px 8px;border-radius:6px\">🛠 10 estaciones<br><small>en la tablet</small></span>➜<span style=\"background:#e9d5ff;padding:6px 8px;border-radius:6px\">✓ Terminada<br><small>con su costo</small></span></div>"], [".al.al-b", "Cuántas esperan", "Te dice cuántas cubiertas están esperando y cuántas faltan para completar una carga de 15."], ["#pc-k-cli", "① Cliente", "Escribí parte del nombre y elegilo de la lista que aparece."], [".pc-nro-w", "② N° de orden", "Dos formas: <b>🤖 Automático</b> lo pone el sistema (OT-00041, OT-00042…). <b>📄 Manual</b>: escribís el N° de la boleta de papel del talonario; si esa boleta ya está cargada, avisa y no deja grabarla dos veces."], ["#pc-k-f", "③ Fecha", "Viene puesta la de hoy. Cambiala si la boleta es de otro día."], ["#pc-k-t", "④ Un renglón por casco", "<b>Tipo</b> (camión/agrícola) → <b>Medida</b> (solo muestra las de ese tipo) → <b>Marca</b> → <b>Trabajo</b>.<br>La <b>marca grabada</b> la pone el sistema (ej. LAM000006): es la que se le graba a la cubierta para seguirla.<br>El <b>DOT</b> es el que trae la cubierta: copialo si se lee; si no tiene, dejalo vacío."], ["#pc-k-mas", "⑤ Otro casco", "Agrega un renglón. Copia tipo, medida, marca y trabajo del anterior, así cargás rápido."], ["#pc-k-ok", "⑥ Grabar boleta", "Graba todo y crea la <b>orden de trabajo</b> del cliente. Después aparece el botón para <b>imprimirla</b>."], ["#pc-k-ant", "Cascos ya cargados", "Los cascos de este cliente que todavía no entraron a la línea. <b>Anular</b> si cargaste uno por error."]], "otrab": [["", "Paso 2 · Órdenes de trabajo", "Una orden de trabajo (OT) = una boleta de un cliente. Normalmente se crean solas en el paso 1."], ["[onclick^=\"PC_.ocli\"]", "Cascos sin orden", "Si cargaste cascos sin trabajo, aparece un botón por cliente. Tocalo para armarle la OT."], ["#pc-o-ok", "Grabar orden de trabajo", "Crea la OT con los cascos que tildaste."], ["[onclick^=\"pcImpOTrab\"]", "🖨 Imprimir", "Imprime la OT o la guarda en PDF para entregar al cliente."], ["[onclick^=\"pcOTrabAnular\"]", "Anular", "Anula la OT si se cargó mal (los cascos quedan sin orden)."]], "armar": [["", "Paso 3 · Orden de servicio", "Acá elegís las <b>15 cubiertas</b> que entran juntas a la línea. Pueden ser de varios clientes."], ["#pc-a-f", "① Buscar", "Escribí cliente, OT o N° de boleta. Te sugiere y filtra la lista."], ["#pc-a-todas", "② Tildar todas", "Tilda de una todas las que ves en la lista, hasta llegar a 15."], [".pc-ck || #pc-tbl-armar", "③ Tildar una por una", "<b>Titular</b> = entra seguro. <b>Suplente</b> = reemplaza a una titular si falla."], ["#pc-a-cont", "Contador", "Cuántas llevás tildadas de las 15."], ["[onclick^=\"pcArmDestildar\"]", "Destildar todo", "Saca todas las marcas para empezar de nuevo."], ["#pc-resp", "④ Responsable", "Quién arma la carga. Se elige de la lista de empleados. <b>Obligatorio</b>."], ["#pc-crear", "⑤ Crear orden de servicio", "Crea la OS. Después la imprimís (hoja de carga) desde la pestaña <b>Órdenes de servicio</b>."]], "ots": [["", "Órdenes de servicio abiertas", "Las cargas que están trabajándose. Las cerradas van a Historial."], ["#pc-tbl-ots", "La lista", "Una fila por orden de servicio: cuántas titulares, suplentes y terminadas tiene, y su estado."], ["[onclick^=\"pcAbrirOT\"]", "Abrir", "Entra a la orden: ves cada cubierta y en qué estación está."], ["[onclick^=\"pcImpOS\"]", "Imprimir", "Recién armada: <b>hoja de carga</b> con casillas 1 a 10 para tildar a mano.<br>Cuando avanzó o se cerró: <b>informe completo</b> con insumos, tiempos y costos."]], "ot": [["", "Adentro de una orden de servicio", "Cada fila es una cubierta y cada columna una estación."], ["#pc-grid || #pc-ot table", "Las estaciones", "✓ = hecha. <b>ACÁ ESTÁ</b> = la que le toca. Tocá una casilla para ver lo que se registró o cargarlo desde la PC."], ["[onclick=\"pcTiempos()\"]", "Tiempos", "Corregir los minutos de cada estación (solo encargado)."], ["#pc-ot [onclick^=\"pcImpOS\"]", "Imprimir", "Hoja de carga o informe de esta orden."], ["[onclick^=\"pcTerminar\"]", "Terminar / Rechazar", "<b>Terminar</b>: la cubierta pasó todo, se calcula su costo.<br><b>Rechazar</b>: no sirve, pide el motivo y va a Rechazadas."], ["[onclick^=\"pcPromover\"]", "A titular", "Una suplente pasa a titular cuando falló una titular."], ["[onclick^=\"pcRetirar\"]", "Sacar", "Saca la cubierta de esta orden: vuelve a esperar otra carga."], ["[onclick^=\"pcVerCosto\"]", "Costo", "El costo de esa cubierta: insumos, herramental, mano de obra, gastos."], ["[onclick=\"pcCerrarOT()\"]", "Cerrar OT", "Cuando todas están terminadas o rechazadas, se cierra la orden."], ["[onclick=\"pcAnularOT()\"]", "Anular OT", "Anula la orden (pide motivo): todas las cubiertas vuelven a espera."]], "rech": [["", "Rechazadas", "Cubiertas que no se pudieron recapar."], ["[onclick^=\"pcDevolver\"]", "Marcar devueltas al cliente", "Cuando el cliente se lleva las rechazadas, las marcás como devueltas."]], "costos": [["", "Costos", "El costo real de cada cubierta terminada."], ["#pc-tbl-costos", "La tabla", "Materiales, herramental, mano de obra, gastos fijos y total de cada cubierta."], ["[onclick^=\"pcCostosExcel\"]", "Excel", "Descarga la tabla en Excel."], ["[onclick^=\"pcProrratear\"]", "Prorratear gastos del mes", "A fin de mes: reparte sueldos, luz, alquiler, etc. entre las cubiertas hechas."]], "herramental": [["", "Herramental", "Inner y envelope: se usan muchas veces. Cada uno tiene número y usos máximos."], ["#pc-tbl-piezas", "Las piezas", "Cada pieza con su modelo, usos hechos y usos que le quedan."], ["[onclick^=\"pcAltaPiezas\"]", "Dar de alta", "Cargar piezas nuevas."], ["[onclick^=\"pcBajaPieza\"]", "Dar de baja / Reactivar", "Sacar de uso una pieza rota o gastada, o volver a usarla."]], "equipos": [["", "Herramientas y consumibles", "Control de herramientas y de lo que se entrega al personal."], ["[onclick^=\"PQ_.sub\"]", "Secciones", "<b>Herramientas</b> de cada estación · <b>Entregas</b> al personal y control semanal · <b>Faltantes y roturas</b> · <b>Cargos al personal</b> · <b>Servicios externos</b>."], ["[onclick^=\"pqHerrForm\"]", "Nueva herramienta", "Agregar una herramienta a una estación."]], "alarmas": [["", "Alarmas", "Lo que necesita atención: stock bajo, herramientas sin control, servicios externos atrasados, consumos raros."], ["[onclick^=\"pcAlarmas\"]", "Actualizar", "Vuelve a revisar."]], "hist": [["", "Historial", "Todo lo viejo: terminado, cerrado o anulado."], ["[onclick^=\"PC_.hsub\"]", "Qué ver", "Cubiertas, órdenes de trabajo u órdenes de servicio."], ["#pc-h-q", "Buscar", "Cliente, OT, boleta, DOT o marca."]], "config": [["", "Configuración", "Ajustes de la producción. Solo encargados."], ["[onclick^=\"pcEncargado\"]", "Encargados", "Quién es encargado de cada línea (autoriza, corrige tiempos, cierra)."], ["[onclick^=\"pcParam\"]", "Parámetros", "Cada ajuste tiene su explicación al lado. Cambiá el valor y tocá <b>Guardar</b> en esa fila."], ["[onclick^=\"pcMotivoForm\"]", "Motivos de rechazo", "La lista de motivos para rechazar una cubierta."]], "puesto": [["", "La tablet de la estación", "Cada tablet queda en una estación. El operario toca la cubierta, hace su trabajo y confirma.<div style=\"display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12px;margin:6px 0\"><span style=\"background:#fde68a;padding:6px 8px;border-radius:6px\">📄 Boleta del cliente</span>➜<span style=\"background:#bfdbfe;padding:6px 8px;border-radius:6px\">1 · Carga de cascos<br><small>queda la OT</small></span>➜<span style=\"background:#c7d2fe;padding:6px 8px;border-radius:6px\">3 · Orden de servicio<br><small>15 cubiertas</small></span>➜<span style=\"background:#bbf7d0;padding:6px 8px;border-radius:6px\">🛠 10 estaciones<br><small>en la tablet</small></span>➜<span style=\"background:#e9d5ff;padding:6px 8px;border-radius:6px\">✓ Terminada<br><small>con su costo</small></span></div>"], ["[onclick^=\"puFijarOS\"]", "Carga que controlás", "La tablet trabaja <b>una orden de servicio (carga) a la vez</b>: ves solo sus cubiertas. Con <b>Cambiar carga</b> pasás a otra."], [".pu-top .est", "Tu estación", "La estación de esta tablet."], ["[onclick=\"puOperario()\"]", "Operario", "Tocá y poné tu nombre: queda en cada paso que confirmes."], ["[onclick=\"puVerHerr()\"]", "Herramientas", "Avisar si se rompió o falta una herramienta."], ["[onclick=\"puVerRetiro()\"]", "Retirar consumibles", "Sacar del depósito un pincel, disco, etc."], ["[onclick=\"doLogout()\"]", "Salir", "Cierra la sesión del aparato. El próximo operario entra con su usuario."], ["[onclick=\"puCambiarEst()\"]", "Cambiar estación", "Cambia la estación de esta tablet."], [".pu-relojes", "⏱ Trabajos en curso", "Las cubiertas que alguien empezó y todavía no confirmó: quién y cuánto tiempo lleva. <b>Tocá una</b> para volver y apretar TERMINÉ."], ["#pu-q", "Buscar cubierta", "Escribí la marca grabada."], [".pu-cubs", "Las cubiertas", "Las que tienen que pasar por tu estación. <b>Tocá una</b> para trabajarla."], [".pu-panel", "Dónde está", "Las 10 estaciones de la cubierta: ✓ hecha · ESTÁS ACÁ · falta."], ["[onclick^=\"puPanelToca\"]", "Entrar", "Entra a la estación que le toca."], ["[onclick^=\"puEmpezar\"]", "▶ EMPEZAR", "Elegís quién hace el trabajo y arranca el reloj. <b>Podés volver y empezar otra cubierta</b>: el reloj sigue corriendo aunque cierres la app."], ["[onclick=\"puTermine()\"]", "■ TERMINÉ", "Tocá al terminar: para el reloj."], ["[onclick=\"puRetirar()\"]", "📦 Retirar lo que voy a usar", "Sacá del stock lo que vas a usar. <b>Lo que sobre</b>: al confirmar elegís si <b>vuelve al depósito</b> o <b>queda en la estación</b> para la próxima cubierta."], ["[onclick^=\"PU_.sobra\"]", "Lo que sobre", "<b>↩ Vuelve al depósito</b>: vuelve solo al stock.<br><b>📍 Queda en la estación</b>: queda guardado acá y se usa primero en la próxima cubierta."], ["[onclick=\"puEstDevolver()\"]", "Material guardado en la estación", "Lo que quedó de cubiertas anteriores. <b>↩ Devolver al depósito</b> lo vuelve al stock (por ejemplo al terminar el turno)."], [".pu-rows", "Insumos de la receta", "Por cada insumo: <b>✓ Igual a receta</b> · poné lo que usaste · <b>↺ Usé otro</b> · <b>No se usó</b>."], ["[onclick=\"puReemplazo()\"]", "↺ Usé otro insumo", "Si usaste algo distinto a la receta."], ["[onclick=\"puReut()\"]", "♻ Banda para reutilizar", "Si sacaste una banda que sirve, entra al stock como reutilizada."], ["[onclick=\"puNoAplica()\"]", "⊘ No pasa por esta estación", "Esta cubierta no necesita este paso (con motivo)."], ["[onclick=\"puFalla()\"]", "⚠ Hubo una falla", "Registrar una falla."], ["#pu-ok", "✓ Confirmar paso", "Graba todo, descuenta los insumos y la cubierta pasa a la estación siguiente."], ["[onclick=\"puVolver()\"]", "← Otra cubierta", "Volver a la lista. <b>El reloj sigue corriendo</b>: podés empezar otra cubierta y volver después."], [".pu-ac-mapa || [onclick=\"puAcAuto()\"]", "Autoclave", "Se cocina <b>toda la carga junta</b>. <b>Ubicar en orden</b> pone cada cubierta en su lugar, después <b>▶ Empieza la cocción</b> y al final <b>■ Terminó la cocción</b>. Las piezas (inner/envelope) quedan libres para la próxima carga."]], "precios": [["", "Precios cubiertas nuevas", "Todas las cubiertas nuevas con su precio y las promos del momento. Se usa desde el celular: buscás la medida y mandás el precio por WhatsApp."], ["#pn-promos", "Promos vigentes", "Deslizá para ver todas. <b>Tocá una</b> para ver solo las medidas que entran en esa promo."], ["#pn-q", "Buscador", "Escribí la medida como te salga: <b>295 80 22.5</b>, <b>2958022</b>, <b>175/70R13</b>. También marca, diseño o código. Podés combinar: <b>wanli 295</b>."], [".pn-chips", "Rubro y marca", "Tocá un rubro (Auto, Camioneta, Camión, Agrícola, Industrial) o una marca para achicar la lista."], [".pn-item", "Cada cubierta", "Medida, marca y diseño. A la derecha el <b>precio con IVA</b> y abajo sin IVA. Si tiene promo aparece en color con el precio final."], [".pn-plz", "Plazos", "En camión: precio contado y a 30, 45, 60, 75 y 90 días."], [".pn-acc2 button", "📤 Mandar por WhatsApp", "Arma el mensaje con la medida, el código, el precio y la promo para mandárselo al cliente."]]};
var PCT_ = null;
function pcTourBuscar(sel) {
  var ops = String(sel || '').split(' || ');
  for (var i = 0; i < ops.length; i++) {
    var s = ops[i].trim(), el = null;
    if (!s) continue;
    if (s.indexOf('tab:') === 0) { var ts = document.querySelectorAll('#page-produccion-cubiertas .tabs .tab'); el = ts[+s.slice(4)] || null; }
    else { try { var cands = document.querySelectorAll(s); for (var j = 0; j < cands.length; j++) { var r = cands[j].getBoundingClientRect(); if (r.width > 0 && r.height > 0 && !cands[j].closest('#pc-tour')) { el = cands[j]; break; } } } catch (e) { el = null; } }
    if (el) return el;
  }
  return null;
}
function pcAyuda(clave) {
  closeModal();
  var pasos = (PC_TOUR[clave] || PC_TOUR.general).filter(function(p) { return !p[0] || pcTourBuscar(p[0]); });
  if (clave !== 'general' && clave !== 'puesto' && clave !== 'precios') pasos.push(['[onclick^="pcAyuda"]', '¿Y el resto?', 'Esta fue la pestaña donde estás. Para ver <b>todas las pestañas</b>, tocá <b>Ver el recorrido general</b>.', 'general']);
  PCT_ = { pasos: pasos, i: 0, clave: clave };
  pcTourPintar();
}
function pcTourCerrar() { var t = $id('pc-tour'); if (t) t.remove(); window.removeEventListener('resize', pcTourPintar); PCT_ = null; }
function pcTourIr(d) { if (!PCT_) return; PCT_.i = Math.max(0, Math.min(PCT_.pasos.length - 1, PCT_.i + d)); pcTourPintar(); }
function pcTourPintar() {
  if (!PCT_) return;
  var p = PCT_.pasos[PCT_.i], el = p[0] ? pcTourBuscar(p[0]) : null, t = $id('pc-tour');
  if (!t) { t = document.createElement('div'); t.id = 'pc-tour'; document.body.appendChild(t); window.addEventListener('resize', pcTourPintar); }
  if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' });
  var vw = window.innerWidth, vh = window.innerHeight, r = el ? el.getBoundingClientRect() : null;
  var bw = Math.min(380, vw - 24), ult = PCT_.i === PCT_.pasos.length - 1;
  var luz = r ? '<div style="position:fixed;left:' + (r.left - 6) + 'px;top:' + (r.top - 6) + 'px;width:' + (r.width + 12) + 'px;height:' + (r.height + 12) + 'px;border:3px solid #f59e0b;border-radius:10px;box-shadow:0 0 0 9999px rgba(15,23,42,.78);pointer-events:none;transition:all .25s"></div>' :
    '<div style="position:fixed;inset:0;background:rgba(15,23,42,.78)"></div>';
  var top, left = r ? Math.max(12, Math.min(vw - bw - 12, r.left + r.width / 2 - bw / 2)) : (vw - bw) / 2;
  var globo = '<div id="pc-tour-g" style="position:fixed;left:' + left + 'px;width:' + bw + 'px;background:#fff;color:#111;border-radius:12px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:14px;line-height:1.45;z-index:2">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px"><b style="font-size:15px">' + p[1] + '</b><span style="font-size:11px;color:#666;white-space:nowrap">' + (PCT_.i + 1) + ' de ' + PCT_.pasos.length + '</span></div>' +
    '<div>' + p[2] + '</div>' +
    '<div style="display:flex;gap:6px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap">' +
    '<button class="btn btn-s btn-sm" onclick="pcTourCerrar()">Salir</button><span style="display:flex;gap:6px">' +
    (PCT_.i > 0 ? '<button class="btn btn-s btn-sm" onclick="pcTourIr(-1)">◀ Anterior</button>' : '') +
    (p[3] ? '<button class="btn btn-p btn-sm" onclick="pcAyuda(\'' + p[3] + '\')">Ver el recorrido general ▶</button>' :
      (ult ? '<button class="btn btn-p btn-sm" onclick="pcTourCerrar()">✓ Entendido</button>' : '<button class="btn btn-p btn-sm" onclick="pcTourIr(1)">Siguiente ▶</button>')) +
    '</span></div>' + (ult ? '<div style="margin-top:8px;font-size:12px"><a href="#" onclick="pcTourCerrar();pcAyudaTodo();return false">📄 Manual para imprimir</a></div>' : '') + '</div>';
  t.innerHTML = '<div style="position:fixed;inset:0;z-index:100001">' + luz + globo + '</div>';
  var g = $id('pc-tour-g'), gh = g.offsetHeight;
  if (!r) top = Math.max(12, (vh - gh) / 2);
  else if (r.bottom + 14 + gh < vh) top = r.bottom + 14;
  else if (r.top - 14 - gh > 0) top = r.top - 14 - gh;
  else top = Math.max(12, vh - gh - 12);
  g.style.top = top + 'px';
}
document.addEventListener('keydown', function(e) { if (!PCT_) return; if (e.key === 'ArrowRight' || e.key === 'Enter') pcTourIr(1); else if (e.key === 'ArrowLeft') pcTourIr(-1); else if (e.key === 'Escape') pcTourCerrar(); });
function pcAyudaTodo() {
  pcImprimir('Ayuda Produccion por cubierta', pcEncImp('AYUDA · PRODUCCIÓN POR CUBIERTA', 'Manual') + PC_AYUDA.map(pcAyudaSec).join(''), false);
}
function pcAyudaClave() {
  if ((PC_.tab === 'os' || PC_.tab === 'ots') && $id('pc-ot') && $id('pc-ot').innerHTML.trim()) return 'ot';
  if (PC_.tab === 'os') return 'armar';
  return PC_.tab || 'general';
}
function pcCerrarVista() { var v = $id('pc-vista'); if (v) v.remove(); }
function pcEncImp(titulo, nro, sub) {
  var logo = (window.EMA_CONFIG && EMA_CONFIG.logo_b64) || 'https://ema-data-analytics.github.io/guerrero-panel/logo_vulcan.jpg?v=4';
  return '<div class="enc"><div style="display:flex;gap:12px;align-items:center"><img src="' + logo + '" crossorigin="anonymous" style="height:62px;border-radius:6px"/><div><h1>' + pcEsc(titulo) + '</h1><div class="emp">VULCAN TREAD NEUMÁTICOS S.R.L. · Salta</div></div></div><div style="text-align:right"><div style="font-size:20px;font-weight:700">' + pcEsc(nro) + '</div>' + (sub ? '<div class="emp" style="font-weight:600">' + pcEsc(sub) + '</div>' : '') + '<div class="emp">Impreso ' + fmtD(Date.now()) + '</div></div></div>';
}
// N° de la orden de trabajo: si se cargó con la boleta de papel, el número que conoce el cliente es el de la boleta
function pcOTPrin(o) { return o && o.NRO_MANUAL ? 'Boleta N° ' + o.NRO_MANUAL : (o ? o.NRO : ''); }
function pcOTSec(o) { return o && o.NRO_MANUAL ? 'Registro del sistema: ' + o.NRO : 'N° del sistema'; }
function pcOTCorto(o) { return o && o.NRO_MANUAL ? 'Boleta ' + o.NRO_MANUAL + ' · ' + o.NRO : (o ? o.NRO : ''); }
// Orden de trabajo: el pedido del cliente (boleta) con sus cascos
// Cambio de trabajo hecho en la inspección (lo decidió el encargado): se muestra en la orden de trabajo y el remito
function pcCambioTrab(idCub) {
  var cs = (PC_.d.cambiosTrabajo || []).filter(function(x) { return String(x.ID_CUB) === String(idCub); });
  return cs.map(function(x) { return '<div style="font-size:9px;color:#b45309">Cambiado de ' + pcEsc(x.ANTES) + ' en la inspección · ' + pcEsc(x.MOTIVO) + ' · decidió ' + pcEsc(x.DECIDE) + '</div>'; }).join('');
}
async function pcImpOTrab(id) {
  var d = PC_.d, o = (d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(id); })[0];
  if (!o) { toast('No encontré la orden de trabajo', 'r2'); return; }
  var firma = ''; if (o.FIRMA_ID) { try { var fi = await asImg('vt_as_img_get', { tok: SES.token, nid: Number(o.FIRMA_ID) }); if (fi && fi.ok) firma = fi.data; } catch (ef) { firma = ''; } }
  var cs = d.cubiertas.filter(function(c) { return String(c.ID_OTRAB) === String(id) && c.ESTADO !== 'ANULADA'; }).sort(function(a, b) { return a.ID_CUB - b.ID_CUB; });
  var cli = d.clientes.filter(function(c) { return String(c.ID_CLIENTE) === String(o.ID_CLIENTE); })[0] || {};
  // Diseño compacto (como la orden del sistema anterior): datos en una grilla y renglones finos
  var fh = new Date(+o.FECHA), hh = ('0' + fh.getHours()).slice(-2) + ':' + ('0' + fh.getMinutes()).slice(-2);
  var logo = (window.EMA_CONFIG && EMA_CONFIG.logo_b64) || 'https://ema-data-analytics.github.io/guerrero-panel/logo_vulcan.jpg?v=4';
  var cel = function(t, v, est) { return '<td class="l">' + t + '</td><td class="v"' + (est ? ' style="' + est + '"' : '') + '>' + v + '</td>'; };
  var h = '<style>.otc{width:100%;border-collapse:collapse;margin:0 0 6px;font-size:10.5px}.otc td{border:1px solid #9aa4b2;padding:3px 6px;vertical-align:middle}.otc td.l{background:#e8edf3;color:#334;font-size:9.5px;white-space:nowrap;width:1%}.otc td.v{font-weight:700}' +
      '.otd{width:100%;border-collapse:collapse;font-size:10.5px}.otd th{background:#e8edf3;color:#223;font-size:9px;text-transform:none;padding:3px 5px;border:1px solid #9aa4b2}.otd td{padding:2px 5px;border:0;border-bottom:1px solid #e3e7ec}.otd tr:nth-child(even) td{background:#f7f9fb}.otd td.n{color:#666;width:16px}</style>' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px"><div style="display:flex;gap:10px;align-items:center"><img src="' + logo + '" crossorigin="anonymous" style="height:40px;border-radius:4px"/><div><div style="font-weight:800;font-size:13px;color:#14213d">VULCAN TREAD NEUMÁTICOS S.R.L.</div><div style="font-size:10.5px;color:#14213d">Planta Salta</div></div></div>' +
    '<div style="text-align:right"><div style="font-weight:800;font-size:14px;color:#14213d">Orden de Trabajo</div><div style="font-size:10px;color:#444">Operador: ' + pcEsc(o.USUARIO || '—') + ' · impresa ' + fmtD(Date.now()) + '</div></div></div>' +
    '<table class="otc"><tr>' + cel('Orden de trabajo', '<span style="font-size:14px">' + pcEsc(o.NRO) + '</span>') + cel('Fecha y hora', fmtD(+o.FECHA) + (hh !== '00:00' ? ' ' + hh : '')) + cel('Orden manual N°', '<span style="font-size:14px">' + pcEsc(o.NRO_MANUAL || '—') + '</span>') + '</tr>' +
    '<tr>' + cel('Razón social', (cli.ID_CLIENTE ? '<span style="color:#666;font-weight:400">' + pcEsc(cli.ID_CLIENTE) + '</span> ' : '') + pcEsc(o.CLIENTE), '') + cel('CUIT', pcEsc(cli.CUIT || '—')) + cel('Condición IVA', pcEsc(cli.COND_IVA || '—')) + '</tr>' +
    '<tr>' + cel('Domicilio', pcEsc(cli.DIRECCION || '—')) + cel('Localidad', pcEsc([cli.LOCALIDAD, cli.CP ? '(' + cli.CP + ')' : ''].join(' ').trim() || '—')) + cel('Provincia', pcEsc(cli.PROVINCIA || '—')) + '</tr>' +
    '<tr>' + cel('Teléfono', pcEsc(cli.TELEFONO || '—')) + cel('Cubiertas', cs.length) + cel('Parche', pcEsc(pcParcheTxt(o))) + '</tr>' +
    (o.OBSERVACIONES ? '<tr><td class="l">Observaciones</td><td class="v" colspan="5" style="font-weight:400">' + pcEsc(o.OBSERVACIONES) + '</td></tr>' : '') + '</table>' +
    '<table class="otd"><thead><tr><th></th><th>Marca grabada</th><th>Identificación</th><th>N° DOT</th><th>Medida</th><th>Marca</th><th>Trabajo</th><th>Observaciones</th></tr></thead><tbody>' +
    cs.map(function(c, i) { return '<tr><td class="n">' + (i + 1) + '</td><td><b>' + pcEsc(c.MARCA || '') + '</b></td><td>' + pcEsc(c.ID_CASCO || '') + '</td><td>' + pcDotTxt(c.DOT) + '</td><td>' + pcEsc(c.MEDIDA) + '</td><td>' + pcEsc(c.FABRICANTE || '') + '</td><td>' + pcEsc(c.TRABAJO) + pcCambioTrab(c.ID_CUB) + (String(c.PARCHE_INCLUIDO || '') ? '<div style="font-size:8.5px;color:#444">' + pcEsc(pcParcheTxt(c)) + ' (solo esta)</div>' : '') + '</td><td style="width:18%"></td></tr>'; }).join('') +
    '</tbody></table><div class="nota" style="font-size:9px">Cada cubierta se sigue por su marca grabada. DOT: el que trae la cubierta (sin DOT si no tiene o no se lee). Identificación: N° interno del casco.</div>' +
    (firma ? '<div class="firmas" style="margin-top:22px"><div style="border-top:0"><img src="' + firma + '" style="max-height:70px;max-width:100%;display:block;margin:0 auto"><div style="border-top:1px solid #111;padding-top:3px">Entregó (cliente): ' + pcEsc(o.FIRMA_NOMBRE || '') + ' · ' + fmtDT(+o.FIRMA_FECHA) + '</div></div><div style="align-self:flex-end">Recibió (Vulcan Tread)</div></div>'
      : '<div class="firmas" style="margin-top:30px"><div>Entregó (cliente)</div><div>Recibió (Vulcan Tread)</div></div>');
  pcImprimir('Orden de trabajo ' + (o.NRO_MANUAL ? 'boleta ' + o.NRO_MANUAL : o.NRO), h);
}
// ── Firma del cliente en la pantalla (celular o tablet): reemplaza la firma del talonario de papel ──
function pcFirmaOT(id) {
  var o = (PC_.d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(id); })[0]; if (!o) return;
  var n = PC_.d.cubiertas.filter(function(c) { return String(c.ID_OTRAB) === String(id) && c.ESTADO !== 'ANULADA'; }).length;
  showModal('<div class="mh"><span class="mt">✍ Firma del cliente · ' + pcEsc(pcOTCorto(o)) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div style="font-size:14px;margin-bottom:6px"><b>' + pcEsc(o.CLIENTE) + '</b> deja <b>' + n + (n === 1 ? ' casco' : ' cascos') + '</b>. Firmá con el dedo en el recuadro.</div>' +
    '<canvas id="pc-fir-c" style="width:100%;height:200px;border:2px dashed var(--border);border-radius:10px;background:#fff;touch-action:none"></canvas>' +
    '<div class="flex gap2 mt2" style="align-items:flex-end;flex-wrap:wrap"><div style="flex:1 1 220px"><label class="fl">Aclaración (nombre de quien firma)</label><input class="fi" id="pc-fir-n" style="width:100%" placeholder="Nombre y apellido"></div><button class="btn btn-s" onclick="pcFirmaBorrar()">Borrar</button></div>' +
    '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pc-fir-ok" onclick="pcFirmaGuardar(' + id + ')">Guardar firma</button></div>', 'md-lg');
  setTimeout(function() {
    var cv = $id('pc-fir-c'); if (!cv) return; var r = cv.getBoundingClientRect(); cv.width = Math.round(r.width); cv.height = Math.round(r.height);
    var g = cv.getContext('2d'); g.lineWidth = 2.5; g.lineCap = 'round'; g.strokeStyle = '#111'; PC_.firmaHay = false; var on = false;
    var pt = function(e) { var b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    cv.onpointerdown = function(e) { on = true; var p = pt(e); g.beginPath(); g.moveTo(p.x, p.y); cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = function(e) { if (!on) return; var p = pt(e); g.lineTo(p.x, p.y); g.stroke(); PC_.firmaHay = true; };
    cv.onpointerup = cv.onpointercancel = function() { on = false; };
  }, 80);
}
function pcFirmaBorrar() { var cv = $id('pc-fir-c'); if (!cv) return; cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); PC_.firmaHay = false; }
async function pcFirmaGuardar(id) {
  var o = (PC_.d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(id); })[0], cv = $id('pc-fir-c'), nm = $v('pc-fir-n').trim(), b = $id('pc-fir-ok');
  if (!PC_.firmaHay) { toast('Falta la firma', 'r2'); return; }
  if (nm.length < 3) { toast('Escribí el nombre de quien firma', 'r2'); $id('pc-fir-n').focus(); return; }
  b.disabled = true; b.textContent = 'Guardando…';
  try {
    var c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; var g2 = c2.getContext('2d'); g2.fillStyle = '#fff'; g2.fillRect(0, 0, c2.width, c2.height); g2.drawImage(cv, 0, 0);
    var fi = await asImg('vt_as_img_put', { tok: SES.token, tipo: 'FIRMA_OT', ref: o.NRO, data: c2.toDataURL('image/jpeg', 0.8) });
    if (!fi || !fi.ok) { toast((fi && fi.error) || 'No se pudo guardar la firma', 'r2'); return; }
    var r = await gsRun('gsPC_OTrabFirma', id, String(fi.id), nm);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    o.FIRMA_ID = String(fi.id); o.FIRMA_NOMBRE = nm; o.FIRMA_FECHA = Date.now();
    closeModal(); toast('Firma guardada ✓', 'g'); if (PC_.tab === 'cascos') pcPintar(); pcImpOTrab(id);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) { b.disabled = false; b.textContent = 'Guardar firma'; } }
}
// Orden de servicio: hoja de carga de la línea, con casilleros para tildar cada estación en papel
// Informe de la orden de servicio (en proceso o cerrada): cómo terminó cada cubierta, estaciones, insumos reales, herramental, tiempo y costo
// Estaciones de una línea (camiones o agrícola)
function pcEstLin(linea) { var L = String(linea || '').toUpperCase(); return PC_.d.estaciones.filter(function(e) { return !L || !e.LINEA || e.LINEA === L; }); }
// Datos de la cubierta del cliente: marca de fábrica, DOT y N° interno
// DOT: el que trae la cubierta; si no tiene se dice "sin DOT" (siempre se muestra con su título)
function pcDotDe(c) { if (!c) return ''; if (c.DOT !== undefined && c.DOT !== null && c.DOT !== '') return c.DOT; var x = (PC_.d.cubiertas || []).filter(function(y) { return String(y.ID_CUB) === String(c.ID_CUB); })[0]; return x ? x.DOT || '' : ''; }
function pcMkDot(c) { return 'Marca grabada ' + pcEsc(c.MARCA || '') + ' · DOT ' + (pcDotDe(c) ? pcEsc(pcDotDe(c)) : 'sin DOT'); }
function pcDotTxt(v) { return v ? pcEsc(v) : '<span style="color:#888">sin DOT</span>'; }
function pcCubIdent(c) { var x = []; x.push('DOT: ' + pcDotTxt(c.DOT)); if (c.FABRICANTE) x.push(pcEsc(c.FABRICANTE)); if (c.ID_CASCO) x.push('N° int. ' + pcEsc(c.ID_CASCO)); return x.length ? '<div style="font-size:8.5px;color:#444">' + x.join('<br>') + '</div>' : ''; }
function pcCubIdentLinea(c) { var x = []; if (c.FABRICANTE) x.push('Marca de fábrica: ' + pcEsc(c.FABRICANTE)); x.push('DOT: ' + pcDotTxt(c.DOT)); if (c.ID_CASCO) x.push('N° interno: ' + pcEsc(c.ID_CASCO)); if (c.NRO_MANUAL) x.push('Boleta: ' + pcEsc(c.NRO_MANUAL)); return x.length ? '<div style="font-size:11px;color:#333;margin-top:2px">' + x.join(' · ') + '</div>' : ''; }
function pcImpOSInforme(r, o) {
  var d = PC_.d, ests = pcEstLin(o && o.LINEA).slice().sort(function(a, b) { return a.ORDEN - b.ORDEN; });
  var nomE = {}; ests.forEach(function(e) { nomE[String(e.ID_ESTACION)] = (e.NRO || e.ORDEN) + '. ' + e.NOMBRE; });
  var nomI = {}; (d.insumos || []).forEach(function(x) { nomI[x.ID_INSUMO] = x.NOMBRE_INSUMO; });
  var cub = {}; d.cubiertas.forEach(function(c) { cub[String(c.ID_CUB)] = c; });
  var $$ = function(n) { return '$ ' + Math.round(+n || 0).toLocaleString('es-AR'); };
  var estTxt = { TERMINADA: 'Terminada', RECHAZADA: 'No apta / rechazada', EN_PROCESO: 'En proceso', PENDIENTE: 'Sin empezar', RETIRADA: 'Retirada' };
  var tot = { n: 0, ok: 0, rech: 0, mat: 0, herr: 0, mo: 0, fij: 0, t: 0, min: 0, tOk: 0, tRech: 0 };
  r.items.forEach(function(i) { tot.n++; if (i.ESTADO === 'TERMINADA') { tot.ok++; tot.tOk += i.COSTO.TOTAL; } if (i.ESTADO === 'RECHAZADA') { tot.rech++; tot.tRech += i.COSTO.TOTAL; } tot.mat += i.COSTO.MATERIALES; tot.herr += i.COSTO.HERRAMENTAL; tot.mo += i.COSTO.MO; tot.fij += i.COSTO.FIJOS; tot.t += i.COSTO.TOTAL; tot.min += i.COSTO.MINUTOS; });
  var ac = (r.autoclave || [])[0];
  var cerrada = o.ESTADO === 'CERRADA';
  var h = pcEncImp('ORDEN DE SERVICIO · INFORME ' + (cerrada ? 'FINAL (CERRADA)' : 'PARCIAL (EN PROCESO)'), o.NRO_OT) +
    '<div class="dat"><div><b>Línea</b>' + pcEsc(o.LINEA) + '</div><div><b>Armada</b>' + fmtD(o.FECHA) + '</div><div><b>Cerrada</b>' + (o.FECHA_CIERRE ? fmtD(o.FECHA_CIERRE) : '—') + '</div><div><b>Responsable</b>' + pcEsc(o.RESPONSABLE || '—') + '</div>' +
    '<div><b>Cubiertas</b>' + tot.n + ' · terminadas ' + tot.ok + ' · no aptas ' + tot.rech + '</div><div><b>Autoclave</b>' + (ac ? fmtD(ac.INICIO) + (ac.MINUTOS ? ' · ' + Math.round(ac.MINUTOS) + ' min' : '') + (ac.OPERARIO ? ' · ' + pcEsc(ac.OPERARIO) : '') : '—') + '</div>' +
    '<div><b>Costo total</b>' + $$(tot.t) + '</div><div><b>Costo de las terminadas</b>' + $$(tot.tOk) + (tot.ok ? ' · ' + $$(tot.tOk / tot.ok) + ' c/u' : '') + '</div>' +
    '<div><b>Costo de los rechazos</b>' + $$(tot.tRech) + (tot.rech ? ' (' + tot.rech + ')' : '') + '</div><div><b>Promedio por terminada con los rechazos</b>' + (tot.ok ? $$((tot.tOk + tot.tRech) / tot.ok) : '—') + '</div></div>' +
    '<h2>Resumen por cubierta</h2><table class="res"><colgroup><col style="width:3%"><col style="width:9%"><col style="width:17%"><col style="width:9%"><col style="width:9%"><col style="width:8%"><col style="width:8%"><col style="width:5%"><col style="width:5%"><col style="width:7%"><col style="width:6%"><col style="width:6%"><col style="width:7%"><col style="width:8%"></colgroup><thead><tr><th>#</th><th>Marca grabada · DOT</th><th>Cliente</th><th>OT · boleta</th><th>Medida</th><th>Trabajo</th><th>Resultado</th><th class="n">Est.</th><th class="n">Min.</th><th class="n">Materiales</th><th class="n">Herram.</th><th class="n">M. obra</th><th class="n">Fijos</th><th class="n">Total</th></tr></thead><tbody>' +
    r.items.map(function(i, k) { var c = cub[String(i.ID_CUB)] || {}; return '<tr><td>' + (k + 1) + '</td><td><b>' + pcEsc(i.MARCA) + '</b>' + (i.ROL === 'SUPLENTE' ? ' (sup.)' : '') + pcCubIdent(c) + '</td><td>' + pcEsc(i.CLIENTE || c.CLIENTE || '') + '</td><td>' + pcEsc(pcNroOTrab(c.ID_OTRAB)) + (c.NRO_MANUAL ? ' · ' + pcEsc(c.NRO_MANUAL) : '') + '</td><td>' + pcEsc(i.MEDIDA || '') + '</td><td>' + pcEsc(i.TRABAJO || '') + '</td>' +
      '<td>' + pcEsc(estTxt[i.ESTADO] || i.ESTADO) + (i.PASADA > 1 ? (i.PULIR ? ' · repulida por exceso de material' : ' · reproceso') : '') + '</td><td class="n">' + i.HECHAS.length + '/' + ests.length + '</td><td class="n">' + (i.COSTO.MINUTOS ? Math.round(i.COSTO.MINUTOS) : '') + '</td><td class="n">' + $$(i.COSTO.MATERIALES) + '</td><td class="n">' + $$(i.COSTO.HERRAMENTAL) + '</td><td class="n">' + $$(i.COSTO.MO) + '</td><td class="n">' + $$(i.COSTO.FIJOS) + '</td><td class="n"><b>' + $$(i.COSTO.TOTAL) + '</b></td></tr>'; }).join('') +
    '<tr class="tot"><td colspan="8"><b>Totales</b></td><td class="n">' + Math.round(tot.min) + '</td><td class="n">' + $$(tot.mat) + '</td><td class="n">' + $$(tot.herr) + '</td><td class="n">' + $$(tot.mo) + '</td><td class="n">' + $$(tot.fij) + '</td><td class="n"><b>' + $$(tot.t) + '</b></td></tr></tbody></table>' +
    '<h2>Detalle por cubierta</h2>' +
    r.items.map(function(i) {
      var regs = i.REGISTROS.slice().sort(function(a, b) { return (+a.FECHA || 0) - (+b.FECHA || 0); });
      var cons = (i.CONSUMOS || []).filter(function(k) { return String(k.ESTADO) !== 'ANULADO'; });
      return '<div style="page-break-inside:avoid;border:1px solid #bbb;border-radius:6px;padding:8px;margin-bottom:10px"><div style="font-size:13px;font-weight:700">' + pcMkDot(Object.assign({}, cub[String(i.ID_CUB)] || {}, i)) + ' · ' + pcEsc(i.CLIENTE || '') + ' · ' + pcEsc(i.MEDIDA || '') + ' · ' + pcEsc(estTxt[i.ESTADO] || i.ESTADO) + '</div>' + pcCubIdentLinea(cub[String(i.ID_CUB)] || {}) +
        '<table class="det" style="margin-top:6px"><colgroup><col style="width:20%"><col style="width:10%"><col style="width:16%"><col style="width:14%"><col style="width:40%"></colgroup><thead><tr><th>Estación</th><th>Fecha</th><th>Operario</th><th>Resultado</th><th>Insumos usados</th></tr></thead><tbody>' +
        (regs.length ? regs.map(function(g) {
          var us = cons.filter(function(k) { return String(k.ID_REG) === String(g.ID_REG); }).map(function(k) { var nm = nomI[k.ID_INSUMO] || nomI[k.ID_INSUMO_RECETA] || k.ID_INSUMO || k.ID_INSUMO_RECETA; return +k.NO_USO === 1 ? '<span style="color:#777">' + pcEsc(nm) + ': no se usó (' + pcEsc(k.MOTIVO || '') + ')</span>' : pcEsc(nm) + ': <b>' + (Math.round((+k.REAL || 0) * 1000) / 1000).toString().replace('.', ',') + ' ' + pcEsc(k.UNIDAD || '') + '</b>' + (+k.REEMPLAZO === 1 ? ' (reemplazo)' : ''); });
          return '<tr><td>' + pcEsc(nomE[g.ID_ESTACION] || g.ID_ESTACION) + (g.PASADA > 1 ? ' (corrección)' : '') + '</td><td>' + fmtD(g.FECHA) + '</td><td>' + pcEsc(g.OPERARIO || g.USUARIO || '') + '</td><td>' + pcEsc(g.RESULTADO || '') + (g.OBSERVACION ? ' · ' + pcEsc(g.OBSERVACION) : '') + '</td><td>' + (us.join('<br>') || '—') + '</td></tr>';
        }).join('') : '<tr><td colspan="5" style="color:#777">Todavía no pasó por ninguna estación</td></tr>') + '</tbody></table>' +
        (i.HERRAMENTAL.length ? '<div class="nota">Herramental: ' + i.HERRAMENTAL.map(function(p) { return pcEsc(p.CODIGO) + ' (uso ' + p.NRO_USO + (p.MAX_USOS ? ' de ' + p.MAX_USOS : '') + ')'; }).join(' · ') + '</div>' : '') + '</div>';
    }).join('') +
    '<div class="firmas"><div>Responsable de la carga</div><div>Encargado de línea</div><div>Control final</div></div>';
  pcImprimir('Informe ' + o.NRO_OT, h, true);
}
async function pcImpOS(id) {
  var r = await gsRun('gsPC_OTDetalle', id);
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  var d0 = PC_.d, o0 = d0.ots.filter(function(x) { return String(x.ID_OT) === String(id); })[0] || r.ot;
  if (o0.ESTADO !== 'ARMADA') return pcImpOSInforme(r, o0);
  var d = PC_.d, o = o0, ests = pcEstLin(o0 && o0.LINEA).slice().sort(function(a, b) { return a.ORDEN - b.ORDEN; });
  var cub = {}; d.cubiertas.forEach(function(c) { cub[String(c.ID_CUB)] = c; });
  var h = pcEncImp('ORDEN DE SERVICIO · HOJA DE CARGA', o.NRO_OT) +
    '<div class="dat"><div><b>Línea</b>' + pcEsc(o.LINEA) + '</div><div><b>Fecha</b>' + fmtD(o.FECHA) + '</div><div><b>Responsable</b>' + pcEsc(o.RESPONSABLE || '—') + '</div><div><b>Cubiertas</b>' + r.items.filter(function(i) { return i.ROL === 'TITULAR'; }).length + ' titulares · ' + r.items.filter(function(i) { return i.ROL === 'SUPLENTE'; }).length + ' suplentes</div>' +
    (o.OBSERVACIONES ? '<div style="grid-column:span 4"><b>Observaciones</b>' + pcEsc(o.OBSERVACIONES) + '</div>' : '') + '</div>' +
    '<table><thead><tr><th>#</th><th>Marca grabada</th><th>Rol</th><th>Cliente</th><th>OT · boleta</th><th>Medida</th><th>Trabajo</th>' + ests.map(function(e) { return '<th class="ck" title="' + pcEsc(e.NOMBRE) + '">' + (e.NRO || e.ORDEN) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    r.items.map(function(i, k) { var c = cub[String(i.ID_CUB)] || {}; return '<tr><td>' + (k + 1) + '</td><td><b>' + pcEsc(i.MARCA) + '</b>' + pcCubIdent(c) + '</td><td>' + (i.ROL === 'SUPLENTE' ? 'Suplente' : 'Titular') + '</td><td>' + pcEsc(c.CLIENTE || '') + '</td><td>' + pcEsc(pcNroOTrab(c.ID_OTRAB)) + (c.NRO_MANUAL ? ' · ' + pcEsc(c.NRO_MANUAL) : '') + '</td><td>' + pcEsc(c.MEDIDA || '') + '</td><td>' + pcEsc(c.TRABAJO || '') + '</td>' + ests.map(function() { return '<td class="ck"></td>'; }).join('') + '</tr>'; }).join('') +
    '</tbody></table><div class="nota">Estaciones: ' + ests.map(function(e) { return (e.NRO || e.ORDEN) + ' ' + pcEsc(e.NOMBRE); }).join(' · ') + '</div>' +
    '<div class="firmas"><div>Responsable de la carga</div><div>Encargado de línea</div></div>';
  pcImprimir('Orden de servicio ' + o.NRO_OT, h, true);
}
// N° de orden: lo asigna el sistema (OT-00001…). El N° de una boleta de papel es opcional y va escondido.
function pcProxOT() { var m = 0; ((PC_.d && PC_.d.ordTrabajo) || []).forEach(function(o) { var n = +o.ID_OTRAB || 0; if (n > m) m = n; }); return 'OT-' + String(m + 1).padStart(5, '0'); }
// Dos formas: automático (el sistema pone OT-000xx) o manual (el N° de la boleta de papel del talonario). La elección queda recordada.
function pcNroModo() { if (!PC_.nroModo) { try { PC_.nroModo = localStorage.getItem('pc_nro_modo') || 'AUTO'; } catch (e) { PC_.nroModo = 'AUTO'; } } return PC_.nroModo; }
function pcNroCambiar(m, idIn) {
  PC_.nroModo = m; try { localStorage.setItem('pc_nro_modo', m); } catch (e) {}
  var w = $id(idIn + '-w'); if (w) w.outerHTML = pcNroAuto(idIn);
  var i = $id(idIn); if (i && m === 'MANUAL') i.focus();
}
function pcNroAuto(idIn) {
  var m = pcNroModo();
  return '<div class="fg pc-nro-w" id="' + idIn + '-w"><label class="fl">N° de orden</label>' +
    '<div class="pc-nro-op"><button type="button" class="' + (m === 'AUTO' ? 'on' : '') + '" onclick="pcNroCambiar(\'AUTO\',\'' + idIn + '\')">🤖 Automático</button><button type="button" class="' + (m === 'MANUAL' ? 'on' : '') + '" onclick="pcNroCambiar(\'MANUAL\',\'' + idIn + '\')">📄 Manual (boleta de papel)</button></div>' +
    (m === 'MANUAL'
      ? '<input class="fi" id="' + idIn + '" placeholder="N° de la boleta del talonario" autocomplete="off" oninput="pcBoletaAviso(this.value,\'' + idIn + '-av\')"/><div id="' + idIn + '-av" style="color:#b91c1c;font-size:12px;font-weight:600"></div>'
      : '<div class="fi pc-nro-auto" title="Lo pone el sistema al grabar">' + pcProxOT() + ' <span class="tdim" style="font-weight:400;margin-left:6px">(lo pone el sistema)</span></div><input type="hidden" id="' + idIn + '" value=""/>') + '</div>';
}
function pcNroFalta(idIn) { if (pcNroModo() === 'MANUAL' && !String($v(idIn) || '').trim()) { toast('Escribí el N° de la boleta de papel (o elegí Automático)', 'r2'); var i = $id(idIn); if (i) i.focus(); return true; } return false; }
function pcBoletaAviso(v, idAv) {
  var n = String(v || '').toUpperCase().replace(/\s+/g, ''), el = $id(idAv || 'pc-k-man-av'); if (!el) return;
  var o = n ? (PC_.d.ordTrabajo || []).filter(function(x) { return x.ESTADO !== 'ANULADA' && String(x.NRO_MANUAL || '').toUpperCase().replace(/\s+/g, '') === n; })[0] : null;
  el.textContent = o ? '⚠ La boleta ' + v + ' ya está cargada en la ' + o.NRO + ' (' + o.CLIENTE + ')' : '';
}
function pcCascos() {
  var d = PC_.d;
  if (!PC_.kf.length) PC_.kf = [pcCasVacio()];
  var ult = PC_.ultOT ? (d.ordTrabajo || []).filter(function(o) { return o.NRO === PC_.ultOT; })[0] : null;
  var h = pcAvisoLinea() + (ult ? '<div class="al al-g mb3" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span>✓ Grabada · ' + (ult.NRO_MANUAL ? 'Boleta N° <b style="font-size:18px">' + pcEsc(ult.NRO_MANUAL) + '</b> <span style="font-size:12px">(sistema ' + pcEsc(ult.NRO) + ')</span>' : 'N° de orden <b style="font-size:18px">' + pcEsc(ult.NRO) + '</b>') + ' · ' + pcEsc(ult.CLIENTE) + '<br><span style="font-size:12px">' + (ult.FIRMA_ID ? '✓ Firmada por ' + pcEsc(ult.FIRMA_NOMBRE) + '. Mandale el comprobante al cliente.' : 'Hacé firmar al cliente en la pantalla y mandale el comprobante.') + '</span></span><span class="flex gap2" style="flex-wrap:wrap">' + (ult.FIRMA_ID ? '' : '<button class="btn btn-p btn-sm" onclick="pcFirmaOT(' + ult.ID_OTRAB + ')">✍ Firma del cliente</button>') + '<button class="btn ' + (ult.FIRMA_ID ? 'btn-p' : 'btn-s') + ' btn-sm" onclick="pcImpOTrab(' + ult.ID_OTRAB + ')"><i class="fas fa-file-pdf"></i> Comprobante (PDF)</button></span></div>' : '') +
    '<div class="card mb3"><div class="card-hd"><span class="card-title">Carga de la boleta: cascos y orden de trabajo</span><span class="tdim" style="font-size:12px">Se cargan los cascos con su trabajo y al grabar queda hecha la orden de trabajo.</span></div><div class="card-body">' +
    '<div class="pc-fila3"><div class="fg"><label class="fl">Cliente *</label><input class="fi" id="pc-k-cli" list="pc-clientes" placeholder="Escribí el nombre..." value="' + pcEsc(pcCliTxt(PC_.kcli)) + '"/>' + pcCliList() + '</div>' +
    pcNroAuto('pc-k-man') +
    '<div class="fg"><label class="fl">Fecha</label><input class="fi" type="date" id="pc-k-f" value="' + fechaISO(new Date()) + '"/></div></div>' +
    pcMedidasList() + '<datalist id="pc-fabricantes">' + (d.marcas || []).map(function(m) { return '<option value="' + pcEsc(m) + '">'; }).join('') + '</datalist>' +
    '<div class="tw"><table style="font-size:12px" class="pc-rec" id="pc-k-t"><thead><tr><th style="width:40px">#</th><th>N° interno</th><th>Tipo *</th><th title="La pone el sistema al grabar">Marca grabada</th><th title="El que trae la cubierta. Si no tiene o no se lee, vacío">DOT</th><th>Medida *</th><th>Marca</th><th>Trabajo</th><th>Observaciones</th><th></th></tr></thead><tbody id="pc-k-filas"></tbody></table></div>' +
    '<div id="pc-k-err" class="mt3"></div><div class="flex gap2 mt3"><button class="btn btn-s btn-sm" id="pc-k-mas" onclick="PC_.kf.push(pcCasVacio());pcCasFilas()"><i class="fas fa-plus"></i> Otro casco</button>' +
    '<button class="btn btn-p" id="pc-k-ok" onclick="pcCasGrabar()"><i class="fas fa-save"></i> Grabar boleta</button><span class="tdim" style="font-size:12px;align-self:center">Si dejás el trabajo vacío, el casco queda sin orden y lo asignás después en "2 · Órdenes de trabajo".</span></div></div></div>' +
    '<div class="card"><div class="card-hd"><span class="card-title">Cascos declarados con anterioridad</span><span class="badge b-blue" id="pc-k-n"></span></div><div id="pc-k-ant"></div></div>';
  $id('pc-body').innerHTML = h;
  $id('pc-k-cli').addEventListener('change', function() { var n = pcCliId(this.value); if (n === PC_.kcli) return; PC_.kcli = n; pcCasAnt(); pcCasFilas(); });
  pcCasFilas(); pcCasAnt();
}
// Alta rápida de medida o marca sin salir de la carga de cascos (queda en el maestro y elegida en el renglón)
function pcAltaRapida(que, i) {
  var f = PC_.kf[i] || {}, med = que === 'MEDIDA';
  if (med && !f.TIPO) { toast('Elegí primero el tipo de cubierta del renglón', 'r2'); return; }
  showModal('<div class="mh"><span class="mt">' + (med ? 'Medida nueva' : 'Marca nueva') + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    (med ? '<div class="tdim mb2" style="font-size:12px">Tipo ' + pcEsc(f.TIPO) + ' · línea ' + pcEsc(pcLineaDeTipo(f.TIPO)) + '. Queda en el maestro de medidas.</div>' : '<div class="tdim mb2" style="font-size:12px">Marca de fábrica del casco. Queda en el maestro de marcas.</div>') +
    '<div class="fg"><label class="fl">' + (med ? 'Medida' : 'Marca') + '</label><input class="fi" id="pc-ar-v" value="' + pcEsc(med ? f.MEDIDA || '' : f.MARCA_FAB || '') + '" style="text-transform:uppercase" placeholder="' + (med ? 'Ej.: 295/80R22.5' : 'Ej.: PIRELLI') + '"/></div>' +
    '<button class="btn btn-p mt3" id="pc-ar-ok" onclick="pcAltaRapidaOk(\'' + que + '\',' + i + ')"><i class="fas fa-save"></i> Agregar y usar</button></div>');
  setTimeout(function() { var e = $id('pc-ar-v'); if (e) e.focus(); }, 50);
}
async function pcAltaRapidaOk(que, i) {
  var f = PC_.kf[i], v = String($v('pc-ar-v') || '').trim().toUpperCase(); if (!v) { toast('Escribí el valor', 'r2'); return; }
  var b = $id('pc-ar-ok'); b.disabled = true;
  try {
    var r = await gsRun('gsPC_AltaRapida', que, v, que === 'MEDIDA' ? pcLineaDeTipo(f.TIPO) : '');
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    if (que === 'MEDIDA') { PC_.d.medidas = PC_.d.medidas || []; if (!PC_.d.medidas.some(function(m) { return m.MEDIDA === r.VALOR && m.LINEA === r.LINEA; })) PC_.d.medidas.push({ MEDIDA: r.VALOR, LINEA: r.LINEA }); f.MEDIDA = r.VALOR; }
    else { PC_.d.marcas = PC_.d.marcas || []; if (PC_.d.marcas.indexOf(r.VALOR) === -1) { PC_.d.marcas.push(r.VALOR); PC_.d.marcas.sort(); } f.MARCA_FAB = r.VALOR; }
    toast((r.YA ? 'Ya existía: ' : 'Agregada: ') + r.VALOR + ' ✓', 'g'); closeModal(); pcCascos();
  } catch (e) { toast(e.message, 'r2'); } finally { b.disabled = false; }
}
function pcCasFilasLuego() { clearTimeout(PC_._cft); PC_._cft = setTimeout(pcCasFilas, 0); }
function pcCasFilas() {
  var ae = document.activeElement, tb = $id('pc-k-filas'); if (!tb) return;
  if (ae && tb.contains(ae) && ae.blur) ae.blur();
  pcCasAuto();
  var optT = '<option value="">— sin orden —</option>' + PC_.d.trabajos.filter(function(x) { return x.ACTIVO != 0; }).map(function(x) { return '<option>' + pcEsc(x.TRABAJO) + '</option>'; }).join('');
  var d = PC_.d, opt = '<option value="">—</option>' + d.tipos.filter(function(x) { return x.ACTIVO != 0; }).map(function(x) { return '<option>' + pcEsc(x.TIPO) + '</option>'; }).join('');
  $id('pc-k-filas').innerHTML = PC_.kf.map(function(f, i) {
    return '<tr><td class="mono tc" data-l="Casco">' + (i + 1) + '</td><td class="tdim" data-l="N° interno">auto</td><td data-l="Tipo *"><select class="fs" data-i="' + i + '" data-k="TIPO" style="min-width:115px">' + opt.replace('<option>' + pcEsc(f.TIPO) + '</option>', '<option selected>' + pcEsc(f.TIPO) + '</option>') + '</select></td>' +
      '<td data-l="Marca grabada"><b class="mono" title="La pone el sistema al grabar">' + (f._MK ? pcEsc(f._MK) : '<span class="tdim" style="font-weight:400">elegí el cliente</span>') + '</b></td>' +
      '<td data-l="DOT (si la cubierta lo trae)"><input class="fi" data-i="' + i + '" data-k="DOT" value="' + pcEsc(f.DOT) + '" placeholder="Si no tiene, vacío" style="width:150px;text-transform:uppercase"/></td>' +
      '<td data-l="Medida *"><div class="pc-celda"><input class="fi" list="' + (f.TIPO ? pcMedKey(f.TIPO) : 'pc-medidas') + '" data-i="' + i + '" data-k="MEDIDA" value="' + pcEsc(f.MEDIDA) + '" placeholder="' + (f.TIPO ? '' : 'Elegí el tipo') + '" style="width:140px"/><button class="btn btn-s btn-xs" title="Medida nueva" onclick="pcAltaRapida(\'MEDIDA\',' + i + ')">＋</button></div></td>' +
      '<td data-l="Marca"><div class="pc-celda"><input class="fi" list="pc-fabricantes" data-i="' + i + '" data-k="MARCA_FAB" value="' + pcEsc(f.MARCA_FAB) + '" style="width:130px;text-transform:uppercase"/><button class="btn btn-s btn-xs" title="Marca nueva" onclick="pcAltaRapida(\'MARCA\',' + i + ')">＋</button></div></td>' +
      '<td data-l="Trabajo"><select class="fs" data-i="' + i + '" data-k="TRABAJO" style="min-width:150px">' + (f.TIPO && f.MEDIDA ? pcTrabOpts(f.TIPO, f.MEDIDA, f.TRABAJO, f.MARCA_FAB).replace('— elegí —', '— sin orden —') : optT.replace('<option>' + pcEsc(f.TRABAJO) + '</option>', '<option selected>' + pcEsc(f.TRABAJO) + '</option>')) + '</select></td>' +
      '<td data-l="Observaciones"><input class="fi" data-i="' + i + '" data-k="OBSERVACIONES" value="' + pcEsc(f.OBSERVACIONES) + '" style="min-width:120px"/></td>' +
      '<td>' + (PC_.kf.length > 1 ? '<button class="btn btn-xs btn-d" onclick="PC_.kf.splice(' + i + ',1);pcCasFilas()">✕</button>' : '') + '</td></tr>';
  }).join('');
  document.querySelectorAll('#pc-k-filas [data-i]').forEach(function(e) {
    var fija = function(el) { var f = PC_.kf[+el.dataset.i]; f[el.dataset.k] = el.value; };
    e.addEventListener('change', function() {
      fija(this);
      if (this.dataset.k === 'MEDIDA' && this.value.trim()) { var f = PC_.kf[+this.dataset.i]; if (!f.TIPO) { toast('Primero elegí el tipo', 'r2'); f.MEDIDA = ''; } else if (!pcMedDeTipo(f.TIPO, this.value)) { toast('La medida ' + this.value.toUpperCase() + ' no es de ' + (pcLineaDeTipo(f.TIPO) || f.TIPO).toLowerCase() + '. Si es nueva, agregala con el ＋', 'r2'); f.MEDIDA = ''; } }
      if (this.dataset.k === 'TIPO') { var f2 = PC_.kf[+this.dataset.i]; if (f2.MEDIDA && !pcMedDeTipo(f2.TIPO, f2.MEDIDA)) f2.MEDIDA = ''; }
      if (this.dataset.k === 'TIPO' || this.dataset.k === 'MEDIDA') pcCasFilasLuego();
    });
    e.addEventListener('input', function() { fija(this); });
  });
}
var PC_CAS_EST = { NUEVO: ['b-orange', 'Sin orden de trabajo'], EN_OT: ['b-blue', 'En orden de trabajo'], ANULADO: ['b-gray', 'Anulado'] };
function pcCasAnt() {
  var el = $id('pc-k-ant'); if (!el) return;
  var cli = PC_.kcli, ks = (PC_.d.cascos || []).filter(function(k) { return cli && String(k.ID_CLIENTE) === String(cli) && (k.ESTADO === 'NUEVO' || k.ESTADO === 'EN_OT'); }).sort(function(a, b) { return b.ID_CASCO - a.ID_CASCO; });
  $id('pc-k-n').textContent = cli ? ks.length + ' en curso' : '';
  if (!cli) { el.innerHTML = '<div class="tdim" style="padding:12px">Elegí el cliente y acá aparecen sus cascos que todavía están en curso. Lo anterior está en "Historial".</div>'; return; }
  el.innerHTML = '<div class="tw"><table style="font-size:12px" id="pc-k-tant"><thead><tr><th>N° interno</th><th>Marca grabada</th><th>Fecha</th><th>Tipo</th><th>DOT</th><th>Medida</th><th>Marca</th><th>Estado</th><th></th></tr></thead><tbody>' +
    (ks.length ? ks.map(function(k) { var e = PC_CAS_EST[k.ESTADO] || ['b-gray', k.ESTADO];
      return '<tr' + (k.ESTADO === 'ANULADO' ? ' style="opacity:.5"' : '') + '><td class="mono"><b>' + k.ID_CASCO + '</b></td><td class="mono"><b>' + pcEsc(k.MARCA || '') + '</b></td><td>' + fmtD(+k.FECHA) + '</td><td>' + pcEsc(k.TIPO) + '</td><td class="mono">' + pcDotTxt(k.DOT) + (pcPuede('EDITAR') ? ' <button class="btn btn-s btn-xs" title="Cargar o corregir el DOT" onclick="pcDotEditar(' + k.ID_CASCO + ')">✎</button>' : '') + '</td><td class="mono">' + pcEsc(k.MEDIDA) + '</td><td>' + pcEsc(k.MARCA_FAB) + '</td>' +
        '<td><span class="badge ' + e[0] + '">' + e[1] + '</span>' + (k.ID_OTRAB ? ' <span class="mono" style="font-size:11px">' + pcEsc(pcNroOTrab(k.ID_OTRAB)) + '</span>' : '') + '</td>' +
        '<td>' + (k.ESTADO === 'NUEVO' && pcPuede('ANULAR') ? '<button class="btn btn-s btn-xs" onclick="pcCasAnular(' + k.ID_CASCO + ')">Anular</button>' : '') + '</td></tr>'; }).join('') : '<tr><td colspan="9" class="tc tdim" style="padding:16px">Este cliente todavía no tiene cascos cargados.</td></tr>') + '</tbody></table></div>';
}
// Cargar o corregir el DOT de un casco (el que trae la cubierta). Vacío = sin DOT.
function pcDotEditar(idCasco) {
  var k = (PC_.d.cascos || []).filter(function(x) { return String(x.ID_CASCO) === String(idCasco); })[0]; if (!k) return;
  showModal('<div class="mh"><span class="mt">DOT del casco N° interno ' + k.ID_CASCO + (k.MARCA ? ' · marca grabada ' + pcEsc(k.MARCA) : '') + '</span><button class="mc" onclick="closeModal()">×</button></div>' +
    '<div class="mb2"><div class="fg"><label class="fl">DOT (el que trae la cubierta; vacío si no tiene)</label><input class="fi" id="pc-dot-v" value="' + pcEsc(k.DOT || '') + '" style="text-transform:uppercase;font-size:18px"/></div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pc-dot-ok" onclick="pcDotGuardar(' + k.ID_CASCO + ')">Guardar</button></div>');
  setTimeout(function() { var i = $id('pc-dot-v'); if (i) i.focus(); }, 50);
}
async function pcDotGuardar(idCasco) {
  var b = $id('pc-dot-ok'); b.disabled = true;
  try { var r = await gsRun('gsPC_DotCorregir', idCasco, $v('pc-dot-v'));
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); b.disabled = false; return; }
    closeModal(); toast('DOT guardado ✓', 'g'); await pcRecargar();
  } catch (e) { toast(e.message, 'r2'); b.disabled = false; }
}
function pcCasErr(msg) { var e = $id('pc-k-err'); if (!e) { if (msg) toast(msg, 'r2'); return; } e.innerHTML = msg ? '<div class="al al-r"><span><b>No se grabó:</b> ' + pcEsc(msg) + '</span><button class="btn btn-xs btn-s" onclick="pcCasErr(\'\')">✕</button></div>' : ''; if (msg) e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
async function pcCasGrabar() {
  pcCasErr('');
  var cli = pcCliId($v('pc-k-cli')); if (!cli) { pcCasErr('Elegí el cliente'); return; }
  var faltan = []; PC_.kf.forEach(function(f, i) { if (!f.TIPO || !f.MEDIDA) faltan.push(i + 1); });
  if (faltan.length) { pcCasErr('Casco ' + faltan.join(', ') + ': falta el tipo o la medida'); return; }
  var sinR = PC_.kf.filter(function(f) { return f.TRABAJO && !pcRecetaDe(f.TIPO, f.MEDIDA, f.TRABAJO, '', f.MARCA_FAB); });
  if (sinR.length) { pcCasErr('Casco ' + sinR.map(function(f) { return (PC_.kf.indexOf(f) + 1) + ' (' + (f._MK || f.DOT || '?') + ')'; }).join(', ') + ': ese trabajo no tiene receta para esa medida. Elegí uno de los de arriba de la lista (con receta) o dejalo sin orden'); return; }
  if (pcNroFalta('pc-k-man')) return;
  var b = $id('pc-k-ok'); b.disabled = true;
  try {
    var r = await gsRun('gsPC_CascosGuardar', { ID_CLIENTE: cli, FECHA: $v('pc-k-f'), NRO_MANUAL: $v('pc-k-man'), CASCOS: PC_.kf });
    if (!r || !r.ok) { pcCasErr((r && r.error) || 'No se pudo'); return; }
    toast('Grabados ' + r.IDS.length + ' cascos · marcas ' + (r.MARCAS || r.DOTS || []).join(', ') + (r.OT ? ' · orden de trabajo ' + r.OT + ' con ' + r.OT_N + ' cubiertas' : '') + (r.SIN_RECETA ? ' · ' + r.SIN_RECETA + ' sin receta' : '') + ' ✓', r.SIN_RECETA ? 'r2' : 'g');
    PC_.kf = []; PC_.kcli = cli; PC_.kman = ''; PC_.ultOT = r.OT || ''; await pcRecargar(); var gOk = document.querySelector('#pc-body .al.al-g'); if (gOk) gOk.scrollIntoView({ block: 'center', behavior: 'smooth' });
  } catch (e) { pcCasErr(e.message); } finally { b.disabled = false; }
}
async function pcCasAnular(id) {
  var m = await uiPedir('¿Por qué se anula el casco ' + id + '?', { obligatorio: true }); if (m === null) return;
  var r = await gsRun('gsPC_CascoAnular', id, m); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast('Anulado ✓', 'g'); pcRecargar();
}
// ================================================================
// 2. ORDEN DE TRABAJO (por cliente: se descargan solos sus cascos nuevos y a cada uno se le pone el trabajo)
// ================================================================
function pcOTrab() {
  var d = PC_.d;
  var h = pcAvisoLinea() + '<div class="card mb3"><div class="card-hd"><span class="card-title">Nueva orden de trabajo</span><span class="tdim" style="font-size:12px">Los cascos nuevos del cliente se descargan solos.</span></div><div class="card-body">' +
    '<div class="pc-fila4"><div class="fg"><label class="fl">Cliente *</label><input class="fi" id="pc-o-cli" list="pc-clientes" placeholder="Escribí el nombre..." value="' + pcEsc(pcCliTxt(PC_.ocli)) + '"/>' + pcCliList() + '</div>' +
    pcNroAuto('pc-o-man') +
    '<div class="fg"><label class="fl">Fecha</label><input class="fi" type="date" id="pc-o-f" value="' + fechaISO(new Date()) + '"/></div>' +
    '<div class="fg"><label class="fl">Observaciones</label><input class="fi" id="pc-o-obs"/></div></div><div id="pc-o-items"></div>' +
    '<button class="btn btn-p mt3" id="pc-o-ok" onclick="pcOTrabGrabar()"><i class="fas fa-save"></i> Grabar orden de trabajo</button></div></div>';
  // Clientes con cascos sin orden: un clic y se cargan
  var sinO = {}; (d.cascos || []).forEach(function(k) { if (k.ESTADO === 'NUEVO') { var n0 = k.CLIENTE || pcCliTxt(k.ID_CLIENTE); sinO[k.ID_CLIENTE] = sinO[k.ID_CLIENTE] || { n: 0, nom: n0 }; sinO[k.ID_CLIENTE].n++; } });
  var ks0 = Object.keys(sinO);
  h = pcAvisoLinea() + (ks0.length ? '<div class="card mb3"><div class="card-body"><div class="fl mb2">Cascos sin orden de trabajo (tocá el cliente)</div><div class="flex gap2" style="flex-wrap:wrap">' +
    ks0.map(function(id) { return '<button class="btn ' + (String(PC_.ocli) === String(id) ? 'btn-p' : 'btn-s') + ' btn-sm" onclick="PC_.ocli=\'' + id + '\';PC_.otr={};pcOTrab()">' + pcEsc(sinO[id].nom) + ' (' + sinO[id].n + ')</button>'; }).join('') + '</div></div></div>' :
    '<div class="al al-g mb3">No hay cascos sin orden de trabajo: todo lo cargado ya tiene su orden.</div>') + h.slice(pcAvisoLinea().length);
  // Solo las órdenes de trabajo que tienen cubiertas esperando o en la línea
  var lo = (d.ordTrabajo || []).filter(function(o) { return o.ESTADO !== 'ANULADA'; }).map(function(o) {
    var mias = d.cubiertas.filter(function(c) { return String(c.ID_OTRAB) === String(o.ID_OTRAB) && c.ESTADO !== 'ANULADA'; });
    return { o: o, mias: mias, pend: mias.filter(function(c) { return c.ESTADO === 'EN_ESPERA'; }).length, linea: mias.filter(function(c) { return c.ESTADO === 'EN_OT'; }).length };
  }).filter(function(x) { return x.pend || x.linea; }).sort(function(a, b) { return b.o.ID_OTRAB - a.o.ID_OTRAB; });
  h += '<div class="card"><div class="card-hd"><span class="card-title">Órdenes de trabajo en curso (' + lo.length + ')</span><span class="tdim" style="font-size:12px">Las terminadas y anuladas están en "Historial"</span></div><div class="tw"><table style="font-size:12px" id="pc-o-lista"><thead><tr><th>N° de orden</th><th>Fecha</th><th>Cliente</th><th>Sistema</th><th class="tr">Cubiertas</th><th class="tr">Esperando</th><th class="tr">En la línea</th><th>Parche</th><th></th></tr></thead><tbody>' +
    (lo.length ? lo.map(function(x) { var o = x.o;
      return '<tr><td class="mono"><b>' + pcEsc(o.NRO_MANUAL ? 'Boleta ' + o.NRO_MANUAL : o.NRO) + '</b></td><td>' + fmtD(+o.FECHA) + '</td><td>' + pcEsc(o.CLIENTE) + '</td><td class="mono">' + pcEsc(o.NRO_MANUAL ? o.NRO : '—') + '</td><td class="tr">' + x.mias.length + '</td><td class="tr">' + x.pend + '</td><td class="tr">' + x.linea + '</td><td style="white-space:nowrap">' + pcParcheBadge(o) + (x.mias.filter(function(c) { return String(c.PARCHE_INCLUIDO || ''); }).length ? ' <span class="badge b-orange">' + x.mias.filter(function(c) { return String(c.PARCHE_INCLUIDO || ''); }).length + (x.mias.filter(function(c) { return String(c.PARCHE_INCLUIDO || ''); }).length === 1 ? ' excepción' : ' excepciones') + '</span>' : '') + ' <button class="btn btn-s btn-xs" onclick="pcParcheForm(' + o.ID_OTRAB + ')">Cambiar</button></td>' +
        '<td style="white-space:nowrap"><button class="btn btn-s btn-xs" title="Imprimir" onclick="pcImpOTrab(' + o.ID_OTRAB + ')"><i class="fas fa-print"></i></button> ' + (pcPuede('ANULAR') && x.pend === x.mias.length ? '<button class="btn btn-s btn-xs" onclick="pcOTrabAnular(' + o.ID_OTRAB + ')">Anular</button>' : '') + '</td></tr>'; }).join('') : '<tr><td colspan="9" class="tc tdim" style="padding:16px">No hay órdenes de trabajo en curso.</td></tr>') + '</tbody></table></div></div>';
  $id('pc-body').innerHTML = h;
  $id('pc-o-cli').addEventListener('change', function() { var n = pcCliId(this.value); if (n === PC_.ocli) return; PC_.ocli = n; PC_.otr = {}; pcOTrabItems(); });
  pcOTrabItems();
}
function pcOTrabItems() {
  var d = PC_.d, el = $id('pc-o-items'), cli = PC_.ocli;
  if (!cli) { el.innerHTML = '<div class="tdim" style="padding:8px 0">Elegí el cliente y se descargan sus cascos nuevos.</div>'; return; }
  var ks = (d.cascos || []).filter(function(k) { return String(k.ID_CLIENTE) === String(cli) && k.ESTADO === 'NUEVO'; }).sort(function(a, b) { return a.ID_CASCO - b.ID_CASCO; });
  if (!ks.length) { el.innerHTML = '<div class="al al-y" style="margin-top:8px">Este cliente no tiene cascos nuevos. Primero cargalos en "1 · Carga de cascos".</div>'; return; }
  var opt = function(v, k) { return pcTrabOpts(k.TIPO, k.MEDIDA, v, k.MARCA_FAB); };
  el.innerHTML = '<div class="tw"><table style="font-size:12px" id="pc-o-t"><thead><tr><th style="width:30px"></th><th>N° interno · marca grabada</th><th>DOT</th><th>Tipo</th><th>Medida</th><th>Marca</th><th>Trabajo *</th><th>Receta</th></tr></thead><tbody>' + ks.map(function(k) {
    var x = PC_.otr[k.ID_CASCO] || (PC_.otr[k.ID_CASCO] = { on: true, tr: 'RECAPADO' }), r = x.tr ? pcRecetaDe(k.TIPO, k.MEDIDA, x.tr, '', k.MARCA_FAB) : null;
    return '<tr><td><input type="checkbox" class="pc-o-on" data-id="' + k.ID_CASCO + '"' + (x.on ? ' checked' : '') + '/></td><td class="mono"><b>' + k.ID_CASCO + '</b>' + (k.MARCA ? '<div style="font-size:11px">Marca grabada <b>' + pcEsc(k.MARCA) + '</b></div>' : '') + '</td><td class="mono">' + pcDotTxt(k.DOT) + '</td><td>' + pcEsc(k.TIPO) + '</td><td class="mono">' + pcEsc(k.MEDIDA) + '</td><td>' + pcEsc(k.MARCA_FAB) + '</td>' +
      '<td><select class="fs pc-o-tr" data-id="' + k.ID_CASCO + '" style="min-width:170px">' + opt(x.tr, k) + '</select></td><td>' + (x.tr ? (r ? '<span class="badge b-green">✓ receta ' + r.ID_RECETA + '</span>' : '<span class="badge b-red">sin receta</span>') : '') + '</td></tr>';
  }).join('') + '</tbody></table></div>';
  document.querySelectorAll('.pc-o-on').forEach(function(c) { c.onchange = function() { PC_.otr[this.dataset.id].on = this.checked; }; });
  document.querySelectorAll('.pc-o-tr').forEach(function(c) { c.onchange = function() { PC_.otr[this.dataset.id].tr = this.value; pcOTrabItems(); }; });
}
async function pcOTrabGrabar() {
  var cli = pcCliId($v('pc-o-cli')); if (!cli) { toast('Elegí el cliente', 'r2'); return; }
  var items = Object.keys(PC_.otr).filter(function(k) { return PC_.otr[k].on && (PC_.d.cascos || []).some(function(c) { return String(c.ID_CASCO) === k && String(c.ID_CLIENTE) === String(cli) && c.ESTADO === 'NUEVO'; }); }).map(function(k) { return { ID_CASCO: k, TRABAJO: PC_.otr[k].tr }; });
  var sinR = items.filter(function(it) { var k = (PC_.d.cascos || []).filter(function(c) { return String(c.ID_CASCO) === String(it.ID_CASCO); })[0]; return !it.TRABAJO || !k || !pcRecetaDe(k.TIPO, k.MEDIDA, it.TRABAJO, '', k.MARCA_FAB); });
  if (sinR.length) { toast('Casco ' + sinR.map(function(it) { return it.ID_CASCO; }).join(', ') + ': ese trabajo no tiene receta para esa medida. Elegí uno de la lista de arriba (con receta)', 'r2'); return; }
  if (pcNroFalta('pc-o-man')) return;
  var b = $id('pc-o-ok'); b.disabled = true;
  try {
    var r = await gsRun('gsPC_OTrabCrear', { ID_CLIENTE: cli, FECHA: $v('pc-o-f'), NRO_MANUAL: $v('pc-o-man'), OBSERVACIONES: $v('pc-o-obs'), ITEMS: items });
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Orden de trabajo ' + r.NRO + ': ' + r.N + ' cubiertas pendientes ✓' + (r.SIN_RECETA ? ' · ' + r.SIN_RECETA + ' sin receta' : ''), r.SIN_RECETA ? 'r2' : 'g');
    PC_.otr = {}; PC_.ocli = ''; await pcRecargar();
  } catch (e) { toast(e.message, 'r2'); } finally { b.disabled = false; }
}
async function pcOTrabAnular(id) {
  var m = await uiPedir('¿Por qué se anula la orden de trabajo?', { obligatorio: true }); if (m === null) return;
  var r = await gsRun('gsPC_OTrabAnular', id, m); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast('Anulada: los cascos vuelven a "sin orden" ✓', 'g'); pcRecargar();
}
// ================================================================
// RECHAZADAS (no aptas en la inspección): para devolver al cliente y control por cliente
// ================================================================
function pcRechazadas() {
  var d = PC_.d, rs = d.cubiertas.filter(function(c) { return c.ESTADO === 'RECHAZADA'; }).sort(function(a, b) { return (+b.FECHA_RECHAZO || 0) - (+a.FECHA_RECHAZO || 0); });
  var porCli = {};
  (d.cascos || []).forEach(function(k) { if (k.ESTADO === 'ANULADO') return; var x = porCli[k.CLIENTE] || (porCli[k.CLIENTE] = { c: 0, r: 0, dv: 0 }); x.c++; });
  rs.forEach(function(c) { var x = porCli[c.CLIENTE] || (porCli[c.CLIENTE] = { c: 0, r: 0, dv: 0 }); x.r++; if (!c.FECHA_DEVOLUCION) x.dv++; });
  var cl = Object.keys(porCli).filter(function(k) { return porCli[k].r || porCli[k].c; }).sort(function(a, b) { return porCli[b].r - porCli[a].r || a.localeCompare(b); });
  var h = '<div class="card mb3"><div class="card-hd"><span class="card-title">Por cliente: cuántas no son aptas para precurado</span></div><div class="tw"><table style="font-size:12px" id="pc-r-cli"><thead><tr><th>Cliente</th><th class="tr">Cascos cargados</th><th class="tr">No aptas</th><th class="tr">% no aptas</th><th class="tr">A devolver</th></tr></thead><tbody>' +
    (cl.length ? cl.map(function(k) { var x = porCli[k]; return '<tr><td><b>' + pcEsc(k) + '</b></td><td class="tr mono">' + x.c + '</td><td class="tr mono">' + x.r + '</td><td class="tr mono">' + (x.c ? Math.round(x.r * 100 / x.c) + '%' : '—') + '</td><td class="tr">' + (x.dv ? '<span class="badge b-orange">' + x.dv + '</span>' : '0') + '</td></tr>'; }).join('') : '<tr><td colspan="5" class="tc tdim" style="padding:16px">Sin datos todavía.</td></tr>') + '</tbody></table></div></div>';
  h += '<div class="card"><div class="card-hd"><span class="card-title">Cubiertas no aptas (' + rs.length + ')</span>' + (pcPuede('EDITAR') ? '<button class="btn btn-p btn-sm" id="pc-r-dev" onclick="pcDevolver()"><i class="fas fa-file-alt"></i> Remito de devolución</button>' : '') + '</div>' +
    '<div class="tw"><table style="font-size:12px" id="pc-r-t"><thead><tr><th style="width:30px"></th><th>Fecha</th><th>Cliente</th><th>N° interno</th><th>DOT</th><th>Marca grabada</th><th>Tipo</th><th>Medida</th><th>Trabajo</th><th>Motivo</th><th>Estado</th></tr></thead><tbody>' +
    (rs.length ? rs.map(function(c) { return '<tr><td>' + (c.FECHA_DEVOLUCION ? '' : '<input type="checkbox" class="pc-r-on" data-id="' + c.ID_CUB + '"' + (PC_.dsel[c.ID_CUB] ? ' checked' : '') + '/>') + '</td><td>' + fmtD(+c.FECHA_RECHAZO || +c.FECHA_ESTADO) + '</td><td>' + pcEsc(c.CLIENTE) + '</td><td class="mono">' + pcEsc(c.ID_CASCO || '') + '</td><td class="mono">' + pcDotTxt(c.DOT) + '</td><td class="mono"><b>' + pcEsc(c.MARCA) + '</b></td><td>' + pcEsc(c.TIPO) + '</td><td class="mono">' + pcEsc(c.MEDIDA) + '</td><td>' + pcEsc(c.TRABAJO) + '</td>' +
      '<td style="max-width:240px">' + pcEsc(c.MOTIVO_RECHAZO || '') + '</td><td>' + (c.FECHA_DEVOLUCION ? '<span class="badge b-green">Devuelta ' + fmtD(+c.FECHA_DEVOLUCION) + '</span>' : '<span class="badge b-orange">A devolver</span>') + '</td></tr>'; }).join('') : '<tr><td colspan="11" class="tc tdim" style="padding:16px">No hay cubiertas rechazadas.</td></tr>') + '</tbody></table></div></div>';
  $id('pc-body').innerHTML = h;
  document.querySelectorAll('.pc-r-on').forEach(function(c) { c.onchange = function() { if (this.checked) PC_.dsel[this.dataset.id] = 1; else delete PC_.dsel[this.dataset.id]; }; });
}
async function pcDevolver() {
  var ids = Object.keys(PC_.dsel); if (!ids.length) { toast('Tildá las que se devuelven', 'r2'); return; }
  var b = $id('pc-r-dev'); if (b) b.disabled = true;
  try {
    var r = await gsRun('gsPC_RemitoDevolucion', ids, ''); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    PC_.dsel = {}; toast('Remito ' + r.NROS.join(', ') + ' ✓ · imprimilo: el QR es para cargar la foto firmada', 'g'); await pcRecargar(); pcRemitosLista(r.REMITOS);
  } catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}

// ── Recepción ──
function pcFilaVacia() { return { MARCA: '', TIPO: '', MEDIDA: '', FABRICANTE: '', MODELO: '', TRABAJO: '', ID_BANDA: '', OBSERVACIONES: '' }; }
function pcRecepcion() {
  var d = PC_.d;
  if (!PC_.filas.length) PC_.filas = [pcFilaVacia()];
  var medidas = {}; d.recetas.forEach(function(r) { medidas[r.MEDIDA] = true; });
  var auto = +d.param.MARCA_AUTO === 1;
  var h = '<div class="card mb3"><div class="card-hd"><span class="card-title">Recibir cubiertas</span></div><div class="card-body">' +
    '<div class="fr"><div class="fg"><label class="fl">Cliente *</label><input class="fi" id="pc-cli" list="pc-clientes" placeholder="Escribí el nombre..."/><datalist id="pc-clientes">' + d.clientes.map(function(c) { return '<option value="' + pcEsc(c.ID_CLIENTE + ' — ' + c.NOMBRE) + '">'; }).join('') + '</datalist></div>' +
    '<div class="fg"><label class="fl">Fecha</label><input class="fi" type="date" id="pc-fecha" value="' + fechaISO(new Date()) + '"/></div></div>' +
    pcMedidasList() +
    '<datalist id="pc-fabricantes">' + (d.marcas || []).map(function(m) { return '<option value="' + pcEsc(m) + '">'; }).join('') + '</datalist>' +
    '<div class="tw"><table style="font-size:12px" class="pc-rec"><thead><tr><th>Marca' + (auto ? ' (vacía = auto)' : ' *') + '</th><th>Tipo *</th><th>Medida *</th><th>Trabajo *</th><th>Banda</th><th>Fabricante</th><th>Modelo</th><th>Receta</th><th></th></tr></thead><tbody id="pc-filas"></tbody></table></div>' +
    '<div class="flex gap2 mt3"><button class="btn btn-s btn-sm" onclick="PC_.filas.push(pcFilaVacia());pcFilas()"><i class="fas fa-plus"></i> Otra cubierta</button>' +
    '<button class="btn btn-p" id="pc-recibir" onclick="pcRecibir()"><i class="fas fa-check"></i> Recibir</button></div></div></div>';
  var esp = d.cubiertas.filter(function(c) { return c.ESTADO === 'EN_ESPERA'; });
  h += '<div class="card"><div class="card-hd"><span class="card-title">En espera (' + esp.length + ')</span></div><div class="tw"><table style="font-size:12px" id="pc-tbl-espera"><thead><tr><th>Marca grabada · DOT</th><th>Recibida</th><th>Cliente</th><th>Tipo</th><th>Medida</th><th>Trabajo</th><th>Receta</th><th></th></tr></thead><tbody>' +
    esp.map(function(c) { return '<tr><td class="mono"><b>' + pcEsc(c.MARCA) + '</b><div style="font-size:11px">DOT: ' + pcDotTxt(c.DOT) + '</div></td><td>' + fmtD(c.FECHA_RECEPCION) + '</td><td>' + pcEsc(c.CLIENTE) + '</td><td>' + pcEsc(c.TIPO) + '</td><td class="mono">' + pcEsc(c.MEDIDA) + '</td><td>' + pcEsc(c.TRABAJO) + '</td><td>' + (c.ID_RECETA ? '✓' : '<span class="badge b-red">sin receta</span>') + '</td>' +
      '<td>' + (pcPuede('ANULAR') ? '<button class="btn btn-s btn-sm" onclick="pcAnularCub(' + c.ID_CUB + ')">Anular</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table>' + (esp.length ? '' : '<div class="tdim" style="padding:12px">No hay cubiertas en espera.</div>') + '</div></div>';
  $id('pc-body').innerHTML = h;
  pcFilas();
}
// Modelos ya usados con ese fabricante (y esa medida primero): así casi no se escribe
function pcModelosDe(fab, med) {
  var F = String(fab || '').toUpperCase().trim(), M = String(med || '').toUpperCase().replace(/\s+/g, ''), a = {}, b = {};
  (PC_.d.cubiertas || []).forEach(function(c) {
    var mo = String(c.MODELO || '').toUpperCase().trim(); if (!mo) return;
    if (F && String(c.FABRICANTE || '').toUpperCase().trim() !== F) return;
    if (M && String(c.MEDIDA || '').toUpperCase().replace(/\s+/g, '') === M) a[mo] = true; else b[mo] = true;
  });
  return Object.keys(a).sort().concat(Object.keys(b).filter(function(x) { return !a[x]; }).sort());
}
function pcFilas() {
  var d = PC_.d;
  var opt = function(lista, campo, v) { return '<option value="">—</option>' + lista.filter(function(x) { return x.ACTIVO != 0; }).map(function(x) { return '<option' + (x[campo] === v ? ' selected' : '') + '>' + pcEsc(x[campo]) + '</option>'; }).join(''); };
  $id('pc-filas').innerHTML = PC_.filas.map(function(f, i) {
    var r = f.TIPO && f.MEDIDA && f.TRABAJO ? pcRecetaDe(f.TIPO, f.MEDIDA, f.TRABAJO, f.ID_BANDA, f.FABRICANTE) : null;
    return '<tr><td><input class="fi" data-i="' + i + '" data-k="MARCA" value="' + pcEsc(f.MARCA) + '" style="width:110px;text-transform:uppercase"/></td>' +
      '<td><select class="fs" data-i="' + i + '" data-k="TIPO" style="min-width:115px">' + opt(d.tipos, 'TIPO', f.TIPO) + '</select></td>' +
      '<td><input class="fi" list="' + (f.TIPO ? pcMedKey(f.TIPO) : 'pc-medidas') + '" data-i="' + i + '" data-k="MEDIDA" value="' + pcEsc(f.MEDIDA) + '" style="width:95px"/></td>' +
      '<td><select class="fs" data-i="' + i + '" data-k="TRABAJO" style="min-width:150px;max-width:220px">' + opt(d.trabajos, 'TRABAJO', f.TRABAJO) + '</select></td>' +
      '<td><select class="fs" style="min-width:95px;max-width:130px" data-i="' + i + '" data-k="ID_BANDA"><option value="">—</option>' + d.bandas.map(function(b) { return '<option value="' + pcEsc(b.ID_INSUMO) + '"' + (b.ID_INSUMO === f.ID_BANDA ? ' selected' : '') + '>' + pcEsc(b.ID_INSUMO) + '</option>'; }).join('') + '</select></td>' +
      '<td><input class="fi" list="pc-fabricantes" data-i="' + i + '" data-k="FABRICANTE" value="' + pcEsc(f.FABRICANTE) + '" placeholder="Elegí" style="width:115px;text-transform:uppercase"/></td>' +
      '<td><input class="fi" list="pc-modelos-' + i + '" data-i="' + i + '" data-k="MODELO" value="' + pcEsc(f.MODELO) + '" placeholder="Elegí" style="width:105px;text-transform:uppercase"/><datalist id="pc-modelos-' + i + '">' + pcModelosDe(f.FABRICANTE, f.MEDIDA).map(function(m) { return '<option value="' + pcEsc(m) + '">'; }).join('') + '</datalist></td>' +
      '<td>' + (f.TIPO && f.MEDIDA && f.TRABAJO ? (r ? '<span class="badge b-green">✓ receta ' + r.ID_RECETA + '</span>' : '<span class="badge b-red">sin receta</span>') : '') + '</td>' +
      '<td>' + (PC_.filas.length > 1 ? '<button class="btn btn-xs btn-d" onclick="PC_.filas.splice(' + i + ',1);pcFilas()">✕</button>' : '') + '</td></tr>';
  }).join('');
  document.querySelectorAll('#pc-filas [data-i]').forEach(function(e) {
    e.addEventListener('change', function() { var k = this.dataset.k, v = (k === 'FABRICANTE' || k === 'MODELO') ? this.value.toUpperCase().trim() : this.value; PC_.filas[+this.dataset.i][k] = v; if (k !== 'MARCA' && k !== 'MODELO') setTimeout(pcFilas, 0); });
  });
}
async function pcRecibir() {
  var cli = $v('pc-cli').split(' — ')[0].trim();
  if (!cli) { toast('Elegí el cliente', 'r2'); return; }
  var lista = PC_.filas.map(function(f) { var o = {}; for (var k in f) o[k] = f[k]; o.ID_CLIENTE = cli; o.FECHA = $v('pc-fecha'); return o; });
  var b = $id('pc-recibir'); b.disabled = true;
  try {
    var r = await gsRun('gsPC_Recibir', lista);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    var sin = r.cubiertas.filter(function(c) { return c.SIN_RECETA; }).length;
    toast('Recibidas ' + r.cubiertas.length + ': ' + r.cubiertas.map(function(c) { return c.MARCA; }).join(', ') + (sin ? ' — ' + sin + ' sin receta' : '') + ' ✓', 'g');
    PC_.filas = [];
    await pcRecargar();
  } catch (e) { toast('Error: ' + e.message, 'r2'); }
  finally { b.disabled = false; }
}
async function pcAnularCub(id) {
  if (!(await uiConfirmar('¿Anular esta recepción? No se borra.', 'Sí, anular'))) return;
  var r = await gsRun('gsPC_AnularCubierta', id, 'anulada desde recepción');
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast('Anulada ✓', 'g'); pcRecargar();
}
// ── Parche incluido en el recapado: por orden de trabajo (la toma del cliente) ──
// Lo que vale para una cubierta: su excepción si la tiene; si no, la de su orden de trabajo
function pcParcheCub(c, o) { var v = String(c && c.PARCHE_INCLUIDO || '').toUpperCase(); return { PARCHE_INCLUIDO: v === 'SI' || v === 'NO' ? v : (o && o.PARCHE_INCLUIDO) }; }
function pcParcheTxt(o) { return String(o && o.PARCHE_INCLUIDO || '').toUpperCase() === 'SI' ? 'Parche incluido en el recapado' : 'Parche: se cobra'; }
function pcParcheBadge(o) { var si = String(o && o.PARCHE_INCLUIDO || '').toUpperCase() === 'SI'; return '<span class="badge ' + (si ? 'b-green' : 'b-gray') + '">' + (si ? 'Incluido' : 'Se cobra') + '</span>'; }
// En el remito (sin precios): si la cubierta llevó parche, dice si va incluido en el recapado o se cobra
function pcParcheRemito(idCub) {
  var c = (PC_.d.cubiertas || []).filter(function(x) { return String(x.ID_CUB) === String(idCub); })[0]; if (!c) return '';
  var p = []; try { p = JSON.parse(c.PARCHES || '[]'); } catch (e) { p = []; }
  if (!p.length) return '';
  var o = (PC_.d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(c.ID_OTRAB); })[0];
  return '<div style="font-size:9px;color:#444">' + pcEsc(pcParcheTxt(pcParcheCub(c, o))) + '</div>';
}
function pcParcheForm(id) {
  var o = (PC_.d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(id); })[0]; if (!o) return;
  var si = String(o.PARCHE_INCLUIDO || '').toUpperCase() === 'SI';
  showModal('<div class="mh"><span class="mt">Parche · ' + pcEsc(o.NRO) + ' · ' + pcEsc(o.CLIENTE) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="al al-b mb2">Ahora: <b>' + pcEsc(pcParcheTxt(o)) + '</b>. El remito no lleva precios: dice si el parche va incluido o se cobra, y la factura lo pone a $0 o con su precio.</div>' +
    '<div class="fr"><div class="fg"><label class="fl">El parche</label><select class="fs" id="pc-pa-v"><option value="SI"' + (si ? '' : ' selected') + '>Va incluido en el precio del recapado ($0)</option><option value="NO"' + (si ? ' selected' : '') + '>Se cobra aparte</option></select></div>' +
    '<div class="fg"><label class="fl">Para</label><select class="fs" id="pc-pa-a" onchange="$id(\'pc-pa-cw\').style.display=this.value===\'CUBIERTA\'?\'\':\'none\'"><option value="CLIENTE">Este cliente, de ahora en más (y esta orden)</option><option value="OT">Solo esta orden de trabajo</option><option value="CUBIERTA">Una cubierta (excepción)</option></select></div></div>' +
    '<div class="fg" id="pc-pa-cw" style="display:none"><label class="fl">Cubierta</label><select class="fs" id="pc-pa-cub">' + (PC_.d.cubiertas || []).filter(function(c) { return String(c.ID_OTRAB) === String(id) && c.ESTADO !== 'ANULADA'; }).map(function(c) { var x = String(c.PARCHE_INCLUIDO || '').toUpperCase(); return '<option value="' + c.ID_CUB + '">N° int. ' + pcEsc(c.ID_CASCO || '') + ' · ' + pcEsc(c.MARCA || c.DOT || '') + ' · ' + pcEsc(c.MEDIDA || '') + (x ? ' · hoy: ' + (x === 'SI' ? 'incluido' : 'se cobra') : '') + '</option>'; }).join('') + '</select>' +
    '<label style="display:flex;gap:6px;align-items:center;margin-top:6px;font-size:12px"><input type="checkbox" id="pc-pa-quitar"> Sacar la excepción (vuelve a lo que diga la orden)</label></div>' +
    '<div class="fg"><label class="fl">Por qué *</label><input class="fi" id="pc-pa-m" placeholder="Ej: acuerdo con el cliente"></div>' +
    '<div class="fr"><div class="fg"><label class="fl">Usuario del encargado (si no sos encargado)</label><input class="fi" id="pc-pa-u" autocomplete="off"></div><div class="fg"><label class="fl">Clave</label><input class="fi" type="password" id="pc-pa-c" autocomplete="new-password"></div></div>' +
    '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pc-pa-ok">Guardar</button></div>');
  $id('pc-pa-ok').onclick = async function() {
    var u = $v('pc-pa-u').trim(), b = this; b.disabled = true;
    try {
      var alc = $v('pc-pa-a'), quitar = alc === 'CUBIERTA' && $id('pc-pa-quitar').checked;
      var r = await gsRun('gsPC_ParcheCond', { ID_OTRAB: id, ID_CUB: alc === 'CUBIERTA' ? $v('pc-pa-cub') : '', VALOR: quitar ? '' : $v('pc-pa-v'), ALCANCE: alc, MOTIVO: $v('pc-pa-m').trim(), AUTORIZA: u ? { USUARIO: u, CLAVE: $v('pc-pa-c') } : null });
      if ($id('pc-pa-c')) $id('pc-pa-c').value = '';
      if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); b.disabled = false; return; }
      closeModal(); toast('Guardado ✓', 'g'); await pcRecargar();
    } catch (e) { toast(e.message, 'r2'); b.disabled = false; }
  };
}
// ── Vida de la cubierta: datos del casco, inspección y, estación por estación, lo que se hizo ──
async function pcHistorial(m) {
  if (!String(m || '').trim()) { toast('Escribí la marca', 'r2'); return; }
  var r = await gsRun('gsPC_Historial', m);
  PC_.vida = { r: r, det: {} };
  showModal('<div class="mh"><span class="mt">Vida de la cubierta ' + pcEsc(r.marca) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2" id="pc-vida">' +
    (r.vidas.length ? r.vidas.map(function(v, k) { return '<div style="text-align:right;margin-bottom:4px"><button class="btn btn-p btn-sm" onclick="pcVidaImprimir(' + k + ')"><i class="fas fa-print"></i> Imprimir para el cliente</button></div>' + pcVidaCab(v) + '<div id="pc-vida-' + k + '" class="tdim" style="font-size:12px;margin:6px 0 14px">Cargando el detalle…</div>'; }).join('') : '<div class="tdim">No hay ninguna cubierta con esa marca.</div>') +
    '</div><div class="mf">' + (r.vidas.length ? '<button class="btn btn-p" onclick="pcVidaCompleta()">⤢ Ver todo en pantalla completa</button>' : '') + '<button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>', 'md-lg');
  for (var k = 0; k < r.vidas.length; k++) {
    var v = r.vidas[k], h = '';
    for (var j = 0; j < (v.OTS || []).length; j++) {
      try { var d = await gsRun('gsPC_OTDetalle', v.OTS[j].ID_OT); var it = (d.items || []).filter(function(x) { return String(x.ID_CUB) === String(v.ID_CUB); })[0];
        if (it) { h += pcVidaDet(it, v.OTS[j], d); var rm = null; try { rm = await gsRun('gsPC_Remitos', v.OTS[j].ID_OT); } catch (e2) {} PC_.vida.det[k] = PC_.vida.det[k] || []; PC_.vida.det[k].push({ it: it, os: v.OTS[j], osF: d.ot && d.ot.FECHA, auto: d.autoclave || [], espec: d.espec || null, rem: rm && rm.REMITOS || [] }); } } catch (e) { h += '<div class="al al-r">' + pcEsc(e.message) + '</div>'; }
    }
    h += pcVidaEntrega(k, v);
    var el = $id('pc-vida-' + k); if (el) { el.className = ''; el.innerHTML = pcVidaTiempo(k, v) + '<div style="font-weight:700;margin:12px 0 4px">Detalle de cada orden de servicio</div>' + (h || '<div class="tdim">Todavía no entró a la línea.</div>'); }
  }
}
// Trazabilidad completa en orden de tiempo, desde que entró a la planta, y dónde está ahora
function pcVidaTiempo(k, v) {
  var dets = PC_.vida.det[k] || [], ev = [], add = function(t, q, txt, extra) { if (t) ev.push({ t: +t || new Date(t).getTime(), q: q, txt: txt, ex: extra || '' }); };
  add(v.FECHA_RECEPCION, 'Planta', 'Entró a la planta: recepción de la boleta' + (v.OTRAB ? ' · orden de trabajo ' + pcEsc(v.OTRAB) : '') + (v.NRO_MANUAL ? ' · boleta ' + pcEsc(v.NRO_MANUAL) : ''), pcEsc([v.TIPO, v.MEDIDA, v.FABRICANTE, v.TRABAJO].filter(Boolean).join(' · ')) + (v.DOT ? ' · DOT ' + pcDotTxt(v.DOT) : ''));
  (v.CAMBIOS || []).forEach(function(c) { add(c.FECHA, 'Inspección', 'Trabajo cambiado de ' + pcEsc(c.ANTES) + ' a ' + pcEsc(c.DESPUES), pcEsc(c.MOTIVO) + ' · decidió ' + pcEsc(c.DECIDE)); });
  dets.forEach(function(x) {
    var ests = pcEstLin(x.os.LINEA), nomE = {}; ests.forEach(function(e) { nomE[String(e.ID_ESTACION)] = (e.NRO || e.ORDEN) + '. ' + e.NOMBRE; });
    add(x.osF, 'Carga', 'Entró a la orden de servicio ' + pcEsc(x.os.NRO_OT) + ' (línea ' + pcEsc(x.os.LINEA) + ')' + (x.it.ROL === 'SUPLENTE' ? ' como suplente' : ''), x.it.PASADA > 1 ? 'Corrección: ' + pcEsc(x.it.MOTIVO_REPROCESO || '') : '');
    (x.it.REGISTROS || []).forEach(function(g) { var ins1 = /^1\./.test(nomE[g.ID_ESTACION] || '') && x.it.PASADA <= 1 ? [v.INSPECCION === 'APTA' ? 'Apta' : v.INSPECCION === 'NO_APTA' ? 'No apta' : '', v.BANDA ? 'banda ' + v.BANDA : '', (v.PARCHES || []).length ? 'parches: ' + v.PARCHES.join(', ') : '', (v.EXTRAS || []).length ? 'extras: ' + v.EXTRAS.join(', ') : ''].filter(Boolean).join(' · ') : '';
      var nomI = {}; (PC_.d.insumos || []).forEach(function(q) { nomI[q.ID_INSUMO] = q.NOMBRE_INSUMO; });
      var us = (x.it.CONSUMOS || []).filter(function(c) { return String(c.ID_REG) === String(g.ID_REG) && String(c.ESTADO) !== 'ANULADO'; }).map(function(c) { var nm = nomI[c.ID_INSUMO] || nomI[c.ID_INSUMO_RECETA] || c.ID_INSUMO; return +c.NO_USO === 1 ? nm + ': no se usó' : nm + ': ' + (Math.round((+c.REAL || 0) * 1000) / 1000).toString().replace('.', ',') + ' ' + (c.UNIDAD || '') + (+c.REEMPLAZO === 1 ? ' (reemplazo)' : ''); });
      var hz = (x.it.HERRAMENTAL || []).filter(function(p) { return String(p.ID_REG || '') === String(g.ID_REG); }).map(function(p) { return 'pieza ' + p.CODIGO; });
      add(g.FECHA, 'Estación', pcEsc(nomE[g.ID_ESTACION] || g.ID_ESTACION) + ' · ' + pcEsc(g.RESULTADO || 'OK') + (g.PASADA > 1 ? ' (' + g.PASADA + 'ª pasada)' : ''), pcEsc([g.OPERARIO || g.USUARIO, g.OBSERVACION, ins1].filter(Boolean).join(' · ')) + (us.length || hz.length ? '<div style="color:#555">' + pcEsc(us.concat(hz).join(' · ')) + '</div>' : '')); });
    if (x.it.ESTADO === 'RETIRADA') add(x.osF, 'Carga', 'Salió de la orden de servicio ' + pcEsc(x.os.NRO_OT) + ' (volvió a esperar otra carga)', pcEsc(x.it.OBSERVACIONES || ''));
    if (x.it.ESTADO === 'RECHAZADA') add((x.it.REGISTROS || []).reduce(function(m, g) { return Math.max(m, +g.FECHA || 0); }, +x.osF || 0), 'Rechazo', 'No apta / rechazada en ' + pcEsc(x.os.NRO_OT), pcEsc(v.MOTIVO_RECHAZO || ''));
    var ac = pcAcDeCub(x.auto, x.it.ID_CUB);
    if (ac) { (ac.LECTURAS || []).forEach(function(l) { add(l.FECHA, 'Autoclave', 'Lectura ' + String(l.TEMP).replace('.', ',') + ' °C · ' + String(l.PRESION).replace('.', ',') + ' ' + pcEsc(l.UNIDAD || ''), pcEsc([l.OPERARIO, l.FOTO_ID ? 'con foto' : 'sin foto', l.FUERA, l.JUSTIFICACION ? 'explicación: ' + l.JUSTIFICACION : ''].filter(Boolean).join(' · '))); });
      add(ac.INICIO, 'Autoclave', 'Empezó la cocción', x.it.POS_AUTOCLAVE ? 'lugar ' + pcEsc(x.it.POS_AUTOCLAVE) : ''); if (ac.FIN) add(ac.FIN, 'Autoclave', 'Terminó la cocción', +ac.MINUTOS ? Math.round(+ac.MINUTOS) + ' min' : ''); }
    (x.rem || []).forEach(function(r) { if (!(r.ITEMS || []).some(function(t) { return String(t.ID_CUB) === String(v.ID_CUB); })) return;
      add(r.FECHA, 'Remito', 'Remito ' + pcEsc(r.NRO) + (r.TIPO ? ' (' + pcEsc(r.TIPO) + ')' : ''), '');
      if (r.ESTADO === 'ENTREGADO') add(r.FECHA_ENTREGA, 'Entrega', 'Entregada al cliente · remito firmado', ''); });
  });
  // La recepción va siempre primero (se carga con la fecha de la boleta, sin hora)
  ev.sort(function(a, b) { return (a.q === 'Planta' ? 0 : 1) - (b.q === 'Planta' ? 0 : 1) || a.t - b.t; });
  var ahora = { EN_ESPERA: 'Esperando entrar a una carga', EN_OT: 'En la línea', TERMINADA: 'Terminada', RECHAZADA: 'No apta', ANULADA: 'Anulada' }[v.ESTADO] || v.ESTADO;
  var ult = dets.length ? dets[dets.length - 1] : null;
  if (v.ESTADO === 'EN_OT' && ult) { var hh = {}; (ult.it.HECHAS || []).forEach(function(q) { hh[String(q.ID_ESTACION)] = 1; }); var sig = pcEstLin(ult.os.LINEA).slice().sort(function(a, b) { return a.ORDEN - b.ORDEN; }).filter(function(e) { return !hh[String(e.ID_ESTACION)]; })[0];
    ahora = 'En la línea · ' + pcEsc(ult.os.NRO_OT) + (sig ? ' · está en la estación ' + pcEsc((sig.NRO || sig.ORDEN) + '. ' + sig.NOMBRE) : ' · pasó todas las estaciones'); }
  var ent = ev.filter(function(e) { return e.q === 'Entrega'; }).length;
  if (v.ESTADO === 'TERMINADA') ahora += ent ? ' y entregada al cliente' : ' · falta entregarla';
  return '<div class="al al-b" style="font-size:14px;margin:6px 0"><b>Ahora:</b> ' + ahora + '</div>' +
    '<div style="font-weight:700;margin:10px 0 4px">Trazabilidad, desde el primer día</div><div class="tw"><table style="font-size:11.5px"><thead><tr><th>Fecha y hora</th><th>Etapa</th><th>Qué pasó</th><th>Detalle</th></tr></thead><tbody>' +
    ev.map(function(e) { return '<tr><td style="white-space:nowrap">' + (e.q === 'Planta' ? fmtD(e.t) : fmtDT(e.t)) + '</td><td>' + e.q + '</td><td><b>' + e.txt + '</b></td><td>' + (e.ex || '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
}
// Entrega al cliente: remito, si ya se entregó y la foto firmada
function pcVidaEntrega(k, v) {
  var rem = null; (PC_.vida.det[k] || []).forEach(function(x) { (x.rem || []).forEach(function(r) { if ((r.ITEMS || []).some(function(t) { return String(t.ID_CUB) === String(v.ID_CUB); })) rem = r; }); });
  if (!rem) return v.ESTADO === 'RECHAZADA' ? '<div class="al al-y mt3">No apta: todavía no figura en un remito de devolución.</div>' : '';
  return '<div class="card mt3"><div class="card-body" style="font-size:13px"><b>Entrega al cliente</b> · remito <b class="mono">' + pcEsc(rem.NRO) + '</b> del ' + fmtD(rem.FECHA) + ' · ' +
    (rem.ESTADO === 'ENTREGADO' ? '<span class="badge b-green">✓ Entregado ' + fmtD(rem.FECHA_ENTREGA) + '</span>' + (rem.FOTO_FIRMA ? ' <button class="btn btn-s btn-xs" onclick="asVerImg(' + Number(rem.FOTO_FIRMA) + ',\'Remito ' + pcEsc(rem.NRO) + ' firmado\')">📷 Ver remito firmado</button>' : '') : '<span class="badge b-orange">Falta la foto del remito firmado</span>') + '</div></div>';
}
// La vida de la cubierta en pantalla completa (lo mismo del modal, todo abierto y más grande)
function pcVidaCompleta() {
  var src = $id('pc-vida'); if (!src) return;
  var md = src.closest('.md') || src.parentNode, tt = md && md.querySelector('.mt') ? md.querySelector('.mt').textContent : 'Vida de la cubierta';
  var ov = document.createElement('div'); ov.id = 'pc-vida-full';
  ov.style.cssText = 'position:fixed;inset:0;z-index:2000;background:var(--bg,#f3f4f6);overflow:auto;padding:16px';
  ov.innerHTML = '<div style="max-width:1200px;margin:0 auto"><div class="flex gap2 mb3" style="position:sticky;top:0;z-index:2;background:var(--bg,#f3f4f6);padding:6px 0;align-items:center;justify-content:space-between">' +
    '<div style="font-size:18px;font-weight:700">' + pcEsc(tt) + '</div>' +
    '<button class="btn btn-s" onclick="var x=$id(\'pc-vida-full\');if(x)x.remove()">✕ Cerrar pantalla completa</button></div><div class="card"><div class="card-body" id="pc-vida-full-b"></div></div></div>';
  document.body.appendChild(ov);
  var b = $id('pc-vida-full-b'); b.innerHTML = src.innerHTML;
  b.querySelectorAll('[id]').forEach(function(e) { e.removeAttribute('id'); });
}
// Orden de trabajo (boleta del cliente) desde el Historial: sus cubiertas y dónde está cada una
function pcOTrabVer(id) {
  var d = PC_.d, o = (d.ordTrabajo || []).filter(function(x) { return String(x.ID_OTRAB) === String(id); })[0]; if (!o) return;
  var cs = d.cubiertas.filter(function(c) { return String(c.ID_OTRAB) === String(id); }).sort(function(a, b) { return a.ID_CUB - b.ID_CUB; });
  var et = { EN_ESPERA: ['b-orange', 'Esperando'], EN_OT: ['b-blue', 'En la línea'], TERMINADA: ['b-green', 'Terminada'], RECHAZADA: ['b-red', 'No apta'], ANULADA: ['b-gray', 'Anulada'] };
  showModal('<div class="mh"><span class="mt">' + pcEsc(o.NRO) + ' · ' + pcEsc(o.CLIENTE) + (o.NRO_MANUAL ? ' · boleta ' + pcEsc(o.NRO_MANUAL) : '') + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="tdim mb2" style="font-size:12px">' + fmtD(+o.FECHA) + ' · ' + pcEsc(o.ESTADO) + ' · parche ' + (o.PARCHE_INCLUIDO === 'SI' ? 'incluido' : 'se cobra') + (o.OBSERVACIONES ? ' · ' + pcEsc(o.OBSERVACIONES) : '') + '. Tocá una cubierta para ver toda su vida.</div>' +
    '<div class="tw"><table style="font-size:12px"><thead><tr><th>N° int.</th><th>DOT</th><th>Medida</th><th>Marca</th><th>Trabajo</th><th>Marca grabada</th><th>Etapa</th><th></th></tr></thead><tbody>' +
    (cs.length ? cs.map(function(c) { var e = et[c.ESTADO] || ['b-gray', c.ESTADO]; return '<tr style="cursor:pointer" onclick="closeModal();pcHistorial(\'CUB:' + c.ID_CUB + '\')"><td class="mono">' + pcEsc(c.ID_CASCO || '') + '</td><td class="mono">' + pcDotTxt(c.DOT) + '</td><td class="mono">' + pcEsc(c.MEDIDA) + '</td><td>' + pcEsc(c.FABRICANTE || '') + '</td><td>' + pcEsc(c.TRABAJO) + '</td><td class="mono">' + pcEsc(c.MARCA || '—') + '</td><td><span class="badge ' + e[0] + '">' + e[1] + '</span></td><td><button class="btn btn-s btn-xs">Ver</button></td></tr>'; }).join('') : '<tr><td colspan="8" class="tc tdim">Sin cubiertas.</td></tr>') +
    '</tbody></table></div></div><div class="mf"><button class="btn btn-p" onclick="closeModal();pcImpOTrab(' + o.ID_OTRAB + ')"><i class="fas fa-print"></i> Ver todo / imprimir la orden</button><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>', 'md-lg');
}
// ── Certificado de trazabilidad para el cliente: todo lo que se le hizo a la cubierta (sin costos ni precios) ──
function pcVidaImprimir(k) {
  var V = PC_.vida, v = V && V.r.vidas[k]; if (!v) return;
  var dets = V.det[k] || [], d = PC_.d;
  var nomI = {}; (d.insumos || []).forEach(function(x) { nomI[x.ID_INSUMO] = x.NOMBRE_INSUMO; });
  var n3 = function(x) { return (Math.round((+x || 0) * 1000) / 1000).toString().replace('.', ','); };
  var rem = null; dets.forEach(function(x) { (x.rem || []).forEach(function(r) { if ((r.ITEMS || []).some(function(t) { return String(t.ID_CUB) === String(v.ID_CUB); })) rem = r; }); });
  var f = function(t, x) { return '<div><b>' + t + '</b>' + (x || '—') + '</div>'; };
  var resTxt = { OK: 'Aprobada', PULIR: 'Exceso de material: se repulió', REPROCESO: 'Volvió a corregirse', RECHAZO_FINAL: 'No apta (rechazo final)', NO_APTA: 'No apta', FALLA: 'Con observación', NO_APLICA: 'No corresponde a este trabajo' };
  var h = pcEncImp('CERTIFICADO DE TRAZABILIDAD DE LA CUBIERTA', v.MARCA || V.r.marca) +
    '<div class="dat">' + f('Cliente', pcEsc(v.CLIENTE)) + f('Marca grabada', pcEsc(V.r.marca)) + f('DOT', pcDotTxt(v.DOT)) + f('N° interno', pcEsc(v.ID_CASCO)) +
    f('Marca de fábrica', pcEsc(v.FABRICANTE)) + f('Cubierta', pcEsc(v.TIPO + ' ' + v.MEDIDA)) + f('Trabajo', pcEsc(v.TRABAJO)) + f('Recibida', fmtD(v.FECHA_RECEPCION)) +
    f('Orden de trabajo', pcEsc(v.OTRAB + (v.NRO_MANUAL ? ' · boleta ' + v.NRO_MANUAL : ''))) + f('Orden de servicio', pcEsc(dets.map(function(x) { return x.os.NRO_OT; }).join(' · '))) +
    f('Remito de entrega', rem ? pcEsc(rem.NRO) + ' · ' + fmtD(rem.FECHA) : 'Todavía no se entregó') + f('Estado', pcEsc({ TERMINADA: 'Terminada', RECHAZADA: 'No apta', EN_OT: 'En proceso', EN_ESPERA: 'Esperando entrar a la línea' }[v.ESTADO] || v.ESTADO)) + '</div>' +
    '<h2>Inspección inicial</h2><div class="dat">' + f('Resultado', v.INSPECCION === 'APTA' ? 'Apta para el trabajo' : v.INSPECCION === 'NO_APTA' ? 'No apta' : 'Sin inspección') + f('Banda indicada', pcEsc(v.BANDA)) +
    f('Parches', pcEsc((v.PARCHES || []).join(' · '))) + f('Trabajos extra', pcEsc((v.EXTRAS || []).join(' · '))) + (v.MOTIVO_RECHAZO ? f('Motivo', pcEsc(v.MOTIVO_RECHAZO)) : '') + '</div>' +
    (v.CAMBIOS || []).map(function(c) { return '<div class="emp">Trabajo cambiado en la inspección de ' + pcEsc(c.ANTES) + ' a ' + pcEsc(c.DESPUES) + ' (' + fmtD(c.FECHA) + '): ' + pcEsc(c.MOTIVO) + '.</div>'; }).join('');
  dets.forEach(function(x) {
    var i = x.it, ests = pcEstLin(x.os.LINEA).slice().sort(function(a, b) { return a.ORDEN - b.ORDEN; });
    var nomE = {}; ests.forEach(function(e) { nomE[String(e.ID_ESTACION)] = (e.NRO || e.ORDEN) + '. ' + e.NOMBRE; });
    var regs = (i.REGISTROS || []).slice().sort(function(a, b) { return (+a.FECHA || 0) - (+b.FECHA || 0); });
    var cons = (i.CONSUMOS || []).filter(function(c) { return String(c.ESTADO) !== 'ANULADO' && +c.NO_USO !== 1 && +c.REAL > 0; });
    var ac = (x.auto || []).filter(function(a) { try { var p = JSON.parse(a.POSICIONES || '{}'); return Object.keys(p).some(function(q) { return String(p[q]) === String(i.ID_CUB); }); } catch (e) { return false; } })[0];
    h += '<h2>Proceso · ' + pcEsc(x.os.NRO_OT) + ' · línea ' + pcEsc(x.os.LINEA) + '</h2><table class="det"><colgroup><col style="width:26%"><col style="width:15%"><col style="width:19%"><col style="width:40%"></colgroup><thead><tr><th>Paso</th><th>Fecha y hora</th><th>Resultado</th><th>Materiales usados</th></tr></thead><tbody>' +
      regs.map(function(g) {
        var us = cons.filter(function(c) { return String(c.ID_REG) === String(g.ID_REG); }).map(function(c) { var nm = nomI[c.ID_INSUMO] || c.ID_INSUMO; return pcEsc(nm) + ': ' + (c.UNIDAD === 'pieza' ? '1 pieza' : n3(c.REAL) + ' ' + pcEsc(c.UNIDAD || '')) + (String(c.PESO_ANTES || '') !== '' ? ' (pesado)' : ''); });
        var extra = String(g.ID_ESTACION) && ac && /autoclave|cocci/i.test(nomE[g.ID_ESTACION] || '') ? '<br>Cocción desde ' + fmtDT(+ac.INICIO) + (ac.FIN ? ' hasta ' + fmtDT(+ac.FIN) : '') + (+ac.MINUTOS ? ' · ' + Math.round(+ac.MINUTOS) + ' min' : '') + (i.POS_AUTOCLAVE ? ' · lugar ' + pcEsc(i.POS_AUTOCLAVE) : '') +
          (x.espec ? '<br>Especificado: ' + pcEsc(pcEspTxt(x.espec)) : '') +
          ((ac.LECTURAS || []).length ? '<br>Registrado: ' + ac.LECTURAS.map(function(l) { return pcEsc(pcLectTxt(l, true)) + (l.FUERA ? ' · <b>fuera de lo especificado (' + pcEsc(l.FUERA) + ')</b>' : ''); }).join('<br>') : '<br>Registrado: sin lecturas cargadas') : '';
        return '<tr><td>' + pcEsc(nomE[g.ID_ESTACION] || g.ID_ESTACION) + (g.PASADA > 1 ? ' (2ª pasada)' : '') + '</td><td>' + fmtDT(+g.FECHA) + '</td><td>' + pcEsc(resTxt[g.RESULTADO] || g.RESULTADO || '') + extra + '</td><td>' + (us.join('<br>') || '—') + '</td></tr>';
      }).join('') + '</tbody></table>';
  });
  h += '<div class="emp" style="margin-top:10px">Cada paso queda registrado en el sistema de producción de Vulcan Tread en el momento en que se hace: quién lo hizo, cuándo y con qué materiales. La temperatura y la presión de cocción son lecturas del termómetro y el manómetro del autoclave, tomadas por el operario y respaldadas con foto. Este certificado no incluye precios.</div>' +
    '<div class="firmas"><div>Control de calidad</div><div>Encargado de línea</div></div>';
  pcImprimir('Trazabilidad ' + (v.MARCA || V.r.marca), h, false);
}
function pcVidaCab(v) {
  var f = function(t, x) { return x ? '<div><b style="display:block;font-size:10px;color:var(--dim);text-transform:uppercase">' + t + '</b>' + x + '</div>' : ''; };
  return '<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:6px"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;font-size:12.5px">' +
    f('Dueño (cliente)', '<b>' + pcEsc(v.CLIENTE) + '</b>') + f('Marca grabada', '<b class="mono">' + pcEsc(v.MARCA || (PC_.vida && PC_.vida.r.marca) || '') + '</b>') + f('Recibida', fmtD(v.FECHA_RECEPCION)) + f('Cubierta', pcEsc(v.TIPO + ' ' + v.MEDIDA)) + f('Marca de fábrica', pcEsc(v.FABRICANTE || '')) + f('DOT', pcDotTxt(v.DOT)) + f('N° interno', pcEsc(v.ID_CASCO)) +
    f('Orden de trabajo', pcEsc(v.OTRAB + (v.NRO_MANUAL ? ' · boleta ' + v.NRO_MANUAL : ''))) + f('Orden de servicio', pcEsc(v.NRO_OT)) + f('Trabajo', pcEsc(v.TRABAJO)) + f('Estado', pcBadge(v.ESTADO)) +
    f('Inspección', pcEsc(v.INSPECCION === 'APTA' ? 'Apta' : v.INSPECCION === 'NO_APTA' ? 'No apta' : (v.INSPECCION || ''))) + f('Banda elegida', pcEsc(v.BANDA)) + f('Parches', pcEsc((v.PARCHES || []).join(' · '))) +
    f('Trabajos extra', pcEsc((v.EXTRAS || []).join(' · '))) + f('Parche', v.OTRAB ? pcEsc(pcParcheTxt(v)) + (v.PARCHE_EXCEPCION ? ' <span class="tdim">(excepción de esta cubierta)</span>' : '') : '') + f('Costo', v.COSTO_TOTAL ? '$ ' + Math.round(v.COSTO_TOTAL).toLocaleString('es-AR') : '') + f('Reprocesos', v.REPROCESOS ? String(v.REPROCESOS) : '') +
    f('Motivo de rechazo', pcEsc(v.MOTIVO_RECHAZO)) + '</div>' +
    (v.CAMBIOS || []).map(function(c) { return '<div style="font-size:12px;color:#b45309;margin-top:6px">Trabajo cambiado de ' + pcEsc(c.ANTES) + ' a ' + pcEsc(c.DESPUES) + ' en la inspección (' + fmtDT(c.FECHA) + ') · ' + pcEsc(c.MOTIVO) + ' · decidió ' + pcEsc(c.DECIDE) + '</div>'; }).join('') + '</div>';
}
// Cocción en la que entró la cubierta, con sus lecturas de temperatura y presión
function pcAcDeCub(auto, idCub) { return (auto || []).filter(function(a) { try { var p = JSON.parse(a.POSICIONES || '{}'); return Object.keys(p).some(function(q) { return String(p[q]) === String(idCub); }); } catch (e) { return false; } })[0] || null; }
function pcEspTxt(e) {
  if (!e) return '';
  var n = function(x) { return x === null ? '…' : String(x).replace('.', ','); };
  var t = e.TMIN !== null || e.TMAX !== null ? n(e.TMIN) + ' a ' + n(e.TMAX) + ' °C' : 'temperatura sin especificación cargada';
  var p = e.PMIN !== null || e.PMAX !== null ? n(e.PMIN) + ' a ' + n(e.PMAX) + ' ' + e.PUNI : 'presión sin especificación cargada';
  return t + ' · ' + p;
}
function pcLectTxt(l, conFoto) { return new Date(l.FECHA).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' → ' + String(l.TEMP).replace('.', ',') + ' °C · ' + String(l.PRESION).replace('.', ',') + ' ' + (l.UNIDAD || '') + (l.MOMENTO === 'FIN' ? ' (final)' : '') + (conFoto ? (l.FOTO_ID ? ' · con foto' : ' · sin foto') : ''); }
// Lo que le falta a la cubierta en esta orden: dónde está ahora y las estaciones que siguen, con lo que prevé la receta en cada una
function pcVidaFalta(i, ests, nomI, n3) {
  if (['PENDIENTE', 'EN_PROCESO'].indexOf(i.ESTADO) === -1) return '';
  var hechas = {}; (i.HECHAS || []).forEach(function(h) { hechas[String(h.ID_ESTACION)] = true; });
  var porEst = {}; (i.LINEAS || []).forEach(function(l) { if (l.ID_ESTACION) (porEst[l.ID_ESTACION] = porEst[l.ID_ESTACION] || []).push(l); });
  var falta = ests.filter(function(e) { return !hechas[String(e.ID_ESTACION)]; });
  if (!falta.length) return '<div class="al al-g mt2" style="font-size:12px">Pasó todas las estaciones: falta terminarla en la oficina.</div>';
  return '<div style="font-weight:700;margin:10px 0 4px">Lo que falta hacer</div><div class="tw"><table style="font-size:11.5px"><thead><tr><th>Estación</th><th></th><th>Lo que prevé la receta</th></tr></thead><tbody>' +
    falta.map(function(e, k) { var ls = porEst[String(e.ID_ESTACION)] || [];
      return '<tr' + (k ? '' : ' style="background:#fff7ed"') + '><td>' + pcEsc((e.NRO || e.ORDEN) + '. ' + e.NOMBRE) + '</td><td>' + (k ? '<span class="tdim">después</span>' : '<b style="color:#c2410c">ACÁ ESTÁ (sigue esta)</b>') + '</td><td>' +
        (ls.length ? ls.map(function(l) { var nm = nomI[l.ID_INSUMO] || l.DESCRIPCION || l.ID_INSUMO; return pcEsc(nm) + ': ' + (l.TIPO_LINEA === 'HERRAMENTAL' ? '1 pieza' : n3(l.CANTIDAD) + ' ' + pcEsc(l.UNIDAD || '')); }).join(' · ') : '<span class="tdim">sin insumos</span>') + '</td></tr>'; }).join('') +
    '</tbody></table></div>';
}
function pcVidaDet(i, os, d0) {
  var d = PC_.d, ests = pcEstLin(os.LINEA).slice().sort(function(a, b) { return a.ORDEN - b.ORDEN; });
  var nomE = {}; ests.forEach(function(e) { nomE[String(e.ID_ESTACION)] = (e.NRO || e.ORDEN) + '. ' + e.NOMBRE; });
  var nomI = {}; (d.insumos || []).forEach(function(x) { nomI[x.ID_INSUMO] = x.NOMBRE_INSUMO; });
  var n3 = function(x) { return (Math.round((+x || 0) * 1000) / 1000).toString().replace('.', ','); };
  var regs = (i.REGISTROS || []).slice().sort(function(a, b) { return (+a.FECHA || 0) - (+b.FECHA || 0); });
  var cons = (i.CONSUMOS || []).filter(function(k) { return String(k.ESTADO) !== 'ANULADO'; });
  var min = {}; (i.TIEMPOS || []).forEach(function(t) { min[t.ID_ESTACION] = (min[t.ID_ESTACION] || 0) + (+t.MINUTOS || 0); });
  var herr = {}; (i.HERRAMENTAL || []).forEach(function(p) { herr[p.ID_INSUMO] = p; });
  return '<div style="font-weight:700;margin:8px 0 4px">' + pcEsc(os.NRO_OT) + ' · línea ' + pcEsc(os.LINEA) + (i.POS_AUTOCLAVE ? ' · autoclave lugar ' + pcEsc(i.POS_AUTOCLAVE) : '') + (i.PASADA > 1 ? ' · ' + (i.PULIR ? 'repulida por exceso de material' : 'con corrección') : '') + '</div>' +
    '<div class="tw"><table style="font-size:11.5px"><thead><tr><th>Estación</th><th>Fecha y hora</th><th>Operario</th><th class="tr">Min.</th><th>Resultado</th><th>Insumos (usado · receta)</th></tr></thead><tbody>' +
    (regs.length ? regs.map(function(g) {
      var us = cons.filter(function(k) { return String(k.ID_REG) === String(g.ID_REG); }).map(function(k) {
        var nm = nomI[k.ID_INSUMO] || nomI[k.ID_INSUMO_RECETA] || k.ID_INSUMO || k.ID_INSUMO_RECETA;
        if (+k.NO_USO === 1) return '<span class="tdim">' + pcEsc(nm) + ': no se usó · ' + pcEsc(k.MOTIVO || '') + '</span>';
        var pz = herr[k.ID_INSUMO] && k.UNIDAD === 'pieza' ? ' · pieza ' + pcEsc(herr[k.ID_INSUMO].CODIGO) : '';
        return pcEsc(nm) + ': <b>' + n3(k.REAL) + ' ' + pcEsc(k.UNIDAD || '') + '</b>' + (+k.PREVISTO ? ' <span class="tdim">· receta ' + n3(k.PREVISTO) + '</span>' : '') +
          (String(k.PESO_ANTES || '') !== '' ? ' <span class="tdim">· pesado ' + n3(k.PESO_ANTES) + ' → ' + n3(k.PESO_DESPUES) + '</span>' : '') + (+k.REEMPLAZO === 1 ? ' (reemplazo)' : '') + pz + (k.MOTIVO ? ' <span style="color:#b45309">· ' + pcEsc(k.MOTIVO) + '</span>' : '');
      });
      return '<tr><td>' + pcEsc(nomE[g.ID_ESTACION] || g.ID_ESTACION) + (g.PASADA > 1 ? ' (2ª pasada)' : '') + '</td><td style="white-space:nowrap">' + fmtDT(+g.FECHA) + '</td><td>' + pcEsc(g.OPERARIO || g.USUARIO || '') + '</td><td class="tr">' + (min[g.ID_ESTACION] ? (min[g.ID_ESTACION] < 1 ? '&lt;1' : Math.round(min[g.ID_ESTACION])) : '') + '</td><td>' + pcEsc(g.RESULTADO || '') + (g.OBSERVACION ? ' · ' + pcEsc(g.OBSERVACION) : '') + '</td><td>' + (us.join('<br>') || '—') + '</td></tr>';
    }).join('') : '<tr><td colspan="6" class="tdim">Todavía no pasó por ninguna estación de esta orden.</td></tr>') + '</tbody></table></div>' +
    pcVidaFalta(i, ests, nomI, n3) +
    ((i.HERRAMENTAL || []).length ? '<div style="font-size:11.5px;margin-top:4px">Herramental: ' + i.HERRAMENTAL.map(function(p) { return pcEsc(p.CODIGO) + ' (uso ' + p.NRO_USO + (p.MAX_USOS ? ' de ' + p.MAX_USOS : '') + ')'; }).join(' · ') + '</div>' : '') +
    (function() { var ac = pcAcDeCub(d0 && d0.autoclave, i.ID_CUB); if (!ac) return '';
      return '<div style="font-size:11.5px;margin-top:4px"><b>Cocción:</b> ' + fmtDT(+ac.INICIO) + (ac.FIN ? ' a ' + fmtDT(+ac.FIN) : '') + (+ac.MINUTOS ? ' · ' + Math.round(+ac.MINUTOS) + ' min' : '') + (d0.espec ? ' · especificado ' + pcEsc(pcEspTxt(d0.espec)) : '') + '</div>' +
        ((ac.LECTURAS || []).length ? ac.LECTURAS.map(function(l) { return '<div style="font-size:11.5px">🌡 ' + pcEsc(pcLectTxt(l, false)) + ' · ' + pcEsc(l.OPERARIO) + (l.FOTO_ID ? ' <button class="btn btn-xs btn-s" onclick="asVerImg(' + Number(l.FOTO_ID) + ',\'Lectura del autoclave\')">📷 Ver foto</button>' : ' · sin foto') + (l.FUERA ? ' <span style="color:var(--danger)">' + pcEsc(l.FUERA) + ' · ' + pcEsc(l.JUSTIFICACION) + '</span>' : '') + '</div>'; }).join('') : '<div class="tdim" style="font-size:11.5px">Sin lecturas de temperatura y presión registradas.</div>'); })();
}

// ── Armar OT ──
// Trabajos para un tipo y medida: arriba los que tienen receta (pueden entrar a la línea), abajo los que no
function pcTrabOpts(tipo, medida, sel, marca) {
  var con = [], sin = [];
  PC_.d.trabajos.filter(function(x) { return x.ACTIVO != 0; }).forEach(function(x) { (pcRecetaDe(tipo, medida, x.TRABAJO, '', marca) ? con : sin).push(x.TRABAJO); });
  var o = function(t) { return '<option value="' + pcEsc(t) + '"' + (t === sel ? ' selected' : '') + '>' + pcEsc(t) + '</option>'; };
  return '<option value="">— elegí —</option><optgroup label="Con receta para ' + pcEsc(tipo + ' ' + medida) + '">' + con.map(o).join('') + '</optgroup>' +
    (sin.length ? '<optgroup label="Sin receta para esta medida (no pueden entrar a la línea)">' + sin.map(o).join('') + '</optgroup>' : '');
}
// Cubierta en espera sin receta: cambiarle el trabajo desde la orden de servicio
function pcArmTrab(id) {
  var c = PC_.d.cubiertas.filter(function(x) { return String(x.ID_CUB) === String(id); })[0]; if (!c) return;
  showModal('<div class="mh"><span class="mt">Cambiar trabajo · casco ' + pcEsc(c.ID_CASCO || c.ID_CUB) + ' · ' + pcEsc(c.CLIENTE) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="al al-y mb2">' + pcEsc(c.TIPO + ' ' + c.MEDIDA) + ' · trabajo actual <b>' + pcEsc(c.TRABAJO) + '</b>: no tiene receta, por eso no puede entrar a la línea.</div>' +
    '<div class="fg"><label class="fl">Trabajo</label><select class="fs" id="pc-at-tr">' + pcTrabOpts(c.TIPO, c.MEDIDA, '', c.FABRICANTE) + '</select></div>' +
    '<label style="display:flex;gap:6px;align-items:center;font-size:13px;margin-top:6px"><input type="checkbox" id="pc-at-todas" checked/> Aplicar a todas las de la misma orden de trabajo con el mismo trabajo y medida sin receta</label>' +
    '<button class="btn btn-p mt3" id="pc-at-ok" onclick="pcArmTrabOk(' + c.ID_CUB + ')"><i class="fas fa-save"></i> Guardar</button></div>');
}
async function pcArmTrabOk(id) {
  var c = PC_.d.cubiertas.filter(function(x) { return String(x.ID_CUB) === String(id); })[0], tr = $v('pc-at-tr');
  if (!tr) { toast('Elegí el trabajo', 'r2'); return; }
  if (!pcRecetaDe(c.TIPO, c.MEDIDA, tr, '', c.FABRICANTE)) { toast('Ese trabajo tampoco tiene receta para ' + c.TIPO + ' ' + c.MEDIDA, 'r2'); return; }
  var lst = $id('pc-at-todas').checked ? PC_.d.cubiertas.filter(function(x) { return x.ESTADO === 'EN_ESPERA' && !x.ID_RECETA && String(x.ID_OTRAB) === String(c.ID_OTRAB) && x.TRABAJO === c.TRABAJO && x.TIPO === c.TIPO && x.MEDIDA === c.MEDIDA; }) : [c];
  var b = $id('pc-at-ok'); b.disabled = true; var ok = 0;
  try {
    for (var i = 0; i < lst.length; i++) { var r = await gsRun('gsPC_ActualizarCubierta', lst[i].ID_CUB, { TRABAJO: tr }); if (r && r.ok && r.ID_RECETA) ok++; else { toast((r && r.error) || 'No se pudo', 'r2'); break; } }
    if (ok) { toast(ok + (ok === 1 ? ' cubierta pasó' : ' cubiertas pasaron') + ' a ' + tr + ' ✓ · ya se pueden tildar', 'g'); closeModal(); await pcRecargar(); }
  } catch (e) { toast(e.message, 'r2'); } finally { b.disabled = false; }
}
// Una sola pestaña: arriba las que están en la línea (con su detalle), abajo para armar una nueva
function pcOS() {
  pcArmar();
  $id('pc-body').insertAdjacentHTML('afterbegin', pcOtsHtml());
}
function pcArmar() {
  var d = PC_.d, esp = d.cubiertas.filter(function(c) { return c.ESTADO === 'EN_ESPERA'; });
  PC_.rpVisto = PC_.rpVisto || {};
  esp.forEach(function(c) { if (c.REPROCESO_PEND && !PC_.sel[c.ID_CUB] && !PC_.rpVisto[c.ID_CUB]) { PC_.sel[c.ID_CUB] = 'TITULAR'; PC_.rpVisto[c.ID_CUB] = 1; } });
  esp.forEach(function(c) { if (!c.MARCA && PC_.mk[c.ID_CUB] === undefined && c.DOT) PC_.mk[c.ID_CUB] = String(c.DOT).toUpperCase().replace(/\s+/g, ''); });
  // Sugerencias del buscador: clientes y OT que tienen cubiertas esperando
  var porCli = {}, porOT = {};
  esp.forEach(function(c) {
    porCli[c.CLIENTE] = (porCli[c.CLIENTE] || 0) + 1;
    var o = pcNroOTrab(c.ID_OTRAB); if (o) { porOT[o] = porOT[o] || { n: 0, cli: c.CLIENTE, man: c.NRO_MANUAL }; porOT[o].n++; }
  });
  var sug = Object.keys(porCli).sort().map(function(k) { return '<option value="' + pcEsc(k) + '">' + porCli[k] + ' esperando</option>'; }).join('') +
    Object.keys(porOT).sort().map(function(k) { return '<option value="' + pcEsc(k) + '">' + pcEsc(porOT[k].cli) + (porOT[k].man ? ' · boleta ' + pcEsc(porOT[k].man) : '') + ' · ' + porOT[k].n + '</option>'; }).join('');
  var h = '<div class="card"><div class="card-hd"><span class="card-title">Armar una orden de servicio nueva (' + esp.length + ' cubiertas esperando)</span><span id="pc-contador" class="badge b-blue"></span></div>' +
    '<div class="card-body">' +
    '<div id="pc-a-cont" style="position:sticky;top:0;z-index:5;background:var(--accent-light);border:1px solid #93c5fd;border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:15px;font-weight:600;color:var(--accent)"></div>' +
    '<div class="flex gap2 mb2" style="align-items:flex-end;flex-wrap:wrap"><div style="flex:1 1 320px;max-width:460px"><label class="fl">Cliente, OT, N° de boleta o DOT</label>' +
    '<input class="fi" id="pc-a-f" list="pc-a-sug" value="' + pcEsc(PC_.af || '') + '" placeholder="Escribí y elegí de la lista..." autocomplete="off"/><datalist id="pc-a-sug">' + sug + '</datalist></div>' +
    '<button class="btn btn-s" onclick="$id(\'pc-a-f\').value=\'\';PC_.af=\'\';pcArmFiltrar()">Ver todas</button>' +
    '<button class="btn btn-s" onclick="pcArmDestildar()">Destildar todo</button></div>' +
    '<div class="tw"><table style="font-size:12px" id="pc-tbl-armar"><thead><tr><th title="Tilda todas las que se ven, hasta completar la carga"><label style="cursor:pointer;white-space:nowrap"><input type="checkbox" id="pc-a-todas"/> Entra</label></th><th>Suplente</th><th>Marca grabada *</th><th>N° interno</th><th>DOT</th><th>Línea</th><th>Tipo</th><th>Medida</th><th>Trabajo</th><th>Cliente</th><th>OT</th><th>Boleta</th><th>Recibida</th></tr></thead><tbody>' +
    esp.sort(function(a, b) { return (b.REPROCESO_PEND ? 1 : 0) - (a.REPROCESO_PEND ? 1 : 0) || (a.FECHA_RECEPCION || 0) - (b.FECHA_RECEPCION || 0) || a.ID_CUB - b.ID_CUB; }).map(function(c) {
      var s = PC_.sel[c.ID_CUB] || '';
      var dis = c.ID_RECETA ? '' : ' disabled title="Sin receta: cargala en Recetas"';
      return '<tr class="pc-a-tr" data-id="' + c.ID_CUB + '" data-txt="' + pcEsc(pcArmTxt(c)) + '"' + (c.ID_RECETA ? '' : ' style="opacity:.5"') + '>' +
        '<td><input type="checkbox" class="pc-ck" data-id="' + c.ID_CUB + '" data-v="TITULAR" style="width:18px;height:18px"' + (s === 'TITULAR' ? ' checked' : '') + dis + '/></td>' +
        '<td><input type="checkbox" class="pc-ck" data-id="' + c.ID_CUB + '" data-v="SUPLENTE"' + (s === 'SUPLENTE' ? ' checked' : '') + dis + '/></td>' +
        '<td>' + (c.MARCA ? '<b class="mono">' + pcEsc(c.MARCA) + '</b>' : '<input class="fi pc-mk" data-id="' + c.ID_CUB + '" value="' + pcEsc(PC_.mk[c.ID_CUB] || '') + '" placeholder="Grabada" style="width:110px;text-transform:uppercase"' + (c.ID_RECETA ? '' : ' disabled') + '/>') + '</td>' +
        '<td class="mono">' + pcEsc(c.ID_CASCO || '') + '</td><td class="mono">' + pcDotTxt(c.DOT) + '</td><td>' + pcEsc(pcLineaDeTipo(c.TIPO)) + '</td><td>' + pcEsc(c.TIPO) + '</td><td class="mono">' + pcEsc(c.MEDIDA) + '</td><td>' + pcEsc(c.TRABAJO) + (c.ID_RECETA ? '' : ' <span class="badge b-red">sin receta</span> <button class="btn btn-p btn-xs" onclick="event.stopPropagation();pcArmTrab(' + c.ID_CUB + ')">Cambiar trabajo</button>') + (c.REPROCESO_PEND ? ' <span class="badge b-orange">reproceso de ' + pcEsc(pcNroOS(c.REPROCESO_PEND)) + ': solo autoclave, control y pintura</span>' : '') + '</td><td>' + pcEsc(c.CLIENTE) + '</td><td class="mono">' + pcEsc(pcNroOTrab(c.ID_OTRAB)) + '</td><td class="mono">' + pcEsc(c.NRO_MANUAL || '') + '</td><td>' + fmtD(c.FECHA_RECEPCION) + '</td></tr>';
    }).join('') + '</tbody></table>' + (esp.length ? '' : '<div class="tdim" style="padding:12px">No hay cubiertas en espera.</div>') + '</div>' +
    '<div class="fr mt3" style="border-top:1px solid var(--border);padding-top:12px"></div>' +
    '<div class="fr"><div class="fg" id="pc-tope-wrap" style="display:none"><label class="fl">Carga mezclada: tope</label><select class="fs" id="pc-tope">' + d.lineas.filter(function(l) { return l.ACTIVO != 0; }).map(function(l) { return '<option value="' + l.LINEA + '">' + l.LINEA + ' (' + l.CAPACIDAD + ' + ' + l.SUPLENTES + ')</option>'; }).join('') + '</select></div>' +
    '<div class="fg"><label class="fl">Responsable de la carga *</label><select class="fs" id="pc-resp"><option value="">— elegí —</option>' + (d.empleados || []).map(function(e) { return '<option' + (PC_.resp === e ? ' selected' : '') + '>' + pcEsc(e) + '</option>'; }).join('') + '</select><div class="tdim" style="font-size:11px">Sale de Maestros › Empleados</div></div><div class="fg"><label class="fl">Observaciones (opcional)</label><input class="fi" id="pc-obs" placeholder="Solo si hay algo para aclarar"/></div></div>' +
    '<div class="flex gap2 mt3" style="flex-wrap:wrap"><button class="btn btn-s" id="pc-mat" onclick="pcMateriales()"><i class="fas fa-boxes-stacked"></i> ¿Alcanzan los materiales?</button><button class="btn btn-p" id="pc-crear" onclick="pcCrearOT()"><i class="fas fa-fire"></i> Crear orden de servicio</button></div><div id="pc-mat-res"></div></div></div>';
  $id('pc-body').innerHTML = h;
  document.querySelectorAll('#pc-body .pc-mk').forEach(function(e) { e.addEventListener('input', function() { PC_.mk[this.dataset.id] = this.value.toUpperCase().replace(/\s+/g, ''); }); });
  // Tildar NO redibuja: solo cambia la casilla y el contador (la pantalla no se mueve)
  document.querySelectorAll('#pc-tbl-armar .pc-ck').forEach(function(k) { k.addEventListener('change', function() { pcArmMarcar(this.dataset.id, this.checked ? this.dataset.v : ''); pcContador(); }); });
  $id('pc-a-todas').addEventListener('change', function() { pcArmTodas(this.checked); });
  $id('pc-resp').addEventListener('change', function() { PC_.resp = this.value; });
  $id('pc-a-f').addEventListener('input', function() { PC_.af = this.value; pcArmFiltrar(); });
  pcArmFiltrar(); pcContador();
}
// Texto donde busca: cliente, OT, N° de boleta, DOT, N° interno, medida, trabajo
function pcArmTxt(c) {
  return [c.CLIENTE, pcNroOTrab(c.ID_OTRAB), c.NRO_MANUAL, c.DOT, c.ID_CASCO, c.MEDIDA, c.TRABAJO, c.MARCA].join(' ').toUpperCase();
}
function pcArmFiltrar() {
  var q = String(PC_.af || '').toUpperCase().trim().split(/\s+/).filter(Boolean);
  document.querySelectorAll('#pc-tbl-armar .pc-a-tr').forEach(function(tr) {
    tr.style.display = q.every(function(p) { return tr.dataset.txt.indexOf(p) !== -1; }) ? '' : 'none';
  });
  var t = $id('pc-a-todas'); if (t) t.checked = false;
}
function pcArmCub(id) { return PC_.d.cubiertas.filter(function(x) { return String(x.ID_CUB) === String(id); })[0]; }
// Cuántos titulares hay ya en la línea de esa cubierta y cuál es el tope
function pcArmLugar(c) {
  var lin = pcLineaDeTipo(c.TIPO), l = PC_.d.lineas.filter(function(x) { return x.LINEA === lin; })[0] || { CAPACIDAD: 15 };
  var ya = Object.keys(PC_.sel).filter(function(i) { var k = pcArmCub(i); return PC_.sel[i] === 'TITULAR' && k && pcLineaDeTipo(k.TIPO) === lin; }).length;
  return { ya: ya, cap: +l.CAPACIDAD || 15 };
}
// Marca una cubierta (TITULAR, SUPLENTE o '' para sacarla) y deja las casillas de esa fila coherentes
function pcArmMarcar(id, v) {
  var c = pcArmCub(id);
  if (v === 'TITULAR' && PC_.sel[id] !== 'TITULAR' && c) { var l = pcArmLugar(c); if (l.ya >= l.cap) { toast('La carga ya tiene ' + l.cap + ' titulares. Marcala como suplente o sacá otra.', 'r2'); v = PC_.sel[id] || ''; } }
  if (v) PC_.sel[id] = v; else delete PC_.sel[id];
  document.querySelectorAll('#pc-tbl-armar .pc-ck[data-id="' + id + '"]').forEach(function(k) { k.checked = (k.dataset.v === v); });
}
// Casilla del encabezado: tilda todas las que se ven (hasta completar) o las destilda
function pcArmTodas(si) {
  var agreg = 0, lleno = 0;
  document.querySelectorAll('#pc-tbl-armar .pc-a-tr').forEach(function(tr) {
    if (tr.style.display === 'none') return;
    var id = tr.dataset.id, c = pcArmCub(id);
    if (!c || !c.ID_RECETA) return;
    if (!si) { if (PC_.sel[id]) pcArmMarcar(id, ''); return; }
    if (PC_.sel[id]) return;
    var l = pcArmLugar(c);
    if (l.ya < l.cap) { pcArmMarcar(id, 'TITULAR'); agreg++; } else lleno++;
  });
  pcContador();
  if (si && lleno) toast('Tildadas ' + agreg + ' · ' + lleno + ' no entran: la carga está completa', 'r2');
}
function pcArmDestildar() {
  Object.keys(PC_.sel).forEach(function(id) { pcArmMarcar(id, ''); });
  var t = $id('pc-a-todas'); if (t) t.checked = false;
  pcContador();
}
function pcContador() {
  var d = PC_.d, ids = Object.keys(PC_.sel);
  var tit = ids.filter(function(i) { return PC_.sel[i] === 'TITULAR'; }), sup = ids.filter(function(i) { return PC_.sel[i] === 'SUPLENTE'; });
  var lineas = {}; tit.concat(sup).forEach(function(i) { var c = d.cubiertas.filter(function(x) { return String(x.ID_CUB) === String(i); })[0]; if (c) lineas[pcLineaDeTipo(c.TIPO)] = true; });
  var lu = Object.keys(lineas), mezcla = lu.length > 1;
  // Cada línea tiene sus estaciones y su cocción: no se puede armar una carga mezclada (avisa antes de grabar)
  PC_.mezcla = mezcla ? lu : null;
  $id('pc-tope-wrap').style.display = 'none';
  var cr = $id('pc-crear'); if (cr) { cr.disabled = mezcla; cr.title = mezcla ? 'No se pueden mezclar ' + lu.join(' y ') + ' en una carga' : ''; }
  var av = $id('pc-mezcla-av'); if (!av && $id('pc-contador')) { av = document.createElement('div'); av.id = 'pc-mezcla-av'; av.className = 'al al-r'; av.style.marginTop = '6px'; $id('pc-contador').parentNode.appendChild(av); }
  if (av) { av.style.display = mezcla ? '' : 'none'; av.innerHTML = mezcla ? '⛔ Elegiste cubiertas de <b>' + pcEsc(lu.join(' y ')) + '</b>. No se pueden mezclar en la misma carga: cada línea tiene sus estaciones y su cocción. Destildá las de una línea y armá una carga por línea.' : ''; }
  var lin = lu[0];
  var l = d.lineas.filter(function(x) { return x.LINEA === lin; })[0] || { CAPACIDAD: 0, SUPLENTES: 0 };
  $id('pc-contador').textContent = (lin || '—') + ' · titulares ' + tit.length + '/' + l.CAPACIDAD + ' · suplentes ' + sup.length + '/' + l.SUPLENTES + (mezcla ? ' · NO SE PUEDE: carga mezclada' : '');
  $id('pc-contador').className = 'badge ' + (mezcla || tit.length > l.CAPACIDAD || sup.length > l.SUPLENTES ? 'b-red' : 'b-blue');
  $id('pc-tope').onchange = pcContador;
  var g = $id('pc-a-cont');
  if (g) {
    var cli = {}; tit.forEach(function(i) { var c = d.cubiertas.filter(function(x) { return String(x.ID_CUB) === String(i); })[0]; if (c) cli[c.CLIENTE] = (cli[c.CLIENTE] || 0) + 1; });
    var cap = +l.CAPACIDAD || 15;
    g.innerHTML = (lin || 'Carga') + ': ' + tit.length + ' de ' + cap + ' cubiertas' + (sup.length ? ' · ' + sup.length + (sup.length === 1 ? ' suplente' : ' suplentes') : '') + (tit.length >= cap ? ' · <span style="color:#15803d">COMPLETA</span>' : ' · faltan ' + (cap - tit.length)) +
      (tit.length ? '<div style="font-size:12px;font-weight:400;margin-top:3px">' + Object.keys(cli).map(function(k) { return pcEsc(k) + ' (' + cli[k] + ')'; }).join(' · ') + '</div>' : '');
    g.style.background = tit.length > cap ? '#fee2e2' : (tit.length >= cap ? '#dcfce7' : 'var(--accent-light)');
    if (mezcla) { g.innerHTML = 'Carga mezclada (' + pcEsc(lu.join(' + ')) + '): no se puede armar'; g.style.background = '#fee2e2'; }
  }
}
// ¿Alcanzan los materiales para las titulares tildadas? (receta de cada cubierta contra el stock de hoy)
async function pcMateriales() {
  var tit = Object.keys(PC_.sel).filter(function(i) { return PC_.sel[i] === 'TITULAR'; });
  if (!tit.length) { toast('Marcá las cubiertas titulares', 'r2'); return; }
  var b = $id('pc-mat'); if (b) b.disabled = true;
  try { var r = await gsRun('gsPC_MaterialesCarga', tit, PC_.alts || {}); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } pcMatPintar(r); }
  catch (e) { toast(e.message, 'r2'); } finally { if (b) b.disabled = false; }
}
function pcMatPintar(r) {
  var el = $id('pc-mat-res'); if (!el) return;
  var f = function(n) { return n === null || n === undefined ? '—' : n === true ? 'falta' : String(Math.round(n * 1000) / 1000).replace('.', ','); };
  el.innerHTML = '<div class="al ' + (r.FALTAN ? 'al-r' : 'al-g') + ' mt3"><b>' + (r.FALTAN ? '⛔ Faltan ' + r.FALTAN + (r.FALTAN === 1 ? ' material' : ' materiales') + ' para esta carga: elegí la alternativa de cada uno o conseguilo. Sin eso no se arma.' : '✓ Alcanzan los materiales para esta carga' + ((r.USADAS || []).length ? ' (con las alternativas elegidas)' : '')) + '</b> <span class="tdim" style="font-size:12px">(receta de cada cubierta contra el stock de hoy)</span></div>' +
    '<div class="tw"><table style="font-size:12px"><thead><tr><th>Material</th><th class="tr">Hace falta</th><th class="tr">Hay</th><th class="tr">Falta</th><th>Alternativa</th></tr></thead><tbody>' +
    r.LINEAS.map(function(x) {
      var alt = '';
      if (x.FALTA) alt = x.TIPO === 'HERRAMENTAL' ? '<span style="color:#b91c1c">Faltan piezas: dalas de alta en Herramental o sacá cubiertas de la carga</span>' :
        ((x.ALTERNATIVAS || []).length ? '<select class="fi pc-alt" data-de="' + pcEsc(x.ID_INSUMO) + '" style="min-width:220px"><option value="">— usar en su lugar —</option>' + x.ALTERNATIVAS.map(function(a) { return '<option value="' + pcEsc(a.ID_INSUMO) + '">' + pcEsc(a.NOMBRE) + ' · hay ' + f(a.HAY) + ' ' + pcEsc(a.UNIDAD) + '</option>'; }).join('') + '</select>' : '<span style="color:#b91c1c">Sin alternativa con stock: hay que comprarlo</span>');
      return '<tr' + (x.FALTA ? ' style="background:#fee2e2"' : '') + '><td>' + pcEsc(x.NOMBRE) + (x.TIPO === 'HERRAMENTAL' ? ' <span class="tdim">(piezas)</span>' : '') + '</td><td class="tr">' + f(x.NECESITA) + ' ' + pcEsc(x.UNIDAD) + '</td><td class="tr">' + f(x.HAY) + '</td><td class="tr">' + (x.FALTA ? '<b style="color:#b91c1c">' + f(x.FALTA) + '</b>' : '—') + '</td><td>' + alt + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    ((r.USADAS || []).length ? '<div class="al al-b mt3" style="font-size:12px"><b>Alternativas previstas para esta carga</b> (el operario las va a ver ya puestas): ' + r.USADAS.map(function(u) { return pcEsc(u.DE_NOMBRE) + ' → <b>' + pcEsc(u.POR_NOMBRE) + '</b> <a href="#" onclick="delete PC_.alts[\'' + pcEsc(u.DE) + '\'];pcMateriales();return false">quitar</a>'; }).join(' · ') + '</div>' : '');
  el.querySelectorAll('.pc-alt').forEach(function(sel) { sel.onchange = function() { PC_.alts = PC_.alts || {}; if (this.value) PC_.alts[this.dataset.de] = this.value; else delete PC_.alts[this.dataset.de]; pcMateriales(); }; });
  el.scrollIntoView({ block: 'nearest' });
}
// ── Preparación de la carga: por estación, lo que la receta prevé (con las alternativas de la carga). Lo que se pesa, con cuánto retirar. ──
async function pcPrep(id) {
  var r = await gsRun('gsPC_PrepCarga', id);
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  PC_.prep = r;
  var n3 = function(x) { return (Math.round((+x || 0) * 1000) / 1000).toString().replace('.', ','); };
  var pes = r.LINEAS.filter(function(l) { return l.PESA; });
  var h = '<div class="mh"><span class="mt">⚖ Preparación y pesaje · ' + pcEsc(r.NRO_OT) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="al al-b" style="margin-bottom:10px">Lo que la receta prevé para esta carga, estación por estación (cubiertas que todavía no pasaron por cada una). ' +
    'Con esto se deja todo listo antes de arrancar: lo que se pesa, se pesa ahora en el pesaje de inicio de cada estación.</div>' +
    (pes.length ? '<div style="font-weight:700;margin:6px 0">A pesar (retirar del depósito, con ' + r.MARGEN + '% de margen)</div><div class="tw"><table style="font-size:13px"><thead><tr><th>Estación</th><th>Insumo</th><th class="tr">Receta</th><th class="tr">Retirar</th><th class="tr">Cubiertas</th></tr></thead><tbody>' +
      pes.map(function(l) { return '<tr><td>' + pcEsc(l.ESTACION) + '</td><td><b>' + pcEsc(l.NOMBRE) + '</b></td><td class="tr">' + n3(l.CANT) + ' ' + pcEsc(l.UNIDAD) + '</td><td class="tr"><b>' + n3(l.RETIRAR) + ' ' + pcEsc(l.UNIDAD) + '</b></td><td class="tr">' + l.CUBIERTAS + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="tdim">En esta carga no hay insumos que se pesen.</div>') +
    '<div style="font-weight:700;margin:12px 0 6px">Todo lo que tiene que estar en cada estación</div><div class="tw"><table style="font-size:12px"><thead><tr><th>Estación</th><th>Material</th><th class="tr">Cantidad</th><th class="tr">Cubiertas</th></tr></thead><tbody>' +
    r.LINEAS.map(function(l) { return '<tr><td>' + pcEsc(l.ESTACION) + '</td><td>' + pcEsc(l.NOMBRE) + (l.PESA ? ' <span class="badge b-orange" style="font-size:9px">se pesa</span>' : '') + (l.HERRAMENTAL ? ' <span class="badge b-blue" style="font-size:9px">pieza</span>' : '') + '</td><td class="tr">' + n3(l.CANT) + ' ' + pcEsc(l.UNIDAD) + '</td><td class="tr">' + l.CUBIERTAS + '</td></tr>'; }).join('') +
    '</tbody></table></div></div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button><button class="btn btn-p" onclick="pcImpPrep()"><i class="fas fa-print"></i> Imprimir hoja de preparación</button></div>';
  closeModal(); showModal(h, 'md-lg');
}
function pcImpPrep() {
  var r = PC_.prep; if (!r) return;
  var n3 = function(x) { return (Math.round((+x || 0) * 1000) / 1000).toString().replace('.', ','); }, ests = [];
  r.LINEAS.forEach(function(l) { if (ests.indexOf(l.ESTACION) === -1) ests.push(l.ESTACION); });
  var h = pcEncImp('HOJA DE PREPARACIÓN Y PESAJE', r.NRO_OT) +
    '<div class="nota">Lo que la receta prevé para la carga. Lo marcado "PESAR" se pesa al retirarlo (margen ' + r.MARGEN + '%) y al final del día se pesa lo que sobra.</div>' +
    '<table><thead><tr><th>Estación</th><th>Material</th><th>Receta</th><th>Retirar</th><th>Pesado real</th><th class="ck">Listo</th></tr></thead><tbody>' +
    ests.map(function(e) { return r.LINEAS.filter(function(l) { return l.ESTACION === e; }).map(function(l, k) { return '<tr><td>' + (k ? '' : '<b>' + pcEsc(e) + '</b>') + '</td><td>' + pcEsc(l.NOMBRE) + (l.PESA ? ' <b>· PESAR</b>' : '') + '</td><td>' + n3(l.CANT) + ' ' + pcEsc(l.UNIDAD) + '</td><td>' + (l.PESA ? '<b>' + n3(l.RETIRAR) + ' ' + pcEsc(l.UNIDAD) + '</b>' : '') + '</td><td>' + (l.PESA ? '' : '—') + '</td><td class="ck"></td></tr>'; }).join(''); }).join('') +
    '</tbody></table><div class="firmas"><div>Preparó</div><div>Encargado de línea</div></div>';
  pcImprimir('Preparación ' + r.NRO_OT, h, false);
}
async function pcCrearOT() {
  var ids = Object.keys(PC_.sel);
  var tit = ids.filter(function(i) { return PC_.sel[i] === 'TITULAR'; }), sup = ids.filter(function(i) { return PC_.sel[i] === 'SUPLENTE'; });
  if (!tit.length) { toast('Marcá las cubiertas titulares', 'r2'); return; }
  if (!$v('pc-resp')) { toast('Elegí el responsable de la carga', 'r2'); $id('pc-resp').focus(); return; }
  if (PC_.mezcla) { toast('No se pueden mezclar ' + PC_.mezcla.join(' y ') + ' en la misma carga: armá una carga por línea', 'r2'); return; }
  var mezcla = false;
  var linea = '';
  var l = mezcla ? PC_.d.lineas.filter(function(x) { return x.LINEA === linea; })[0] : null;
  var b = $id('pc-crear'); b.disabled = true;
  try {
    var marcas = {}; tit.concat(sup).forEach(function(i) { if (PC_.mk[i]) marcas[i] = PC_.mk[i]; });
    var dat = { TITULARES: tit, SUPLENTES: sup, LINEA: linea, TOPE: l ? l.CAPACIDAD : '', RESPONSABLE: $v('pc-resp'), OBSERVACIONES: $v('pc-obs'), MARCAS: marcas, ALTERNATIVAS: PC_.alts || {} };
    var r = await gsRun('gsPC_CrearOT', dat);
    if (r && !r.ok && r.FALTAN_MATERIALES) { pcMatPintar(r.FALTAN_MATERIALES); toast(r.error, 'r2'); return; }
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    PC_.alts = {};
    PC_.mk = {};
    toast('Orden de servicio ' + r.NRO_OT + ' creada (' + r.LINEA + ', tope ' + r.TOPE + ') ✓', 'g');
    PC_.sel = {}; PC_.armAuto = 0; PC_.tab = 'os'; await pcRecargar(); await pcAbrirOT(r.ID_OT); pcPrep(r.ID_OT);
  } catch (e) { toast('Error: ' + e.message, 'r2'); }
  finally { b.disabled = false; }
}

// ── Órdenes ──
// ── Historial: todas las cubiertas, órdenes de trabajo y de servicio, con su recorrido completo, filtros por fecha y estado ──
function pcHist() {
  if (!PC_.hd) { $id('pc-body').innerHTML = '<div class="al al-b tc" style="padding:24px"><i class="fas fa-sync-alt fa-spin"></i> Cargando historial...</div>'; pcHistCargar(); return; }
  var sub = PC_.hsub || 'cub', hoy = new Date(), hace = new Date(hoy.getTime() - 90 * 86400000);
  if (PC_.hdesde === undefined) PC_.hdesde = fechaISO(hace);
  if (PC_.hhasta === undefined) PC_.hhasta = fechaISO(hoy);
  var h = '<div class="flex gap2 mb3" style="flex-wrap:wrap;align-items:flex-end">' +
    '<div style="flex:1 1 260px;max-width:380px"><label class="fl">Buscar (cliente, OT, boleta, DOT, N° interno, marca, remito)</label><input class="fi" id="pc-h-q" value="' + pcEsc(PC_.hq || '') + '" autocomplete="off"/></div>' +
    '<div><label class="fl">Recibidas desde</label><input class="fi" type="date" id="pc-h-d" value="' + pcEsc(PC_.hdesde) + '" style="width:150px"/></div>' +
    '<div><label class="fl">hasta</label><input class="fi" type="date" id="pc-h-h" value="' + pcEsc(PC_.hhasta) + '" style="width:150px"/></div>' +
    '<div><label class="fl">Etapa</label><select class="fs" id="pc-h-e" style="width:170px">' + [['', 'Todas'], ['ESPERA', 'Esperando entrar'], ['LINEA', 'En la línea'], ['TERMINADA', 'Terminada sin entregar'], ['ENTREGADA', 'Entregada'], ['NOAPTA', 'No apta / rechazada'], ['ANULADA', 'Anulada']].map(function(x) { return '<option value="' + x[0] + '"' + (PC_.hest === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></div>' +
    '<button class="btn btn-s" onclick="PC_.hd=null;pcHist()" title="Volver a leer"><i class="fas fa-sync-alt"></i></button></div>' +
    '<div class="flex gap2 mb3">' + [['cub', 'Cubiertas'], ['otr', 'Órdenes de trabajo'], ['os', 'Órdenes de servicio']].map(function(x) { return '<button class="btn ' + (sub === x[0] ? 'btn-p' : 'btn-s') + '" onclick="PC_.hsub=\'' + x[0] + '\';PC_.hpag=1;pcHist()">' + x[1] + '</button>'; }).join('') + '</div><div id="pc-h-res"></div>';
  $id('pc-body').innerHTML = h;
  $id('pc-h-q').addEventListener('input', function() { PC_.hq = this.value; PC_.hpag = 1; pcHistPintar(); });
  $id('pc-h-d').addEventListener('change', function() { PC_.hdesde = this.value; PC_.hpag = 1; pcHistPintar(); });
  $id('pc-h-h').addEventListener('change', function() { PC_.hhasta = this.value; PC_.hpag = 1; pcHistPintar(); });
  $id('pc-h-e').addEventListener('change', function() { PC_.hest = this.value; PC_.hpag = 1; pcHistPintar(); });
  pcHistPintar();
}
async function pcHistCargar() {
  try { var r = await gsRun('gsPC_HistDatos'); if (!r || !r.ok) throw new Error((r && r.error) || 'sin datos'); PC_.hd = r.CUBIERTAS; }
  catch (e) { $id('pc-body').innerHTML = '<div class="al al-r">No se pudo leer el historial: ' + pcEsc(e.message || e) + '</div>'; return; }
  if (PC_.tab === 'hist') pcHist();
}
// Etapa de una cubierta para el historial: [clave, clase, texto]
function pcHistEtapa(c) {
  if (c.ESTADO === 'ANULADA') return ['ANULADA', 'b-gray', 'Anulada'];
  if (c.ESTADO === 'RECHAZADA') { var rf = /^Rechazo final/i.test(String(c.MOTIVO_RECHAZO || '')) ? 'Rechazo final' : (c.INSPECCION === 'APTA' ? 'Rechazada' : 'No apta'); return ['NOAPTA', 'b-red', c.FECHA_DEVOLUCION || c.REMITO_ESTADO === 'ENTREGADO' ? rf + ' · devuelta' : rf]; }
  if (c.REMITO_ESTADO === 'ENTREGADO') return ['ENTREGADA', 'b-green', 'Entregada'];
  if (c.ESTADO === 'TERMINADA' || c.ESTADO === 'ENTREGADA') return ['TERMINADA', 'b-purple', c.REMITO ? 'Terminada · remito sin firmar' : 'Terminada'];
  if (c.ESTADO === 'EN_OT') return ['LINEA', 'b-blue', 'En la línea' + (c.ESTACION ? ' · ' + c.ESTACION : '')];
  if (c.ESTADO === 'EN_ESPERA') return ['ESPERA', 'b-orange', 'Esperando entrar'];
  return ['', 'b-gray', PC_EST_TXT[c.ESTADO] || c.ESTADO];
}
function pcHistFiltrar() {
  var q = String(PC_.hq || '').toUpperCase().trim(), est = PC_.hest || '';
  var d0 = PC_.hdesde ? new Date(PC_.hdesde + 'T00:00:00').getTime() : 0, d1 = PC_.hhasta ? new Date(PC_.hhasta + 'T23:59:59').getTime() : Infinity;
  return (PC_.hd || []).filter(function(c) {
    if (c.RECIBIDA && (c.RECIBIDA < d0 || c.RECIBIDA > d1)) return false;
    if (est && pcHistEtapa(c)[0] !== est) return false;
    if (q) { var t = [c.CLIENTE, c.OT, c.BOLETA, c.DOT, c.N_INTERNO, c.MARCA, c.MEDIDA, c.TRABAJO, c.OS, c.REMITO, c.FABRICANTE].join(' ').toUpperCase(); if (!q.split(/\s+/).every(function(p) { return t.indexOf(p) !== -1; })) return false; }
    return true;
  });
}
function pcHistPag(total, por) {
  var pages = Math.max(1, Math.ceil(total / por)); if ((PC_.hpag || 1) > pages) PC_.hpag = pages;
  var p = PC_.hpag || 1;
  return { desde: (p - 1) * por, hasta: p * por, html: pages > 1 ? '<div class="flex gap2" style="padding:8px 12px;align-items:center"><button class="btn btn-s btn-xs" ' + (p <= 1 ? 'disabled' : '') + ' onclick="PC_.hpag=' + (p - 1) + ';pcHistPintar()">‹ Anterior</button><span style="font-size:12px">Página ' + p + ' de ' + pages + '</span><button class="btn btn-s btn-xs" ' + (p >= pages ? 'disabled' : '') + ' onclick="PC_.hpag=' + (p + 1) + ';pcHistPintar()">Siguiente ›</button></div>' : '' };
}
function pcHistPintar() {
  var el = $id('pc-h-res'); if (!el) return;
  var d = PC_.d, sub = PC_.hsub || 'cub', cs = pcHistFiltrar(), r = '', fd = function(t) { return t ? fmtD(t) : '—'; };
  if (sub === 'cub') {
    cs.sort(function(a, b) { return (b.RECIBIDA - a.RECIBIDA) || (b.ID_CUB - a.ID_CUB); });
    var pg = pcHistPag(cs.length, 100);
    var cont = {}; cs.forEach(function(c) { var k = pcHistEtapa(c)[0]; cont[k] = (cont[k] || 0) + 1; });
    r = '<div class="card"><div class="card-hd"><span class="card-title">Cubiertas (' + cs.length + ')</span><span class="tdim" style="font-size:12px">Esperando ' + (cont.ESPERA || 0) + ' · En la línea ' + (cont.LINEA || 0) + ' · Terminadas ' + (cont.TERMINADA || 0) + ' · Entregadas ' + (cont.ENTREGADA || 0) + ' · No aptas ' + (cont.NOAPTA || 0) + (cont.ANULADA ? ' · Anuladas ' + cont.ANULADA : '') + '</span></div>' +
      '<div class="tw"><table style="font-size:12px" id="pc-h-tcub"><thead><tr><th>Recibida</th><th>OT · boleta</th><th>Cliente</th><th>DOT · N° int.</th><th>Fábrica</th><th>Medida</th><th>Trabajo</th><th>Etapa</th><th>Orden de servicio</th><th>Terminada</th><th>Remito · entrega</th><th>Marca grabada</th></tr></thead><tbody>' +
      (cs.length ? cs.slice(pg.desde, pg.hasta).map(function(c) {
        var e = pcHistEtapa(c);
        return '<tr style="cursor:pointer" title="Ver la vida de la cubierta" onclick="pcHistorial(\'CUB:' + c.ID_CUB + '\')"><td>' + fd(c.RECIBIDA) + '</td>' +
          '<td class="mono">' + pcEsc(c.OT || '—') + (c.BOLETA ? '<div class="tdim" style="font-size:10px">boleta ' + pcEsc(c.BOLETA) + '</div>' : '') + '</td><td>' + pcEsc(c.CLIENTE) + '</td>' +
          '<td class="mono">' + pcDotTxt(c.DOT) + (c.N_INTERNO ? '<div class="tdim" style="font-size:10px">N° int. ' + pcEsc(c.N_INTERNO) + '</div>' : '') + '</td><td>' + pcEsc(c.FABRICANTE || '—') + '</td><td class="mono">' + pcEsc(c.MEDIDA) + '</td><td>' + pcEsc(c.TRABAJO) + '</td>' +
          '<td><span class="badge ' + e[1] + '">' + pcEsc(e[2]) + '</span>' + (c.REPROCESOS ? '<div class="twarn" style="font-size:10px">' + c.REPROCESOS + ' reproceso' + (c.REPROCESOS > 1 ? 's' : '') + '</div>' : '') + (c.MOTIVO_RECHAZO && e[0] === 'NOAPTA' ? '<div class="tred" style="font-size:10px">' + pcEsc(c.MOTIVO_RECHAZO) + '</div>' : '') + '</td>' +
          '<td class="mono">' + (c.OS ? '<a href="#" onclick="event.stopPropagation();pcAbrirOT(' + c.ID_OT + ');return false">' + pcEsc(c.OS) + '</a>' : '—') + '</td><td>' + fd(c.TERMINADA) + '</td>' +
          '<td class="mono">' + (c.REMITO ? pcEsc(c.REMITO) + '<div style="font-size:10px" class="' + (c.REMITO_ESTADO === 'ENTREGADO' ? 'tgreen' : 'twarn') + '">' + (c.REMITO_ESTADO === 'ENTREGADO' ? 'entregado ' + fd(c.FECHA_ENTREGA) + (c.RECIBE ? ' · ' + pcEsc(c.RECIBE) : '') : 'sin firmar') + '</div>' : '—') + '</td>' +
          '<td class="mono">' + (c.MARCA ? pcEsc(c.MARCA) : '—') + ' <button class="btn btn-s btn-xs" onclick="event.stopPropagation();pcHistorial(\'CUB:' + c.ID_CUB + '\')">Ver</button></td></tr>';
      }).join('') : '<tr><td colspan="12" class="tc tdim" style="padding:16px">No hay cubiertas con esos filtros.</td></tr>') + '</tbody></table></div>' + pg.html + '</div>';
  } else if (sub === 'otr') {
    var porOT = {}; cs.forEach(function(c) { if (!c.ID_OTRAB) return; var k = c.ID_OTRAB; var x = porOT[k] = porOT[k] || { n: 0, ESPERA: 0, LINEA: 0, TERMINADA: 0, ENTREGADA: 0, NOAPTA: 0, ANULADA: 0 }; var e = pcHistEtapa(c)[0]; if (e !== 'ANULADA') x.n++; x[e] = (x[e] || 0) + 1; });
    var q = String(PC_.hq || '').toUpperCase().trim();
    var lo = (d.ordTrabajo || []).filter(function(o) { return porOT[String(o.ID_OTRAB)] || (q && [o.NRO, o.CLIENTE, o.NRO_MANUAL].join(' ').toUpperCase().indexOf(q) !== -1); }).sort(function(a, b) { return b.ID_OTRAB - a.ID_OTRAB; });
    var pg2 = pcHistPag(lo.length, 100);
    r = '<div class="card"><div class="card-hd"><span class="card-title">Órdenes de trabajo (' + lo.length + ')</span></div><div class="tw"><table style="font-size:12px" id="pc-h-tot"><thead><tr><th>N° de orden</th><th>Fecha</th><th>Cliente</th><th>Sistema</th><th class="tr">Cubiertas</th><th class="tr">Esperando</th><th class="tr">En línea</th><th class="tr">Terminadas</th><th class="tr">Entregadas</th><th class="tr">No aptas</th><th>Estado</th><th></th></tr></thead><tbody>' +
      (lo.length ? lo.slice(pg2.desde, pg2.hasta).map(function(o) {
        var x = porOT[String(o.ID_OTRAB)] || { n: 0 }, fin = o.ESTADO !== 'ANULADA' && x.n > 0 && !(x.ESPERA || x.LINEA || x.TERMINADA);
        var est = o.ESTADO === 'ANULADA' ? '<span class="badge b-gray">Anulada</span>' : fin ? '<span class="badge b-green">Completa</span>' : '<span class="badge b-blue">En curso</span>';
        return '<tr' + (o.ESTADO === 'ANULADA' ? ' style="opacity:.55"' : '') + '><td class="mono"><b>' + pcEsc(o.NRO_MANUAL ? 'Boleta ' + o.NRO_MANUAL : o.NRO) + '</b></td><td>' + fmtD(+o.FECHA) + '</td><td>' + pcEsc(o.CLIENTE) + '</td><td class="mono">' + pcEsc(o.NRO_MANUAL ? o.NRO : '—') + '</td>' +
          '<td class="tr">' + x.n + '</td><td class="tr">' + (x.ESPERA || '') + '</td><td class="tr">' + (x.LINEA || '') + '</td><td class="tr">' + (x.TERMINADA || '') + '</td><td class="tr tgreen">' + (x.ENTREGADA || '') + '</td><td class="tr tred">' + (x.NOAPTA || '') + '</td><td>' + est + '</td>' +
          '<td style="white-space:nowrap"><button class="btn btn-p btn-xs" onclick="pcOTrabVer(' + o.ID_OTRAB + ')">Ver</button> <button class="btn btn-s btn-xs" onclick="pcImpOTrab(' + o.ID_OTRAB + ')" title="Imprimir"><i class="fas fa-print"></i></button></td></tr>';
      }).join('') : '<tr><td colspan="12" class="tc tdim" style="padding:16px">No hay órdenes con esos filtros.</td></tr>') + '</tbody></table></div>' + pg2.html + '</div>';
  } else {
    var q2 = String(PC_.hq || '').toUpperCase().trim(), conCub = {};
    cs.forEach(function(c) { if (c.ID_OT) conCub[String(c.ID_OT)] = true; });
    var d0 = PC_.hdesde ? new Date(PC_.hdesde + 'T00:00:00').getTime() : 0, d1 = PC_.hhasta ? new Date(PC_.hhasta + 'T23:59:59').getTime() : Infinity;
    var os = d.ots.filter(function(o) { var f = +o.FECHA || 0; return (conCub[String(o.ID_OT)] || (f >= d0 && f <= d1)) && (!q2 || conCub[String(o.ID_OT)] || [o.NRO_OT, o.LINEA, o.ESTADO].join(' ').toUpperCase().indexOf(q2) !== -1); }).sort(function(a, b) { return b.ID_OT - a.ID_OT; });
    var pg3 = pcHistPag(os.length, 100);
    r = '<div class="card"><div class="card-hd"><span class="card-title">Órdenes de servicio (' + os.length + ')</span></div><div class="tw"><table style="font-size:12px" id="pc-h-tos"><thead><tr><th>Orden</th><th>Fecha</th><th>Cierre</th><th>Línea</th><th class="tr">Titulares</th><th class="tr">Terminadas</th><th>Estado</th><th></th></tr></thead><tbody>' +
      (os.length ? os.slice(pg3.desde, pg3.hasta).map(function(o) { return '<tr' + (o.ESTADO === 'ANULADA' ? ' style="opacity:.55"' : '') + '><td class="mono"><b>' + pcEsc(o.NRO_OT) + '</b></td><td>' + fmtD(o.FECHA) + '</td><td>' + (o.FECHA_CIERRE ? fmtD(o.FECHA_CIERRE) : '—') + '</td><td>' + pcEsc(o.LINEA) + '</td><td class="tr">' + o.TITULARES + '/' + o.TOPE + '</td><td class="tr">' + o.TERMINADAS + '</td><td>' + pcBadge(o.ESTADO) + '</td>' +
        '<td style="white-space:nowrap"><button class="btn btn-p btn-xs" onclick="pcAbrirOT(' + o.ID_OT + ')">Abrir</button> <button class="btn btn-s btn-xs" onclick="pcImpOS(' + o.ID_OT + ')" title="Imprimir"><i class="fas fa-print"></i></button>' + (o.ESTADO === 'CERRADA' ? ' <button class="btn btn-s btn-xs" onclick="pcRemitos(' + o.ID_OT + ')">Remitos</button>' : '') + '</td></tr>'; }).join('') : '<tr><td colspan="8" class="tc tdim" style="padding:16px">No hay órdenes con esos filtros.</td></tr>') + '</tbody></table></div>' + pg3.html + '</div>';
  }
  el.innerHTML = r;
}
function pcOts() { $id('pc-body').innerHTML = pcOtsHtml(); }
function pcOtsHtml() {
  var d = PC_.d;
  var ots = d.ots.filter(function(o) { return o.ESTADO === 'ARMADA' || o.ESTADO === 'EN_PROCESO'; }).sort(function(a, b) { return b.ID_OT - a.ID_OT; });
  return '<div class="card mb3"><div class="card-hd"><span class="card-title">En la línea ahora (' + ots.length + ')</span><span class="tdim" style="font-size:12px">Las cerradas y anuladas están en "Historial"</span></div><div class="tw"><table style="font-size:12px" id="pc-tbl-ots"><thead><tr><th>OT</th><th>Fecha</th><th>Línea</th><th class="tr">Titulares</th><th class="tr">Suplentes</th><th class="tr">Terminadas</th><th>Estado</th><th></th></tr></thead><tbody>' +
    ots.map(function(o) { return '<tr><td class="mono"><b>' + pcEsc(o.NRO_OT) + '</b></td><td>' + fmtD(o.FECHA) + '</td><td>' + pcEsc(o.LINEA) + ' (tope ' + o.TOPE + ')</td><td class="tr">' + o.TITULARES + '/' + o.TOPE + '</td><td class="tr">' + o.SUPLENTES + '</td><td class="tr">' + o.TERMINADAS + '</td><td>' + pcBadge(o.ESTADO) + '</td><td style="white-space:nowrap"><button class="btn btn-p btn-sm" onclick="pcAbrirOT(' + o.ID_OT + ')">Abrir</button> <button class="btn btn-s btn-sm" onclick="pcImpOS(' + o.ID_OT + ')"><i class="fas fa-print"></i> Imprimir</button></td></tr>'; }).join('') +
    '</tbody></table>' + (ots.length ? '' : '<div class="tdim" style="padding:12px">No hay órdenes de servicio en la línea. Se arman acá abajo.</div>') + '</div></div><div id="pc-ot"></div>';
}
async function pcAbrirOT(id) {
  var r = await gsRun('gsPC_OTDetalle', id);
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo abrir', 'r2'); return; }
  PC_.ot = r;
  if (PC_.tab !== 'os') { PC_.tab = 'os'; pcPintar(); }
  pcPintarOT();
  var po = $id('pc-ot'); if (po && po.scrollIntoView) po.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function pcEstacionesOT() {
  var ot = PC_.ot, est = pcEstLin(ot.ot && ot.ot.LINEA).slice(), usadas = {};
  ot.items.forEach(function(i) { i.LINEAS.forEach(function(l) { usadas[l.ID_ESTACION] = true; }); });
  var todas = +((PC_.d.param || {}).ESTACIONES_OBLIGATORIAS) === 1;
  var cols = est.filter(function(e) { return todas || usadas[String(e.ID_ESTACION)]; }).map(function(e) { return { id: String(e.ID_ESTACION), nombre: (e.NRO || e.ORDEN) + '. ' + e.NOMBRE }; });
  if (usadas[''] && !todas) cols.unshift({ id: '', nombre: 'General' });
  return cols;
}
// Minutos con coma → fácil de leer: 0,32 → "19 seg"; 2,08 → "2 min 05 seg"
function pcDur(minutos) {
  var seg = Math.round((Number(minutos) || 0) * 60);
  if (seg < 60) return seg + ' seg';
  var m = Math.floor(seg / 60), r = seg % 60;
  if (m < 60) return m + ' min' + (r ? ' ' + (r < 10 ? '0' : '') + r + ' seg' : '');
  return Math.floor(m / 60) + ' h ' + (m % 60) + ' min';
}
function pcPintarOT() {
  var ot = PC_.ot, o = ot.ot, cols = pcEstacionesOT(), abierta = o.ESTADO === 'ARMADA' || o.ESTADO === 'EN_PROCESO';
  var tot = { mat: 0, herr: 0, mo: 0, fij: 0, t: 0, n: 0 };
  ot.items.forEach(function(i) { if (i.ESTADO === 'TERMINADA') { tot.mat += i.COSTO.MATERIALES; tot.herr += i.COSTO.HERRAMENTAL; tot.mo += i.COSTO.MO; tot.fij += i.COSTO.FIJOS; tot.t += i.COSTO.TOTAL; tot.n++; } });
  var h = '<div class="card mt3"><div class="card-hd"><span class="card-title">' + pcEsc(o.NRO_OT) + ' · ' + pcEsc(o.LINEA) + ' · tope ' + o.TOPE + ' + ' + o.SUPLENTES_MAX + ' suplentes ' + pcBadge(o.ESTADO) + '</span>' +
    '<span class="flex gap2">' + (abierta && ot.soyEncargado ? '<button class="btn btn-s btn-sm" onclick="pcTiempos()"><i class="fas fa-stopwatch"></i> Tiempos</button>' : '') +
    (abierta ? '<button class="btn btn-p btn-sm" onclick="pcPrep(' + o.ID_OT + ')">⚖ Preparación y pesaje</button>' : '') +
    '<button class="btn btn-s btn-sm" onclick="pcImpOS(' + o.ID_OT + ')"><i class="fas fa-print"></i> Imprimir</button>' +
    (o.ESTADO === 'CERRADA' ? '<button class="btn btn-p btn-sm" onclick="pcRemitos(' + o.ID_OT + ')"><i class="fas fa-file-alt"></i> Remitos</button>' : '') +
    (abierta && pcPuede('EDITAR') ? '<button class="btn btn-p btn-sm" onclick="pcCerrarOT()">Cerrar OT</button>' : '') +
    (abierta && pcPuede('ANULAR') ? '<button class="btn btn-s btn-sm" onclick="pcAnularOT()">Anular OT</button>' : '') + '</span></div>' +
    (o.OBSERVACIONES ? '<div class="tdim" style="padding:0 14px;font-size:12px">' + pcEsc(o.OBSERVACIONES) + '</div>' : '') +
    '<div class="tw"><table style="font-size:12px" id="pc-grid"><thead><tr><th>#</th><th>Marca grabada · DOT</th><th>Cubierta</th><th>Rol</th>' + cols.map(function(c) { return '<th class="tc" style="min-width:70px;max-width:120px;white-space:normal">' + pcEsc(c.nombre) + '</th>'; }).join('') + '<th>Estado</th><th class="tr">Costo</th><th></th></tr></thead><tbody>' +
    ot.items.map(function(i) {
      var fuera = i.ESTADO === 'RETIRADA';
      return '<tr' + (fuera ? ' style="opacity:.45"' : '') + '><td>' + i.ORDEN + '</td><td class="mono"><b>' + pcEsc(i.MARCA) + '</b>' + pcCubIdent(i) +
        (i.POS_AUTOCLAVE ? '<div class="tdim" style="font-size:10px">autoclave lugar ' + pcEsc(i.POS_AUTOCLAVE) + '</div>' : '') +
        (i.PASADA > 1 ? '<div><span class="badge b-orange" style="font-size:9px">' + (i.PULIR ? 'repulir' : 'corrección') + '</span></div>' : '') +
        (i.REPROCESO_DE ? '<div><span class="badge b-orange" style="font-size:9px">reproceso de ' + pcEsc(i.REPROCESO_DE) + '</span></div>' : '') +
        (i.REPROCESO_EN ? '<div class="tdim" style="font-size:10px">siguió en ' + pcEsc(i.REPROCESO_EN) + '</div>' : '') + '</td><td style="font-size:11px;min-width:170px">' + pcEsc(i.TIPO + ' ' + i.MEDIDA) + '<div class="tdim">' + pcEsc(i.TRABAJO + ' · ' + i.CLIENTE) + '</div></td><td>' + (i.ROL === 'SUPLENTE' ? '<span class="badge b-orange">suplente</span>' : 'titular') + '</td>' +
        (function() { var obl = +((PC_.d.param || {}).ESTACIONES_OBLIGATORIAS) === 1, act = !fuera && (i.ESTADO === 'PENDIENTE' || i.ESTADO === 'EN_PROCESO');
          i._hh = {}; if (i.HECHAS) i.HECHAS.forEach(function(x) { i._hh[x.ID_ESTACION] = x; }); else i.REGISTROS.forEach(function(r) { i._hh[r.ID_ESTACION] = r; });
          i._aca = null; if (obl && act) { for (var q = 0; q < cols.length; q++) { if (cols[q].id && !i._hh[cols[q].id]) { i._aca = cols[q].id; break; } } } return ''; })() +
        cols.map(function(c) {
          var tiene = i.LINEAS.some(function(l) { return l.ID_ESTACION === c.id; });
          var reg = i.REGISTROS.filter(function(r) { return r.ID_ESTACION === c.id; }).sort(function(a, b) { return (b.PASADA || 1) - (a.PASADA || 1); })[0];
          var corregir = (i.REHACER || []).indexOf(c.id) !== -1 && i.PASADA > 1 && (!reg || (reg.PASADA || 1) < i.PASADA);
          var previa = i._hh[c.id] && i._hh[c.id].PREVIA;
          if (corregir) reg = null;
          if (!tiene && !reg && +((PC_.d.param || {}).ESTACIONES_OBLIGATORIAS) !== 1) return '<td class="tc tdim">—</td>';
          var min = i.TIEMPOS.filter(function(t) { return t.ID_ESTACION === c.id; })[0];
          var cel = previa ? '<span class="tdim" title="Hecha en la orden anterior">✓</span>' : (!reg && i._aca === c.id ? '<span class="badge b-' + (corregir ? 'orange' : 'blue') + '" title="La cubierta está esperando en esta estación">' + (corregir ? '↻ corregir' : '⏳ acá está') + '</span>' : (corregir ? '<span class="badge b-orange">↻ corregir</span>' : reg ? (reg.RESULTADO === 'OK' ? '<span style="color:var(--success);font-weight:700">✓' + ((reg.PASADA || 1) > 1 ? '²' : '') + '</span>' : (reg.RESULTADO === 'NO_APLICA' ? '<span class="tdim" title="No pasa por esta estación">⊘</span>' : (reg.RESULTADO === 'REPROCESO' || reg.RESULTADO === 'PULIR' ? '<span style="color:var(--warn);font-weight:700" title="' + pcEsc(reg.OBSERVACION) + '">' + (reg.RESULTADO === 'PULIR' ? '✂' : '↻') + '</span>' : '<span style="color:var(--danger);font-weight:700" title="' + pcEsc(reg.OBSERVACION || '') + '">✗</span>'))) : '<span class="tdim">·</span>'));
          var click = abierta && !fuera && (i.ESTADO === 'PENDIENTE' || i.ESTADO === 'EN_PROCESO') ? ' style="cursor:pointer" onclick="pcRegistro(' + i.ID_CUB + ',\'' + c.id + '\')"' : '';
          return '<td class="tc"' + click + '>' + cel + (min ? '<div class="tdim" style="font-size:10px">' + pcDur(min.MINUTOS) + '</div>' : '') + '</td>';
        }).join('') +
        '<td>' + pcBadge(i.ESTADO) + '</td><td class="tr mono">' + (i.COSTO.TOTAL ? fmt(i.COSTO.TOTAL) : '—') + '</td>' +
        '<td style="white-space:nowrap">' + (abierta && (i.ESTADO === 'PENDIENTE' || i.ESTADO === 'EN_PROCESO') ?
          (i.REGISTROS.length ? '<button class="btn btn-p btn-xs" onclick="pcTerminar(' + i.ID_CUB + ',\'TERMINADA\')">Terminar</button> ' : '') + '<button class="btn btn-s btn-xs" onclick="pcTerminar(' + i.ID_CUB + ',\'RECHAZADA\')">Rechazar</button> ' +
          (i.ROL === 'SUPLENTE' ? '<button class="btn btn-s btn-xs" onclick="pcPromover(' + i.ID_CUB + ')">A titular</button> ' : '') +
          (i.REGISTROS.length ? '' : '<button class="btn btn-s btn-xs" onclick="pcRetirar(' + i.ID_CUB + ')">Sacar</button>') : (i.ESTADO === 'TERMINADA' ? '<button class="btn btn-s btn-xs" onclick="pcVerCosto(' + i.ID_CUB + ')">Costo</button>' : '')) + '</td></tr>';
    }).join('') + '</tbody></table></div>' +
    (tot.n ? '<div class="flex jb" style="padding:10px 14px;font-size:12px"><span class="tdim">Terminadas: ' + tot.n + ' · materiales ' + fmt(tot.mat) + ' · herramental ' + fmt(tot.herr) + ' · mano de obra ' + fmt(tot.mo) + ' · fijos ' + fmt(tot.fij) + '</span><b>Promedio por cubierta ' + fmt(tot.t / tot.n) + '</b></div>' : '') +
    '<div class="tdim" style="padding:8px 14px;font-size:11px">Tocá una celda para registrar la estación (insumos reales, herramental, resultado). Para corregir, abrí la celda y anulá el registro.</div></div>';
  $id('pc-ot').innerHTML = h;
}

// Registro de una estación
function pcRegistro(idCub, est) {
  var ot = PC_.ot, i = ot.items.filter(function(x) { return String(x.ID_CUB) === String(idCub); })[0];
  var reg = i.REGISTROS.filter(function(r) { return r.ID_ESTACION === est; })[0];
  var nombre = est === '' ? 'General' : (PC_.d.estaciones.filter(function(e) { return String(e.ID_ESTACION) === est; })[0] || {}).NOMBRE;
  if (reg) {
    var cs = i.CONSUMOS.filter(function(c) { return String(c.ID_REG) === String(reg.ID_REG); });
    showModal('<div class="mh"><span class="mt">' + pcMkDot(i) + ' · ' + pcEsc(nombre) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
      '<p>Resultado: <b>' + reg.RESULTADO + '</b> · ' + fmtD(reg.FECHA) + ' · ' + pcEsc(reg.USUARIO) + (reg.OPERARIO ? ' · operario ' + pcEsc(reg.OPERARIO) : '') + '</p>' + (reg.OBSERVACION ? '<p class="tdim">' + pcEsc(reg.OBSERVACION) + '</p>' : '') +
      '<table style="font-size:12px"><thead><tr><th>Insumo</th><th class="tr">Previsto</th><th class="tr">Real</th><th class="tr">Dif.</th><th class="tr">Costo</th></tr></thead><tbody>' +
      cs.map(function(c) { return '<tr><td>' + pcEsc(c.ID_INSUMO) + (+c.REEMPLAZO ? ' <span class="badge b-orange">reemplazo de ' + pcEsc(c.ID_INSUMO_RECETA) + '</span>' : '') + (c.MOTIVO ? '<div class="tdim" style="font-size:10px">' + pcEsc(c.MOTIVO) + '</div>' : '') + '</td><td class="tr">' + fmtN(c.PREVISTO) + '</td><td class="tr">' + fmtN(c.REAL) + ' ' + pcEsc(c.UNIDAD) + '</td><td class="tr">' + Math.round(c.DIF_PCT * 100) + '%</td><td class="tr mono">' + fmt(c.COSTO) + '</td></tr>'; }).join('') + '</tbody></table>' +
      i.HERRAMENTAL.filter(function(hh) { return true; }).map(function(hh) { return '<div class="tdim" style="font-size:12px">Herramental: ' + pcEsc(hh.CODIGO) + ' (uso ' + hh.NRO_USO + ' de ' + (hh.MAX_USOS || '∞') + ')</div>'; }).join('') +
      '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button>' + (pcPuede('ANULAR') ? '<button class="btn btn-d" onclick="pcAnularRegistro(' + reg.ID_REG + ')">Anular registro</button>' : '') + '</div>', 'md-lg');
    return;
  }
  var lineas = i.LINEAS.filter(function(l) { return l.ID_ESTACION === est; });
  var tol = ot.tolerancia || 0;
  var insumos = PC_.d.insumos || [];
  var herr = function(l) {
    var ps = ot.piezasDisponibles.filter(function(p) { return p.ID_INSUMO === l.ID_INSUMO; }), otras = ot.piezasDisponibles.filter(function(p) { return p.ID_INSUMO !== l.ID_INSUMO; });
    return '<select class="fs pc-pieza" style="width:260px"><option value="">— sin pieza registrada —</option>' + ps.map(function(p) { return '<option value="' + p.ID_PIEZA + '">' + pcEsc(p.CODIGO) + ' (usos ' + p.USOS + '/' + (p.MAX_USOS || '∞') + ')</option>'; }).join('') +
      (otras.length ? '<optgroup label="Otras piezas (reemplazo, requiere encargado)">' + otras.map(function(p) { return '<option value="' + p.ID_PIEZA + '" data-otro="1">' + pcEsc(p.CODIGO) + '</option>'; }).join('') + '</optgroup>' : '') + '</select>';
  };
  showModal('<div class="mh"><span class="mt">Registrar ' + pcEsc(nombre) + ' — ' + pcMkDot(i) + ' (' + pcEsc(i.MEDIDA + ' ' + i.TRABAJO) + ')</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<table style="font-size:12px" id="pc-reg-tbl"><thead><tr><th>Insumo previsto</th><th class="tr">Previsto</th><th class="tr">Stock</th><th>Se usó</th><th class="tr" style="width:100px">Real</th><th>Motivo (si cambia)</th></tr></thead><tbody>' +
    lineas.map(function(l, k) {
      if (l.TIPO_LINEA === 'MANO_OBRA') return '<tr><td colspan="6" class="tdim">' + pcEsc(l.DESCRIPCION) + ' (mano de obra: va en los tiempos)</td></tr>';
      if (l.TIPO_LINEA === 'HERRAMENTAL') return '<tr data-herr="' + k + '"><td>' + pcEsc(l.DESCRIPCION || l.ID_INSUMO) + ' <span class="badge b-gray">herramental</span></td><td class="tr">1 pieza</td><td></td><td colspan="3">' + herr(l) + '</td></tr>';
      return '<tr data-det="' + l.ID_DET + '" data-prev="' + l.CANTIDAD + '" data-ins="' + pcEsc(l.ID_INSUMO) + '"><td>' + pcEsc(l.DESCRIPCION || l.ID_INSUMO) + '<div class="tdim" style="font-size:10px">' + pcEsc(l.ID_INSUMO || 'sin vincular') + '</div></td><td class="tr">' + fmtN(l.CANTIDAD) + ' ' + pcEsc(l.UNIDAD) + '</td>' +
        '<td class="tr">' + (l.STOCK === null ? '—' : '<span' + (l.STOCK < l.CANTIDAD ? ' style="color:var(--danger);font-weight:700"' : '') + '>' + fmtN(l.STOCK) + '</span>') + '</td>' +
        '<td><input class="fi pc-real-ins" list="pc-ins-list" value="' + pcEsc(l.ID_INSUMO) + '" style="width:130px" title="Si se usó otro insumo, escribí su código (reemplazo)"/></td>' +
        '<td><input class="fi tr pc-real" type="number" step="any" min="0" value="' + l.CANTIDAD + '"/></td><td><input class="fi pc-motivo" placeholder="Motivo"/></td></tr>';
    }).join('') + '</tbody></table>' + (lineas.length ? '' : '<div class="tdim">Esta estación no tiene insumos en la receta.</div>') +
    '<datalist id="pc-ins-list">' + (insumos || []).map(function(x) { return '<option value="' + pcEsc(x.ID_INSUMO) + '">' + pcEsc(x.NOMBRE_INSUMO) + '</option>'; }).join('') + '</datalist>' +
    '<div id="pc-reg-aviso" class="mt3" style="font-size:12px"></div>' +
    '<div class="fr mt3"><div class="fg"><label class="fl">Resultado</label><select class="fs" id="pc-res"><option value="OK">OK</option><option value="FALLA">Falla</option></select></div>' +
    '<div class="fg"><label class="fl">Operario</label><select class="fs" id="pc-oper" onchange="PC_.oper=this.value"><option value="">— elegí —</option>' + (PC_.d.empleados || []).map(function(e) { return '<option' + (PC_.oper === e ? ' selected' : '') + '>' + pcEsc(e) + '</option>'; }).join('') + '</select></div><div class="fg"><label class="fl">Observación</label><input class="fi" id="pc-robs"/></div></div>' +
    '<div id="pc-aut" class="card" style="display:none;padding:10px;background:var(--warn-light)"><div class="fl mb3">Reemplazo: autoriza el encargado de línea</div><div class="fr"><div class="fg"><label class="fl">Usuario encargado</label><input class="fi" id="pc-aut-u" autocomplete="off"/></div><div class="fg"><label class="fl">Clave</label><input class="fi" type="password" id="pc-aut-c" autocomplete="new-password"/></div></div></div>' +
    '</div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pc-reg-ok">Registrar</button></div>', 'md-lg');
  var revisar = function() {
    var reemp = false, avisos = [];
    document.querySelectorAll('#pc-reg-tbl tr[data-det]').forEach(function(tr) {
      var prev = +tr.dataset.prev, real = parseFloat(tr.querySelector('.pc-real').value) || 0, ins = tr.querySelector('.pc-real-ins').value.trim();
      if (tr.dataset.ins && ins && ins !== tr.dataset.ins) reemp = true;
      var dif = prev ? (real - prev) / prev : 0;
      if (Math.abs(dif) > tol + 1e-9) avisos.push('Diferencia ' + Math.round(dif * 100) + '% en ' + tr.cells[0].innerText.split('\n')[0] + ' — escribí el motivo');
    });
    document.querySelectorAll('.pc-pieza').forEach(function(s) { var o = s.options[s.selectedIndex]; if (o && o.dataset.otro) reemp = true; });
    $id('pc-aut').style.display = reemp ? '' : 'none';
    $id('pc-reg-aviso').innerHTML = avisos.map(function(a) { return '<div style="color:var(--warn)">⚠ ' + pcEsc(a) + '</div>'; }).join('');
  };
  document.querySelectorAll('#pc-reg-tbl input, .pc-pieza').forEach(function(e) { e.addEventListener('input', revisar); e.addEventListener('change', revisar); });
  $id('pc-reg-ok').addEventListener('click', async function() {
    var b = this;
    var cons = [], piezas = [];
    document.querySelectorAll('#pc-reg-tbl tr[data-det]').forEach(function(tr) { cons.push({ ID_DET: tr.dataset.det, ID_INSUMO: tr.querySelector('.pc-real-ins').value.trim(), REAL: tr.querySelector('.pc-real').value, MOTIVO: tr.querySelector('.pc-motivo').value.trim() }); });
    document.querySelectorAll('.pc-pieza').forEach(function(s) { if (s.value) piezas.push(s.value); });
    var aut = $id('pc-aut').style.display === 'none' ? null : { USUARIO: $v('pc-aut-u'), CLAVE: $v('pc-aut-c') };
    b.disabled = true;
    try {
      var r = await gsRun('gsPC_Registrar', { ID_OT: PC_.ot.ot.ID_OT, ID_CUB: idCub, ID_ESTACION: est, RESULTADO: $v('pc-res'), OPERARIO: $v('pc-oper'), OBSERVACION: $v('pc-robs'), CONSUMOS: cons, PIEZAS: piezas, AUTORIZA: aut });
      if ($id('pc-aut-c')) $id('pc-aut-c').value = '';
      if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
      toast('Registrado ✓' + (r.REEMPLAZOS.length ? ' · reemplazo autorizado' : '') + (r.SIN_STOCK.length ? ' · ojo: sin stock de ' + r.SIN_STOCK.join(', ') : ''), r.SIN_STOCK.length ? 'b' : 'g');
      closeModal(); pcAbrirOT(PC_.ot.ot.ID_OT);
    } catch (e) { if ($id('pc-aut-c')) $id('pc-aut-c').value = ''; toast('Error: ' + e.message, 'r2'); }
    finally { b.disabled = false; }
  });
}
async function pcAnularRegistro(idReg) {
  var motivo = await uiPedir('Motivo de la anulación:', { obligatorio: true }); if (motivo === null) return;
  var r = await gsRun('gsPC_AnularRegistro', idReg, motivo);
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast('Registro anulado: se devolvió el stock ✓', 'g'); closeModal(); pcAbrirOT(PC_.ot.ot.ID_OT);
}
async function pcTerminar(idCub, res) {
  var obs = ''; if (res === 'RECHAZADA') { obs = await uiPedir('Motivo del rechazo:', { obligatorio: true }); if (obs === null) return; }
  var r = await gsRun('gsPC_TerminarCubierta', PC_.ot.ot.ID_OT, idCub, res, obs);
  if (r && !r.ok && /observaci/.test(r.error)) { obs = (await uiPedir(r.error, { obligatorio: true })) || ''; if (obs) r = await gsRun('gsPC_TerminarCubierta', PC_.ot.ot.ID_OT, idCub, res, obs); }
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast((res === 'TERMINADA' ? 'Terminada' : 'Rechazada') + ' · costo ' + fmt(r.costo.COSTO_TOTAL) + ' ✓', 'g'); pcAbrirOT(PC_.ot.ot.ID_OT);
}
async function pcPromover(idCub) { var r = await gsRun('gsPC_PromoverSuplente', PC_.ot.ot.ID_OT, idCub); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Pasó a titular ✓', 'g'); pcAbrirOT(PC_.ot.ot.ID_OT); }
async function pcRetirar(idCub) { if (!(await uiConfirmar('¿Sacar la cubierta de la orden de servicio? Vuelve a espera.', 'Sí, sacar'))) return; var r = await gsRun('gsPC_RetirarCubierta', PC_.ot.ot.ID_OT, idCub, 'sacada de la OT'); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Volvió a espera ✓', 'g'); await pcRecargar(); pcAbrirOT(PC_.ot.ot.ID_OT); }
async function pcCerrarOT() { var id = PC_.ot.ot.ID_OT, r = await gsRun('gsPC_CerrarOT', id); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('OT cerrada ✓ · ' + ((r.REMITOS || []).length) + ' remito(s) de entrega', 'g'); await pcRecargar(); await pcAbrirOT(id); if ((r.REMITOS || []).length) pcRemitosLista(r.REMITOS); }
// ── Remitos de entrega: uno por cliente, se arman solos al cerrar la orden de servicio ──
async function pcRemitos(idOt) { var r = await gsRun('gsPC_Remitos', idOt); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } if (!(r.REMITOS || []).length) { toast('Esta orden no tiene remitos', 'r2'); return; } pcRemitosLista(r.REMITOS); }
function pcRemitosLista(rs) {
  window.PC_REM = rs;
  showModal('<div class="mh"><span class="mt">Remitos de entrega</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2"><div class="tw">' + pcRemTabla(rs) + '</div>' +
    '<div class="tdim" style="font-size:12px;margin-top:8px">Imprimí el remito: el cliente firma y el chofer escanea el QR con el celular y saca la foto. Ahí queda "Entregado".</div></div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>');
}
// Rechazadas del cliente que todavía no se devolvieron (para sumarlas al remito)
function pcRechSinDev(idCli) { return (PC_.d.cubiertas || []).filter(function(c) { return c.ESTADO === 'RECHAZADA' && !c.FECHA_DEVOLUCION && String(c.ID_CLIENTE) === String(idCli); }); }
function pcRemEstado(x) {
  return x.ESTADO === 'ENTREGADO' ? '<span class="badge b-green">✓ Entregado ' + fmtD(x.FECHA_ENTREGA) + '</span>' : '<span class="badge b-orange">Falta la foto firmada</span>';
}
function pcRemTabla(rs) {
  return '<table style="font-size:12px" id="pc-rem-t"><thead><tr><th>Remito</th><th>Fecha</th><th>Cliente</th><th>Orden de servicio</th><th class="tr">Terminadas</th><th class="tr">Devueltas</th><th>Estado</th><th></th></tr></thead><tbody>' +
    (rs.length ? rs.map(function(x, i) {
      var pend = x.ESTADO !== 'ENTREGADO' ? pcRechSinDev(x.ID_CLIENTE) : [];
      return '<tr><td class="mono"><b>' + pcEsc(x.NRO) + '</b></td><td>' + fmtD(x.FECHA) + '</td><td>' + pcEsc(x.CLIENTE) + '</td><td class="mono">' + pcEsc(x.NRO_OT || 'devolución') + '</td><td class="tr">' + x.N_TERMINADAS + '</td><td class="tr">' + x.N_DEVUELTAS + '</td><td>' + pcRemEstado(x) + '</td>' +
        '<td style="white-space:nowrap"><button class="btn btn-p btn-xs" onclick="pcImpRemito(' + i + ')"><i class="fas fa-print"></i> Imprimir</button> ' +
        (pend.length ? '<button class="btn btn-w btn-xs" onclick="pcRemSumar(' + i + ')">+ Sumar ' + pend.length + (pend.length === 1 ? ' rechazada' : ' rechazadas') + '</button> ' : '') +
        (x.FOTO_FIRMA ? '<button class="btn btn-s btn-xs" onclick="asVerImg(' + Number(x.FOTO_FIRMA) + ',\'Remito ' + pcEsc(x.NRO) + ' firmado\')">📷 Ver firmado</button>' : '<button class="btn btn-s btn-xs" onclick="pcRemFoto(' + i + ')">📷 Cargar foto</button>') + '</td></tr>';
    }).join('') : '<tr><td colspan="8" class="tc tdim" style="padding:14px">No hay remitos.</td></tr>') + '</tbody></table>';
}
async function pcRemSumar(i) {
  var x = window.PC_REM[i], pend = pcRechSinDev(x.ID_CLIENTE); if (!pend.length) return;
  try {
    var r = await gsRun('gsPC_RemitoSumarRech', x.ID_REMITO, pend.map(function(c) { return c.ID_CUB; }));
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast(r.N + (r.N === 1 ? ' rechazada sumada' : ' rechazadas sumadas') + ' al ' + x.NRO + ' ✓', 'g'); window.PC_REM[i] = r.REMITO; await pcRecargar(); pcRemRefrescar();
  } catch (e) { toast(e.message, 'r2'); }
}
// Carga manual de la foto del remito firmado (si no se usó el QR)
function pcRemFoto(i) {
  var x = window.PC_REM[i];
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
  inp.onchange = function() {
    var f = inp.files && inp.files[0]; if (!f) return;
    var rd = new FileReader(); rd.onload = function() { var im = new Image(); im.onload = async function() {
      try {
        var data = asComprimir(im, 1600, 0.72);
        var up = await asImg('vt_as_img_put', { tok: SES.token, tipo: 'REMITO', ref: x.NRO, data: data });
        if (!up || !up.ok) { toast((up && up.error) || 'No se pudo subir la foto', 'r2'); return; }
        var r = await gsRun('gsPC_RemitoFoto', x.ID_REMITO, up.id, '');
        if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
        toast(x.NRO + ' entregado ✓', 'g'); x.ESTADO = 'ENTREGADO'; x.FOTO_FIRMA = up.id; x.FECHA_ENTREGA = Date.now(); pcRemRefrescar();
      } catch (e) { toast(e.message, 'r2'); }
    }; im.src = rd.result; }; rd.readAsDataURL(f);
  };
  inp.click();
}
function pcRemRefrescar() { var t = $id('pc-rem-t'); if (t) t.outerHTML = pcRemTabla(window.PC_REM); }
function pcRemUrl(x) { return location.origin + location.pathname.replace(/[^\/]*$/, '') + 'firma/?t=' + encodeURIComponent(x.TOKEN_FIRMA || ''); }
// 4 · Entregas: todos los remitos, primero los que no tienen la foto firmada
async function pcEntregas() {
  $id('pc-body').innerHTML = '<div class="tdim" style="padding:16px">Cargando remitos…</div>';
  var r = await gsRun('gsPC_Remitos', '');
  var rs = ((r && r.REMITOS) || []).slice().sort(function(a, b) { return (a.ESTADO === 'ENTREGADO' ? 1 : 0) - (b.ESTADO === 'ENTREGADO' ? 1 : 0) || b.FECHA - a.FECHA; });
  window.PC_REM = rs;
  var nP = rs.filter(function(x) { return x.ESTADO !== 'ENTREGADO'; }).length;
  var nR = (PC_.d.cubiertas || []).filter(function(c) { return c.ESTADO === 'RECHAZADA' && !c.FECHA_DEVOLUCION; }).length;
  $id('pc-body').innerHTML = (nR ? '<div class="al al-y mb3">Hay ' + nR + (nR === 1 ? ' cubierta rechazada' : ' cubiertas rechazadas') + ' sin devolver: sumalas a un remito de abajo o hacé el remito de devolución en "Rechazadas".</div>' : '') +
    '<div class="card"><div class="card-hd"><span class="card-title">Remitos (' + rs.length + ') · ' + nP + ' sin la foto firmada</span><span class="tdim" style="font-size:12px">El remito queda "Entregado" cuando se carga la foto firmada (QR del remito o botón 📷)</span></div><div class="tw">' + pcRemTabla(rs) + '</div></div>';
}
async function pcImpRemito(i) {
  var x = window.PC_REM[i]; if (!x) return;
  var qr = ''; try { if (x.TOKEN_FIRMA) { await asLibQR(); qr = asQRsvg(pcRemUrl(x), 130); } } catch (eq) { qr = ''; }
  var ter = x.ITEMS.filter(function(t) { return t.RESULTADO === 'TERMINADA'; }), dev = x.ITEMS.filter(function(t) { return t.RESULTADO !== 'TERMINADA'; });
  var nInt = {}; (PC_.d.cubiertas || []).forEach(function(c) { nInt[String(c.ID_CUB)] = c.ID_CASCO; });
  var fila = function(t, k) { return '<tr><td>' + (k + 1) + '</td><td><b>' + pcEsc(t.MARCA) + '</b>' + (nInt[String(t.ID_CUB)] ? '<div style="font-size:9px;color:#444">N° int. ' + pcEsc(nInt[String(t.ID_CUB)]) + '</div>' : '') + '</td><td>' + pcDotTxt(t.DOT) + '</td><td>' + pcEsc(t.MEDIDA) + '</td><td>' + pcEsc(t.FABRICANTE) + '</td><td>' + pcEsc(t.TRABAJO) + (t.REPROCESO ? ' (con corrección)' : '') + pcCambioTrab(t.ID_CUB) + pcParcheRemito(t.ID_CUB) + '</td><td>' + (t.BOLETA ? 'Boleta ' + pcEsc(t.BOLETA) + ' · ' : '') + pcEsc(t.OTRAB) + '</td>' + (t.RESULTADO === 'TERMINADA' ? '' : '<td>' + pcEsc(t.MOTIVO) + '</td>') + '<td class="ck">☐</td></tr>'; };
  var h = pcEncImp('REMITO DE ENTREGA', x.NRO) +
    '<div class="dat"><div><b>Cliente</b>' + pcEsc(x.CLIENTE) + '</div><div><b>Fecha</b>' + fmtD(x.FECHA) + '</div><div><b>Orden de servicio</b>' + pcEsc(x.NRO_OT || 'Devolución sin trabajo') + '</div><div><b>Cubiertas</b>' + x.ITEMS.length + '</div>' +
    (x.CUIT ? '<div><b>CUIT</b>' + pcEsc(x.CUIT) + '</div>' : '') + (x.DIRECCION ? '<div><b>Dirección</b>' + pcEsc(x.DIRECCION) + '</div>' : '') + (x.TELEFONO ? '<div><b>Teléfono</b>' + pcEsc(x.TELEFONO) + '</div>' : '') + '</div>' +
    (ter.length ? '<h2>Cubiertas terminadas (' + ter.length + ')</h2><table><thead><tr><th>#</th><th>Marca grabada</th><th>DOT</th><th>Medida</th><th>Marca casco</th><th>Trabajo</th><th>Orden de trabajo</th><th class="ck">Recibe</th></tr></thead><tbody>' + ter.map(fila).join('') + '</tbody></table>' : '') +
    (dev.length ? '<h2>Cubiertas que se devuelven sin trabajo (' + dev.length + ')</h2><table><thead><tr><th>#</th><th>Marca grabada</th><th>DOT</th><th>Medida</th><th>Marca casco</th><th>Trabajo pedido</th><th>Orden de trabajo</th><th>Motivo</th><th class="ck">Recibe</th></tr></thead><tbody>' + dev.map(fila).join('') + '</tbody></table>' : '') +
    '<div class="nota">Documento interno de entrega de cubiertas del cliente. No válido como factura.</div>' +
    '<div class="firmas"><div>Entregó (Vulcan Tread)</div><div>Recibió conforme (cliente) · Aclaración y DNI</div></div>' +
    (qr ? '<div style="display:flex;gap:12px;align-items:center;margin-top:18px;border:1px dashed #999;border-radius:8px;padding:8px;page-break-inside:avoid"><div style="width:110px;height:110px">' + qr + '</div><div style="font-size:11px"><b>Al entregar:</b> con el remito firmado, escaneá este código con el celular y sacale una foto. Queda cargado en el sistema.</div></div>' : '');
  pcImprimir('Remito ' + x.NRO + ' ' + x.CLIENTE, h);
}
async function pcAnularOT() { var m = await uiPedir('Motivo de la anulación de la orden de servicio:', { obligatorio: true }); if (m === null) return; var r = await gsRun('gsPC_AnularOT', PC_.ot.ot.ID_OT, m); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('OT anulada: las cubiertas volvieron a espera ✓', 'g'); await pcRecargar(); pcAbrirOT(PC_.ot.ot.ID_OT); }
function pcVerCosto(idCub) {
  var i = PC_.ot.items.filter(function(x) { return String(x.ID_CUB) === String(idCub); })[0], c = i.COSTO;
  showModal('<div class="mh"><span class="mt">Costo real — ' + pcMkDot(i) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    [['Materiales (insumos reales)', c.MATERIALES], ['Herramental (por uso)', c.HERRAMENTAL], ['Mano de obra (' + String(Math.round((Number(c.MINUTOS) || 0) * 10) / 10).replace('.', ',') + ' min)', c.MO], ['Gastos fijos prorrateados', c.FIJOS]].map(function(x) { return '<div class="flex jb"><span class="tdim">' + x[0] + '</span><span class="mono">' + fmt(x[1]) + '</span></div>'; }).join('') +
    '<div class="flex jb" style="font-size:16px;font-weight:700;margin-top:8px"><span>Total</span><span class="mono">' + fmt(c.TOTAL) + '</span></div></div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button></div>');
}
// Tiempos por estación (solo encargado)
function pcTiempos() {
  var ot = PC_.ot, cols = pcEstacionesOT().filter(function(c) { return c.id !== ''; });
  var est = PC_.d.estaciones;
  showModal('<div class="mh"><span class="mt">Tiempos por estación (minutos) — ' + pcEsc(ot.ot.NRO_OT) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2"><div class="tw"><table style="font-size:12px"><thead><tr><th>Marca</th>' +
    cols.map(function(c) { var e = est.filter(function(x) { return String(x.ID_ESTACION) === c.id; })[0] || {}; return '<th class="tc">' + pcEsc(c.nombre) + '<div class="tdim" style="font-size:9px">estándar ' + (e.MINUTOS || 0) + '</div></th>'; }).join('') + '</tr></thead><tbody>' +
    ot.items.filter(function(i) { return i.ESTADO !== 'RETIRADA'; }).map(function(i) { return '<tr><td class="mono">' + pcEsc(i.MARCA) + '<div style="font-size:10px">DOT: ' + pcDotTxt(pcDotDe(i)) + '</div></td>' + cols.map(function(c) { var t = i.TIEMPOS.filter(function(x) { return x.ID_ESTACION === c.id; })[0]; return '<td><input class="fi tr pc-min" type="number" min="0" step="any" style="width:70px" data-cub="' + i.ID_CUB + '" data-est="' + c.id + '" value="' + (t ? t.MINUTOS : '') + '"/></td>'; }).join('') + '</tr>'; }).join('') +
    '</tbody></table></div><div class="tdim" style="font-size:11px">Los minutos se usan para el costo de mano de obra de cada cubierta.</div></div><div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pc-min-ok">Guardar tiempos</button></div>', 'md-lg');
  $id('pc-min-ok').addEventListener('click', async function() {
    var filas = []; document.querySelectorAll('.pc-min').forEach(function(x) { if (x.value !== '') filas.push({ ID_CUB: x.dataset.cub, ID_ESTACION: x.dataset.est, MINUTOS: x.value }); });
    var r = await gsRun('gsPC_CargarTiempos', PC_.ot.ot.ID_OT, filas);
    if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
    toast('Tiempos guardados (' + r.grabados + ') ✓', 'g'); closeModal(); pcAbrirOT(PC_.ot.ot.ID_OT);
  });
}


// ── 📅 Plan del día siguiente: el día anterior se eligen las cubiertas y se deja todo listo (materiales, estaciones, piezas, pesaje) ──
async function pcPlan(dia) {
  var b = $id('pc-body'); b.innerHTML = '<div class="card"><div class="card-body tdim">Cargando…</div></div>';
  var r; try { r = await gsRun('gsPC_PlanDatos', dia || PC_.plDia || ''); } catch (e) { b.innerHTML = '<div class="al al-r">' + pcEsc(e.message) + '</div>'; return; }
  if (!r || !r.ok) { b.innerHTML = '<div class="al al-r">' + pcEsc((r && r.error) || 'No se pudo') + '</div>'; return; }
  PC_.plDia = r.DIA; PC_.plInfo = r;
  PC_.plSel = {}; (r.PLAN ? r.PLAN.CUBIERTAS : []).forEach(function(id) { PC_.plSel[id] = true; });
  var dd = function(s) { return String(s).split('-').reverse().join('/'); };
  var g = pcPsCubs(), ks = Object.keys(g).sort(function(a, b) { return (/^Esperando/.test(a) ? 1 : 0) - (/^Esperando/.test(b) ? 1 : 0) || a.localeCompare(b); });
  var sel = '<div class="tdim">No hay cubiertas en cargas abiertas ni esperando.</div>';
  if (ks.length) sel = ks.map(function(k, gi) { var cs = g[k], todas = cs.every(function(c) { return PC_.plSel[c.ID_CUB]; });
    return '<div style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px"><label style="display:flex;gap:8px;align-items:center;padding:6px 10px;background:var(--bg);font-weight:700;cursor:pointer"><input type="checkbox"' + (todas ? ' checked' : '') + ' onchange="pcPlGrupo(' + gi + ',this.checked)"> ' + pcEsc(k) + ' <span class="tdim" style="font-weight:400">(' + cs.length + ')</span></label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;padding:6px 10px">' + cs.map(function(c) { return '<label style="display:flex;gap:6px;align-items:center;font-size:12px;cursor:pointer"><input type="checkbox" class="pc-pl-c" data-g="' + gi + '" value="' + c.ID_CUB + '"' + (PC_.plSel[c.ID_CUB] ? ' checked' : '') + ' onchange="PC_.plSel[this.value]=this.checked;pcPlCalc()"><b class="mono">' + pcEsc(c.MARCA || c.ID_CUB) + '</b> ' + pcEsc((c.CLIENTE || '') + ' · ' + (c.MEDIDA || '') + ' · ' + (c.TRABAJO || '')) + '</label>'; }).join('') + '</div></div>'; }).join('');
  b.innerHTML = '<div class="card mb3"><div class="card-hd"><span class="card-title">📅 Plan del ' + dd(r.DIA) + (r.DIA === r.MANANA ? ' (próximo día de trabajo)' : r.DIA === r.HOY ? ' (hoy)' : '') + '</span><span class="flex gap2" style="align-items:center;flex-wrap:wrap">' +
    '<input type="date" class="fi" id="pc-pl-dia" value="' + pcEsc(r.DIA) + '" min="' + pcEsc(r.HOY) + '" onchange="pcPlan(this.value)"><button class="btn btn-s btn-sm" onclick="pcPlan(PC_.plInfo.MANANA)">Próximo día</button></span></div>' +
    '<div class="card-body"><div class="al ' + (r.PLAN ? 'al-g' : 'al-y') + ' mb2" style="font-size:12px">' + (r.PLAN ? '✓ Plan guardado' + (r.PLAN.USUARIO ? ' por ' + pcEsc(r.PLAN.USUARIO) : '') + ' · ' + r.PLAN.CUBIERTAS.length + ' cubiertas. Se puede cambiar y volver a guardar.' : 'Todavía no hay plan para este día. Tildá las cubiertas que se van a hacer y tocá «Guardar plan».') + '</div>' +
    '<div class="tdim mb2" style="font-size:12px">El día anterior: 1) tildá lo que se hace ese día (una carga entera o sueltas), 2) mirá si alcanzan los materiales, 3) lo que tiene que estar en cada estación, 4) las piezas con su marca, 5) lo que hay que pesar o medir. Después imprimí la hoja del plan.</div>' +
    sel + '<div class="fg mt2"><label class="fl">Notas del plan (opcional)</label><input class="fi" id="pc-pl-obs" maxlength="500" value="' + pcEsc(r.PLAN ? r.PLAN.OBS : '') + '" placeholder="Ej.: arranca la carga a las 7, falta confirmar banda"></div>' +
    '<div class="flex gap2 mt2" style="flex-wrap:wrap"><button class="btn btn-p" onclick="pcPlGuardar()"><i class="fas fa-save"></i> Guardar plan</button><button class="btn btn-s" onclick="pcPlImp()"><i class="fas fa-print"></i> Hoja del plan (PDF)</button><button class="btn btn-s" onclick="pcPlPesar()">⚖ Ir a pesar para ese día</button></div></div></div><div id="pc-pl-res"></div>';
  pcPlCalc();
}
function pcPlGrupo(gi, v) { document.querySelectorAll('.pc-pl-c[data-g="' + gi + '"]').forEach(function(x) { x.checked = v; PC_.plSel[x.value] = v; }); pcPlCalc(); }
function pcPlIds() { return Object.keys(PC_.plSel || {}).filter(function(k) { return PC_.plSel[k]; }); }
async function pcPlCalc() {
  var ids = pcPlIds(), box = $id('pc-pl-res'); if (!box) return;
  if (!ids.length) { box.innerHTML = ''; PC_.plR = null; return; }
  box.innerHTML = '<div class="card"><div class="card-body tdim">Calculando el plan…</div></div>';
  var tk = PC_.plTk = (PC_.plTk || 0) + 1;
  var r; try { r = await gsRun('gsPC_PlanCalc', ids, PC_.plDia); } catch (e) { box.innerHTML = '<div class="al al-r">' + pcEsc(e.message) + '</div>'; return; }
  if (tk !== PC_.plTk) return; // llegó una cuenta vieja: se tildó otra cubierta mientras calculaba
  if (!r || !r.ok) { box.innerHTML = '<div class="al al-r">' + pcEsc((r && r.error) || 'No se pudo') + '</div>'; return; }
  PC_.plR = r;
  var f3 = function(n) { return n === null || n === undefined ? '—' : n === true ? 'falta' : (Math.round((+n || 0) * 1000) / 1000).toLocaleString('es-AR'); }, M = r.MATERIALES, E = r.ESTACIONES;
  var pes = E.filter(function(x) { return x.PESA; }), herr = E.filter(function(x) { return x.HERRAMENTAL; });
  var faltaPes = pes.filter(function(x) { return x.PESADO + 1e-9 < x.RETIRAR; }).length;
  var resumen = [[M.FALTAN ? '⛔ Faltan ' + M.FALTAN + ' materiales' : '✓ Alcanzan los materiales', M.FALTAN ? 'b-red' : 'b-green'],
    [faltaPes ? '⚖ Falta pesar/medir ' + faltaPes : (pes.length ? '✓ Todo pesado' : 'Nada para pesar'), faltaPes ? 'b-orange' : 'b-green'],
    [herr.length ? herr.length + ' tipo' + (herr.length === 1 ? '' : 's') + ' de pieza' : 'Sin piezas', 'b-blue']];
  var h = '<div class="card mb3"><div class="card-body"><b>' + ids.length + ' cubiertas en el plan.</b> ' + resumen.map(function(x) { return '<span class="badge ' + x[1] + '" style="margin-left:6px">' + x[0] + '</span>'; }).join('') + '</div></div>';
  // 1 Materiales
  h += '<div class="card mb3"><div class="card-hd"><span class="card-title">1 · ¿Alcanzan los materiales?</span><span class="tdim" style="font-size:11px">receta de las tildadas contra el stock de hoy</span></div><div class="card-body"><div class="tw"><table id="pc-pl-mat" style="font-size:13px"><thead><tr><th>Material</th><th class="tr">Necesita</th><th class="tr">Hay</th><th class="tr">Falta</th><th>Qué hacer</th></tr></thead><tbody>' +
    M.LINEAS.map(function(x) { var q = !x.FALTA ? '✓' : x.TIPO === 'RECETA' ? '<span style="color:#b91c1c">Corregir la receta</span>' : x.TIPO === 'HERRAMENTAL' ? '<span style="color:#b91c1c">Dar de alta piezas o sacar cubiertas</span>' : (x.ALTERNATIVAS && x.ALTERNATIVAS.length ? 'Comprar o usar: ' + x.ALTERNATIVAS.slice(0, 3).map(function(a) { return pcEsc(a.NOMBRE) + ' (' + f3(a.HAY) + ')'; }).join(', ') : '<span style="color:#b91c1c">Comprar</span>');
      return '<tr' + (x.FALTA ? ' style="background:#fee2e2"' : '') + '><td>' + pcEsc(x.NOMBRE) + '</td><td class="tr mono">' + f3(x.NECESITA) + ' ' + pcEsc(x.UNIDAD) + '</td><td class="tr mono">' + f3(x.HAY) + '</td><td class="tr mono">' + (x.FALTA ? '<b style="color:#b91c1c">' + f3(x.FALTA) + '</b>' : '—') + '</td><td style="font-size:12px">' + q + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';
  // 2 Por estación
  var ests = []; E.forEach(function(x) { if (ests.indexOf(x.ESTACION) === -1) ests.push(x.ESTACION); });
  h += '<div class="card mb3"><div class="card-hd"><span class="card-title">2 · Lo que tiene que estar listo en cada estación</span></div><div class="card-body"><div class="tw"><table id="pc-pl-est" style="font-size:13px"><thead><tr><th>Estación</th><th>Material</th><th class="tr">Cantidad</th><th class="tr">Cubiertas</th></tr></thead><tbody>' +
    ests.map(function(e) { return E.filter(function(x) { return x.ESTACION === e; }).map(function(x, k) { return '<tr><td>' + (k ? '' : '<b>' + pcEsc(e) + '</b>') + '</td><td>' + pcEsc(x.NOMBRE) + (x.PESA ? ' <span class="badge b-orange" style="font-size:9px">' + (x.VERBO === 'PESAR' ? 'se pesa' : 'se mide') + '</span>' : '') + (x.HERRAMENTAL ? ' <span class="badge b-blue" style="font-size:9px">pieza</span>' : '') + '</td><td class="tr mono">' + f3(x.CANT) + ' ' + pcEsc(x.UNIDAD) + '</td><td class="tr">' + x.CUBIERTAS + '</td></tr>'; }).join(''); }).join('') + '</tbody></table></div>' +
    (r.SIN_ESTACION.length ? '<div class="al al-y mt2" style="font-size:12px">Sin estación en la receta: ' + pcEsc(r.SIN_ESTACION.join(', ')) + '.</div>' : '') + '</div></div>';
  // 3 Piezas
  h += '<div class="card mb3"><div class="card-hd"><span class="card-title">3 · Inner y envelope: piezas disponibles con su marca</span></div><div class="card-body">' + (herr.length ? herr.map(function(x) { var falta = x.DISPONIBLES.length < x.CANT;
      return '<div style="margin-bottom:8px"><b>' + pcEsc(x.NOMBRE) + '</b> · ' + pcEsc(x.ESTACION) + ' · hacen falta <b>' + x.CANT + '</b>, disponibles <b style="color:' + (falta ? '#b91c1c' : 'var(--success)') + '">' + x.DISPONIBLES.length + '</b><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + (x.DISPONIBLES.length ? x.DISPONIBLES.map(function(c) { return '<span class="badge b-gray mono">' + pcEsc(c || 'Sin número') + '</span>'; }).join('') : '<span class="tdim">Ninguna disponible</span>') + '</div></div>'; }).join('') : '<div class="tdim">Lo tildado no lleva inner ni envelope.</div>') + '</div></div>';
  // 4 Pesaje
  h += '<div class="card mb3"><div class="card-hd"><span class="card-title">4 · Lo que hay que pesar o medir para el ' + String(r.DIA).split('-').reverse().join('/') + '</span><button class="btn btn-p btn-sm" onclick="pcPlPesar()">⚖ Ir a pesar</button></div><div class="card-body">' + (pes.length ? '<div class="tw"><table id="pc-pl-pes" style="font-size:13px"><thead><tr><th>Estación</th><th>Material</th><th class="tr">Receta</th><th class="tr">Retirar (+' + r.MARGEN + '%)</th><th class="tr">Ya pesado</th><th class="tr">Falta</th></tr></thead><tbody>' +
    pes.map(function(x) { var u = pcEsc(x.UNIDAD), falta = Math.max(0, Math.round((x.RETIRAR - x.PESADO) * 1000) / 1000); return '<tr><td>' + pcEsc(x.ESTACION) + '</td><td><b>' + pcEsc(x.NOMBRE) + '</b></td><td class="tr mono">' + f3(x.CANT) + ' ' + u + '</td><td class="tr mono"><b>' + f3(x.RETIRAR) + ' ' + u + '</b></td><td class="tr mono">' + (x.PESADO ? f3(x.PESADO) + ' ' + u : '—') + '</td><td class="tr mono" style="color:' + (falta > 0 ? 'var(--danger)' : 'var(--success)') + '">' + (falta > 0 ? f3(falta) + ' ' + u : '✓') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="tdim">Lo tildado no lleva nada que vaya por peso o volumen.</div>') + '</div></div>';
  box.innerHTML = h;
}
async function pcPlGuardar() {
  var ids = pcPlIds(); if (!ids.length) { toast('Tildá las cubiertas que se hacen ese día', 'r2'); return; }
  try { var r = await gsRun('gsPC_PlanGuardar', PC_.plDia, ids, $v('pc-pl-obs')); if (!r || !r.ok) return toast((r && r.error) || 'No se pudo', 'r2'); toast('Plan guardado ✓', 'g'); pcPlan(PC_.plDia); } catch (e) { toast(e.message, 'r2'); }
}
function pcPlPesar() {
  var ids = pcPlIds(); if (!ids.length) { toast('Tildá las cubiertas del plan', 'r2'); return; }
  PC_.psSel = {}; ids.forEach(function(i) { PC_.psSel[i] = true; });
  PC_.psDia = PC_.plDia === (PC_.plInfo && PC_.plInfo.HOY) ? '' : PC_.plDia; PC_.tab = 'pesaje'; pcPintar();
  setTimeout(function() { if (typeof pcPsCalc === 'function') pcPsCalc(); }, 400);
}
function pcPlImp() {
  var r = PC_.plR; if (!r) { toast('Tildá las cubiertas del plan', 'r2'); return; }
  var f3 = function(n) { return n === null || n === undefined ? '—' : n === true ? 'falta' : (Math.round((+n || 0) * 1000) / 1000).toLocaleString('es-AR'); }, ids = pcPlIds(), dia = String(r.DIA).split('-').reverse().join('/');
  var cubs = PC_.d.cubiertas.filter(function(c) { return PC_.plSel[c.ID_CUB]; }), E = r.ESTACIONES, ests = [];
  E.forEach(function(x) { if (ests.indexOf(x.ESTACION) === -1) ests.push(x.ESTACION); });
  var h = pcEncImp('PLAN DEL DÍA ' + dia, ids.length + ' cubiertas') +
    ($v('pc-pl-obs') ? '<div class="nota"><b>Notas:</b> ' + pcEsc($v('pc-pl-obs')) + '</div>' : '') +
    '<h3>Cubiertas</h3><table><thead><tr><th>Marca grabada</th><th>DOT</th><th>Cliente</th><th>Medida</th><th>Trabajo</th></tr></thead><tbody>' + cubs.map(function(c) { return '<tr><td><b>' + pcEsc(c.MARCA) + '</b></td><td>' + pcDotTxt(pcDotDe(c)) + '</td><td>' + pcEsc(c.CLIENTE) + '</td><td>' + pcEsc((c.TIPO || '') + ' ' + (c.MEDIDA || '')) + '</td><td>' + pcEsc(c.TRABAJO) + '</td></tr>'; }).join('') + '</tbody></table>' +
    '<h3>Materiales</h3><table><thead><tr><th>Material</th><th>Necesita</th><th>Hay</th><th>Falta</th></tr></thead><tbody>' + r.MATERIALES.LINEAS.map(function(x) { return '<tr><td>' + pcEsc(x.NOMBRE) + '</td><td>' + f3(x.NECESITA) + ' ' + pcEsc(x.UNIDAD) + '</td><td>' + f3(x.HAY) + '</td><td>' + (x.FALTA ? '<b>' + f3(x.FALTA) + '</b>' : '—') + '</td></tr>'; }).join('') + '</tbody></table>' +
    '<h3>Por estación</h3><table><thead><tr><th>Estación</th><th>Material</th><th>Cantidad</th><th>Retirar</th><th>Pesado real</th><th class="ck">Listo</th></tr></thead><tbody>' +
    ests.map(function(e) { return E.filter(function(x) { return x.ESTACION === e; }).map(function(x, k) { return '<tr><td>' + (k ? '' : '<b>' + pcEsc(e) + '</b>') + '</td><td>' + pcEsc(x.NOMBRE) + (x.PESA ? ' <b>· ' + (x.VERBO === 'PESAR' ? 'PESAR' : 'MEDIR') + '</b>' : '') + (x.HERRAMENTAL ? ' <b>· PIEZA</b> (' + pcEsc(x.DISPONIBLES.join(', ') || 'ninguna disponible') + ')' : '') + '</td><td>' + f3(x.CANT) + ' ' + pcEsc(x.UNIDAD) + '</td><td>' + (x.PESA ? '<b>' + f3(x.RETIRAR) + ' ' + pcEsc(x.UNIDAD) + '</b>' : '') + '</td><td>' + (x.PESA ? (x.PESADO ? f3(x.PESADO) + ' ' + pcEsc(x.UNIDAD) : '') : '—') + '</td><td class="ck"></td></tr>'; }).join(''); }).join('') +
    '</tbody></table><div class="firmas"><div>Preparó</div><div>Encargado de planta</div></div>';
  pcImprimir('Plan del día ' + dia, h, false);
}
PC_TOUR.plan = [['', '📅 Plan de mañana', 'El día anterior se tildan las cubiertas que se hacen ese día y queda guardado. El sistema dice si alcanzan los materiales, qué tiene que estar en cada estación, qué piezas hay con su marca y qué falta pesar o medir.'], ['#pc-pl-dia', 'El día', 'Por defecto, el próximo día de trabajo.']];
// ── Herramental ──
// ── Pesaje de cojín y flux: informe por día y configuración (qué estaciones pesan además cada cubierta) ──
// ── Pesaje y medición: se tildan las cubiertas que se van a hacer, el sistema suma la receta y se va cargando lo pesado o medido ──
function pcPsCubs() {
  var d = PC_.d, abiertas = {}; d.ots.forEach(function(o) { if (o.ESTADO === 'ARMADA' || o.ESTADO === 'EN_PROCESO') abiertas[o.ID_OT] = o; });
  var g = {}; d.cubiertas.forEach(function(c) {
    var k = c.ESTADO === 'EN_OT' && abiertas[c.ID_OT] ? abiertas[c.ID_OT].NRO_OT + ' · ' + abiertas[c.ID_OT].LINEA : (c.ESTADO === 'EN_ESPERA' ? 'Esperando entrar a una carga' : null);
    if (k) (g[k] = g[k] || []).push(c);
  });
  return g;
}
function pcPsSelHTML() {
  var g = pcPsCubs(), ks = Object.keys(g).sort(function(a, b) { return (/^Esperando/.test(a) ? 1 : 0) - (/^Esperando/.test(b) ? 1 : 0) || a.localeCompare(b); }), sel = PC_.psSel = PC_.psSel || {};
  if (!ks.length) return '<div class="tdim">No hay cubiertas en cargas abiertas ni esperando.</div>';
  return ks.map(function(k, gi) { var cs = g[k], todas = cs.every(function(c) { return sel[c.ID_CUB]; });
    return '<div style="border:1px solid var(--border);border-radius:8px;margin-bottom:8px"><label style="display:flex;gap:8px;align-items:center;padding:6px 10px;background:var(--bg);font-weight:700;cursor:pointer"><input type="checkbox" class="pc-ps-g" data-g="' + gi + '"' + (todas ? ' checked' : '') + ' onchange="pcPsGrupo(' + gi + ',this.checked)"> ' + pcEsc(k) + ' <span class="tdim" style="font-weight:400">(' + cs.length + ')</span></label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;padding:6px 10px">' + cs.map(function(c) { return '<label style="display:flex;gap:6px;align-items:center;font-size:12px;cursor:pointer"><input type="checkbox" class="pc-ps-c" data-g="' + gi + '" value="' + c.ID_CUB + '"' + (sel[c.ID_CUB] ? ' checked' : '') + ' onchange="PC_.psSel[this.value]=this.checked;pcPsCalc()"><b class="mono">' + pcEsc(c.MARCA || c.ID_CUB) + '</b> ' + pcEsc((c.CLIENTE || '') + ' · ' + (c.MEDIDA || '') + ' · ' + (c.TRABAJO || '')) + '</label>'; }).join('') + '</div></div>'; }).join('');
}
function pcPsGrupo(gi, v) { document.querySelectorAll('.pc-ps-c[data-g="' + gi + '"]').forEach(function(x) { x.checked = v; PC_.psSel[x.value] = v; }); pcPsCalc(); }
async function pcPsCalc() {
  var ids = Object.keys(PC_.psSel || {}).filter(function(k) { return PC_.psSel[k]; }), box = $id('pc-ps-res'); if (!box) return;
  if (!ids.length) { box.innerHTML = '<div class="tdim">Tildá las cubiertas que se van a hacer.</div>'; return; }
  box.innerHTML = '<div class="tdim">Calculando…</div>';
  var r; try { r = await gsRun('gsPC_PesajeSel', ids, PC_.psDia || ''); } catch (e) { box.innerHTML = '<div class="al al-r">' + pcEsc(e.message) + '</div>'; return; }
  if (!r || !r.ok) { box.innerHTML = '<div class="al al-r">' + pcEsc((r && r.error) || 'No se pudo') + '</div>'; return; }
  PC_.psR = r;
  var f3 = function(n) { return n === null || n === undefined ? '—' : n === true ? 'falta' : (Math.round((+n || 0) * 1000) / 1000).toLocaleString('es-AR'); };
  var h = '<div class="tdim mb2" style="font-size:12px">' + ids.length + ' cubierta' + (ids.length === 1 ? '' : 's') + ' tildada' + (ids.length === 1 ? '' : 's') + '. Receta de cada una (las que ya están en la línea, sin las estaciones que ya pasaron). Retirar = receta + ' + r.MARGEN + '% de margen. Cada vez que pesás o medís se suma a lo ya cargado ese día.</div>';
  if (!r.LINEAS.length) h += '<div class="tdim">Lo tildado no lleva nada que vaya por peso o volumen (o ya pasó por esas estaciones).</div>';
  else h += '<div class="tw"><table id="pc-tbl-ps" style="font-size:13px"><thead><tr><th>Estación</th><th>Material</th><th class="tr">Receta</th><th class="tr">Retirar</th><th class="tr">Ya cargado</th><th class="tr">Falta</th><th>Pesado / medido ahora</th></tr></thead><tbody>' +
    r.LINEAS.map(function(x, k) { var u = pcEsc(x.UNIDAD), ya = x.PES ? x.PES.INICIO : 0, falta = Math.max(0, Math.round((x.RETIRAR - ya) * 1000) / 1000), cerr = x.PES && x.PES.ESTADO === 'CERRADO';
      return '<tr><td>' + pcEsc(x.ESTACION) + '</td><td><b>' + pcEsc(x.NOMBRE) + '</b> <span class="badge ' + (x.VERBO === 'PESAR' ? 'b-orange' : 'b-blue') + '" style="font-size:9px">' + (x.VERBO === 'PESAR' ? 'se pesa' : 'se mide') + '</span><div class="tdim" style="font-size:10px">' + x.CUBIERTAS + ' cubierta' + (x.CUBIERTAS === 1 ? '' : 's') + '</div></td>' +
        '<td class="tr mono">' + f3(x.CANT) + ' ' + u + '</td><td class="tr mono"><b>' + f3(x.RETIRAR) + ' ' + u + '</b></td>' +
        '<td class="tr mono">' + (ya ? f3(ya) + ' ' + u : '—') + (x.MOVS.length ? '<div class="tdim" style="font-size:10px">' + x.MOVS.map(function(m) { return f3(m.CANT) + ' · ' + pcEsc(m.OPERARIO); }).join('<br>') + '</div>' : '') + '</td>' +
        '<td class="tr mono" style="color:' + (falta > 0 ? 'var(--danger)' : 'var(--success)') + '">' + (falta > 0 ? f3(falta) + ' ' + u : '✓') + '</td>' +
        '<td>' + (cerr ? '<span class="badge b-gray">día cerrado</span>' : '<div class="flex gap2" style="align-items:center"><input class="fi pc-ps-in" id="pc-ps-in-' + k + '" inputmode="decimal" style="width:90px" placeholder="' + (x.VERBO === 'PESAR' ? 'Peso' : 'Medida') + '"> ' + u + ' <button class="btn btn-p btn-sm" onclick="pcPsGuardar(' + k + ')">Sumar</button></div>') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  if (r.SIN_ESTACION.length) h += '<div class="al al-y mt2" style="font-size:12px">Sin estación en la receta (no se puede asignar el pesaje): ' + pcEsc(r.SIN_ESTACION.join(', ')) + '. Hay que ponerle la estación en la receta.</div>';
  box.innerHTML = h;
}
async function pcPsGuardar(k) {
  var x = PC_.psR && PC_.psR.LINEAS[k]; if (!x) return;
  var v = $v('pc-ps-in-' + k), op = $v('pc-ps-op');
  if (!op) { toast('Elegí quién pesa', 'r2'); $id('pc-ps-op').focus(); return; }
  if (!String(v).trim()) { toast('Poné lo ' + (x.VERBO === 'PESAR' ? 'pesado' : 'medido'), 'r2'); $id('pc-ps-in-' + k).focus(); return; }
  var marcas = PC_.d.cubiertas.filter(function(c) { return PC_.psSel[c.ID_CUB]; }).map(function(c) { return c.MARCA; }).join(', ');
  try { var r = await gsRun('gsPC_PesajeSumar', { FECHA: PC_.psR.DIA, ID_ESTACION: x.ID_ESTACION, ID_INSUMO: x.ID_INSUMO, CANTIDAD: v, OPERARIO: op, CUBIERTAS: marcas }); if (!r || !r.ok) return toast((r && r.error) || 'No se pudo', 'r2'); toast(x.NOMBRE + ': sumado ✓', 'g'); pcPsCalc(); } catch (e) { toast(e.message, 'r2'); }
}
function pcPsHTML() {
  var hoy = new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10), emps = (PC_.d.empleados || []).map(function(e) { return typeof e === 'string' ? e : e.NOMBRE; });
  return '<div class="card mb3"><div class="card-hd"><span class="card-title">⚖ Pesar y medir lo que se va a hacer</span><span class="flex gap2">' +
    '<button class="btn btn-sm ' + (!PC_.psDia ? 'btn-p' : 'btn-s') + '" onclick="PC_.psDia=\'\';pcPesaje()">Hoy</button><button class="btn btn-sm ' + (PC_.psDia ? 'btn-p' : 'btn-s') + '" onclick="PC_.psDia=\'MANANA\';pcPesaje()">Preparar para el próximo día</button></span></div>' +
    '<div class="card-body"><div class="tdim mb2" style="font-size:12px">1) Tildá las cubiertas que se van a hacer (una carga entera o sueltas). 2) El sistema suma lo que prevé la receta de todo lo que va por peso o volumen (kg, litros, gramos, metros), estación por estación. 3) Pesá o medí lo que retirás y cargalo: se va sumando. A la tarde se pesa lo que sobró.</div>' +
    '<div class="fg" style="max-width:300px"><label class="fl">¿Quién pesa?</label><select class="fs" id="pc-ps-op"><option value="">Elegí…</option>' + emps.map(function(n) { return '<option' + (PC_.psOp === n ? ' selected' : '') + '>' + pcEsc(n) + '</option>'; }).join('') + '</select></div>' +
    '<div id="pc-ps-sel">' + pcPsSelHTML() + '</div><div id="pc-ps-res" class="mt2"></div></div></div>';
}
async function pcPesaje() {
  var b = $id('pc-body'); b.innerHTML = '<div class="card"><div class="card-body tdim">Cargando…</div></div>';
  if (PC_.psDia === 'MANANA') { try { var mn = await gsRun('gsPC_PesajeSel', [], ''); PC_.psDia = mn.MANANA; } catch (e) { PC_.psDia = ''; } }
  var psTop = pcPsHTML();
  var hoy = new Date(Date.now() - 3 * 3600000).toISOString().slice(0, 10);
  PC_.pesD = PC_.pesD || hoy; PC_.pesH = PC_.pesH || hoy;
  var inf, cfg;
  try { var r = await Promise.all([gsRun('gsPC_PesajeInforme', PC_.pesD, PC_.pesH), gsRun('gsPC_PesajeConfig')]); inf = r[0]; cfg = r[1]; } catch (e) { b.innerHTML = '<div class="al al-r">' + pcEsc(e.message) + '</div>'; return; }
  if (!inf.ok || !cfg.ok) { b.innerHTML = '<div class="al al-r">' + pcEsc(inf.error || cfg.error) + '</div>'; return; }
  var f3 = function(n) { return n === null || n === undefined ? '—' : (Math.round(n * 1000) / 1000).toLocaleString('es-AR'); };
  var dd = function(s) { return String(s).split('-').reverse().join('/'); };
  var h = '<div class="card mb3"><div class="card-hd"><span class="card-title">Control del día: lo que se fue contra lo cargado en las cubiertas</span><span style="display:flex;gap:6px;align-items:center">' +
    '<input type="date" class="fi" id="pc-pes-d" value="' + pcEsc(PC_.pesD) + '"> a <input type="date" class="fi" id="pc-pes-h" value="' + pcEsc(PC_.pesH) + '"><button class="btn btn-p btn-sm" onclick="PC_.pesD=$v(\'pc-pes-d\');PC_.pesH=$v(\'pc-pes-h\');pcPesaje()">Ver</button></span></div>' +
    '<div class="card-body"><div class="tdim mb2" style="font-size:12px">Retirado a la mañana − sobrante a la tarde = <b>se fue</b>. Se compara con lo cargado en las cubiertas ese día en esa estación. Rojo: la diferencia pasa el ' + inf.MARGEN + '%. Fecha de Argentina.</div>';
  if (!inf.FILAS.length) h += '<div class="tdim">No hay pesajes ni consumos en esas fechas.</div>';
  else h += '<div class="tw"><table id="pc-tbl-pes"><thead><tr><th>Fecha</th><th>Estación</th><th>Insumo</th><th class="tr">Retirado</th><th class="tr">Sobró</th><th class="tr">Se fue</th><th class="tr">En cubiertas</th><th class="tr">Diferencia</th><th>Sobrante</th><th>Quién · explicación</th></tr></thead><tbody>' +
    inf.FILAS.map(function(x) {
      var P = x.PES, c = x.CALC, u = pcEsc(x.UNIDAD), est;
      if (x.SIN_PESAJE) est = '<span class="badge b-red">Sin pesaje del día</span>';
      else if (P.ESTADO === 'ANULADO') est = '<span class="badge b-gray">Anulado: ' + pcEsc(P.MOTIVO_ANULA) + '</span>';
      else if (P.ESTADO === 'ABIERTO') est = '<span class="badge b-orange">Falta el pesaje del final</span>';
      else est = c && c.FUERA ? '<b style="color:var(--danger)">' + (c.DIF > 0 ? '+' : '') + f3(c.DIF) + ' ' + u + ' (' + (c.PCT > 0 ? '+' : '') + String(c.PCT).replace('.', ',') + '%)</b>' : '<span style="color:var(--success);font-weight:700">' + (c.DIF > 0 ? '+' : '') + f3(c.DIF) + ' ' + u + ' (' + String(c.PCT).replace('.', ',') + '%)</span>';
      return '<tr' + (P && P.ESTADO === 'ANULADO' ? ' style="opacity:.5"' : '') + '><td>' + dd(x.FECHA) + '</td><td>' + pcEsc(x.ESTACION) + '</td><td>' + pcEsc(x.INSUMO) + '</td>' +
        '<td class="tr mono">' + (P ? f3(P.INICIO) + ' ' + u : '—') + '</td><td class="tr mono">' + (P && P.FIN !== null ? f3(P.FIN) + ' ' + u : '—') + '</td><td class="tr mono">' + (c ? f3(c.REAL) + ' ' + u : '—') + '</td>' +
        '<td class="tr mono">' + f3(x.USADO_CUB) + ' ' + u + '<div class="tdim" style="font-size:10px">' + x.CUBIERTAS + ' cub.' + (x.PESADAS ? ' · ' + x.PESADAS + ' pesadas' : ' · receta') + '</div></td><td class="tr">' + est + '</td>' +
        '<td>' + (P && P.DESTINO ? (P.DESTINO === 'QUEDA' ? 'Quedó en la estación' : 'Volvió al depósito') : '') + '</td>' +
        '<td style="font-size:11px">' + (P ? pcEsc([P.OPERARIO_INI ? 'inicio ' + P.OPERARIO_INI : '', P.OPERARIO_FIN ? 'fin ' + P.OPERARIO_FIN : ''].filter(Boolean).join(' · ')) + (P.JUSTIFICACION ? '<div><b>' + pcEsc(P.JUSTIFICACION) + '</b>' + (P.AUTORIZA ? ' · ' + pcEsc(P.AUTORIZA) : '') + '</div>' : '') : '') +
        (P && P.ESTADO !== 'ANULADO' ? ' <button class="btn btn-xs btn-s" onclick="pcPesAnular(' + P.ID_PES + ')">Anular</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  h += '</div></div>';
  h += '<div class="card"><div class="card-hd"><span class="card-title">Qué se pesa en cada estación</span></div><div class="card-body"><div class="tdim mb2" style="font-size:12px">Se controla <b>todo lo que va por cantidad</b>: kg, gramos, litros, metros (' + cfg.INSUMOS.length + ' insumos). Lo que va por unidad no se pesa.<br>' +
    '<b>Inicio y fin del día</b>: obligatorio en toda estación que usa alguno. <b>Por cubierta</b>: se elige acá; con el tilde, la tablet pide peso de antes y de después en cada cubierta.</div>' +
    '<div class="tw"><table><thead><tr><th>Estación</th><th>Línea</th><th>Usa</th><th>Inicio y fin del día</th><th>Por cubierta</th></tr></thead><tbody>' +
    cfg.ESTACIONES.filter(function(e) { return e.DIA || e.CUB; }).map(function(e) {
      return '<tr><td>' + pcEsc((e.NRO || e.ORDEN) + ' · ' + e.NOMBRE) + '</td><td>' + pcEsc(e.LINEA || '') + '</td><td style="font-size:11px">' + pcEsc(e.INSUMOS.join(', ')) + '</td><td>' + (e.DIA ? '<span class="badge b-green">Obligatorio</span>' : '—') + '</td>' +
        '<td><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" class="pc-pes-cub" value="' + pcEsc(e.ID_ESTACION) + '"' + (e.CUB ? ' checked' : '') + '> pesar cada cubierta</label></td></tr>';
    }).join('') + '</tbody></table></div>' +
    '<div class="flex gap2 mt2" style="align-items:center">Margen de diferencia permitido <input class="fi" id="pc-pes-mg" style="width:70px" value="' + pcEsc(cfg.MARGEN) + '"> % <button class="btn btn-p" onclick="pcPesGuardar()">Guardar</button></div></div></div>';
  b.innerHTML = psTop + h;
  var so = $id('pc-ps-op'); if (so) so.onchange = function() { PC_.psOp = this.value; };
  pcPsCalc();
}
PC_TOUR.pesaje = [['', '⚖ Pesaje y medición', 'Se tildan las cubiertas que se van a hacer y el sistema suma la receta de todo lo que va por peso o volumen. A la mañana cada estación pesa lo que retira y a la tarde lo que sobra. Acá se ve, día por día, lo que se fue contra lo cargado en las cubiertas.'], ['#pc-tbl-pes', 'El informe', '<b>Se fue</b> = retirado − sobrante. <b>En cubiertas</b> = lo cargado en la tablet ese día. En rojo, la diferencia que pasa el margen, con la explicación del encargado.'], ['.pc-pes-cub', 'Por cubierta', 'Con el tilde, en esa estación la tablet pide el peso de antes y de después en cada cubierta.']];
async function pcPesGuardar() {
  var cub = Array.prototype.filter.call(document.querySelectorAll('.pc-pes-cub'), function(x) { return x.checked; }).map(function(x) { return x.value; });
  try { var r = await gsRun('gsPC_PesajeGuardarConfig', { CUB: cub, MARGEN: $v('pc-pes-mg') }); if (!r.ok) return toast(r.error, 'r2'); toast('Guardado ✓', 'g'); pcPesaje(); } catch (e) { toast(e.message, 'r2'); }
}
async function pcPesAnular(id) {
  var m = await uiPedir('¿Por qué se anula este pesaje?', { obligatorio: true }); if (!m) return;
  try { var r = await gsRun('gsPC_PesajeAnular', id, m); if (!r.ok) return toast(r.error, 'r2'); toast('Anulado', 'g'); pcPesaje(); } catch (e) { toast(e.message, 'r2'); }
}
async function pcHerramental() {
  $id('pc-body').innerHTML = '<div class="tdim">Cargando...</div>';
  var r = await gsRun('gsPC_Piezas');
  PC_.piezas = r;
  var disp = function(id) { return r.piezas.filter(function(p) { return p.ID_INSUMO === id && p.ESTADO === 'DISPONIBLE'; }).length; };
  $id('pc-body').innerHTML = '<div class="card mb3"><div class="card-hd"><span class="card-title">Alta de piezas</span></div><div class="card-body"><div class="tdim mb3" style="font-size:12px">Cada inner, envelope o llanta es una pieza con su código. En cada estación se elige qué pieza se usó: así se sabe cuántos usos lleva y en qué cubiertas estuvo.</div>' +
    // Formulario en grilla: cada fila alineada (etiquetas de una línea, campos de la misma altura)
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px 16px;align-items:end">' +
    '<div style="grid-column:1/-1"><label class="fl">Herramental (pieza)</label><select class="fs" id="pch-ins" style="width:100%">' + r.herramental.map(function(h) { return '<option value="' + pcEsc(h.ID_INSUMO) + '" data-usos="' + h.MAX_USOS + '">' + pcEsc(h.ID_INSUMO + ' — ' + h.NOMBRE) + ' (' + disp(h.ID_INSUMO) + ' disponibles)</option>'; }).join('') + '</select></div>' +
    '<div><label class="fl">Cantidad de piezas</label><input class="fi" type="number" min="1" max="200" id="pch-n" value="1" style="width:100%"/></div>' +
    '<div><label class="fl">Usos máximos</label><input class="fi" type="number" min="0" id="pch-u" placeholder="del insumo" style="width:100%"/></div>' +
    '<div style="grid-column:1/-1"><label class="fl">Marcas vulcanizadas</label><textarea class="fi" id="pch-m" rows="2" placeholder="Ej.: IN-019, EV-028 (una por renglón o separadas por coma)" style="text-transform:uppercase;width:100%"></textarea><div class="tdim" style="font-size:11px;margin-top:4px">Si las escribís, se da de alta una pieza por marca y la marca es su código. Si las dejás vacías, se usa la cantidad.</div></div>' +
    '<div style="grid-column:1/-1"><button class="btn btn-p" onclick="pcAltaPiezas()">Dar de alta</button></div></div></div></div>' +
    '<div class="card"><div class="tw"><table style="font-size:12px" id="pc-tbl-piezas"><thead><tr><th>Marca (código)</th><th>Herramental</th><th class="tr">Usos</th><th>Estado</th><th>Últimos usos</th><th></th></tr></thead><tbody>' +
    r.piezas.map(function(p) { return '<tr' + (p.ESTADO === 'BAJA' ? ' style="opacity:.55"' : '') + '><td class="mono"><b>' + pcEsc(p.CODIGO) + '</b></td><td>' + pcEsc(p.NOMBRE) + '</td><td class="tr">' + p.USOS + ' / ' + (p.MAX_USOS || '∞') + '</td><td>' + (p.ESTADO === 'DISPONIBLE' ? '<span class="badge b-green">disponible</span>' : '<span class="badge b-gray">baja</span>') + '</td>' +
      '<td style="font-size:11px">' + p.HISTORIAL.slice(-3).map(function(h) { return pcEsc(h.NRO_OT + ' ' + h.MARCA); }).join(' · ') + '</td>' +
      '<td style="white-space:nowrap">' + (pcPuede('EDITAR') ? '<button class="btn btn-w btn-xs" onclick="pcPiezaMarca(' + p.ID_PIEZA + ')">Marca</button> ' : '') + (p.ESTADO === 'DISPONIBLE' ? (pcPuede('ANULAR') ? '<button class="btn btn-s btn-xs" onclick="pcBajaPieza(' + p.ID_PIEZA + ',false)">Dar de baja</button>' : '') : (pcPuede('ANULAR') ? '<button class="btn btn-s btn-xs" onclick="pcBajaPieza(' + p.ID_PIEZA + ',true)">Reactivar</button>' : '')) + '</td></tr>'; }).join('') +
    '</tbody></table>' + (r.piezas.length ? '' : '<div class="tdim" style="padding:12px">No hay piezas cargadas.</div>') + '</div></div>';
}
async function pcAltaPiezas() {
  var mks = String($v('pch-m') || '').split(/[\n,;]+/).map(function(x) { return x.trim(); }).filter(function(x) { return x; });
  var r = await gsRun('gsPC_AltaPiezas', $v('pch-ins'), $v('pch-n'), $v('pch-u'), '', mks);
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  toast('Piezas: ' + r.codigos.join(', ') + ' ✓', 'g'); pcHerramental();
}
function pcPiezaMarca(id) {
  var p = (PC_.piezas.piezas || []).filter(function(x) { return String(x.ID_PIEZA) === String(id); })[0]; if (!p) return;
  showModal('<div class="mh"><span class="mt">Marca vulcanizada · ' + pcEsc(p.NOMBRE) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="tdim mb2" style="font-size:12px">Código actual: <b class="mono">' + pcEsc(p.CODIGO) + '</b> · ' + p.USOS + ' usos. Escribí la marca que tiene vulcanizada la pieza: es la que se elige en la estación.</div>' +
    '<div class="fg"><label class="fl">Marca</label><input class="fi" id="pcpm-m" value="' + pcEsc(/#\d+$/.test(p.CODIGO) ? '' : p.CODIGO) + '" style="text-transform:uppercase"/></div>' +
    '<button class="btn btn-p mt3" id="pcpm-ok" onclick="pcPiezaMarcaOk(' + p.ID_PIEZA + ')"><i class="fas fa-save"></i> Guardar</button></div>');
  setTimeout(function() { var e = $id('pcpm-m'); if (e) e.focus(); }, 50);
}
async function pcPiezaMarcaOk(id) {
  var b = $id('pcpm-ok'); b.disabled = true;
  try { var r = await gsRun('gsPC_PiezaMarca', id, $v('pcpm-m')); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Marca ' + r.CODIGO + ' ✓', 'g'); closeModal(); pcHerramental(); }
  catch (e) { toast(e.message, 'r2'); } finally { b.disabled = false; }
}
async function pcBajaPieza(id, act) { var r = await gsRun('gsPC_BajaPieza', id, act, act ? 'reactivada' : 'baja manual'); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Listo ✓', 'g'); pcHerramental(); }

// ── Configuración ──
function pcConfig() {
  var d = PC_.d, adm = SES && (SES.rol === 'SUPER' || SES.rol === 'ADMINISTRADOR');
  var desc = { MARCA_AUTO: 'Marca automática si se deja vacía (1 sí / 0 no)', MARCA_PREFIJO: 'Prefijo de la marca', MARCA_DIGITOS: 'Dígitos', TOLERANCIA_CONSUMO: 'Tolerancia de consumo (0,10 = 10%)', HERR_BAJA_AUTO: 'Baja automática de herramental al llegar a sus usos', BLOQUEAR_SIN_STOCK: 'Bloquear si no hay stock (1) o solo avisar (0)', HERR_OBLIGATORIO: 'Exigir la pieza de herramental en cada registro', PRORRATEO: 'Reparto de gastos fijos: CUBIERTA o MINUTOS' , ESTACIONES_OBLIGATORIAS: 'Exigir las 10 estaciones para terminar (1 sí / 0 no)', ORDEN_ESTACIONES: 'Estaciones en orden: no deja saltear (1 sí / 0 no)', TIEMPO_OPERARIO: 'El operario toma el tiempo en la tablet (1 sí / 0 no)', APRENDER_ESTACION: 'Aprender en qué estación va cada insumo (1 sí / 0 no)', CONSUMO_AMARILLO: 'Consumibles: amarillo desde (1,2 = 20% más)', CONSUMO_ROJO: 'Consumibles: rojo desde (1,5 = 50% más)', CAMBIO_CONTRA_ENTREGA: 'Consumible nuevo solo entregando el gastado (1 sí / 0 no)', SERVICE_AVISO_DIAS: 'Avisar el service de herramientas con estos días', CONTROL_DIARIO: 'Control diario de herramientas en la tablet (1 sí / 0 no: solo se avisa "Se rompió / Me falta")', CONTROL_SEMANAL_DIA: 'Día del control semanal (0 domingo … 6 sábado)', CONTROL_SEMANAL_DIAS: 'Alarma si una entrega pasa más de estos días sin control' };
  $id('pc-body').innerHTML = '<div class="g2"><div class="card"><div class="card-hd"><span class="card-title">Encargados de línea</span></div><div class="card-body"><div class="tdim mb3" style="font-size:12px">Autorizan reemplazos con su clave y cargan los tiempos.</div>' +
    '<table style="font-size:12px"><tbody>' + d.encargados.map(function(e) { return '<tr><td>' + pcEsc(e.USUARIO) + '</td><td>' + pcEsc(e.LINEA || 'Todas') + '</td><td>' + (e.ACTIVO ? 'activo' : 'inactivo') + '</td><td>' + (adm ? '<button class="btn btn-s btn-xs" onclick="pcEncargado(\'' + pcEsc(e.USUARIO) + '\',\'' + pcEsc(e.LINEA) + '\',' + (e.ACTIVO ? 0 : 1) + ')">' + (e.ACTIVO ? 'Desactivar' : 'Activar') + '</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table>' +
    (adm ? '<div class="flex gap2 aic mt3"><input class="fi" id="pce-u" placeholder="usuario" style="width:140px"/><select class="fs" id="pce-l" style="width:140px"><option value="">Todas las líneas</option>' + d.lineas.map(function(l) { return '<option>' + pcEsc(l.LINEA) + '</option>'; }).join('') + '</select><button class="btn btn-p btn-sm" onclick="pcEncargado($v(\'pce-u\'),$v(\'pce-l\'),1)">Agregar</button></div>' : '') + '</div></div>' +
    '<div class="card"><div class="card-hd"><span class="card-title">Parámetros</span></div><div class="card-body"><table style="font-size:12px"><tbody>' +
    Object.keys(desc).filter(function(k) { return d.param[k] !== undefined; }).map(function(k) { return '<tr><td>' + desc[k] + '</td><td><input class="fi" id="pcp-' + k + '" value="' + pcEsc(d.param[k]) + '" style="width:90px"' + (adm ? '' : ' disabled') + '/></td><td>' + (adm ? '<button class="btn btn-s btn-xs" onclick="pcParam(\'' + k + '\')">Guardar</button>' : '') + '</td></tr>'; }).join('') +
    '</tbody></table><div class="tdim mt3" style="font-size:11px">Líneas y capacidades: Producción → Recetas → "Líneas, tipos y trabajos". Gastos fijos: Órdenes de Trabajo → Costos.</div></div></div></div>' +
    pcMotivosGrilla(adm);
}
// ── Motivos de rechazo: por qué un casco NO es apto para recapar (se elige en la Inspección inicial). No se borran: se desactivan ──
function pcMotivosGrilla(adm) {
  var ms = PC_.d.motivosRechazo || [];
  return '<div class="card mt3"><div class="card-hd"><span class="card-title">Motivos de rechazo (casco no apto para recapar)</span>' +
    '<span class="flex gap2 aic"><span class="badge b-blue">' + ms.length + ' registros</span>' + (adm ? '<button class="btn btn-p btn-sm" id="pcm-nuevo" onclick="pcMotivoForm(0)"><i class="fas fa-plus"></i> Agregar</button>' : '') + '</span></div>' +
    '<div class="fbar"><input class="fi" style="width:220px" placeholder="Buscar..." oninput="filterTable(this,\'tbl-motivos\')"/></div>' +
    '<div class="tw"><table id="tbl-motivos"><thead><tr><th style="width:40px">#</th><th style="width:90px">Código</th><th>Motivo</th><th style="width:100px">Estado</th><th style="width:60px"></th></tr></thead><tbody>' +
    (ms.length ? ms.map(function(m, i) {
      return '<tr' + (m.ACTIVO ? '' : ' style="opacity:.5"') + '><td class="mono tc" style="font-size:11px">' + (i + 1) + '</td><td class="mono" style="font-size:12px">' + pcEsc(m.CODIGO) + '</td><td style="font-size:13px">' + pcEsc(m.DESCRIPCION) + '</td>' +
        '<td><span class="badge ' + (m.ACTIVO ? 'b-green' : 'b-gray') + '">' + (m.ACTIVO ? 'Activo' : 'Desactivado') + '</span></td>' +
        '<td>' + (adm ? '<button class="btn btn-xs btn-s" onclick="pcMotivoForm(' + m.ID_MOT + ')" title="Modificar"><i class="fas fa-edit"></i></button>' : '') + '</td></tr>';
    }).join('') : '<tr><td colspan="5" class="tc tdim" style="padding:24px">Sin motivos cargados.</td></tr>') +
    '</tbody></table></div><div class="tdim" style="font-size:11px;padding:8px 16px">No se borran: si uno ya no se usa, se modifica y se desactiva.</div></div>';
}
function pcMotivoForm(id) {
  var m = id ? (PC_.d.motivosRechazo || []).filter(function(x) { return String(x.ID_MOT) === String(id); })[0] : { CODIGO: '', DESCRIPCION: '', ACTIVO: 1 };
  if (!m) return;
  showModal('<div class="mh"><span class="mt">' + (id ? 'Modificar motivo ' + pcEsc(m.CODIGO) : 'Nuevo motivo de rechazo') + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<div class="fr"><div class="fg" style="max-width:130px"><label class="fl">Código *</label><input class="fi" id="pcm-c" value="' + pcEsc(m.CODIGO) + '" placeholder="R10"/></div>' +
    '<div class="fg"><label class="fl">Motivo *</label><input class="fi" id="pcm-d" value="' + pcEsc(m.DESCRIPCION) + '" placeholder="Ej: Talón dañado"/></div></div>' +
    '<div class="fg"><label class="fl">Estado</label><select class="fs" id="pcm-a"><option value="1"' + (m.ACTIVO ? ' selected' : '') + '>Activo</option><option value="0"' + (m.ACTIVO ? '' : ' selected') + '>Desactivado</option></select></div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pcm-ok" onclick="pcMotivoGuardar(' + (id || 0) + ')"><i class="fas fa-save"></i> Guardar</button></div>');
}
async function pcMotivoGuardar(id) {
  var r = await gsRun('gsPC_GuardarMotivoRechazo', { ID_MOT: id || '', CODIGO: $v('pcm-c'), DESCRIPCION: $v('pcm-d'), ACTIVO: +$v('pcm-a') });
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  closeModal(); toast('Guardado ✓', 'g'); pcRecargar();
}
async function pcEncargado(u, l, act) { var r = await gsRun('gsPC_GuardarEncargado', u, l, act); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Guardado ✓', 'g'); pcRecargar(); }
async function pcParam(k) { var r = await gsRun('gsPC_GuardarParam', k, $v('pcp-' + k)); if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; } toast('Guardado ✓', 'g'); pcRecargar(); }
// ── Costos por cubierta y prorrateo de gastos fijos del mes ──
async function pcCostos() {
  var mes = PC_.mes || fechaISO(new Date()).slice(0, 7);
  PC_.mes = mes;
  $id('pc-body').innerHTML = '<div class="tdim">Cargando...</div>';
  var r = await gsRun('gsPC_Costos', mes);
  PC_.costos = r;
  var t = { mat: 0, herr: 0, mo: 0, fij: 0, tot: 0 };
  r.filas.forEach(function(f) { t.mat += f.MATERIALES; t.herr += f.HERRAMENTAL; t.mo += f.MO; t.fij += f.FIJOS; t.tot += f.TOTAL; });
  var n = r.filas.length;
  $id('pc-body').innerHTML = '<div class="card"><div class="fbar no-print" style="gap:8px;flex-wrap:wrap"><label class="fl" style="margin:0">Mes</label><input class="fi" type="month" id="pcc-mes" value="' + mes + '" style="width:160px"/>' +
    '<button class="btn btn-s btn-sm" onclick="pcCostosExcel()"><i class="fas fa-file-download"></i> Excel</button>' +
    (pcPuede('EDITAR') ? '<button class="btn btn-p btn-sm" onclick="pcProrratear()"><i class="fas fa-balance-scale"></i> Prorratear gastos fijos del mes</button>' : '') +
    '<button class="btn btn-s btn-sm" onclick="pcPreciosRec()"><i class="fas fa-tags"></i> Precios de recapado</button>' +
    '<span class="tdim" style="font-size:11px">Reparto: ' + (r.metodo === 'MINUTOS' ? 'según minutos de cada cubierta' : 'igual por cubierta') + '</span></div>' +
    '<div class="tw"><table style="font-size:12px" id="pc-tbl-costos"><thead><tr><th>Terminada</th><th>OT</th><th>Marca grabada · DOT</th><th>Cliente</th><th>Cubierta</th><th class="tr">Materiales</th><th class="tr">Herramental</th><th class="tr">Min</th><th class="tr">Mano de obra</th><th class="tr">Fijos</th><th class="tr">Total</th></tr></thead><tbody>' +
    r.filas.map(function(f) { return '<tr><td>' + fmtD(f.FECHA_FIN) + '</td><td class="mono">' + pcEsc(f.NRO_OT) + '</td><td class="mono"><b>' + pcEsc(f.MARCA) + '</b><div style="font-size:10px">DOT: ' + pcDotTxt(pcDotDe(f)) + '</div></td><td>' + pcEsc(f.CLIENTE) + '</td><td style="font-size:11px">' + pcEsc(f.TIPO + ' ' + f.MEDIDA + ' · ' + f.TRABAJO) + '</td><td class="tr mono">' + fmt(f.MATERIALES) + '</td><td class="tr mono">' + fmt(f.HERRAMENTAL) + '</td><td class="tr">' + f.MINUTOS + '</td><td class="tr mono">' + fmt(f.MO) + '</td><td class="tr mono">' + fmt(f.FIJOS) + '</td><td class="tr mono"><b>' + fmt(f.TOTAL) + '</b></td></tr>'; }).join('') +
    (n ? '<tr style="font-weight:700"><td colspan="5">Total ' + n + ' cubiertas (promedio ' + fmt(t.tot / n) + ')</td><td class="tr mono">' + fmt(t.mat) + '</td><td class="tr mono">' + fmt(t.herr) + '</td><td></td><td class="tr mono">' + fmt(t.mo) + '</td><td class="tr mono">' + fmt(t.fij) + '</td><td class="tr mono">' + fmt(t.tot) + '</td></tr>' : '') +
    '</tbody></table>' + (n ? '' : '<div class="tdim" style="padding:12px">No hay cubiertas terminadas en ' + mes + '.</div>') + '</div>' +
    (r.prorrateos.length ? '<div class="tdim" style="padding:8px 14px;font-size:11px">Prorrateos hechos: ' + r.prorrateos.map(function(p) { return p.MES + ' (' + p.METODO + ', ' + fmt(p.FIJOS_MES) + ' entre ' + p.CUBIERTAS + ')'; }).join(' · ') + '</div>' : '') + '</div>';
  $id('pcc-mes').addEventListener('change', function() { PC_.mes = this.value; pcCostos(); });
}
function pcCostosExcel() {
  var r = PC_.costos; if (!r) return;
  var filas = [['TERMINADA', 'OT', 'MARCA', 'CLIENTE', 'TIPO', 'MEDIDA', 'TRABAJO', 'MATERIALES', 'HERRAMENTAL', 'MINUTOS', 'MANO_OBRA', 'FIJOS', 'TOTAL']].concat(r.filas.map(function(f) { return [fmtD(f.FECHA_FIN), f.NRO_OT, f.MARCA, f.CLIENTE, f.TIPO, f.MEDIDA, f.TRABAJO, f.MATERIALES, f.HERRAMENTAL, f.MINUTOS, f.MO, f.FIJOS, f.TOTAL]; }));
  var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(filas), 'COSTOS'); XLSX.writeFile(wb, 'COSTO_CUBIERTAS_' + PC_.mes + '.xlsx');
}
async function pcProrratear() {
  var r = await gsRun('gsPC_Prorratear', PC_.mes, false);
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  showModal('<div class="mh"><span class="mt">Prorrateo de gastos fijos — ' + pcEsc(r.mes) + '</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<p>Gastos fijos del mes: <b>' + fmt(r.fijosMes) + '</b> entre <b>' + r.cubiertas + '</b> cubiertas terminadas, ' + (r.metodo === 'MINUTOS' ? 'según los minutos de cada una (' + r.minutos + ' min en total)' : 'en partes iguales') + '.</p>' +
    '<div class="tw" style="max-height:300px"><table style="font-size:12px"><thead><tr><th>Marca grabada · DOT</th><th class="tr">Fijos antes</th><th class="tr">Fijos nuevo</th><th class="tr">Total nuevo</th></tr></thead><tbody>' +
    r.detalle.map(function(d) { return '<tr><td class="mono">' + pcEsc(d.MARCA) + '<div style="font-size:10px">DOT: ' + pcDotTxt(pcDotDe((PC_.d.cubiertas || []).filter(function(y) { return y.MARCA === d.MARCA; })[0])) + '</div></td><td class="tr mono">' + fmt(d.FIJOS_ANTES) + '</td><td class="tr mono">' + fmt(d.FIJOS) + '</td><td class="tr mono">' + fmt(d.TOTAL) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    '<div class="tdim" style="font-size:11px">Los gastos fijos salen de Órdenes de Trabajo → Costos (sin la mano de obra, que va por minutos).</div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" id="pcp-ok">Aplicar</button></div>', 'md-lg');
  $id('pcp-ok').addEventListener('click', async function() {
    this.disabled = true;
    var g = await gsRun('gsPC_Prorratear', PC_.mes, true);
    if (!g || !g.grabado) { toast((g && g.error) || 'No se pudo', 'r2'); return; }
    toast('Prorrateo aplicado ✓', 'g'); closeModal(); pcCostos();
  });
}

// ── Precios de recapado desde el costo real (28/10/2026) ──
// Servicio a clientes: promedio del costo de las cubiertas terminadas de cada medida y trabajo. Recapada propia: promedio de las unidades en stock.
// Precio = costo × (1 + rentabilidad) ÷ (1 − impuestos de venta) + IVA. «Armar la lista» deja una lista de venta nueva en borrador para aprobar en Precios.
async function pcPreciosRec() {
  var r; try { r = await gsRun('gsFP_Precios', false); } catch (e) { toast(e.message || e, 'r2'); return; }
  if (!r || !r.ok) { toast((r && r.error) || 'No se pudo', 'r2'); return; }
  var g = r.REGLA, pct = function(x) { return (Math.round(x * 10000) / 100).toLocaleString('es-AR') + '%'; };
  showModal('<div class="mh"><span class="mt"><i class="fas fa-tags" style="color:var(--accent)"></i> Precios de recapado desde el costo real</span><button class="mc" onclick="closeModal()">×</button></div><div class="mb2">' +
    '<p style="margin-top:0">Regla: costo × (1 + rentabilidad ' + pct(g.RENTABILIDAD) + ') ÷ (1 − impuestos de venta ' + pct(g.IMP_VENTA) + ') + IVA ' + pct(g.IVA) + '. Los parámetros están en Órdenes de Trabajo → Costos.</p>' +
    '<div class="tw" style="max-height:360px"><table style="font-size:13px"><thead><tr><th>Artículo</th><th>Base</th><th class="tr">Costo</th><th class="tr">Sin IVA</th><th class="tr">Con IVA</th><th class="tr">En la lista hoy</th></tr></thead><tbody>' +
    (r.FILAS.length ? r.FILAS.map(function(f) { var cambia = Math.round(f.CON_IVA) !== Math.round(f.ACTUAL);
      return '<tr><td>' + pcEsc(f.NOMBRE) + '<div class="tdim" style="font-size:11px">' + (f.CLASE === 'SERVICIO' ? 'Servicio a clientes' : 'Recapada propia (stock)') + '</div></td><td>' + pcEsc(f.BASE) + '</td><td class="tr mono">' + fmt(f.COSTO) + '</td><td class="tr mono">' + fmt(f.SIN_IVA) + '</td><td class="tr mono"><b>' + fmt(f.CON_IVA) + '</b></td><td class="tr mono"' + (cambia ? ' style="color:var(--warning)"' : '') + '>' + (f.ACTUAL ? fmt(f.ACTUAL) : 'sin precio') + '</td></tr>'; }).join('')
      : '<tr><td colspan="6" class="tdim">Todavía no hay cubiertas terminadas con costo.</td></tr>') + '</tbody></table></div>' +
    '<div class="tdim" style="font-size:12px;margin-top:8px">' + r.CAMBIAN + ' precio' + (r.CAMBIAN === 1 ? '' : 's') + ' distinto' + (r.CAMBIAN === 1 ? '' : 's') + ' de la lista vigente. Al armar la lista queda en borrador: la aprueba un administrador en Precios → Versiones de la lista.</div></div>' +
    '<div class="mf"><button class="btn btn-s" onclick="closeModal()">Cerrar</button>' + (r.CAMBIAN ? '<button class="btn btn-p" id="pcpr-ok"><i class="fas fa-check"></i> Armar la lista nueva con estos precios</button>' : '') + '</div>', 'md-lg');
  var ok = $id('pcpr-ok'); if (!ok) return;
  ok.addEventListener('click', async function() {
    this.disabled = true;
    try { var c = await gsRun('gsFP_Precios', true); if (!c || !c.ok) { toast((c && c.error) || 'No se pudo', 'r2'); this.disabled = false; return; }
      closeModal(); toast('Lista de venta N° ' + c.ID_LV + ' en borrador: aprobala en Precios → Versiones de la lista', 'g'); }
    catch (e) { toast(e.message || e, 'r2'); this.disabled = false; }
  });
}

// ── Lista desplegable propia para los campos con sugerencias (cliente, medida, marca, buscador) ──
// La lista del navegador (datalist) no aparece en todos los navegadores ni tablets: esta se ve siempre.
// Solo actúa en Producción por cubierta y en el Puesto de estación.
(function() {
  var box = null, act = null, eligiendo = false;
  var esc = function(x) { return String(x === undefined || x === null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var css = document.createElement('style');
  css.textContent = '.ac-box{position:absolute;z-index:99999;background:var(--surface,#fff);border:1px solid var(--border,#ccc);border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.18);max-height:280px;overflow:auto;font-size:14px}' +
    '.ac-op{padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--border,#eee)}.ac-op:hover,.ac-op.on{background:var(--accent-light,#e8f0fe)}.ac-op span{color:var(--dim,#777);font-size:12px}.ac-vacio{padding:9px 12px;color:var(--dim,#777)}';
  document.head.appendChild(css);
  var enZona = function(t) { return t && t.closest && (t.closest('#page-produccion-cubiertas') || t.closest('#page-puesto-estacion') || t.closest('.pu-vent')); };
  var cerrar = function() { if (box) { box.remove(); box = null; } act = null; };
  var opciones = function(inp) { var dl = document.getElementById(inp.getAttribute('data-list') || ''); return dl ? Array.prototype.map.call(dl.options, function(o) { return { v: o.value, t: o.textContent || '' }; }) : []; };
  var mostrar = function(inp) {
    var q = String(inp.value || '').toUpperCase().trim().split(/\s+/).filter(Boolean);
    var ops = opciones(inp).filter(function(o) { var s = (o.v + ' ' + o.t).toUpperCase(); return q.every(function(p) { return s.indexOf(p) !== -1; }); }).slice(0, 50);
    if (!box) { box = document.createElement('div'); box.className = 'ac-box'; document.body.appendChild(box); }
    act = inp;
    box.innerHTML = ops.length ? ops.map(function(o, i) { return '<div class="ac-op" data-i="' + i + '"><b>' + esc(o.v) + '</b>' + (o.t && o.t !== o.v ? ' <span>' + esc(o.t) + '</span>' : '') + '</div>'; }).join('') : '<div class="ac-vacio">' + (q.length ? 'No hay coincidencias' : 'Escribí para buscar') + '</div>';
    var r = inp.getBoundingClientRect();
    box.style.left = (r.left + window.scrollX) + 'px'; box.style.top = (r.bottom + window.scrollY + 2) + 'px'; box.style.minWidth = Math.max(r.width, 220) + 'px';
    box.onmousedown = function(e) {
      var el = e.target.closest ? e.target.closest('.ac-op') : null; if (!el) return;
      e.preventDefault();
      var o = ops[+el.getAttribute('data-i')]; eligiendo = true;
      inp.value = o.v; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
      eligiendo = false; cerrar();
    };
  };
  document.addEventListener('focusin', function(e) {
    var t = e.target;
    if (t && t.tagName === 'INPUT' && t.getAttribute('list') && enZona(t)) { t.setAttribute('data-list', t.getAttribute('list')); t.removeAttribute('list'); t.setAttribute('autocomplete', 'off'); }
    if (t && t.tagName === 'INPUT' && t.getAttribute('data-list') && enZona(t)) mostrar(t); else cerrar();
  });
  document.addEventListener('input', function(e) { var t = e.target; if (!eligiendo && t && t.getAttribute && t.getAttribute('data-list') && document.activeElement === t) mostrar(t); });
  document.addEventListener('focusout', function(e) { if (e.target === act) setTimeout(function() { if (document.activeElement !== act) cerrar(); }, 150); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') cerrar(); });
})();
