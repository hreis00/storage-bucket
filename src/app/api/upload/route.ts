import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import connectDB from "@/lib/mongodb";
import File from "@/models/File";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Create uploads directory if it doesn't exist
		const uploadDir = join(process.cwd(), "uploads");
		if (!existsSync(uploadDir)) {
			await mkdir(uploadDir, { recursive: true });
		}

		// Create a unique filename
		const timestamp = Date.now();
		const uniqueFilename = `${timestamp}-${file.name}`;
		await writeFile(join(uploadDir, uniqueFilename), buffer);

		// Determine correct MIME type for markdown files
		let mimeType = file.type;
		if (
			file.name.toLowerCase().endsWith(".md") ||
			file.name.toLowerCase().endsWith(".markdown")
		) {
			mimeType = "text/markdown";
		}

		await connectDB();

		const newFile = await File.create({
			filename: uniqueFilename,
			originalName: file.name,
			size: buffer.length,
			mimeType: mimeType,
			userId: session.user.id,
		});

		return NextResponse.json(newFile);
	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Error uploading file" },
			{ status: 500 }
		);
	}
}
