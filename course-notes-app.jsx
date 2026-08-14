import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronRight, ChevronDown, Plus, Trash2, Pencil, Menu, X,
  Code2, Heading1, Heading2, Heading3, Pilcrow, ArrowUp, ArrowDown,
  Eye, Settings, Check, FolderPlus, FilePlus, RotateCcw, Loader2
} from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const COLORS = {
  black: "#12141A",
  grey: "#5B6472",
};

const BLOCK_TYPES = [
  { type: "h1", label: "Heading 1", icon: Heading1 },
  { type: "h2", label: "Heading 2", icon: Heading2 },
  { type: "h3", label: "Heading 3", icon: Heading3 },
  { type: "p", label: "Paragraph", icon: Pilcrow },
  { type: "code", label: "Code", icon: Code2 },
];

function seedData() {
  const catId = uid();
  const secId = uid();
  const topicIntro = uid();
  const topicLoop = uid();
  const topicOps = uid();
  return {
    tree: [
      {
        id: catId,
        title: "Arrays",
        sections: [
          {
            id: secId,
            title: "Vectors (STL)",
            topics: [
              { id: topicIntro, title: "Introduction to Vectors" },
              { id: topicOps, title: "Operations on Vector" },
              { id: topicLoop, title: "Looping through Vector" },
            ],
          },
        ],
      },
      {
        id: uid(),
        title: "Two Dimensional Arrays",
        sections: [{ id: uid(), title: "Basics", topics: [] }],
      },
      { id: uid(), title: "Strings", sections: [{ id: uid(), title: "Basics", topics: [] }] },
    ],
    content: {
      [topicIntro]: [
        { id: uid(), type: "h1", text: "Introduction to Vectors", color: "black" },
        {
          id: uid(),
          type: "p",
          text: "A vector is a dynamic array from the C++ Standard Template Library. Unlike a plain array, it can grow or shrink at runtime.",
          color: "grey",
        },
      ],
      [topicOps]: [
        { id: uid(), type: "h1", text: "Operations on Vector", color: "black" },
        { id: uid(), type: "p", text: "Common operations include push_back, pop_back, size, and accessing elements by index.", color: "grey" },
      ],
      [topicLoop]: [
        { id: uid(), type: "h1", text: "Looping through Vector", color: "black" },
        { id: uid(), type: "h3", text: "Q. Find the last occurence of x = 6 in the array = [9, 10, 6, 12, 11, 6, 0]", color: "black" },
        {
          id: uid(),
          type: "code",
          text:
            "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main(){\n    vector<int> v;\n    v.push_back(9);\n    v.push_back(10);\n    v.push_back(6);\n    v.push_back(12);\n    v.push_back(11);\n    v.push_back(6);\n    v.push_back(0);\n\n    int x = 6;\n    int idx = -1;\n\n    for(int i=v.size()-1; i>=0; i--){\n        if(v[i]==x){\n            idx = i;\n            break;\n        }\n    }\n}",
          color: "black",
        },
      ],
    },
  };
}

function normalizeImportedBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];

  return blocks
    .map((block) => {
      const type = BLOCK_TYPES.some((item) => item.type === block?.type) ? block.type : "p";
      const value = typeof block?.text === "string" ? block.text : typeof block?.content === "string" ? block.content : "";
      return {
        id: block?.id || uid(),
        type,
        text: value,
        color: block?.color === "grey" ? "grey" : "black",
      };
    })
    .filter((block) => block.text || block.type === "code");
}

