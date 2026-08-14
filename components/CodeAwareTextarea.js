"use client";
import { useEffect, useRef } from "react";

const PAIR_OPEN_TO_CLOSE = { "(": ")", "{": "}", "[": "]" };
const PAIR_CLOSERS = [")", "}", "]"];
const PAIR_QUOTES = ['"', "'"];

// A textarea with auto-indent, auto-closing brackets/quotes, and Tab support.
// Used for code blocks. Uncontrolled: parent gets updates via onTextChange.
export default function CodeAwareTextarea({ value, onTextChange, onCommit, placeholder, rows = 6, style }) {
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
    onTextChange(el.value);
  };

  const handleKeyDown = (e) => {
    const el = e.target;
    const s = el.selectionStart;
    const en = el.selectionEnd;
    const val = el.value;
    const key = e.key;

    if (key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        const lineStart = val.lastIndexOf("\n", s - 1) + 1;
        const lineText = val.slice(lineStart, s);
        const removeCount = Math.min(4, lineText.length - lineText.trimStart().length);
        if (removeCount > 0) {
          el.value = val.slice(0, lineStart) + val.slice(lineStart + removeCount);
          el.selectionStart = el.selectionEnd = s - removeCount;
          afterEdit(el);
        }
      } else {
        el.value = val.slice(0, s) + "    " + val.slice(en);
        el.selectionStart = el.selectionEnd = s + 4;
        afterEdit(el);
      }
      return;
    }

    if (key === "Enter") {
      e.preventDefault();
      const lineStart = val.lastIndexOf("\n", s - 1) + 1;
      const currentLine = val.slice(lineStart, s);
      const indent = (currentLine.match(/^[ \t]*/) || [""])[0];
      const charBefore = val[s - 1];
      const charAfter = val[s];
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
      el.value = val.slice(0, s) + insertText + val.slice(en);
      el.selectionStart = el.selectionEnd = s + cursorOffset;
      afterEdit(el);
      return;
    }

    if (key === "Backspace" && s === en && s > 0) {
      const charBefore = val[s - 1];
      const charAfter = val[s];
      if (PAIR_OPEN_TO_CLOSE[charBefore] === charAfter) {
        e.preventDefault();
        el.value = val.slice(0, s - 1) + val.slice(s + 1);
        el.selectionStart = el.selectionEnd = s - 1;
        afterEdit(el);
        return;
      }
    }

    if (PAIR_OPEN_TO_CLOSE[key]) {
      e.preventDefault();
      const close = PAIR_OPEN_TO_CLOSE[key];
      if (s !== en) {
        el.value = val.slice(0, s) + key + val.slice(s, en) + close + val.slice(en);
        el.selectionStart = s + 1;
        el.selectionEnd = en + 1;
      } else {
        el.value = val.slice(0, s) + key + close + val.slice(en);
        el.selectionStart = el.selectionEnd = s + 1;
      }
      afterEdit(el);
      return;
    }

    if (PAIR_CLOSERS.includes(key) && s === en && val[s] === key) {
      e.preventDefault();
      el.selectionStart = el.selectionEnd = s + 1;
      return;
    }

    if (PAIR_QUOTES.includes(key)) {
      if (s === en && val[s] === key) {
        e.preventDefault();
        el.selectionStart = el.selectionEnd = s + 1;
        return;
      }
      e.preventDefault();
      if (s !== en) {
        el.value = val.slice(0, s) + key + val.slice(s, en) + key + val.slice(en);
        el.selectionStart = s + 1;
        el.selectionEnd = en + 1;
      } else {
        el.value = val.slice(0, s) + key + key + val.slice(en);
        el.selectionStart = el.selectionEnd = s + 1;
      }
      afterEdit(el);
      return;
    }
  };

  return (
    <textarea
      ref={taRef}
      defaultValue={value}
      onInput={(e) => autoGrow(e.target)}
      onChange={(e) => onTextChange(e.target.value)}
      onBlur={(e) => onCommit(e.target.value)}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      placeholder={placeholder}
      rows={rows}
      style={style}
    />
  );
}
