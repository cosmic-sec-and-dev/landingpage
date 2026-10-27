import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  message
} from 'antd';
import {
  CodeOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';

const { TextArea, Search } = Input;
const { Text, Title } = Typography;

export const JsonQueryTesterModal = ({
  visible,
  record,
  onClose
}) => {
  const { isDark } = useAppTheme();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [currentData, setCurrentData] = useState(record?.data || null);

  useEffect(() => {
    if (record) {
      setQuery('');
      if (record.id && record.data === undefined) {
        setResult('Carregando payload JSON...');
        apiRequest(`/json_boxes?id=eq.${record.id}&select=id,slug,name,data,metadata`)
          .then(res => {
            if (res.ok && Array.isArray(res.data) && res.data[0]) {
              setCurrentData(res.data[0].data);
              setResult(res.data[0].data ? JSON.stringify(res.data[0].data, null, 2) : 'null');
            }
          })
          .catch(() => {
            setResult('Erro ao carregar dados do documento');
          });
      } else {
        setCurrentData(record.data || null);
        setResult(record.data ? JSON.stringify(record.data, null, 2) : 'null');
      }
    }
  }, [record, visible]);

  const handleRunQuery = () => {
    if (!record || !currentData) {
      setResult('Documento sem dados');
      return;
    }

    if (!query.trim()) {
      setResult(JSON.stringify(currentData, null, 2));
      return;
    }

    try {
      // Evaluate dot notation or simple expression
      const data = currentData;
      const metadata = record.metadata;
      // Safe extraction using Function
      const fn = new Function('data', 'metadata', `return (${query.startsWith('data') || query.startsWith('metadata') ? query : 'data.' + query});`);
      const output = fn(data, metadata);
      setResult(typeof output === 'object' ? JSON.stringify(output, null, 2) : String(output));
    } catch (err) {
      setResult(`Erro na consulta: ${err.message}`);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CodeOutlined style={{ color: '#0284c7' }} />
          <span>Testador de Consultas JSON: <strong>{record?.name}</strong></span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>
      ]}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
          Digite uma propriedade ou expressão de consulta JS (ex: <code>site_title</code>, <code>data.items[0].title</code>, <code>metadata.version</code>):
        </Text>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="Ex: notifications.email ou data.rollout_percentage"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={handleRunQuery}
          />
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRunQuery}>
            Executar
          </Button>
        </Space.Compact>
      </div>

      <Row gutter={16}>
        <Col span={24}>
          <Card
            type="inner"
            title="Resultado da Avaliação"
            extra={
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  message.success('Resultado copiado!');
                }}
              >
                Copiar
              </Button>
            }
            style={{
              background: isDark ? '#0f172a' : '#f8fafc',
              borderColor: isDark ? '#334155' : '#e2e8f0'
            }}
          >
            <pre style={{
              margin: 0,
              maxHeight: 340,
              overflow: 'auto',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.5,
              color: isDark ? '#38bdf8' : '#0369a1'
            }}>
              {result}
            </pre>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};
