import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import { AuthProvider } from "@/components/AuthProvider";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "",
  description: "",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
       <title>RecruitFlow</title>
      </head>
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <AuthProvider session={session}>{children}</AuthProvider>
        </ReactQueryProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}