function normalizeImportedData(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("The uploaded file is not valid JSON.");
  }

  if (Array.isArray(payload.tree) && payload.content && typeof payload.content === "object") {
    return payload;
  }

  const source = Array.isArray(payload.categories)
    ? payload.categories
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : [];

  if (!source.length) {
    throw new Error("The JSON file must contain a course tree like categories/sections/topics.");
  }

  const tree = [];
  const content = {};

  source.forEach((category, catIndex) => {
    const sections = Array.isArray(category?.sections) ? category.sections : Array.isArray(category?.items) ? category.items : [];
    const normalizedSections = sections.map((section, secIndex) => {
      const rawTopics = Array.isArray(section?.topics) ? section.topics : Array.isArray(section?.items) ? section.items : [];

      const topics = rawTopics.map((topic) => {
        const topicId = topic?.id || uid();
        const blockData = Array.isArray(topic?.blocks)
          ? topic.blocks
          : Array.isArray(topic?.notes)
            ? topic.notes
            : Array.isArray(topic?.content)
              ? topic.content
              : [];

        content[topicId] = normalizeImportedBlocks(blockData);
        return {
          id: topicId,
          title: String(topic?.title || topic?.name || `Topic ${secIndex + 1}`),
        };
      });

      return {
        id: section?.id || uid(),
        title: String(section?.title || section?.name || `Section ${secIndex + 1}`),
        topics,
      };
    });

    tree.push({
      id: category?.id || uid(),
      title: String(category?.title || category?.name || `Category ${catIndex + 1}`),
      sections: normalizedSections,
    });
  });

  return { tree, content };
}

function useCourseData() {
  const [data, setDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const dataRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("course-data", true);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          dataRef.current = parsed;
          setDataState(parsed);
        } else {
          const seed = seedData();
          dataRef.current = seed;
          setDataState(seed);
          await window.storage.set("course-data", JSON.stringify(seed), true);
        }
      } catch (e) {
        const seed = seedData();
        dataRef.current = seed;
        setDataState(seed);
        try {
          await window.storage.set("course-data", JSON.stringify(seed), true);
        } catch (e2) {
          setError("Could not reach storage. Changes may not be saved.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setSaving(true);
    try {
      const result = await window.storage.set("course-data", JSON.stringify(next), true);
      if (!result) throw new Error("no result");
      setError(null);
    } catch (e) {
      setError("Couldn't save your last change. Check your connection.");
    } finally {
      setSaving(false);
    }
  }, []);

  const setData = useCallback((updater, opts = {}) => {
    setDataState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      dataRef.current = next;
      if (opts.save !== false) persist(next);
      return next;
    });
  }, [persist]);

  const flush = useCallback(() => {
    if (dataRef.current) persist(dataRef.current);
  }, [persist]);

  return { data, setData, loading, error, saving, flush };
}

