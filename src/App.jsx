import { useEffect, useState } from 'react';
import { ARENAS, PALETTE, HEX_WIDTH, HEXES_PER_ROW, STORE_KEY } from './arenas.js';
import { BEATS, beatOptionMap, BEAT_CAPTIONS } from './beats.js';

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M11.3 1.3a1.5 1.5 0 0 1 2.12 0l1.28 1.28a1.5 1.5 0 0 1 0 2.12l-8.5 8.5-4 1 1-4 8.1-8.9z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function geometry() {
  const w = HEX_WIDTH;
  const h = w * 1.1547;
  const cols = HEXES_PER_ROW;
  return { w, h, cols, stepX: w / 2, dropY: h * 0.75, rowPitch: h * 1.75 + 20 };
}

function slot(i, g) {
  const col = i % g.cols;
  const row = Math.floor(i / g.cols);
  return { left: col * g.stepX, top: row * g.rowPitch + (col % 2 ? g.dropY : 0), w: g.w, h: g.h };
}

function boxStyle(i, g) {
  const s = slot(i, g);
  return { position: 'absolute', left: s.left + 'px', top: s.top + 'px', width: s.w + 'px', height: s.h + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
}

function inkLayer(ratio, colour, fixedHeight) {
  const base = { aspectRatio: ratio, background: colour, isolation: 'isolate', mixBlendMode: 'multiply' };
  return fixedHeight
    ? { ...base, height: fixedHeight, width: 'auto' }
    : { ...base, maxWidth: '100%', maxHeight: '100%', height: '100%', width: 'auto' };
}

function ThreadChip({ thread, selected, onPick, onEdit }) {
  return (
    <button className={'thread-chip' + (selected ? ' selected' : '')} title={thread.name} onClick={onPick}>
      <span className="thread-dot" style={{ background: thread.color }} />
      <span>{thread.name}</span>
      <span
        className="thread-pencil"
        role="button"
        tabIndex={0}
        title={'Edit ' + thread.name}
        onClick={e => { e.stopPropagation(); onEdit(); }}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onEdit(); } }}
      >
        <PencilIcon />
      </span>
    </button>
  );
}

