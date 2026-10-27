import React, { useState, useRef } from 'react';
import { Input, Button, Progress, Space, Image, message, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, CheckCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { uploadTusFile } from '../../services/tusUploader';

const { Text } = Typography;

export const TusUpload = ({
  value = '',
  onChange,
  onSuccess,
  onUploadSuccess,
  endpoint = '/files',
  placeholder = 'URL ou upload de arquivo...',
  accept = '*/*',
  disabled = false,
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [internalValue, setInternalValue] = useState(value || '');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadTusFile(file, (percent) => {
        setProgress(percent);
      });

      const uploadedUrl = result?.url || '';
      setInternalValue(uploadedUrl);
      message.success(`Upload de "${file.name}" concluído com sucesso!`);
      if (onChange) {
        onChange(uploadedUrl);
      }
      if (onSuccess) {
        onSuccess(uploadedUrl);
      }
      if (onUploadSuccess) {
        onUploadSuccess(uploadedUrl);
      }
    } catch (err) {
      console.error('Erro no upload Tus:', err);
      message.error(err.message || 'Falha ao realizar upload do arquivo.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase();
    return (
      clean.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) ||
      clean.includes('/files/') ||
      clean.includes('/tusd/') ||
      clean.includes('avatar') ||
      clean.includes('banner')
    );
  };

  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      onChange('');
    }
    if (onSuccess) {
      onSuccess('');
    }
  };

  const displayValue = (value !== undefined && value !== null && value !== '') ? value : internalValue;

  return (
    <div style={{ width: '100%' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={displayValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              if (onChange) onChange(e.target.value);
              if (onSuccess) onSuccess(e.target.value);
            }}
            placeholder={placeholder}
            disabled={disabled || uploading}
            allowClear
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            disabled={disabled || uploading}
          >
            {uploading ? `${progress}%` : 'Upload'}
          </Button>
          {displayValue && (
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={handleClear}
              disabled={disabled || uploading}
              title="Limpar campo"
            />
          )}
        </Space.Compact>

        {uploading && (
          <Progress percent={progress} size="small" status="active" />
        )}

        {showPreview && displayValue && (
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isImageUrl(displayValue) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image
                  src={displayValue}
                  alt="Preview"
                  width={48}
                  height={48}
                  style={{
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9'
                  }}
                  fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>"
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />
                  Arquivo pronto
                </Text>
              </div>
            ) : (
              <a href={displayValue} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PaperClipOutlined /> Visualizar anexo ({displayValue.slice(0, 30)}...)
              </a>
            )}
          </div>
        )}
      </Space>
    </div>
  );
};
