"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

type Props = {
	children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return <SessionProvider>{children}</SessionProvider>;
}