function ArenaPicker({ arenas, selectedKey, colour, onSelect }) {
  return (
    <div className="arena-row">
      {arenas.map(a => (
        <button
          key={a.key}
          className={'arena-btn' + (selectedKey === a.key ? ' selected' : '')}
          title={a.label}
          onClick={() => onSelect(a.key)}
        >
          <div style={inkLayer(a.ratio, colour, '54px')}>
            <img src={a.src} alt={a.label} style={{ width: '100%', height: '100%', objectFit: 'fill', mixBlendMode: 'lighten', display: 'block' }} />
          </div>
          <span className="arena-label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function ThreadPicker({ threads, selectedId, onPick, onEdit }) {
  return (
    <div className="thread-chip-row">
      {threads.map(t => (
        <ThreadChip key={t.id} thread={t} selected={selectedId === t.id} onPick={() => onPick(t.id)} onEdit={() => onEdit(t.id)} />
      ))}
    </div>
  );
}

function BeatCategoryPicker({ categories, selectedId, onPick }) {
  return (
    <div className="thread-chip-row">
      {categories.map(c => (
        <button
          key={c.id}
          className={'thread-chip' + (selectedId === c.id ? ' selected' : '')}
          onClick={() => onPick(c.id)}
        >
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}

function BeatVariantPicker({ options, selectedId, onSelect }) {
  return (
    <div className="arena-row">
      {options.map(o => (
        <button
          key={o.id}
          className={'arena-btn' + (selectedId === o.id ? ' selected' : '')}
          title={o.title}
          onClick={() => onSelect(o.id)}
        >
          <div className="beat-thumb">
            <img src={o.image} alt={o.title} />
          </div>
          <span className="arena-label">{o.title}</span>
        </button>
      ))}
    </div>
  );
}

function Modal({ zIndex, onScrimClick, children }) {
  return (
    <div className={'modal-scrim' + (zIndex ? ' ' + zIndex : '')}>
      <div className="modal-overlay-close" onClick={onScrimClick} />
      <div className="modal-card">{children}</div>
    </div>
  );
}

const initialState = {
  placed: [],
  threads: [{ id: 't1', name: 'Thread one', color: '#0d0d0d' }],
  active: 't1',
  filter: null,
  hover: -1,
  modal: null,
  editing: -1,
  draftKey: null,
  draftThread: null,
  draftBeatOption: null,
  beatCategory: null,
  threadDraft: null,
  threadReturn: null
};

export default function App() {
  const [state, setState] = useState(initialState);
  const g = geometry();

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (raw && Array.isArray(raw.threads) && raw.threads.length) {
        setState(s => ({ ...s, placed: raw.placed || [], threads: raw.threads, active: raw.active || raw.threads[0].id }));
      }
    } catch (e) { /* corrupt or unavailable storage: start fresh */ }
  }, []);

  function patch(p) {
    setState(s => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }));
  }

  function persist(p) {
    setState(s => {
      const next = { ...s, ...(typeof p === 'function' ? p(s) : p) };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ placed: next.placed, threads: next.threads, active: next.active }));
      } catch (e) { /* storage unavailable (private mode, quota) */ }
      return next;
    });
  }

  function thread(id) {
    return state.threads.find(t => t.id === id) || state.threads[0];
  }

  function beatOf(item) {
    return item && item.beatOptionId ? beatOptionMap.get(item.beatOptionId) : null;
  }

  function openThreadEditor(id, returnTo) {
    const t = id ? thread(id) : null;
    patch({
      modal: 'thread',
      threadReturn: returnTo || null,
      threadDraft: t ? { id: t.id, name: t.name, color: t.color } : { id: null, name: '', color: PALETTE[4] }
    });
  }

  function openEditor(i) {
    const beat = beatOf(state.placed[i]);
    patch({ modal: 'edit', editing: i, beatCategory: beat ? beat.categoryId : null });
  }

  function closeModal() {
    patch({ modal: null, editing: -1, draftKey: null, draftThread: null, draftBeatOption: null, beatCategory: null });
  }

  function pickFilter(id) {
    if (state.filter === id) {
      patch({ filter: null });
    } else {
      patch({ filter: id, active: id });
    }
  }

  const { placed, threads, active, filter, hover, modal, editing, draftKey, draftThread, draftBeatOption, beatCategory, threadDraft, threadReturn } = state;
  const visible = placed
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !filter || item.threadId === filter);
  const rows = Math.floor(Math.max(0, visible.length) / g.cols) + 1;
  const tile = editing >= 0 ? placed[editing] : null;
  const tileThread = tile ? thread(tile.threadId) : null;
  const tileBeat = beatOf(tile);
  const draftThreadId = draftThread || active;
  const draftColour = thread(draftThreadId) ? thread(draftThreadId).color : '#0d0d0d';
  const draft = threadDraft || { id: null, name: '', color: PALETTE[4] };
  const activeBeatCategory = BEATS.find(b => b.id === beatCategory) || null;

  const viewArena = tile ? (ARENAS.find(x => x.key === tile.key) || ARENAS[0]) : null;
  const viewImage = tileBeat ? tileBeat.image : (viewArena ? viewArena.src : null);
  const viewTitle = tileBeat ? tileBeat.title : (viewArena ? viewArena.label : '');
  const viewCaption = viewImage ? BEAT_CAPTIONS[viewImage] : null;

  const mapStyle = {
    position: 'relative',
    width: (g.cols * g.stepX + g.w) + 'px',
    maxWidth: '100%',
    minHeight: '280px',
    height: ((rows - 1) * g.rowPitch + g.h * 1.75) + 'px'
  };

  function addCommit() {
    if (!draftKey || !draftBeatOption) return;
    patch({ modal: null, draftKey: null, draftThread: null, draftBeatOption: null, beatCategory: null });
    persist({ placed: placed.concat({ key: draftKey, threadId: draftThreadId, beatOptionId: draftBeatOption }), active: draftThreadId });
  }

  function saveThread() {
    const name = (draft.name || '').trim();
    if (draft.id) {
      const nextThreads = threads.map(t => (t.id === draft.id ? { id: t.id, name: name || t.name, color: draft.color } : t));
      patch({ modal: threadReturn || null, threadDraft: null, threadReturn: null });
      persist({ threads: nextThreads });
    } else {
      const id = 't' + (Date.now() % 1000000);
      const nextThreads = threads.concat({ id, name: name || 'Thread ' + (threads.length + 1), color: draft.color });
      patch({ modal: threadReturn || null, threadDraft: null, threadReturn: null, draftThread: id });
      persist({ threads: nextThreads, active: id });
    }
  }

  function deleteThread() {
    const nextThreads = threads.filter(t => t.id !== draft.id);
    const fallback = nextThreads[0].id;
    patch({ modal: threadReturn === 'edit' ? null : (threadReturn || null), threadDraft: null, threadReturn: null, editing: -1 });
    persist({
      threads: nextThreads,
      placed: placed.map(p => (p.threadId === draft.id ? { ...p, threadId: fallback } : p)),
      active: active === draft.id ? fallback : active,
      filter: filter === draft.id ? null : filter
    });
  }

  function removeTile() {
    const next = placed.slice();
    next.splice(editing, 1);
    patch({ modal: null, editing: -1 });
    persist({ placed: next });
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="title">The Story Within</h1>
      </header>

      <main className="main">
        <div className="map-scroll">
          <div style={mapStyle}>
            {visible.map(({ item, i }, pos) => {
              const a = ARENAS.find(x => x.key === item.key) || ARENAS[0];
              const t = thread(item.threadId);
              const showPencil = hover === i && !modal;
              return (
                <div
                  key={i}
                  style={boxStyle(pos, g)}
                  onMouseEnter={() => patch({ hover: i })}
                  onMouseLeave={() => patch({ hover: -1 })}
                  onClick={() => patch({ modal: 'view', editing: i })}
                >
                  <div style={inkLayer(a.ratio, t ? t.color : '#0d0d0d')}>
                    <img className="hex-img" src={a.src} alt={a.label} />
                  </div>
                  {showPencil && (
                    <button
                      className="hex-pencil"
                      title="Edit"
                      onClick={e => { e.stopPropagation(); openEditor(i); }}
                    >
                      <PencilIcon />
                    </button>
                  )}
                </div>
              );
            })}

            <button className="ghost-btn" onClick={() => patch({ modal: 'add', draftKey: null, draftThread: active, draftBeatOption: null, beatCategory: null })} title="Add a hexagon" style={boxStyle(visible.length, g)}>
              <div className="ghost-hex">+</div>
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="thread-row">
          <ThreadPicker threads={threads} selectedId={filter} onPick={pickFilter} onEdit={id => openThreadEditor(id, 'home')} />
          <button className="new-thread-btn" onClick={() => openThreadEditor(null, 'home')}>New thread</button>
        </div>

        <div className="link-row">
          <button className="link-btn" onClick={() => persist({ placed: placed.slice(0, -1) })}>Undo</button>
          <button className="link-btn" onClick={() => patch({ modal: 'clear' })}>Clear</button>
        </div>
      </footer>

      {modal === 'view' && tile && (
        <div className="view-scrim" onClick={closeModal}>
          <button className="view-close" onClick={closeModal} title="Close">
            <CloseIcon />
          </button>
          {viewImage && (
            <div className="view-frame" onClick={e => e.stopPropagation()}>
              <img className="view-image" src={viewImage} alt={viewTitle} />
              {viewCaption && (
                <p
                  className="view-caption"
                  style={{
                    top: viewCaption.top,
                    left: viewCaption.left,
                    width: viewCaption.width,
                    textAlign: viewCaption.align,
                    color: viewCaption.color,
                    textShadow: viewCaption.shadow
                  }}
                >
                  {viewCaption.text}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {modal === 'add' && (
        <Modal onScrimClick={closeModal}>
          <div className="modal-title">Add a hexagon</div>
          <ArenaPicker arenas={ARENAS} selectedKey={draftKey} colour={draftColour} onSelect={k => patch({ draftKey: k })} />
          <div className="thread-section">
            <div className="thread-section-label">Thread</div>
            <ThreadPicker threads={threads} selectedId={draftThreadId} onPick={id => patch({ draftThread: id })} onEdit={id => openThreadEditor(id, 'add')} />
            <button className="new-thread-btn" onClick={() => openThreadEditor(null, 'add')}>New thread</button>
          </div>
          <div className="thread-section">
            <div className="thread-section-label">Beat</div>
            <BeatCategoryPicker categories={BEATS} selectedId={beatCategory} onPick={id => patch({ beatCategory: id })} />
            {activeBeatCategory && (
              <BeatVariantPicker
                options={activeBeatCategory.options}
                selectedId={draftBeatOption}
                onSelect={id => patch({ draftBeatOption: id })}
              />
            )}
          </div>
          <div className="modal-actions">
            <button className="action-muted" onClick={closeModal}>Cancel</button>
            <button className={draftKey && draftBeatOption ? 'action-primary' : 'action-disabled'} onClick={addCommit}>
              {!draftKey ? 'Choose an arena' : !draftBeatOption ? 'Choose a beat' : 'Add to map'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'edit' && tile && (
        <Modal onScrimClick={closeModal}>
          <div className="modal-title">{(ARENAS.find(x => x.key === tile.key) || ARENAS[0]).label}</div>
          <ArenaPicker
            arenas={ARENAS}
            selectedKey={tile.key}
            colour={tileThread ? tileThread.color : '#0d0d0d'}
            onSelect={k => {
              const next = placed.slice();
              next[editing] = { ...next[editing], key: k };
              persist({ placed: next });
            }}
          />
          <div className="thread-section">
            <div className="thread-section-label">Thread</div>
            <ThreadPicker
              threads={threads}
              selectedId={tile.threadId}
              onPick={id => {
                const next = placed.slice();
                next[editing] = { ...next[editing], threadId: id };
                persist({ placed: next });
              }}
              onEdit={id => openThreadEditor(id, 'edit')}
            />
          </div>
          <div className="thread-section">
            <div className="thread-section-label">Beat</div>
            <BeatCategoryPicker categories={BEATS} selectedId={beatCategory} onPick={id => patch({ beatCategory: id })} />
            {activeBeatCategory && (
              <BeatVariantPicker
                options={activeBeatCategory.options}
                selectedId={tile.beatOptionId}
                onSelect={id => {
                  const next = placed.slice();
                  next[editing] = { ...next[editing], beatOptionId: id };
                  persist({ placed: next });
                }}
              />
            )}
          </div>
          <div className="modal-actions">
            <button className="action-muted" onClick={removeTile}>Remove</button>
            <button className="action-primary" onClick={closeModal}>Done</button>
          </div>
        </Modal>
      )}

      {modal === 'thread' && (
        <Modal zIndex="thread" onScrimClick={() => patch({ modal: threadReturn || null, threadDraft: null, threadReturn: null })}>
          <div className="modal-title">{draft.id ? 'Edit thread' : 'New thread'}</div>
          <input
            className="thread-name-input"
            value={draft.name}
            placeholder="Name this thread"
            onChange={e => patch({ threadDraft: { ...draft, name: e.target.value } })}
          />
          <div className="swatch-grid">
            {PALETTE.map(c => (
              <button
                key={c}
                className={'swatch' + (draft.color === c ? ' selected' : '')}
                style={{ background: c }}
                title="Thread colour"
                onClick={() => patch({ threadDraft: { ...draft, color: c } })}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button className="action-muted" onClick={() => patch({ modal: threadReturn || null, threadDraft: null, threadReturn: null })}>Cancel</button>
            {draft.id && threads.length > 1 && (
              <button className="action-muted" onClick={deleteThread}>Delete</button>
            )}
            <button className="action-primary" onClick={saveThread}>Save</button>
          </div>
        </Modal>
      )}

      {modal === 'clear' && (
        <Modal zIndex="clear" onScrimClick={closeModal}>
          <div className="modal-title" style={{ textAlign: 'center' }}>Clear the whole map?</div>
          <div className="modal-actions">
            <button className="action-muted" onClick={closeModal}>Keep it</button>
            <button className="action-primary" onClick={() => { patch({ modal: null }); persist({ placed: [] }); }}>Clear</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
