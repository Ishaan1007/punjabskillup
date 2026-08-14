"use client";
import { useState } from "react";
import {
  Trash2, Pencil, ArrowUp, ArrowDown, FolderPlus, FilePlus,
  Heading1, Heading2, Heading3, Pilcrow, Code2,
} from "lucide-react";
import { uid, COLORS } from "../lib/constants";
import CodeAwareTextarea from "./CodeAwareTextarea";

const BLOCK_TYPES = [
  { type: "h1", label: "Heading 1", icon: Heading1 },
  { type: "h2", label: "Heading 2", icon: Heading2 },
  { type: "h3", label: "Heading 3", icon: Heading3 },
  { type: "p", label: "Paragraph", icon: Pilcrow },
  { type: "code", label: "Code", icon: Code2 },
];

function ColorSwatch({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Object.entries(COLORS).map(([key, hex]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          aria-label={key}
          title={key === "black" ? "Black" : "Dark grey"}
          style={{
            width: 20, height: 20, borderRadius: "50%", background: hex, padding: 0, cursor: "pointer",
            border: value === key ? "2px solid #0E7FD1" : "2px solid #E4E7EC",
          }}
        />
      ))}
    </div>
  );
}

function Block({ block, index, total, onChange, onDelete, onMove }) {
  const meta = BLOCK_TYPES.find((b) => b.type === block.type);
  const Icon = meta.icon;
  const isCode = block.type === "code";

  const textStyle = {
    width: "100%", resize: "none", border: "none", outline: "none",
    fontFamily: isCode ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
    fontSize: isCode ? 13 : block.type === "h1" ? 22 : block.type === "h2" ? 18 : block.type === "h3" ? 15 : 14,
    fontWeight: block.type.startsWith("h") ? 600 : 400,
    color: isCode ? "#12141A" : COLORS[block.color],
    background: isCode ? "#F6F7F9" : "transparent",
    padding: isCode ? "10px 12px" : "2px 0",
    borderRadius: isCode ? 8 : 0,
    lineHeight: 1.6,
  };

  return (
    <div className="block-card">
      <div className="block-toolbar">
        <span className="block-kind">
          <Icon size={13} />
          {meta.label}
        </span>
        {!isCode && <ColorSwatch value={block.color} onChange={(c) => onChange({ ...block, color: c })} />}
        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <button className="icon-btn" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp size={14} /></button>
          <button className="icon-btn" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown size={14} /></button>
          <button className="icon-btn icon-btn-danger" onClick={onDelete} aria-label="Delete block"><Trash2 size={14} /></button>
        </div>
      </div>
      {isCode ? (
        <CodeAwareTextarea
          value={block.text}
          placeholder="// paste your code here"
          rows={6}
          style={textStyle}
          onTextChange={(text) => onChange({ ...block, text }, false)}
          onCommit={(text) => onChange({ ...block, text }, true)}
        />
      ) : (
        <textarea
          defaultValue={block.text}
          placeholder="Type here..."
          rows={block.type === "p" ? 3 : 1}
          style={textStyle}
          onChange={(e) => onChange({ ...block, text: e.target.value }, false)}
          onBlur={(e) => onChange({ ...block, text: e.target.value }, true)}
        />
      )}
    </div>
  );
}

