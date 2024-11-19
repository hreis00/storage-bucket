'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  DocumentIcon,
  PhotoIcon,
  PlayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ArrowsUpDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Loading from './loading';
import ConfirmDialog from '@/components/ConfirmDialog';
import FilePreview from '@/components/FilePreview';

interface File {
  _id: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

type SortField = 'name' | 'size' | 'type' | 'date';
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
  });
  const [previewDialog, setPreviewDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
    mimeType: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
    mimeType: '',
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get icon based on mime type
  const getFileIcon = (mimeType: string) => {
    const IconClasses = "h-5 w-5 inline-block mr-2";
    
    if (mimeType.startsWith('image/')) {
      return <PhotoIcon className={`${IconClasses} text-blue-400`} />;
    }
    if (mimeType.startsWith('video/')) {
      return <PlayIcon className={`${IconClasses} text-purple-400`} />;
    }
    if (mimeType.startsWith('text/')) {
      return <DocumentTextIcon className={`${IconClasses} text-green-400`} />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <TableCellsIcon className={`${IconClasses} text-emerald-400`} />;
    }
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css')) {
      return <CodeBracketIcon className={`${IconClasses} text-yellow-400`} />;
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return <ArchiveBoxIcon className={`${IconClasses} text-orange-400`} />;
    }
    return <DocumentIcon className={`${IconClasses} text-gray-400`} />;
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'name':
        return direction * a.originalName.localeCompare(b.originalName);
      case 'size':
        return direction * (a.size - b.size);
      case 'type':
        return direction * a.mimeType.localeCompare(b.mimeType);
      case 'date':
        return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return 0;
    }
  });

  // Filter files
  const filteredFiles = sortedFiles.filter(file => 
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle batch selection
  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)) return;
    
    try {
      await Promise.all(
        Array.from(selectedFiles).map(fileId =>
          fetch(`/api/files/${fileId}`, { method: 'DELETE' })
        )
      );
      toast.success(`${selectedFiles.size} files deleted successfully`);
      await fetchFiles();
      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete some files');
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);

    try {
      setUploadProgress(0);
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          await fetchFiles();
          toast.success('File uploaded successfully!');
        } else {
          toast.error('Failed to upload file');
        }
        setUploadProgress(null);
        setIsUploading(false);
      };

      xhr.onerror = () => {
        console.error('Error uploading file');
        toast.error('Failed to upload file');
        setUploadProgress(null);
        setIsUploading(false);
      };

      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      setUploadProgress(null);
      setIsUploading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setDeleteDialog({ isOpen: true, fileId, fileName });
  };

  const handleDeleteConfirm = async () => {
    const { fileId, fileName } = deleteDialog;
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast.success(`${fileName} deleted successfully`);
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete ${fileName}`);
    } finally {
      setDeleteDialog({ isOpen: false, fileId: '', fileName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, fileId: '', fileName: '' });
  };

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`/api/download/${fileId}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.find(f => f._id === fileId)?.originalName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handlePreviewClick = (fileId: string, fileName: string, mimeType: string) => {
    setPreviewDialog({
      isOpen: true,
      fileId,
      fileName,
      mimeType,
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session) {
      fetchFiles();
    }
  }, [session]);

  if (!mounted || status === 'loading') {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteDialog.fileName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <FilePreview
        fileId={previewDialog.fileId}
        fileName={previewDialog.fileName}
        mimeType={previewDialog.mimeType}
        isOpen={previewDialog.isOpen}
        onClose={() => setPreviewDialog(prev => ({ ...prev, isOpen: false }))}
      />
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">File Storage</h1>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-sm font-medium text-gray-700">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Upload Files</h2>
              <p className="mt-1 text-sm text-gray-500">
                Drag and drop your files here or click to browse
              </p>
            </div>
            <div>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
                disabled={isUploading}
              />
              <label
                htmlFor="fileInput"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      Uploading
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Batch Actions */}
        {selectedFiles.size > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-700">
                  {selectedFiles.size} {selectedFiles.size === 1 ? 'file' : 'files'} selected
                </span>
              </div>
              <button
                onClick={handleBatchDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="sm:flex sm:items-center p-6">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900">Your Files</h2>
              <p className="mt-2 text-sm text-gray-700">
                A list of all your uploaded files including their name, size, type and upload date.
              </p>
            </div>
          </div>
          <div className="mt-2">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-3 py-3.5">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(new Set(files.map(f => f._id)));
                        } else {
                          setSelectedFiles(new Set());
                        }
                      }}
                      checked={selectedFiles.size === files.length && files.length > 0}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer group"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <ArrowsUpDownIcon className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-500" />
                      {sortField === 'name' && (
                        <span className="ml-1 text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer group"
                    onClick={() => handleSort('size')}
                  >
                    <div className="flex items-center">
                      Size
                      <ArrowsUpDownIcon className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-500" />
                      {sortField === 'size' && (
                        <span className="ml-1 text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer group"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type
                      <ArrowsUpDownIcon className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-500" />
                      {sortField === 'type' && (
                        <span className="ml-1 text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer group"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowsUpDownIcon className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-500" />
                      {sortField === 'date' && (
                        <span className="ml-1 text-blue-500">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <DocumentIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-1">No files found</p>
                        <p className="text-gray-400 text-xs">
                          {searchQuery ? 'Try a different search term' : 'Upload some files to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr
                      key={file._id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="w-8 px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file._id)}
                          onChange={() => toggleFileSelection(file._id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="flex items-center">
                          {getFileIcon(file.mimeType)}
                          <span className="font-medium text-gray-900">{file.originalName}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {file.mimeType}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handlePreviewClick(file._id, file.originalName, file.mimeType)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-50"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownload(file._id)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded-md hover:bg-blue-50"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDeleteClick(file._id, file.originalName)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
