"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";

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
            <div style={{ fontSize: 12, color: "#B4B8C0", padding: "4px 8px", fontFamily: "'JetBrains Mono', monospace" }}>
              empty
            </div>
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

export default function Sidebar({ tree, selectedTopic, onSelectTopic, mobileOpen, setMobileOpen }) {
  const [expanded, setExpanded] = useState(() => {
    const e = {};
    tree.forEach((c) => (e[c.id] = true));
    return e;
  });
  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="sidebar-scrim" />}
      <aside className={"sidebar" + (mobileOpen ? " sidebar-open" : "")}>
        <div style={{ padding: "12px 12px 6px", display: "flex", justifyContent: "flex-end" }} className="mobile-only">
          <button className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "4px 8px 24px" }}>
          {tree.length === 0 && (
            <div style={{ padding: "20px 12px", fontSize: 13, color: "#8A8F99", fontFamily: "'JetBrains Mono', monospace" }}>
              No content yet.
            </div>
          )}
          {tree.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 6 }}>
              <button onClick={() => toggle(cat.id)} className="tree-category">
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