export function BlockEditor({ blocks, onBlocksChange }) {
  const addBlock = (type) => onBlocksChange([...(blocks || []), { id: uid(), type, text: "", color: "black" }]);
  const updateBlock = (i, updated, save) => onBlocksChange(blocks.map((b, idx) => (idx === i ? updated : b)), save);
  const deleteBlock = (i) => onBlocksChange(blocks.filter((_, idx) => idx !== i));
  const moveBlock = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onBlocksChange(next);
  };

  return (
    <div>
      <div className="add-block-bar">
        {BLOCK_TYPES.map((b) => (
          <button key={b.type} className="add-block-btn" onClick={() => addBlock(b.type)}>
            <b.icon size={14} />
            {b.label}
          </button>
        ))}
      </div>
      {(!blocks || blocks.length === 0) && (
        <div style={{ padding: "32px 4px", color: "#8A8F99", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          No blocks yet. Add a heading, paragraph, or code snippet above.
        </div>
      )}
      {blocks &&
        blocks.map((b, i) => (
          <Block
            key={b.id}
            block={b}
            index={i}
            total={blocks.length}
            onChange={(updated, save) => updateBlock(i, updated, save)}
            onDelete={() => deleteBlock(i)}
            onMove={(dir) => moveBlock(i, dir)}
          />
        ))}
    </div>
  );
}

export function TreeAdmin({ tree, setData, selectedTopic, onSelectTopic }) {
  const [editing, setEditing] = useState(null);
  const [drafts, setDrafts] = useState({});

  const startEdit = (id, current) => {
    setEditing(id);
    setDrafts((d) => ({ ...d, [id]: current }));
  };
  const commitEdit = (mutate) => {
    mutate();
    setEditing(null);
  };

  const addCategory = () => setData((prev) => ({ ...prev, tree: [...prev.tree, { id: uid(), title: "New category", sections: [] }] }));

  const addSection = (catId) =>
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) => (c.id === catId ? { ...c, sections: [...c.sections, { id: uid(), title: "New section", topics: [] }] } : c)),
    }));

  const addTopic = (catId, secId) => {
    const newId = uid();
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) =>
        c.id !== catId ? c : { ...c, sections: c.sections.map((s) => (s.id !== secId ? s : { ...s, topics: [...s.topics, { id: newId, title: "New topic" }] })) }
      ),
      content: { ...prev.content, [newId]: [] },
    }));
    onSelectTopic(newId);
  };

  const renameCategory = (catId, title) => setData((prev) => ({ ...prev, tree: prev.tree.map((c) => (c.id === catId ? { ...c, title } : c)) }));

  const renameSection = (catId, secId, title) =>
    setData((prev) => ({ ...prev, tree: prev.tree.map((c) => (c.id !== catId ? c : { ...c, sections: c.sections.map((s) => (s.id === secId ? { ...s, title } : s)) })) }));

  const renameTopic = (catId, secId, topicId, title) =>
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) =>
        c.id !== catId ? c : { ...c, sections: c.sections.map((s) => (s.id !== secId ? s : { ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, title } : t)) })) }
      ),
    }));

  const deleteCategory = (catId) => {
    if (!window.confirm("Delete this category and everything inside it?")) return;
    setData((prev) => ({ ...prev, tree: prev.tree.filter((c) => c.id !== catId) }));
  };
  const deleteSection = (catId, secId) => {
    if (!window.confirm("Delete this section and its topics?")) return;
    setData((prev) => ({ ...prev, tree: prev.tree.map((c) => (c.id !== catId ? c : { ...c, sections: c.sections.filter((s) => s.id !== secId) })) }));
  };
  const deleteTopic = (catId, secId, topicId) => {
    if (!window.confirm("Delete this topic and its notes?")) return;
    setData((prev) => {
      const nextContent = { ...prev.content };
      delete nextContent[topicId];
      return {
        ...prev,
        tree: prev.tree.map((c) =>
          c.id !== catId ? c : { ...c, sections: c.sections.map((s) => (s.id !== secId ? s : { ...s, topics: s.topics.filter((t) => t.id !== topicId) })) }
        ),
        content: nextContent,
      };
    });
    if (selectedTopic === topicId) onSelectTopic(null);
  };

  return (
    <div style={{ padding: "4px 8px 24px" }}>
      <button className="add-block-btn" style={{ margin: "8px" }} onClick={addCategory}>
        <FolderPlus size={14} /> Add category
      </button>
      {tree.map((cat) => (
        <div key={cat.id} className="admin-node">
          <div className="admin-row admin-row-category">
            {editing === cat.id ? (
              <input
                autoFocus
                className="admin-input"
                value={drafts[cat.id]}
                onChange={(e) => setDrafts((d) => ({ ...d, [cat.id]: e.target.value }))}
                onBlur={() => commitEdit(() => renameCategory(cat.id, drafts[cat.id] || "Untitled"))}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
              />
            ) : (
              <span className="admin-title">{cat.title}</span>
            )}
            <div className="admin-actions">
              <button className="icon-btn" onClick={() => startEdit(cat.id, cat.title)} aria-label="Rename"><Pencil size={13} /></button>
              <button className="icon-btn icon-btn-danger" onClick={() => deleteCategory(cat.id)} aria-label="Delete"><Trash2 size={13} /></button>
            </div>
          </div>
          <div style={{ marginLeft: 16 }}>
            {cat.sections.map((sec) => (
              <div key={sec.id} className="admin-node">
                <div className="admin-row admin-row-section">
                  {editing === sec.id ? (
                    <input
                      autoFocus
                      className="admin-input"
                      value={drafts[sec.id]}
                      onChange={(e) => setDrafts((d) => ({ ...d, [sec.id]: e.target.value }))}
                      onBlur={() => commitEdit(() => renameSection(cat.id, sec.id, drafts[sec.id] || "Untitled"))}
                      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                    />
                  ) : (
                    <span className="admin-title">{sec.title}</span>
                  )}
                  <div className="admin-actions">
                    <button className="icon-btn" onClick={() => startEdit(sec.id, sec.title)} aria-label="Rename"><Pencil size={13} /></button>
                    <button className="icon-btn icon-btn-danger" onClick={() => deleteSection(cat.id, sec.id)} aria-label="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ marginLeft: 16 }}>
                  {sec.topics.map((t) => (
                    <div key={t.id} className={"admin-row admin-row-topic" + (selectedTopic === t.id ? " admin-row-topic-active" : "")}>
                      {editing === t.id ? (
                        <input
                          autoFocus
                          className="admin-input"
                          value={drafts[t.id]}
                          onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))}
                          onBlur={() => commitEdit(() => renameTopic(cat.id, sec.id, t.id, drafts[t.id] || "Untitled"))}
                          onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                        />
                      ) : (
                        <button className="admin-topic-select" onClick={() => onSelectTopic(t.id)}>{t.title}</button>
                      )}
                      <div className="admin-actions">
                        <button className="icon-btn" onClick={() => startEdit(t.id, t.title)} aria-label="Rename"><Pencil size={13} /></button>
                        <button className="icon-btn icon-btn-danger" onClick={() => deleteTopic(cat.id, sec.id, t.id)} aria-label="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                  <button className="add-block-btn add-block-btn-small" onClick={() => addTopic(cat.id, sec.id)}>
                    <FilePlus size={13} /> Add topic
                  </button>
                </div>
              </div>
            ))}
            <button className="add-block-btn add-block-btn-small" onClick={() => addSection(cat.id)}>
              <FolderPlus size={13} /> Add section
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
