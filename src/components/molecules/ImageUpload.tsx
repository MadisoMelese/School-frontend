import React, { useRef, useState } from 'react';
import { Icon } from '../atoms/Icon';

interface ImageUploadProps {
  label: string;
  value?: string | File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  required?: boolean;
  maxSize?: number; // in bytes, default 5MB
  acceptedFormats?: string[]; // e.g., ['image/png', 'image/jpeg']
  preview?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ['image/png', 'image/jpeg'],
  preview = true,
  disabled = false,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  // Initialize preview if value is a string (URL)
  React.useEffect(() => {
    if (typeof value === 'string') {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPreviewUrl(null);
      setFileName('');
      onChange?.(null);
      return;
    }

    // Validate file format
    if (!acceptedFormats.includes(file.type)) {
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      return;
    }

    setFileName(file.name);
    onChange?.(file);

    // Create preview
    if (preview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName('');
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
        {required && <span className="text-danger-600 ml-1">*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={acceptedFormats.join(',')}
        className="hidden"
        disabled={disabled}
        aria-label={label}
      />

      {/* Preview */}
      {preview && previewUrl && (
        <div className="mb-4 relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border border-neutral-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute -top-2 -right-2 bg-danger-500 text-white rounded-full p-1 hover:bg-danger-600 disabled:opacity-50"
            aria-label="Remove image"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          disabled
            ? 'bg-neutral-50 border-neutral-200 cursor-not-allowed'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
        } ${error ? 'border-danger-300 bg-danger-50' : ''}`}
      >
        <Icon name="Upload" size={32} className="mx-auto mb-2 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700">
          {fileName || 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          {acceptedFormats.includes('image/png') && acceptedFormats.includes('image/jpeg')
            ? 'PNG or JPG'
            : acceptedFormats.join(', ')}
          {' • '}
          Max {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Error Message */}
      {error && <span className="text-danger-600 text-sm mt-2 block">{error}</span>}

      {/* Helper Text */}
      {helperText && !error && (
        <span className="text-neutral-500 text-sm mt-2 block">{helperText}</span>
      )}
    </div>
  );
};
