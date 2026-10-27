import React from 'react';
import { Modal, Descriptions, Tag, Button, Space, Image, Typography, Tooltip } from 'antd';
import { FilePdfOutlined, CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

const isImageUrl = (val) => {
  if (!val || typeof val !== 'string') return false;
  const clean = val.split('?')[0].toLowerCase();
  return (
    clean.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) ||
    clean.startsWith('/files/') ||
    clean.startsWith('/tusd/')
  );
};

export const ViewModal = ({ open, onCancel, record }) => {
  if (!record) return null;

  const handleExportPdf = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const rowsHtml = Object.entries(record).map(([key, val]) => {
      let displayVal = '-';
      if (val !== null && val !== undefined) {
        if (typeof val === 'boolean') {
          displayVal = val ? '<span style="color:#16a34a;font-weight:bold;">Sim</span>' : '<span style="color:#dc2626;font-weight:bold;">Não</span>';
        } else if (typeof val === 'object') {
          displayVal = `<pre style="margin:0;font-family:monospace;font-size:11px;background:#f8fafc;padding:6px;border-radius:4px;border:1px solid #e2e8f0;">${JSON.stringify(val, null, 2)}</pre>`;
        } else if (isImageUrl(val)) {
          displayVal = `<img src="${val}" style="max-height:80px;border-radius:4px;border:1px solid #e2e8f0;" alt="${key}" /><br/><span style="font-size:10px;color:#64748b;">${val}</span>`;
        } else {
          displayVal = String(val);
        }
      }
      return `
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; width: 30%; background: #f8fafc; border: 1px solid #e2e8f0; color: #334155; font-size: 12px; vertical-align: top;">
            ${key.replace(/_/g, ' ').toUpperCase()}
          </td>
          <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #0f172a; font-size: 12px; word-break: break-word;">
            ${displayVal}
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Selene - Detalhes do Registro ${record.id ? `(${record.id})` : ''}</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              @page { margin: 12mm; size: auto; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; padding: 24px; background: #fff; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 24px; }
            .brand { font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: 0.5px; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 2px; }
            .meta-box { text-align: right; }
            .meta-title { font-size: 13px; font-weight: 600; color: #1e293b; }
            .meta-time { font-size: 11px; color: #64748b; }
            .doc-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">SELENE</div>
              <div class="subtitle">Multi-Tenant Cloud Operations Platform</div>
            </div>
            <div class="meta-box">
              <div class="meta-title">Relatório de Detalhes do Registro</div>
              <div class="meta-time">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
            </div>
          </div>
          <div class="doc-title">Identificação do Registro ${record.id ? `(#${record.id})` : ''}</div>
          <table>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            Documento emitido automaticamente pelo Selene. Todos os direitos reservados.
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(String(text));
  };

  return (
    <Modal
      title="Detalhes do Registro"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button
          key="pdf"
          icon={<FilePdfOutlined />}
          onClick={handleExportPdf}
          style={{ borderColor: '#ef4444', color: '#ef4444' }}
        >
          Gerar PDF
        </Button>,
        <Button key="close" type="primary" onClick={onCancel}>
          Fechar
        </Button>
      ]}
      width={800}
      style={{ maxWidth: '95vw' }}
      destroyOnHidden
    >
      <Descriptions bordered column={1} size="small" styles={{ label: { width: '28%', fontWeight: 600 } }}>
        {Object.entries(record).map(([key, val]) => (
          <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
            {val === null || val === undefined ? (
              <Text type="secondary">-</Text>
            ) : typeof val === 'boolean' ? (
              <Tag color={val ? 'green' : 'red'}>{val ? 'Sim' : 'Não'}</Tag>
            ) : typeof val === 'object' ? (
              <div style={{ position: 'relative' }}>
                <pre style={{
                  margin: 0,
                  fontSize: '12px',
                  maxHeight: '220px',
                  overflow: 'auto',
                  background: '#f8fafc',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  {JSON.stringify(val, null, 2)}
                </pre>
                <Tooltip title="Copiar JSON">
                  <Button
                    size="small"
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(JSON.stringify(val, null, 2))}
                    style={{ position: 'absolute', top: 4, right: 4 }}
                  />
                </Tooltip>
              </div>
            ) : isImageUrl(val) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Image
                  src={val}
                  alt={key}
                  width={64}
                  height={64}
                  style={{ objectFit: 'cover', borderRadius: '6px', border: '1px solid #d9d9d9' }}
                  fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>"
                />
                <Text code style={{ fontSize: '11px', wordBreak: 'break-all' }}>{val}</Text>
              </div>
            ) : String(val).length > 80 ? (
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.5
              }}>
                {String(val)}
              </div>
            ) : (
              <span style={{ wordBreak: 'break-word' }}>{String(val)}</span>
            )}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Modal>
  );
};
