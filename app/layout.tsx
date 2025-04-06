import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FilesProvider } from "@/context/FilesContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FileSharing - Secure File Upload",
    description: "Upload and share files anonymously and securely",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
            <body className={inter.className}>
                <Navbar />
                <FilesProvider>{children}</FilesProvider>
                <Footer />
                <Toaster richColors position="top-center" />

                <div className="fixed w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-3xl -z-10 top-[20%] left-[10%]"></div>
                <div className="fixed w-[200px] h-[200px] rounded-full bg-blue-500/10 blur-3xl -z-10 bottom-[30%] right-[5%]"></div>
                <div className="fixed w-[150px] h-[150px] rounded-full bg-pink-500/10 blur-3xl -z-10 top-[10%] right-[20%]"></div>
            </body>
        </html>
    );
}
