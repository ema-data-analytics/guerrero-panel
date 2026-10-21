# Arma el panel de GitHub a partir de APPSCRIPT_PRUEBAS (mismas pantallas, mismo motor Supabase).
# Uso: python3 armar_panel.py CARPETA_APPSCRIPT CARPETA_SALIDA
import re, json, sys, os
src, out = sys.argv[1], sys.argv[2]
cod = open(os.path.join(src, 'Código.js'), encoding='utf-8').read()
v = re.search(r"var MOTOR_VERSION_ARMADO_ = '([0-9a-f]+)'", cod).group(1)
g = open(os.path.join(src, 'guerrero.html'), encoding='utf-8').read()
def inc(m):
    return open(os.path.join(src, m.group(1) + '.html'), encoding='utf-8').read()
g = re.sub(r"<\?!=\s*include\('([a-z0-9-]+)'\);\s*\?>", inc, g)
cfg = {'url': 'https://igxdgivroxmbuolsdagk.supabase.co', 'key': 'sb_publishable_dgGGJ5PSVp9i4l7Up1r5yw_ADYBEt_G', 'esquema': 'pruebas', 'v': v}
cab = ('<script>window.EMA_MOTOR="supabase";window.EMA_SB=' + json.dumps(cfg) +
       ';window.EMA_ORIGEN="github";window.google={script:{run:{}}};</script>')
g, n = re.subn(r"<\?!=\s*motorConfigHtml_\(.*?\?>", lambda m: cab, g)
assert n == 1, 'no encontré motorConfigHtml_'
resto = re.findall(r"<\?.*?\?>", g, re.S)
assert not resto, 'quedaron etiquetas de Apps Script: ' + str(resto[:3])
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(g)
open(os.path.join(out, '.nojekyll'), 'w').write('')
print('OK version', v, 'bytes', len(g.encode('utf-8')))
