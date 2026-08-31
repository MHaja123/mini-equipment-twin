# Mini Equipment Twin

A one-page 3D digital twin viewer for a gearbox assembly, built with Three.js and Vite.

## Features

- 3D Gearbox model loaded from a GLB file
- Orbit, pan and zoom camera controls
- Clickable gearbox parts
- Equipment information side panel
- Temperature and RPM readings
- Simulated live data updates every 3 seconds
- Automatic equipment status:
  - 🟢 OK
  - 🟠 WARNING
  - 🔴 CRITICAL
- Visual status highlighting on the selected model part
- Reset View button
- Loading state while the 3D model loads
- Responsive one-page interface

## Tech Stack

- Three.js
- JavaScript
- Vite
- HTML
- CSS
- GLB / glTF 3D model

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal.

## Deployment

The application is deployed using Vercel.

**Live Demo:**  
https://mini-equipment-twin.vercel.app/

## Project Structure

```text
mini-equipment-twin/
├── public/
│   └── GearboxAssy.glb
├── src/
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── README.md
```

## What I Would Improve With More Time

- Add a dedicated alerts history panel
- Add more detailed equipment metrics
- Improve mobile responsiveness
- Add persistent historical charts for temperature and RPM
- Connect the simulated readings to a real API or WebSocket
- Improve 3D model part identification and naming
- Add performance optimizations for larger 3D models