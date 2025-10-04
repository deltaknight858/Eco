export const metadata = {
  title: 'Eco Shell',
  description: 'Eco shell app placeholder',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
