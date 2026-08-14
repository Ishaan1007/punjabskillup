"use client";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Reader from "./Reader";

export default function Viewer({ initialData }) {
  const data = initialData || { tree: [], content: {} };
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (selectedTopic) return;
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
    for (const c of data.tree) {
      for (const s of c.sections) {
        const t = s.topics.find((x) => x.id === topicId);
        if (t) return [c.title, s.title, t.title];
      }
    }
    return [];
  };

  const crumb = findBreadcrumb(selectedTopic);
  const blocks = selectedTopic ? data.content[selectedTopic] : null;

  return (
    <div className="app-shell">
      <div className="topbar">
        <button className="icon-btn mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={16} />
        </button>
        <span className="topbar-title">C++ DSA Notes</span>
      </div>
      <div className="body-row">
        <Sidebar
          tree={data.tree}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <main className="main">
          <Reader topicTitle={crumb[2]} breadcrumb={crumb} blocks={blocks} />
        </main>
      </div>
    </div>
  );
}
