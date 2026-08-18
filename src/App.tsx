import { useState } from 'react';
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
  MousePointer2,
  ChevronDown,
  ChevronUp,
  Focus,
  Wrench
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
    resetCamera,
    history,
    future
  } = useStore();

  const [isPlacementCollapsed, setIsPlacementCollapsed] = useState(false);

  return (
    <div className="ui-container">
      {/* Header relocated to top-left corner */}
      <header className="header-panel">
        <div className="header-brand">
          <div className="header-indicator" />
          <h1>Gravity Simulator</h1>
        </div>
        <p className="header-subtitle">3×3×3 Sandbox</p>
      </header>

      {/* Top right quick actions */}
      <div className="top-actions">
        <button
          className="floating-btn reset-cam-btn"
          onClick={resetCamera}
          title="正面にカメラ位置を戻す"
        >
          <Focus size={16} /> 正面に戻す
        </button>
      </div>

      {/* 3D Canvas in background */}
      <main style={{ position: 'absolute', inset: 0 }}>
        <Scene />
      </main>

      {/* Bottom Controls */}
      {phase === 'placement' ? (
        <footer className={`controls-panel panel ${isPlacementCollapsed ? 'collapsed' : ''}`}>
          {/* Toggle button to collapse/expand panel */}
          <button
            className="collapse-toggle-btn"
            onClick={() => setIsPlacementCollapsed(!isPlacementCollapsed)}
            title={isPlacementCollapsed ? '操作パネルを展開' : '操作パネルをしまう'}
          >
            {isPlacementCollapsed ? (
              <>
                <ChevronUp size={16} /> パネルを表示
              </>
            ) : (
              <>
                <ChevronDown size={16} /> しまう
              </>
            )}
          </button>

          {!isPlacementCollapsed && (
            <div className="panel-content-row">
              <div className="tools-group">
                <span className="tools-label">Placement Options</span>
                <div className="button-row">
                  <button
                    className={toolMode === 'none' ? 'active' : ''}
                    onClick={() => setToolMode('none')}
                  >
                    <MousePointer2 size={18} /> 視点移動
                  </button>
                  <button
                    className={`block-btn white-btn ${toolMode === 'white' ? 'active' : ''}`}
                    onClick={() => setToolMode('white')}
                  >
                    <Box size={18} /> 白ブロック
                  </button>
                  <button
                    className={`block-btn red-btn ${toolMode === 'red' ? 'active' : ''}`}
                    onClick={() => setToolMode('red')}
                  >
                    <Box size={18} fill="#ef4444" color="#dc2626" /> 赤ブロック
                  </button>
                  <button
                    className={`block-btn black-btn ${toolMode === 'black' ? 'active' : ''}`}
                    onClick={() => setToolMode('black')}
                  >
                    <Box size={18} fill="currentColor" /> 黒ブロック (固定)
                  </button>
                  <button
                    className={toolMode === 'erase' ? 'active danger-mode' : ''}
                    onClick={() => setToolMode('erase')}
                  >
                    <Trash2 size={18} /> 消去
                  </button>
                </div>
              </div>

              <div className="tools-group" style={{ alignItems: 'flex-end' }}>
                <span className="tools-label">Current Phase: Placement</span>
                <div className="button-row">
                  <button className="danger" onClick={clearGrid}>
                    <RotateCcw size={18} /> 全リセット
                  </button>
                  <button className="primary" onClick={() => setPhase('rotation')}>
                    <Check size={18} /> 配置完了 (シミュレーション)
                  </button>
                </div>
              </div>
            </div>
          )}
        </footer>
      ) : (
        /* Rotation / Simulation Controls: Transparent background with distinct floating buttons */
        <footer className="rotation-controls-container">
          <div className="floating-group left-controls">
            <span className="floating-label">Rotate Box (重力: 下方向)</span>
            <div className="dpad-grid">
              {/* Row 1: Left-Top (-X CCW), Top (+Y Up), Right-Top (+X CW) */}
              <button
                className="dpad-btn diagonal-btn"
                onClick={() => rotateBox('x', -1)}
                title="左上: -X 回転 (反時計回り)"
              >
                <RotateCcw size={18} />
              </button>
              <button
                className="dpad-btn straight-btn"
                onClick={() => rotateBox('y', 1)}
                title="上: +Y 回転"
              >
                <ArrowUp size={18} />
              </button>
              <button
                className="dpad-btn diagonal-btn"
                onClick={() => rotateBox('x', 1)}
                title="右上: +X 回転 (時計回り)"
              >
                <RotateCw size={18} />
              </button>

              {/* Row 2: Left (+Z Left), Center (Reset Camera), Right (-Z Right) */}
              <button
                className="dpad-btn straight-btn"
                onClick={() => rotateBox('z', 1)}
                title="左: +Z 回転"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="dpad-btn center-cam-btn"
                onClick={resetCamera}
                title="カメラを正面に戻す"
              >
                <Focus size={18} />
              </button>
              <button
                className="dpad-btn straight-btn"
                onClick={() => rotateBox('z', -1)}
                title="右: -Z 回転"
              >
                <ArrowRight size={18} />
              </button>

              {/* Row 3: Empty, Bottom (-Y Down), Empty */}
              <div className="dpad-spacer" />
              <button
                className="dpad-btn straight-btn"
                onClick={() => rotateBox('y', -1)}
                title="下: -Y 回転"
              >
                <ArrowDown size={18} />
              </button>
              <div className="dpad-spacer" />
            </div>
          </div>

          <div className="floating-group right-controls">
            <span className="floating-label">History & Actions</span>
            <div className="button-row">
              <button
                className="floating-btn"
                onClick={undo}
                disabled={history.length === 0}
                title="1つ戻す"
              >
                <Undo2 size={18} /> Undo
              </button>
              <button
                className="floating-btn"
                onClick={redo}
                disabled={future.length === 0}
                title="やり直す"
              >
                <Redo2 size={18} /> Redo
              </button>
              <button
                className="floating-btn secondary-btn"
                onClick={() => setPhase('placement')}
                title="ブロックの再配置へ"
              >
                <Wrench size={18} /> 配置に戻る
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