function Sidebar({ tree, selectedTopic, onSelectTopic, mobileOpen, setMobileOpen, mode }) {
  const [expanded, setExpanded] = useState(() => {
    const e = {};
    tree.forEach((c) => (e[c.id] = true));
    return e;
  });
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "absolute", inset: 0, background: "rgba(18,20,26,0.35)", zIndex: 10 }}
          className="sidebar-scrim"
        />
      )}
      <aside className={"sidebar" + (mobileOpen ? " sidebar-open" : "")}>
        <div style={{ padding: "18px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: "#12141A", letterSpacing: "-0.01em" }}>
            C++ DSA Course
          </div>
          <button className="icon-btn mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "4px 8px 24px" }}>
          {tree.length === 0 && (
            <div style={{ padding: "20px 12px", fontSize: 13, color: "#8A8F99", fontFamily: "'JetBrains Mono', monospace" }}>
              {mode === "admin" ? "No categories yet. Add one below." : "No content yet."}
            </div>
          )}
          {tree.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 6 }}>
              <button
                onClick={() => toggle(cat.id)}
                className="tree-category"
              >
                <span>{cat.title}</span>
                {expanded[cat.id] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
              {expanded[cat.id] &&
                cat.sections.map((sec) => (
                  <SectionRow
                    key={sec.id}
                    section={sec}
                    selectedTopic={selectedTopic}
                    onSelectTopic={(t) => {
                      onSelectTopic(t);
                      setMobileOpen(false);
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function SectionRow({ section, selectedTopic, onSelectTopic }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginLeft: 6 }}>
      <button onClick={() => setOpen((o) => !o)} className="tree-section">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span>{section.title}</span>
      </button>
      {open && (
        <div style={{ marginLeft: 14, borderLeft: "1px solid #E4E7EC", paddingLeft: 10 }}>
          {section.topics.length === 0 && (
            <div style={{ fontSize: 12, color: "#B4B8C0", padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace" }}>empty</div>
          )}
          {section.topics.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTopic(t.id)}
              className={"tree-topic" + (selectedTopic === t.id ? " tree-topic-active" : "")}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: hex,
            border: value === key ? "2px solid #0E7FD1" : "2px solid #E4E7EC",
            cursor: "pointer",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}

const PAIR_OPEN_TO_CLOSE = { "(": ")", "{": "}", "[": "]" };
const PAIR_CLOSERS = [")", "}", "]"];
const PAIR_QUOTES = ['"', "'"];

function Block({ block, index, total, onChange, onDelete, onMove }) {
  const meta = BLOCK_TYPES.find((b) => b.type === block.type);
  const Icon = meta.icon;
  const isCode = block.type === "code";
  const taRef = useRef(null);

  const autoGrow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoGrow(taRef.current);
  }, []);

  const afterEdit = (el) => {
    autoGrow(el);
    onChange({ ...block, text: el.value }, false);
  };

  const handleCodeKeyDown = (e) => {
    if (!isCode) return;
    const el = e.target;
    const s = el.selectionStart;
    const en = el.selectionEnd;
    const value = el.value;
    const key = e.key;

    if (key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = value.lastIndexOf("\n", s - 1) + 1;
        const lineText = value.slice(lineStart, s);
        const removeCount = Math.min(4, lineText.length - lineText.trimStart().length);
        if (removeCount > 0) {
          el.value = value.slice(0, lineStart) + value.slice(lineStart + removeCount);
          el.selectionStart = el.selectionEnd = s - removeCount;
          afterEdit(el);
        }
      } else {
        el.value = value.slice(0, s) + "    " + value.slice(en);
        el.selectionStart = el.selectionEnd = s + 4;
        afterEdit(el);
      }
      return;
    }

    if (key === "Enter") {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const currentLine = value.slice(lineStart, s);
      const indent = (currentLine.match(/^[ \t]*/) || [""])[0];
      const charBefore = value[s - 1];
      const charAfter = value[s];
      const opensBracket = "{[(".includes(charBefore);
      const closesMatch = opensBracket && PAIR_OPEN_TO_CLOSE[charBefore] === charAfter;
      let insertText, cursorOffset;
      if (closesMatch) {
        const inner = "\n" + indent + "    ";
        const outer = "\n" + indent;
        insertText = inner + outer;
        cursorOffset = inner.length;
      } else if (opensBracket) {
        insertText = "\n" + indent + "    ";
        cursorOffset = insertText.length;
      } else {
        insertText = "\n" + indent;
        cursorOffset = insertText.length;
      }
      el.value = value.slice(0, s) + insertText + value.slice(en);
      el.selectionStart = el.selectionEnd = s + cursorOffset;
      afterEdit(el);
      return;
    }

    if (key === "Backspace" && s === en && s > 0) {
      const charBefore = value[s - 1];
      const charAfter = value[s];
      if (PAIR_OPEN_TO_CLOSE[charBefore] === charAfter) {
        e.preventDefault();
        el.value = value.slice(0, s - 1) + value.slice(s + 1);
        el.selectionStart = el.selectionEnd = s - 1;
        afterEdit(el);
        return;
      }
    }

    if (PAIR_OPEN_TO_CLOSE[key]) {
      e.preventDefault();
      const close = PAIR_OPEN_TO_CLOSE[key];
      if (s !== en) {
        el.value = value.slice(0, s) + key + value.slice(s, en) + close + value.slice(en);
        el.selectionStart = s + 1;
        el.selectionEnd = en + 1;
      } else {
        el.value = value.slice(0, s) + key + close + value.slice(en);
        el.selectionStart = el.selectionEnd = s + 1;
      }
      afterEdit(el);
      return;
    }

    if (PAIR_CLOSERS.includes(key) && s === en && value[s] === key) {
      e.preventDefault();
      el.selectionStart = el.selectionEnd = s + 1;
      return;
    }

    if (PAIR_QUOTES.includes(key)) {
      if (s === en && value[s] === key) {
        e.preventDefault();
        el.selectionStart = el.selectionEnd = s + 1;
        return;
      }
      e.preventDefault();
      if (s !== en) {
        el.value = value.slice(0, s) + key + value.slice(s, en) + key + value.slice(en);
        el.selectionStart = s + 1;
        el.selectionEnd = en + 1;
      } else {
        el.value = value.slice(0, s) + key + key + value.slice(en);
        el.selectionStart = el.selectionEnd = s + 1;
      }
      afterEdit(el);
      return;
    }
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
          <button className="icon-btn" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
            <ArrowUp size={14} />
          </button>
          <button className="icon-btn" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move down">
            <ArrowDown size={14} />
          </button>
          <button className="icon-btn icon-btn-danger" onClick={onDelete} aria-label="Delete block">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <textarea
        ref={taRef}
        defaultValue={block.text}
        onInput={(e) => autoGrow(e.target)}
        onChange={(e) => onChange({ ...block, text: e.target.value }, false)}
        onBlur={(e) => onChange({ ...block, text: e.target.value }, true)}
        onKeyDown={handleCodeKeyDown}
        spellCheck={false}
        placeholder={isCode ? "// paste your code here" : "Type here..."}
        rows={isCode ? 6 : block.type === "p" ? 3 : 1}
        style={{
          width: "100%",
          resize: "none",
          border: "none",
          outline: "none",
          fontFamily: isCode ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
          fontSize: isCode ? 13 : block.type === "h1" ? 22 : block.type === "h2" ? 18 : block.type === "h3" ? 15 : 14,
          fontWeight: block.type.startsWith("h") ? 600 : 400,
          color: isCode ? "#12141A" : COLORS[block.color],
          background: isCode ? "#F6F7F9" : "transparent",
          padding: isCode ? "10px 12px" : "2px 0",
          borderRadius: isCode ? 8 : 0,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function AdminContentEditor({ topic, blocks, onBlocksChange }) {
  const addBlock = (type) => {
    const newBlock = { id: uid(), type, text: "", color: "black" };
    onBlocksChange([...(blocks || []), newBlock]);
  };
  const updateBlock = (i, updated, save) => {
    const next = blocks.map((b, idx) => (idx === i ? updated : b));
    onBlocksChange(next, save);
  };
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

function TreeAdmin({ tree, setData, selectedTopic, onSelectTopic }) {
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

  const addCategory = () => {
    setData((prev) => ({ ...prev, tree: [...prev.tree, { id: uid(), title: "New category", sections: [] }] }));
  };

  const addSection = (catId) => {
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) => (c.id === catId ? { ...c, sections: [...c.sections, { id: uid(), title: "New section", topics: [] }] } : c)),
    }));
  };

  const addTopic = (catId, secId) => {
    const newId = uid();
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              sections: c.sections.map((s) =>
                s.id !== secId ? s : { ...s, topics: [...s.topics, { id: newId, title: "New topic" }] }
              ),
            }
      ),
      content: { ...prev.content, [newId]: [] },
    }));
    onSelectTopic(newId);
  };

  const renameCategory = (catId, title) =>
    setData((prev) => ({ ...prev, tree: prev.tree.map((c) => (c.id === catId ? { ...c, title } : c)) }));

  const renameSection = (catId, secId, title) =>
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) =>
        c.id !== catId ? c : { ...c, sections: c.sections.map((s) => (s.id === secId ? { ...s, title } : s)) }
      ),
    }));

  const renameTopic = (catId, secId, topicId, title) =>
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              sections: c.sections.map((s) =>
                s.id !== secId ? s : { ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, title } : t)) }
              ),
            }
      ),
    }));

  const deleteCategory = (catId) => {
    if (!window.confirm("Delete this category and everything inside it?")) return;
    setData((prev) => ({ ...prev, tree: prev.tree.filter((c) => c.id !== catId) }));
  };

  const deleteSection = (catId, secId) => {
    if (!window.confirm("Delete this section and its topics?")) return;
    setData((prev) => ({
      ...prev,
      tree: prev.tree.map((c) => (c.id !== catId ? c : { ...c, sections: c.sections.filter((s) => s.id !== secId) })),
    }));
  };

  const deleteTopic = (catId, secId, topicId) => {
    if (!window.confirm("Delete this topic and its notes?")) return;
    setData((prev) => {
      const nextContent = { ...prev.content };
      delete nextContent[topicId];
      return {
        ...prev,
        tree: prev.tree.map((c) =>
          c.id !== catId
            ? c
            : {
                ...c,
                sections: c.sections.map((s) =>
                  s.id !== secId ? s : { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
                ),
              }
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

function Reader({ topicTitle, breadcrumb, blocks }) {
  if (!topicTitle) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "#8A8F99" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>[ select a topic from the sidebar ]</div>
      </div>
    );
  }
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 28px 80px" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0E7FD1", marginBottom: 14 }}>
        {breadcrumb.join(" / ")}
      </div>
      {(!blocks || blocks.length === 0) && (
        <div style={{ color: "#8A8F99", fontSize: 14 }}>No notes have been added for this topic yet.</div>
      )}
      {blocks &&
        blocks.map((b) => {
          if (b.type === "code") {
            const lines = (b.text || "").split("\n");
            return (
              <div key={b.id} className="code-block">
                <div className="code-gutter">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="code-content">{b.text || " "}</pre>
              </div>
            );
          }
          const tag = b.type === "h1" ? "h1" : b.type === "h2" ? "h2" : b.type === "h3" ? "h3" : "p";
          const sizes = { h1: 26, h2: 20, h3: 16, p: 15 };
          const Tag = tag;
          return (
            <Tag
              key={b.id}
              style={{
                fontFamily: tag === "p" ? "'Inter', sans-serif" : "'Space Grotesk', sans-serif",
                fontWeight: tag === "p" ? 400 : 600,
                fontSize: sizes[tag],
                color: COLORS[b.color] || COLORS.black,
                lineHeight: 1.65,
                margin: tag === "p" ? "0 0 16px" : "28px 0 10px",
              }}
            >
              {b.text}
            </Tag>
          );
        })}
    </div>
  );
}

export default function CourseNotesApp() {
  const { data, setData, loading, error, saving, flush } = useCourseData();
  const [mode, setMode] = useState("view");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!data || selectedTopic) return;
    for (const c of data.tree) {
      for (const s of c.sections) {
        if (s.topics.length > 0) {
          setSelectedTopic(s.topics[0].id);
          return;
        }
      }
    }
  }, [data]);

  const findBreadcrumb = (topicId) => {
    if (!data) return [];
    for (const c of data.tree) {
      for (const s of c.sections) {
        const t = s.topics.find((x) => x.id === topicId);
        if (t) return [c.title, s.title, t.title];
      }
    }
    return [];
  };

  const fileInputRef = useRef(null);

  const handleImportJson = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const next = normalizeImportedData(parsed);
        setData(next);
        setSelectedTopic(null);
        if (window.confirm("Import successful. Open the first topic?")) {
          const firstTopic = next.tree[0]?.sections?.[0]?.topics?.[0]?.id || null;
          if (firstTopic) setSelectedTopic(firstTopic);
        }
      } catch (error) {
        window.alert(error.message || "Your JSON file could not be imported.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "course-notes-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetDemo = () => {
    if (!window.confirm("Replace all content with the demo course? This can't be undone.")) return;
    const seed = seedData();
    setData(seed);
    setSelectedTopic(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480, gap: 8, color: "#8A8F99", fontFamily: "'Inter', sans-serif" }}>
        <Loader2 size={16} className="spin" /> Loading course...
      </div>
    );
  }

  const crumb = findBreadcrumb(selectedTopic);
  const blocks = selectedTopic ? data.content[selectedTopic] : null;

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .app-root { font-family: 'Inter', sans-serif; background: #F6F7F9; height: 640px; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; border: 1px solid #E4E7EC; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .topbar { display:flex; align-items:center; gap:10px; padding:10px 16px; background:#FFFFFF; border-bottom:1px solid #E4E7EC; flex-shrink:0; }
        .topbar-title { font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:14px; color:#12141A; }
        .mode-toggle { display:flex; background:#F0F1F4; border-radius:8px; padding:2px; margin-left:auto; }
        .mode-btn { border:none; background:transparent; padding:6px 12px; font-size:12.5px; font-weight:500; border-radius:6px; cursor:pointer; display:flex; align-items:center; gap:6px; color:#5B6472; font-family:'Inter',sans-serif; }
        .mode-btn-active { background:#12141A; color:#fff; }
        .body-row { display:flex; flex:1; min-height:0; position:relative; }
        .sidebar { width:270px; background:#FFFFFF; border-right:1px solid #E4E7EC; display:flex; flex-direction:column; flex-shrink:0; }
        .main { flex:1; overflow-y:auto; }
        .tree-category { width:100%; display:flex; align-items:center; justify-content:space-between; background:none; border:none; padding:8px 10px; font-family:'JetBrains Mono',monospace; font-size:11.5px; letter-spacing:0.04em; text-transform:uppercase; color:#5B6472; font-weight:600; cursor:pointer; border-radius:6px; }
        .tree-category:hover { background:#F6F7F9; }
        .tree-section { width:100%; display:flex; align-items:center; gap:6px; background:none; border:none; padding:6px 8px; font-size:13px; color:#12141A; font-weight:500; cursor:pointer; border-radius:6px; text-align:left; }
        .tree-section:hover { background:#F6F7F9; }
        .tree-topic { display:block; width:100%; text-align:left; background:none; border:none; padding:6px 8px; font-size:13px; color:#5B6472; cursor:pointer; border-radius:6px; }
        .tree-topic:hover { background:#F6F7F9; color:#12141A; }
        .tree-topic-active { background:#E6F1FB; color:#0E7FD1; font-weight:500; }
        .icon-btn { border:none; background:transparent; color:#8A8F99; cursor:pointer; padding:5px; border-radius:6px; display:flex; align-items:center; justify-content:center; }
        .icon-btn:hover { background:#F0F1F4; color:#12141A; }
        .icon-btn:disabled { opacity:0.3; cursor:default; }
        .icon-btn-danger:hover { background:#FCEBEB; color:#A32D2D; }
        .mobile-only { display:none; }
        .sidebar-scrim { display:none; }
        .code-block { display:flex; background:#12141A; border-radius:10px; overflow:hidden; margin:16px 0; font-family:'JetBrains Mono',monospace; font-size:13px; }
        .code-gutter { padding:14px 10px; color:#5B6472; background:#181A21; text-align:right; user-select:none; line-height:1.6; }
        .code-content { margin:0; padding:14px 16px; color:#E4E7EC; overflow-x:auto; line-height:1.6; white-space:pre; }
        .block-card { border:1px solid #E4E7EC; border-radius:10px; padding:10px 12px; margin-bottom:10px; background:#FFFFFF; }
        .block-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .block-kind { display:flex; align-items:center; gap:5px; font-size:11.5px; font-family:'JetBrains Mono',monospace; color:#8A8F99; text-transform:uppercase; letter-spacing:0.03em; }
        .add-block-bar { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
        .add-block-btn { display:flex; align-items:center; gap:6px; border:1px solid #E4E7EC; background:#FFFFFF; padding:7px 12px; border-radius:8px; font-size:12.5px; color:#12141A; cursor:pointer; font-family:'Inter',sans-serif; }
        .add-block-btn:hover { border-color:#0E7FD1; color:#0E7FD1; }
        .add-block-btn-small { font-size:12px; padding:5px 10px; margin:4px 0 10px; }
        .admin-node { margin-bottom:2px; }
        .admin-row { display:flex; align-items:center; gap:6px; padding:6px 8px; border-radius:6px; }
        .admin-row:hover { background:#F6F7F9; }
        .admin-row-category { font-family:'JetBrains Mono',monospace; font-size:11.5px; text-transform:uppercase; letter-spacing:0.04em; font-weight:600; color:#12141A; }
        .admin-row-section { font-size:13px; font-weight:500; color:#12141A; margin-left:10px; }
        .admin-row-topic { font-size:13px; color:#5B6472; margin-left:24px; }
        .admin-row-topic-active { background:#E6F1FB; }
        .admin-title { flex:1; }
        .admin-topic-select { flex:1; text-align:left; background:none; border:none; padding:0; color:inherit; font-size:13px; cursor:pointer; font-family:'Inter',sans-serif; }
        .admin-actions { display:flex; gap:2px; opacity:0; }
        .admin-row:hover .admin-actions { opacity:1; }
        .admin-input { flex:1; border:1px solid #0E7FD1; border-radius:5px; padding:3px 6px; font-size:13px; font-family:'Inter',sans-serif; outline:none; }
        .save-pill { display:flex; align-items:center; gap:5px; font-size:11.5px; color:#8A8F99; font-family:'JetBrains Mono',monospace; }
        .error-pill { font-size:11.5px; color:#A32D2D; font-family:'JetBrains Mono',monospace; }
        textarea:focus { outline: 1px solid #0E7FD1; border-radius: 6px; }
        @media (max-width: 720px) {
          .mobile-only { display:flex; }
          .sidebar { position:absolute; top:0; bottom:0; left:0; transform:translateX(-100%); transition:transform 0.2s ease; z-index:20; box-shadow:2px 0 12px rgba(0,0,0,0.08); }
          .sidebar-open { transform:translateX(0); }
          .sidebar-scrim { display:block; }
        }
      `}</style>

      <div className="topbar">
        <button className="icon-btn mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={16} />
        </button>
        <span className="topbar-title">C++ DSA Notes</span>
        {saving && (
          <span className="save-pill">
            <Loader2 size={11} className="spin" /> saving
          </span>
        )}
        {error && <span className="error-pill">{error}</span>}
        <div className="mode-toggle">
          <button className={"mode-btn" + (mode === "view" ? " mode-btn-active" : "")} onClick={() => setMode("view")}>
            <Eye size={13} /> View
          </button>
          <button className={"mode-btn" + (mode === "admin" ? " mode-btn-active" : "")} onClick={() => setMode("admin")}>
            <Settings size={13} /> Admin
          </button>
        </div>
      </div>

      <div className="body-row">
        {mode === "view" ? (
          <Sidebar
            tree={data.tree}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            mode={mode}
          />
        ) : (
          <aside className={"sidebar" + (mobileOpen ? " sidebar-open" : "")} style={{ overflowY: "auto" }}>
            <div style={{ padding: "14px 16px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: "#12141A" }}>
                Manage content
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="icon-btn" onClick={handleExportJson} title="Export JSON" aria-label="Export JSON">
                  <FilePlus size={14} />
                </button>
                <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload JSON" aria-label="Upload JSON">
                  <FolderPlus size={14} />
                </button>
                <button className="icon-btn" onClick={resetDemo} title="Reset to demo content" aria-label="Reset to demo content">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleImportJson} />
            <TreeAdmin tree={data.tree} setData={setData} selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
          </aside>
        )}

        <main className="main">
          {mode === "admin" ? (
            selectedTopic ? (
              <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 28px 80px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0E7FD1", marginBottom: 16 }}>
                  {crumb.join(" / ")}
                </div>
                <AdminContentEditor
                  topic={selectedTopic}
                  blocks={blocks || []}
                  onBlocksChange={(next, save) =>
                    setData((prev) => ({ ...prev, content: { ...prev.content, [selectedTopic]: next } }), { save: save !== false })
                  }
                />
              </div>
            ) : (
              <div style={{ padding: "80px 24px", textAlign: "center", color: "#8A8F99" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                  [ select or create a topic to edit its notes ]
                </div>
              </div>
            )
          ) : (
            <Reader topicTitle={crumb[2]} breadcrumb={crumb} blocks={blocks} />
          )}
        </main>
      </div>
    </div>
  );
}
