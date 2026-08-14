export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const COLORS = {
  black: "#12141A",
  grey: "#5B6472",
};

export const BLOCK_TYPE_LABELS = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  p: "Paragraph",
  code: "Code",
};
