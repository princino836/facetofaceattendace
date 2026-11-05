# CS Group B Attendance (HTML/CSS/JS + C++ WebAssembly scaffold)

## Included
- `index.html`, `style.css`, `script.js`: responsive frontend and GPS radius check.
- `cpp/attendance.cpp`: C++ Haversine distance helper.
- `wasm/`: location for compiled WASM output.
- `admin/admin.html`: reserved for a future separate admin page.

## Run locally
GPS permissions normally require HTTPS or `localhost`.
From this folder:
```bash
python3 -m http.server 8000
```
Open http://localhost:8000

## Compile C++ to WebAssembly (Omarchy/Arch)
Install Emscripten using an official SDK setup, then activate it:
```bash
# After installing emsdk in your home directory:
source ~/emsdk/emsdk_env.sh
emcc cpp/attendance.cpp -O3 -s WASM=1 -s MODULARIZE=1 \
  -s EXPORT_NAME=createAttendanceModule \
  -s EXPORTED_FUNCTIONS='["_distance_metres"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall"]' \
  -o wasm/attendance.js
```
Then integrate the generated `wasm/attendance.js` in `script.js` and call
`Module.ccall("distance_metres", "number", ["number","number","number","number"], [...])`.
The included JavaScript currently has a JS Haversine fallback so it runs immediately.

## Host on GitHub Pages
1. Create/sign in to GitHub and create a new public repository (e.g. `cs-group-b-attendance`).
2. Upload/push the contents of this folder to the repository root.
3. Repository → Settings → Pages → Deploy from branch → `main` / root → Save.
4. Wait for deployment and open the Pages URL. HTTPS is needed for GPS permissions.

## Important limitation (please read)
This folder is a static frontend prototype. `localStorage` is per browser/device. Admin GPS is held only in the admin browser, so it is **not transmitted to student phones**. Cross-device live location, shared session status, central duplicate-index protection, and automatic email require Firebase (or another hosted backend). Firebase was discussed but has not yet been configured in this downloadable package. Admin password in frontend code is not secure; do not use it for real sensitive attendance.

To use this with the whole class, next step is configuring Firebase Realtime Database + rules and a Cloud Function/email service. GitHub Pages can still host the frontend.
