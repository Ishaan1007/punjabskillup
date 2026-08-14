import "./globals.css";

export const metadata = {
  title: "C++ DSA Notes",
  description: "C++ Data Structures & Algorithms notes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
