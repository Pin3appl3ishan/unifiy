# U&I - Ideate. Code. Create.

A collaborative whiteboard application with integrated code editing capabilities.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install
# or
yarn install

# 2. Start development server
npm run dev
# or
yarn dev

# 3. Open http://localhost:3000
```

## 📁 Project Structure

```
src/
├── components/
│   ├── CodePad/          # Embedded code editor component
│   │   └── CodePad.tsx   # CodeMirror-based editor
│   └── Whiteboard/       # Excalidraw wrapper
│       └── Whiteboard.tsx
├── stores/
│   └── canvasStore.ts    # Zustand store with localStorage persistence
├── styles/
│   └── index.css         # Tailwind + custom styles
├── App.tsx               # Main app component
└── main.tsx              # Entry point
```

## ✨ Features Implemented

- [x] Excalidraw whiteboard integration
- [x] CodePad component with CodeMirror
- [x] Zustand state management
- [x] Auto-save to localStorage
- [x] Multiple canvas support
- [x] Drag & resize CodePads
- [x] Dark mode support
- [x] Tailwind CSS styling

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + Shift + C` - Add new CodePad

## 🛠️ Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- CodeMirror 6 (code editor)
- Excalidraw (whiteboard)

## 📝 Next Steps

- [ ] Add more programming languages to CodePad
- [ ] Implement React Router for proper navigation
- [ ] Create landing page
- [ ] Create dashboard for canvas management
- [ ] Add Supabase for real-time collaboration
