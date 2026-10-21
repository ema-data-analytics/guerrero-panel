# Panel de Guerrero en GitHub (sin Apps Script)

- Las pantallas son las mismas de APPSCRIPT_PRUEBAS, armadas en un solo index.html.
- Llaman directo al motor de Supabase (función `gs`, esquema `pruebas`), igual que hoy el link con ?motor=supabase.
- El link de Apps Script sigue funcionando hasta que se confirme que GitHub anda bien.

## Cómo se arma
`python3 armar_panel.py ..\APPSCRIPT_PRUEBAS salida`  → deja `index.html` y `.nojekyll` en `salida`, que es lo que se sube al repositorio.
La versión del motor sale sola de `MOTOR_VERSION_ARMADO_` en Código.js: si cambia Código.js hay que publicarlo en Supabase (app.codigo) y volver a armar.
