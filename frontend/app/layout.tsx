import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/newsreader/500.css";
import "./globals.css";

export const metadata = {
  title: "LiquidityLens — Liquidity risk intelligence",
  description: "Explainable liquidity risk investigation using synthetic data.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
