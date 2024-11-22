import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import {
	PhotoIcon,
	DocumentIcon,
	DocumentTextIcon,
	ExclamationCircleIcon,
	ArrowsPointingOutIcon,
	MagnifyingGlassMinusIcon,
	MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface FilePreviewProps {
	fileId: string;
	mimeType: string;
	fileName: string;
	isOpen: boolean;
	onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
	fileId,
	mimeType,
	fileName,
	isOpen,
	onClose,
}) => {
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [scale, setScale] = useState(1);

	const isImage = mimeType.startsWith("image/");
	const isPDF = mimeType === "application/pdf";
	const isMarkdown = mimeType === "text/markdown" || fileName.endsWith(".md");
	const isText =
		mimeType.startsWith("text/") || mimeType === "application/json";

	const previewUrl = `/api/preview/${fileId}`;

	useEffect(() => {
		if (!isOpen || !fileId) {
			return;
		}

		setLoading(true);
		setError(null);

		if (isText || isMarkdown) {
			fetch(previewUrl)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Failed to load content");
					}
					return response.text();
				})
				.then((text) => {
					setContent(text);
					setLoading(false);
				})
				.catch((err) => {
					console.error("Error loading text content:", err);
					setError("Failed to load text content");
					setLoading(false);
				});
		} else {
			setLoading(false);
		}

		return () => {
			setContent("");
			setError("");
		};
	}, [isOpen, fileId, isText, isMarkdown, previewUrl]);

	if (!isOpen) return null;

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/50" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-card p-6 shadow-xl transition-all">
								<div className="flex items-center justify-between mb-4">
									<Dialog.Title className="text-lg font-medium text-foreground">
										{fileName}
									</Dialog.Title>
									<button
										type="button"
										className="rounded-md p-1 text-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
										onClick={onClose}
									>
										<XMarkIcon className="h-6 w-6" />
									</button>
								</div>
								<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
									{isImage ? (
										<div className="relative flex flex-col items-center justify-center min-h-[200px] bg-gray-800 rounded-lg p-4">
											<a
												href={`/api/preview/${fileId}`}
												target="_blank"
												rel="noopener noreferrer"
												className="relative cursor-pointer group"
											>
												<Image
													src={`/api/preview/${fileId}`}
													alt={fileName}
													className="rounded-lg object-contain max-h-[70vh] transition-transform group-hover:scale-[1.02]"
													width={800}
													height={600}
													style={{ width: "auto", height: "auto" }}
													priority={true}
												/>
												<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
													<div className="bg-black/50 p-2 rounded-lg">
														<ArrowsPointingOutIcon className="w-6 h-6 text-white" />
													</div>
												</div>
											</a>
										</div>
									) : isPDF ? (
										<div className="w-full h-full min-h-[600px] rounded-lg overflow-hidden border border-gray-200">
											<iframe
												src={`${previewUrl}#view=FitH`}
												className="w-full h-full"
												title={fileName}
											/>
										</div>
									) : isMarkdown && content ? (
										<div className="prose prose-invert prose-sm md:prose-base lg:prose-lg max-w-none bg-gray-800 p-4 rounded-lg">
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												rehypePlugins={[rehypeRaw]}
												className="markdown-body text-gray-200"
												components={{
													p: ({ node, className, children, ...props }) => {
														return (
															<p
																className={`text-gray-200 ${className || ""}`}
																{...props}
															>
																{children}
															</p>
														);
													},
													div: ({ node, className, children, ...props }) => {
														return (
															<div
																className={`text-gray-200 ${className || ""}`}
																{...props}
															>
																{children}
															</div>
														);
													},
													span: ({ node, className, children, ...props }) => {
														return (
															<span
																className={`text-gray-200 ${className || ""}`}
																{...props}
															>
																{children}
															</span>
														);
													},
													h1: ({ node, children, ...props }) => (
														<h1
															className="text-gray-100 text-2xl font-bold mb-4"
															{...props}
														>
															{children}
														</h1>
													),
													h2: ({ node, children, ...props }) => (
														<h2
															className="text-gray-100 text-xl font-bold mb-3"
															{...props}
														>
															{children}
														</h2>
													),
													h3: ({ node, children, ...props }) => (
														<h3
															className="text-gray-100 text-lg font-bold mb-2"
															{...props}
														>
															{children}
														</h3>
													),
													a: ({ node, children, ...props }) => (
														<a
															className="text-blue-400 hover:text-blue-300"
															{...props}
														>
															{children}
														</a>
													),
													table: ({ node, className, children, ...props }) => {
														return (
															<div className="my-8 overflow-x-auto">
																<table
																	className="min-w-full table-auto border-collapse border border-gray-600"
																	{...props}
																>
																	{children}
																</table>
															</div>
														);
													},
													thead: ({ node, children, ...props }) => {
														return (
															<thead className="bg-gray-700" {...props}>
																{children}
															</thead>
														);
													},
													tbody: ({ node, children, ...props }) => {
														return (
															<tbody
																className="divide-y divide-gray-600"
																{...props}
															>
																{children}
															</tbody>
														);
													},
													tr: ({ node, children, ...props }) => {
														return (
															<tr
																className="hover:bg-gray-700 transition-colors"
																{...props}
															>
																{children}
															</tr>
														);
													},
													th: ({ node, children, ...props }) => {
														return (
															<th
																className="border border-gray-600 bg-gray-700 px-4 py-2 text-left text-sm font-semibold text-gray-100"
																{...props}
															>
																{children}
															</th>
														);
													},
													td: ({ node, children, ...props }) => {
														return (
															<td
																className="border border-gray-600 px-4 py-2 text-sm text-gray-200"
																{...props}
															>
																{children}
															</td>
														);
													},
													code: ({
														node,
														inline,
														className,
														children,
														...props
													}) => {
														return (
															<code
																className={`${
																	inline ? "bg-gray-700 px-1 py-0.5 rounded" : ""
																} text-gray-200 ${className || ""}`}
																{...props}
															>
																{children}
															</code>
														);
													},
													pre: ({ node, children, ...props }) => {
														return (
															<pre
																className="bg-gray-700 p-4 rounded-lg overflow-x-auto"
																{...props}
															>
																{children}
															</pre>
														);
													},
													ul: ({ node, children, ...props }) => (
														<ul
															className="text-gray-200 list-disc pl-5 space-y-2"
															{...props}
														>
															{children}
														</ul>
													),
													ol: ({ node, children, ...props }) => (
														<ol
															className="text-gray-200 list-decimal pl-5 space-y-2"
															{...props}
														>
															{children}
														</ol>
													),
													li: ({ node, children, ...props }) => (
														<li className="text-gray-200" {...props}>
															{children}
														</li>
													),
													blockquote: ({ node, children, ...props }) => (
														<blockquote
															className="border-l-4 border-gray-600 pl-4 italic text-gray-300"
															{...props}
														>
															{children}
														</blockquote>
													),
												}}
											>
												{content}
											</ReactMarkdown>
										</div>
									) : isText && !isMarkdown && content ? (
										<div className="relative">
											<pre className="whitespace-pre-wrap break-words text-gray-200 font-mono text-sm p-4 bg-gray-800 rounded-lg overflow-x-auto">
												{content}
											</pre>
										</div>
									) : (
										<div className="flex h-full items-center justify-center">
											<p className="text-muted">
												Preview not available for this file type
											</p>
										</div>
									)}
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default FilePreview;
