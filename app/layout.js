import "../styles.css";

export const metadata = {
  title: "School Management System",
  description: "ITI School Management System dashboard",
  applicationName: "ITI Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
