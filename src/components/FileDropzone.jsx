import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, Image as ImageIcon, FileArchive, 
  FileCode, File, Folder, X, Trash2, CheckCircle2 
} from 'lucide-react';
import './FileDropzone.css';

// Helper to format bytes to human readable string
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get file icon and color
export const getFileMeta = (file) => {
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
    return { icon: ImageIcon, color: '#10b981', label: 'Image', isImage: true };
  }
  if (['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv', 'flv'].includes(ext)) {
    return { icon: FileCode, color: '#0ea5e9', label: 'Video / Media' };
  }
  if (['pdf'].includes(ext)) {
    return { icon: FileText, color: '#ef4444', label: 'PDF' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { icon: FileArchive, color: '#f59e0b', label: 'Archive' };
  }
  if (['exe', 'msi', 'dmg', 'pkg', 'deb', 'apk', 'iso'].includes(ext)) {
    return { icon: FileCode, color: '#8b5cf6', label: 'Setup / App' };
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'xls', 'pptx'].includes(ext)) {
    return { icon: FileText, color: '#3b82f6', label: 'Document' };
  }
  return { icon: File, color: '#94a3b8', label: 'File' };
};

const FileDropzone = ({ files, setFiles, uploadProgress = null, isSubmitting = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Traverse dropped directory entries recursively
  const traverseEntry = (entry, path = '') => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file) => {
          file.customRelativePath = path + file.name;
          resolve([file]);
        }, () => resolve([]));
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = [];
        const readEntries = () => {
          reader.readEntries((results) => {
            if (!results.length) {
              Promise.all(entries.map(e => traverseEntry(e, path + entry.name + '/')))
                .then(all => resolve(all.flat()));
            } else {
              entries.push(...results);
              readEntries();
            }
          }, () => resolve([]));
        };
        readEntries();
      } else {
        resolve([]);
      }
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isSubmitting) return;

    const items = e.dataTransfer.items;
    const droppedFiles = [];

    if (items && items.length > 0) {
      const entryPromises = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            entryPromises.push(traverseEntry(entry));
          }
        }
      }

      if (entryPromises.length > 0) {
        const resolved = await Promise.all(entryPromises);
        droppedFiles.push(...resolved.flat());
      }
    }

    if (droppedFiles.length === 0 && e.dataTransfer.files) {
      droppedFiles.push(...Array.from(e.dataTransfer.files));
    }

    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSubmitting) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      addFiles(selected);
      e.target.value = '';
    }
  };

  const handleFolderInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).map(file => {
        file.customRelativePath = file.webkitRelativePath || file.name;
        return file;
      });
      addFiles(selected);
      e.target.value = '';
    }
  };

  const addFiles = (newFiles) => {
    setFiles(prev => {
      // Avoid duplicate filenames in same path
      const existingKeys = new Set(prev.map(f => (f.customRelativePath || f.name) + '_' + f.size));
      const filtered = newFiles.filter(f => !existingKeys.has((f.customRelativePath || f.name) + '_' + f.size));
      return [...prev, ...filtered];
    });
  };

  const removeFile = (indexToRemove) => {
    if (isSubmitting) return;
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearAll = () => {
    if (isSubmitting) return;
    setFiles([]);
  };

  const totalSize = files.reduce((acc, curr) => acc + (curr.size || 0), 0);

  return (
    <div className="file-dropzone-container">
      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        multiple 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={handleFolderInputChange} 
        webkitdirectory="" 
        directory="" 
        multiple 
        style={{ display: 'none' }} 
      />

      {/* Drop area */}
      <div 
        className={`dropzone-box ${isDragOver ? 'drag-over' : ''} ${isSubmitting ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isSubmitting && fileInputRef.current?.click()}
      >
        <div className="dropzone-icon-wrap">
          <UploadCloud size={20} className="dropzone-cloud-icon" />
        </div>
        <div className="dropzone-text-content">
          <p className="dropzone-main-text">
            <span>Drag & drop</span> PDF, Photos, Zip, Folder, or Setup (.exe) here
          </p>
          <p className="dropzone-sub-text">
            Supports all file types — PDF, Photos, Zip, Folders, Setup (.exe), Videos (up to 5GB each)
          </p>
        </div>
        <div className="dropzone-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button" 
            className="dropzone-btn browse-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            Choose Files
          </button>
          <button 
            type="button" 
            className="dropzone-btn folder-btn"
            onClick={() => folderInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Folder size={14} /> Upload Folder
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploadProgress !== null && uploadProgress >= 0 && (
        <div className="upload-progress-wrapper">
          <div className="upload-progress-header">
            <span>{uploadProgress >= 100 ? 'Saving & processing attachments...' : 'Uploading attachments...'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="upload-progress-track">
            <div 
              className="upload-progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="selected-files-section">
          <div className="selected-files-header">
            <span className="files-count-badge">
              📎 {files.length} {files.length === 1 ? 'file' : 'files'} ({formatFileSize(totalSize)})
            </span>
            {!isSubmitting && (
              <button 
                type="button" 
                className="clear-all-btn" 
                onClick={clearAll}
                title="Remove all files"
              >
                <Trash2 size={13} /> Clear All
              </button>
            )}
          </div>

          <div className="files-preview-list">
            {files.map((file, idx) => {
              const meta = getFileMeta(file);
              const IconComp = meta.icon;
              const displayPath = file.customRelativePath || file.name;

              return (
                <div key={idx} className="file-item-card">
                  <div className="file-item-left">
                    <div className="file-icon-box" style={{ background: `${meta.color}15`, color: meta.color }}>
                      <IconComp size={18} />
                    </div>
                    <div className="file-item-details">
                      <div className="file-name" title={displayPath}>
                        {displayPath}
                      </div>
                      <div className="file-meta-sub">
                        <span className="file-type-pill" style={{ borderColor: `${meta.color}30`, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="file-size-text">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isSubmitting && (
                    <button 
                      type="button" 
                      className="file-remove-btn" 
                      onClick={() => removeFile(idx)}
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
