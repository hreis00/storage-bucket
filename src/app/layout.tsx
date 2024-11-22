import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "File Storage App",
	description: "A simple file storage application",
};

// This forces Next.js to render this layout dynamically
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>
					<ThemeProvider>
						{children}
						<Toaster position="bottom-right" />
					</ThemeProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
