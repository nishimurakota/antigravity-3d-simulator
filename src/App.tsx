import { useStore } from './store';
import {
  Box,
  Trash2,
  Check,
  Undo2,
  Redo2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  MousePointer2
} from 'lucide-react';
import Scene from './components/Scene';
import './index.css';

function App() {
  const {
    phase,
    toolMode,
    setToolMode,
    setPhase,
    clearGrid,
    rotateBox,
    undo,
    redo,
    history,
    future
  } = useStore();

  return (
    <div className="ui-container">
      <header className="header-panel panel">
        <h1>Gravity Simulator</h1>
        <p>3x3x3 Block Simulation Sandbox</p>
      </header>

      {/* 3D Canvas will be behind these panels, but needs to receive pointer events */}
      <main style={{ position: 'absolute', inset: 0 }}>
        <Scene />
      </main>

      <footer className="controls-panel panel">
        {phase === 'placement' ? (
          <>
            <div className="tools-group">
              <span className="tools-label">Placement Options</span>
              <div className="button-row">
                <button
                  className={toolMode === 'none' ? 'active' : ''}
                  onClick={() => setToolMode('none')}
                >
                  <MousePointer2 size={18} /> None (Move)
                </button>
                <button
                  className={toolMode === 'white' ? 'active' : ''}
                  onClick={() => setToolMode('white')}
                >
                  <Box size={18} /> White Block
                </button>
                <button
                  className={toolMode === 'black' ? 'active' : ''}
                  onClick={() => setToolMode('black')}
                >
                  <Box size={18} fill="currentColor" /> Black Block (Fixed)
                </button>
                <button
                  className={toolMode === 'erase' ? 'active' : ''}
                  onClick={() => setToolMode('erase')}
                >
                  <Trash2 size={18} /> Erase
                </button>
              </div>
            </div>

            <div className="tools-group" style={{ alignItems: 'flex-end' }}>
              <span className="tools-label">Current Phase: Placement</span>
              <div className="button-row">
                <button className="danger" onClick={clearGrid}>
                  <RotateCcw size={18} /> Reset All
                </button>
                <button className="primary" onClick={() => setPhase('rotation')}>
                  <Check size={18} /> Finish Placement
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="tools-group">
              <span className="tools-label">Rotate Box (Gravity: Down)</span>
              <div className="dpad">
                <button onClick={() => rotateBox('y', 1)} title="+Y Rotate"><ArrowUp size={18} /></button>
                <button onClick={() => rotateBox('x', 1)} title="+X Rotate"><RotateCw size={18} /></button>
                <button onClick={() => rotateBox('y', -1)} title="-Y Rotate"><ArrowDown size={18} /></button>

                <button onClick={() => rotateBox('z', 1)} title="+Z Rotate"><ArrowLeft size={18} /></button>
                <button onClick={() => rotateBox('z', -1)} title="-Z Rotate"><ArrowRight size={18} /></button>
                <button onClick={() => rotateBox('x', -1)} title="-X Rotate"><RotateCcw size={18} /></button>
              </div>
            </div>

            <div className="tools-group" style={{ alignItems: 'flex-end' }}>
              <span className="tools-label">Current Phase: Simulation</span>
              <div className="button-row">
                <button onClick={undo} disabled={history.length === 0}>
                  <Undo2 size={18} /> Undo
                </button>
                <button onClick={redo} disabled={future.length === 0}>
                  <Redo2 size={18} /> Redo
                </button>
              </div>
            </div>
          </>
        )}
      </footer>
    </div>
  );
}

export default App;
