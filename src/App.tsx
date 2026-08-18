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
    <div className="app-container">
      {/* 3D Canvas Layer (Independent full-screen background) */}
      <main className="canvas-wrapper">
        <Scene />
      </main>

      {/* UI Layer (Interactive overlay on top of 3D Canvas) */}
      <div className="ui-overlay">
        {/* Header relocated to top-left */}
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
            className="top-btn"
            onClick={resetCamera}
            title="正面にカメラ位置を戻す"
          >
            <Focus size={15} /> 正面に戻す
          </button>
        </div>

        {/* Bottom Controls */}
        {phase === 'placement' ? (
          <div className={`placement-dock ${isPlacementCollapsed ? 'collapsed' : ''}`}>
            {/* Small Compact Collapse/Expand Toggle */}
            <div className="collapse-toggle-wrapper">
              <button
                className="collapse-pill-btn"
                onClick={() => setIsPlacementCollapsed(!isPlacementCollapsed)}
                title={isPlacementCollapsed ? '操作パネルを展開' : '操作パネルをしまう'}
              >
                {isPlacementCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                <span>{isPlacementCollapsed ? 'パネル表示' : 'しまう'}</span>
              </button>
            </div>

            {!isPlacementCollapsed && (
              <div className="placement-split-container">
                {/* Left side: View mode, Blocks, Erase, Reset */}
                <div className="placement-left-panel panel">
                  <span className="section-label">Placement Options</span>
                  <div className="button-group-row">
                    <button
                      className={`ui-btn ${toolMode === 'none' ? 'active' : ''}`}
                      onClick={() => setToolMode('none')}
                      title="視点移動・カメラ回転"
                    >
                      <MousePointer2 size={16} /> 視点移動
                    </button>
                    <button
                      className={`ui-btn block-btn white-btn ${toolMode === 'white' ? 'active' : ''}`}
                      onClick={() => setToolMode('white')}
                      title="白ブロックを配置"
                    >
                      <Box size={16} /> 白ブロック
                    </button>
                    <button
                      className={`ui-btn block-btn red-btn ${toolMode === 'red' ? 'active' : ''}`}
                      onClick={() => setToolMode('red')}
                      title="赤ブロックを配置"
                    >
                      <Box size={16} fill="#ef4444" color="#dc2626" /> 赤ブロック
                    </button>
                    <button
                      className={`ui-btn block-btn black-btn ${toolMode === 'black' ? 'active' : ''}`}
                      onClick={() => setToolMode('black')}
                      title="黒ブロック(外枠固定)を配置"
                    >
                      <Box size={16} fill="currentColor" /> 黒ブロック (固定)
                    </button>
                    <button
                      className={`ui-btn ${toolMode === 'erase' ? 'active danger-mode' : ''}`}
                      onClick={() => setToolMode('erase')}
                      title="ブロックを消去"
                    >
                      <Trash2 size={16} /> 消去
                    </button>

                    <div className="btn-divider" />

                    <button
                      className="ui-btn danger-btn"
                      onClick={clearGrid}
                      title="すべてのブロックを初期化"
                    >
                      <RotateCcw size={16} /> 全リセット
                    </button>
                  </div>
                </div>

                {/* Right side: Finish Placement Action */}
                <div className="placement-right-panel panel">
                  <span className="section-label">Next Action</span>
                  <button
                    className="ui-btn primary-btn finish-btn"
                    onClick={() => setPhase('rotation')}
                    title="配置を完了してシミュレーションを開始"
                  >
                    <Check size={17} /> 配置完了 (シミュレーション)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Rotation Phase: Positioned cleanly at bottom */
          <div className="rotation-dock">
            {/* Left side: Rotate Box D-Pad */}
            <div className="rotation-left-group">
              <span className="floating-section-label">Rotate Box (重力: 下方向)</span>
              <div className="dpad-grid">
                {/* Row 1: Left-Top (-Z CCW), Top (+X Up), Right-Top (+Z CW) */}
                <button
                  className="dpad-btn diagonal-btn"
                  onClick={() => rotateBox('z', 1)}
                  title="反時計回り"
                >
                  <RotateCcw size={17} />
                </button>
                <button
                  className="dpad-btn straight-btn"
                  onClick={() => rotateBox('x', -1)}
                  title="上回転"
                >
                  <ArrowUp size={17} />
                </button>
                <button
                  className="dpad-btn diagonal-btn"
                  onClick={() => rotateBox('z', -1)}
                  title="時計回り"
                >
                  <RotateCw size={17} />
                </button>

                {/* Row 2: Left (-Y Left), Center (Reset Camera), Right (+Y Right) */}
                <button
                  className="dpad-btn straight-btn"
                  onClick={() => rotateBox('y', -1)}
                  title="左回転"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  className="dpad-btn center-cam-btn"
                  onClick={resetCamera}
                  title="カメラを正面に戻す"
                >
                  <Focus size={17} />
                </button>
                <button
                  className="dpad-btn straight-btn"
                  onClick={() => rotateBox('y', 1)}
                  title="右回転"
                >
                  <ArrowRight size={17} />
                </button>

                {/* Row 3: Empty, Bottom (-X Down), Empty */}
                <div className="dpad-spacer" />
                <button
                  className="dpad-btn straight-btn"
                  onClick={() => rotateBox('x', 1)}
                  title="下回転"
                >
                  <ArrowDown size={17} />
                </button>
                <div className="dpad-spacer" />
              </div>
            </div>

            {/* Right side: History Actions & Back to Placement */}
            <div className="rotation-right-group">
              <span className="floating-section-label">History & Actions</span>
              <div className="button-group-row">
                <button
                  className="ui-btn floating-action-btn"
                  onClick={undo}
                  disabled={history.length === 0}
                  title="1つ戻す"
                >
                  <Undo2 size={16} /> Undo
                </button>
                <button
                  className="ui-btn floating-action-btn"
                  onClick={redo}
                  disabled={future.length === 0}
                  title="やり直す"
                >
                  <Redo2 size={16} /> Redo
                </button>
                <button
                  className="ui-btn floating-action-btn secondary-btn"
                  onClick={() => setPhase('placement')}
                  title="ブロックの配置モードに戻る"
                >
                  <Wrench size={16} /> 配置に戻る
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
