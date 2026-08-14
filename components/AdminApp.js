"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, RotateCcw } from "lucide-react";
import { TreeAdmin, BlockEditor } from "./AdminEditor";
import { uid } from "../lib/constants";

function seedData() {
  const catId = uid(), secId = uid(), topicId = uid();
  return {
    tree: [{ id: catId, title: "Arrays", sections: [{ id: secId, title: "Vectors (STL)", topics: [{ id: topicId, title: "Introduction to Vectors" }] }] }],
    content: { [topicId]: [{ id: uid(), type: "h1", text: "Introduction to Vectors", color: "black" }] },
  };
}

export default function AdminApp({ initialData }) {
  const router = useRouter();
  const [data, setDataState] = useState(initialData);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const dataRef = useRef(initialData);

  const persist = useCallback(async (next) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: next }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
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

  const findBreadcrumb = (topicId) => {
    for (const c of data.tree) {
      for (const s of c.sections) {
        const t = s.topics.find((x) => x.id === topicId);
        if (t) return [c.title, s.title, t.title];
      }
    }
    return [];
  };

  const resetDemo = () => {
    if (!window.confirm("Replace all content with a starter example? This can't be undone.")) return;
    setData(seedData());
    setSelectedTopic(null);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const crumb = findBreadcrumb(selectedTopic);
  const blocks = selectedTopic ? data.content[selectedTopic] : null;

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="topbar-title">C++ DSA Notes — Admin</span>
        {saving && (
          <span className="save-pill">
            <Loader2 size={11} className="spin" /> saving
          </span>
        )}
        {error && <span className="error-pill">{error}</span>}
        <button className="topbar-link" onClick={resetDemo} style={{ marginLeft: "auto" }}>
          <RotateCcw size={13} /> Reset demo content
        </button>
        <button className="topbar-link" onClick={logout}>
          <LogOut size={13} /> Log out
        </button>
      </div>
      <div className="body-row">
        <aside className="sidebar">
          <TreeAdmin tree={data.tree} setData={setData} selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
        </aside>
        <main className="main">
          {selectedTopic ? (
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 28px 80px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#0E7FD1", marginBottom: 16 }}>
                {crumb.join(" / ")}
              </div>
              <BlockEditor
                blocks={blocks || []}
                onBlocksChange={(next, save) => setData((prev) => ({ ...prev, content: { ...prev.content, [selectedTopic]: next } }), { save: save !== false })}
              />
            </div>
          ) : (
            <div style={{ padding: "80px 24px", textAlign: "center", color: "#8A8F99" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                [ select or create a topic on the left to edit its notes ]
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
