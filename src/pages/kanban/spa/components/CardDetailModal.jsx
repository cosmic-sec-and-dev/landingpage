import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Button, Space, Typography, Form, Input, Select, DatePicker, InputNumber, Switch, Divider, message } from 'antd';
import {
  FilePdfOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TagOutlined,
  PaperClipOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiRequest } from '../../../../services/api';
import { UniversalRichEditor } from '../../../../components/editor/UniversalRichEditor';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const CardDetailModal = ({ open, onCancel, card, columns = [], onCardUpdated, isDark }) => {
  if (!card) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleToggleComplete = async (checked) => {
    setLoading(true);
    try {
      const res = await apiRequest(`/kanban_tasks?id=eq.${card.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_completed: checked,
          completed_at: checked ? new Date().toISOString() : null
        })
      });
      if (res.ok) {
        message.success(checked ? 'Tarefa marcada como concluída!' : 'Tarefa reaberta!');
        if (onCardUpdated) onCardUpdated();
      } else {
        message.error('Falha ao atualizar status da tarefa');
      }
    } catch {
      message.error('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        column_id: values.column_id,
        estimated_hours: values.estimated_hours,
        due_date: values.due_date ? values.due_date.toISOString() : null
      };
      const res = await apiRequest(`/kanban_tasks?id=eq.${card.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        message.success('Cartão atualizado com sucesso!');
        setIsEditing(false);
        if (onCardUpdated) onCardUpdated();
      } else {
        message.error('Falha ao atualizar cartão');
      }
    } catch {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  const currentColumn = columns.find(c => c.id === card.column_id);

  const priorityColorMap = {
    urgent: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'default'
  };

  const tags = Array.isArray(card.tags_json) ? card.tags_json : [];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '24px' }}>
          <span>Detalhes do Cartão</span>
          <Space>
            <Tag color={priorityColorMap[card.priority] || 'blue'}>
              {(card.priority || 'medium').toUpperCase()}
            </Tag>
            {card.is_completed ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>CONCLUÍDO</Tag>
            ) : (
              <Tag color="processing">EM ANDAMENTO</Tag>
            )}
          </Space>
        </div>
      }
      open={open}
      onCancel={() => {
        setIsEditing(false);
        onCancel();
      }}
      footer={[
        !isEditing ? (
          <Button key="edit" icon={<EditOutlined />} onClick={() => {
            form.setFieldsValue({
              title: card.title,
              description: card.description,
              priority: card.priority,
              column_id: card.column_id,
              estimated_hours: card.estimated_hours,
              due_date: card.due_date ? dayjs(card.due_date) : null
            });
            setIsEditing(true);
          }}>
            Editar Cartão
          </Button>
        ) : (
          <Button key="save" type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSaveEdit}>
            Salvar Alterações
          </Button>
        ),
        <Button key="close" type="primary" onClick={onCancel}>
          Fechar
        </Button>
      ]}
      width={720}
      destroyOnHidden
    >
      {!isEditing ? (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ margin: '0 0 8px 0', color: isDark ? '#f8fafc' : '#0f172a' }}>
              {card.title}
            </Title>
            <div
              style={{ color: isDark ? '#cbd5e1' : '#475569', fontSize: '14px', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{
                __html: card.description || '<p style="color: #94a3b8; font-style: italic;">Nenhuma descrição detalhada informada para este cartão.</p>'
              }}
            />
          </div>

          <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', margin: '16px 0' }} />

          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Coluna / Etapa">
              <Tag color={currentColumn?.color_hex || 'blue'}>{currentColumn?.name || 'Não atribuída'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Prioridade">
              <Tag color={priorityColorMap[card.priority] || 'blue'}>{(card.priority || 'medium').toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Data Limite (Due Date)">
              {card.due_date ? (
                <Space>
                  <ClockCircleOutlined />
                  <span>{new Date(card.due_date).toLocaleString('pt-BR')}</span>
                </Space>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Estimativa (Horas)">
              {card.estimated_hours ? `${card.estimated_hours}h` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status de Conclusão" span={2}>
              <Space>
                <Switch
                  checked={card.is_completed}
                  onChange={handleToggleComplete}
                  loading={loading}
                  checkedChildren="Concluído"
                  unCheckedChildren="Pendente"
                />
                {card.completed_at && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Finalizado em: {new Date(card.completed_at).toLocaleString('pt-BR')}
                  </Text>
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Etiquetas (Tags)" span={2}>
              {tags.length > 0 ? (
                <Space size="small" wrap>
                  {tags.map((t, idx) => (
                    <Tag key={idx} icon={<TagOutlined />} color="purple">
                      {typeof t === 'string' ? t : t.name || JSON.stringify(t)}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">Nenhuma etiqueta atribuída</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Criado Em">
              {card.created_at ? new Date(card.created_at).toLocaleString('pt-BR') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Atualizado Em">
              {card.updated_at ? new Date(card.updated_at).toLocaleString('pt-BR') : '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Título da Tarefa" rules={[{ required: true, message: 'Informe o título' }]}>
            <Input placeholder="Título do cartão" />
          </Form.Item>
          <Form.Item name="description" label="Descrição da Tarefa">
            <UniversalRichEditor variant="compact" minHeight={160} placeholder="Detalhes da tarefa, checklists, imagens..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="column_id" label="Coluna de Destino" rules={[{ required: true }]}>
              <Select placeholder="Selecione a coluna">
                {columns.map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="priority" label="Prioridade" rules={[{ required: true }]}>
              <Select>
                <Option value="low">Baixa (Low)</Option>
                <Option value="medium">Média (Medium)</Option>
                <Option value="high">Alta (High)</Option>
                <Option value="urgent">Urgente (Urgent)</Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="due_date" label="Data Limite">
              <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
            <Form.Item name="estimated_hours" label="Horas Estimadas">
              <InputNumber min={0.25} step={0.5} style={{ width: '100%' }} placeholder="Ex: 4.5" />
            </Form.Item>
          </div>
        </Form>
      )}
    </Modal>
  );
};
