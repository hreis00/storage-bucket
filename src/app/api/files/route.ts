import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import File from "@/models/File";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const files = await File.find({ userId: session.user.id }).sort({
			createdAt: -1,
		});

		return NextResponse.json(files);
	} catch (error) {
		console.error("Error fetching files:", error);
		return NextResponse.json(
			{ error: "Error fetching files" },
			{ status: 500 }
		);
	}
}
