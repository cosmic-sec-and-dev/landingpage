import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, Select, Modal, Form, Input, InputNumber, Tooltip, Empty, Badge, message } from 'antd';
import {
  PlusOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EllipsisOutlined,
  TagOutlined,
  FolderAddOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAppTheme } from '../../../../context/ThemeContext';
import { apiRequest } from '../../../../services/api';
import { CardDetailModal } from './CardDetailModal';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export const KanbanBoardView = ({
  boards = [],
  columns = [],
  tasks = [],
  onRefresh,
  loading
}) => {
  const { isDark } = useAppTheme();
  const [selectedBoardId, setSelectedBoardId] = useState(boards.length > 0 ? boards[0].id : null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addBoardModalOpen, setAddBoardModalOpen] = useState(false);
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState(null);

  const [boardForm] = Form.useForm();
  const [columnForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  // Active Board
  const activeBoard = boards.find(b => b.id === selectedBoardId) || (boards.length > 0 ? boards[0] : null);
  const currentBoardId = activeBoard ? activeBoard.id : null;

  // Filter columns and tasks for current board
  const boardColumns = columns
    .filter(c => c.board_id === currentBoardId)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const boardTasks = tasks.filter(t => t.board_id === currentBoardId);

  // Move task to adjacent column
  const handleMoveTask = async (task, direction) => {
    const colIndex = boardColumns.findIndex(c => c.id === task.column_id);
    if (colIndex === -1) return;

    const targetIndex = direction === 'right' ? colIndex + 1 : colIndex - 1;
    if (targetIndex < 0 || targetIndex >= boardColumns.length) return;

    const newColumn = boardColumns[targetIndex];
    try {
      const res = await apiRequest(`/kanban_tasks?id=eq.${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ column_id: newColumn.id })
      });
      if (res.ok) {
        message.success(`Tarefa movida para "${newColumn.name}"`);
        if (onRefresh) onRefresh();
      } else {
        message.error('Falha ao mover tarefa');
      }
    } catch {
      message.error('Erro de conexão');
    }
  };

  // Quick toggle completion
  const handleToggleTaskComplete = async (task, e) => {
    e.stopPropagation();
    const newStatus = !task.is_completed;
    try {
      const res = await apiRequest(`/kanban_tasks?id=eq.${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null
        })
      });
      if (res.ok) {
        message.success(newStatus ? 'Tarefa concluída!' : 'Tarefa reaberta');
        if (onRefresh) onRefresh();
      }
    } catch {
      message.error('Erro ao atualizar status');
    }
  };

  // Add new Board
  const handleCreateBoard = async () => {
    try {
      const values = await boardForm.validateFields();
      const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await apiRequest('/kanban_boards', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          slug: slug || `board-${Date.now()}`,
          description: values.description,
          color_hex: values.color_hex || '#3B82F6',
          privacy_type: values.privacy_type || 'public_tenant'
        })
      });
      if (res.ok) {
        message.success('Quadro criado com sucesso!');
        setAddBoardModalOpen(false);
        boardForm.resetFields();
        if (onRefresh) onRefresh();
      } else {
        message.error(res.data?.message || 'Falha ao criar quadro');
      }
    } catch {}
  };

  // Add new Column
  const handleCreateColumn = async () => {
    if (!currentBoardId) {
      message.warning('Selecione um quadro primeiro');
      return;
    }
    try {
      const values = await columnForm.validateFields();
      const nextPos = boardColumns.length;
      const res = await apiRequest('/kanban_board_columns', {
        method: 'POST',
        body: JSON.stringify({
          board_id: currentBoardId,
          name: values.name,
          position: nextPos,
          wip_limit: values.wip_limit || null,
          color_hex: values.color_hex || '#64748B'
        })
      });
      if (res.ok) {
        message.success('Coluna adicionada!');
        setAddColumnModalOpen(false);
        columnForm.resetFields();
        if (onRefresh) onRefresh();
      } else {
        message.error('Falha ao adicionar coluna');
      }
    } catch {}
  };

  // Open Add Task Modal
  const handleOpenAddTaskModal = (colId) => {
    const selectedColId = colId || (boardColumns.length > 0 ? boardColumns[0].id : null);
    setTargetColumnId(selectedColId);
    taskForm.resetFields();
    taskForm.setFieldsValue({
      column_id: selectedColId,
      priority: 'medium'
    });
    setAddTaskModalOpen(true);
  };

  // Add new Task
  const handleCreateTask = async () => {
    try {
      const values = await taskForm.validateFields();
      const colId = values.column_id || targetColumnId;
      if (!currentBoardId || !colId) {
        message.warning('Selecione um quadro e uma coluna válida');
        return;
      }
      const colTasks = boardTasks.filter(t => t.column_id === colId);
      const res = await apiRequest('/kanban_tasks', {
        method: 'POST',
        body: JSON.stringify({
          board_id: currentBoardId,
          column_id: colId,
          title: values.title,
          description: values.description || null,
          priority: values.priority || 'medium',
          position: colTasks.length,
          estimated_hours: values.estimated_hours || null,
          tags_json: []
        })
      });
      if (res.ok) {
        message.success('Cartão adicionado com sucesso!');
        setAddTaskModalOpen(false);
        taskForm.resetFields();
        if (onRefresh) onRefresh();
      } else {
        const errorMsg = res.data?.message || res.data?.error || res.data?.details || 'Falha ao criar cartão';
        message.error(errorMsg);
      }
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Erro ao criar cartão');
    }
  };

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#3b82f6',
    low: '#64748b'
  };

  return (
    <div>
      {/* Board Selector & Header Bar */}
      <Card
        style={{
          background: isDark ? 'rgba(26, 35, 56, 0.75)' : '#ffffff',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '20px'
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Space size="middle" align="center">
            <ProjectOutlined style={{ fontSize: '24px', color: '#38bdf8' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Select
                  value={currentBoardId}
                  onChange={setSelectedBoardId}
                  style={{ width: 280 }}
                  placeholder="Selecione um quadro"
                >
                  {boards.map(b => (
                    <Option key={b.id} value={b.id}>
                      <Space>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: b.color_hex || '#3b82f6' }} />
                        {b.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
                {activeBoard && (
                  <Tag color="blue">{activeBoard.privacy_type?.toUpperCase() || 'PUBLIC'}</Tag>
                )}
              </div>
              {activeBoard?.description && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {activeBoard.description}
                </Text>
              )}
            </div>
          </Space>

          <Space wrap>
            <Button
              icon={<FolderAddOutlined />}
              onClick={() => setAddBoardModalOpen(true)}
            >
              Novo Quadro
            </Button>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              disabled={!currentBoardId}
              onClick={() => setAddColumnModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)', border: 0 }}
            >
              Nova Coluna
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={loading}
            />
          </Space>
        </div>
      </Card>

      {/* Kanban Board Horizontal Columns */}
      {!currentBoardId || boardColumns.length === 0 ? (
        <Card
          style={{
            background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
            border: isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed #cbd5e1',
            borderRadius: '12px',
            textAlign: 'center',
            padding: '40px 20px'
          }}
        >
          <Empty
            description={
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {boards.length === 0 ? 'Nenhum quadro Kanban cadastrado no sistema.' : 'Este quadro ainda não possui colunas no fluxo.'}
              </span>
            }
          >
            {boards.length === 0 ? (
              <Button type="primary" icon={<FolderAddOutlined />} onClick={() => setAddBoardModalOpen(true)}>
                Criar Primeiro Quadro
              </Button>
            ) : (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddColumnModalOpen(true)}>
                Criar Primeira Coluna
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <div style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '20px',
          minHeight: 'calc(100vh - 360px)',
          alignItems: 'flex-start'
        }}>
          {boardColumns.map((col, colIdx) => {
            const colTasks = boardTasks.filter(t => t.column_id === col.id);
            const isOverWip = col.wip_limit && colTasks.length > col.wip_limit;

            return (
              <div
                key={col.id}
                style={{
                  minWidth: '320px',
                  width: '320px',
                  background: isDark ? 'rgba(26, 35, 56, 0.85)' : '#f1f5f9',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 340px)',
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '14px 16px',
                  borderTop: `4px solid ${col.color_hex || '#38bdf8'}`,
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Text strong style={{ fontSize: '15px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                      {col.name}
                    </Text>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                      <Tag color={isOverWip ? 'error' : 'default'} style={{ fontSize: '11px', margin: 0 }}>
                        {colTasks.length} {col.wip_limit ? `/ ${col.wip_limit} (WIP)` : 'tarefas'}
                      </Tag>
                    </div>
                  </div>

                  <Button
                    size="small"
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenAddTaskModal(col.id)}
                    style={{ color: isDark ? '#94a3b8' : '#64748b' }}
                  />
                </div>

                {/* Task Cards List */}
                <div style={{
                  padding: '12px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: isDark ? '#64748b' : '#94a3b8', fontSize: '12px' }}>
                      Nenhum cartão nesta etapa
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const tags = Array.isArray(task.tags_json) ? task.tags_json : [];
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedCard(task);
                            setDetailModalOpen(true);
                          }}
                          style={{
                            background: isDark ? 'rgba(26, 35, 56, 0.9)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            opacity: task.is_completed ? 0.65 : 1
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDark ? '0 6px 16px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Priority and Actions Bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <Tag
                              color={priorityColors[task.priority] || 'blue'}
                              style={{ fontSize: '10px', textTransform: 'uppercase', borderRadius: '4px', margin: 0 }}
                            >
                              {task.priority || 'medium'}
                            </Tag>

                            <Space size={2} onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="small"
                                type="text"
                                disabled={colIdx === 0}
                                icon={<ArrowLeftOutlined style={{ fontSize: '11px' }} />}
                                onClick={() => handleMoveTask(task, 'left')}
                              />
                              <Button
                                size="small"
                                type="text"
                                disabled={colIdx === boardColumns.length - 1}
                                icon={<ArrowRightOutlined style={{ fontSize: '11px' }} />}
                                onClick={() => handleMoveTask(task, 'right')}
                              />
                            </Space>
                          </div>

                          {/* Title */}
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            textDecoration: task.is_completed ? 'line-through' : 'none',
                            marginBottom: '4px'
                          }}>
                            {task.title}
                          </div>

                          {/* Description preview */}
                          {task.description && (
                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{
                                fontSize: '12px',
                                color: isDark ? '#94a3b8' : '#64748b',
                                margin: '0 0 8px 0'
                              }}
                            >
                              {task.description}
                            </Paragraph>
                          )}

                          {/* Tags */}
                          {tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                              {tags.slice(0, 3).map((t, idx) => (
                                <Tag key={idx} color="purple" style={{ fontSize: '10px', margin: 0 }}>
                                  {typeof t === 'string' ? t : t.name || 'tag'}
                                </Tag>
                              ))}
                            </div>
                          )}

                          {/* Footer Info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {task.due_date ? (
                              <Space size={4}>
                                <ClockCircleOutlined />
                                <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                              </Space>
                            ) : <span />}

                            {task.estimated_hours && (
                              <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
                                {task.estimated_hours}h
                              </Tag>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Card Footer */}
                <div style={{ padding: '8px 12px', borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0' }}>
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenAddTaskModal(col.id)}
                    style={{ fontSize: '12px' }}
                  >
                    Adicionar Cartão
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Card Detail / Edit Modal */}
      <CardDetailModal
        open={detailModalOpen}
        card={selectedCard}
        columns={boardColumns}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedCard(null);
        }}
        onCardUpdated={() => {
          if (onRefresh) onRefresh();
          setDetailModalOpen(false);
          setSelectedCard(null);
        }}
        isDark={isDark}
      />

      {/* Add Board Modal */}
      <Modal
        title="Criar Novo Quadro Kanban"
        open={addBoardModalOpen}
        onCancel={() => setAddBoardModalOpen(false)}
        onOk={handleCreateBoard}
        okText="Criar Quadro"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={boardForm} layout="vertical">
          <Form.Item name="name" label="Nome do Quadro" rules={[{ required: true, message: 'Informe o nome do quadro' }]}>
            <Input placeholder="Ex: Roadmap de Produto 2026" />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} placeholder="Objetivos e escopo do quadro..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="privacy_type" label="Privacidade" initialValue="public_tenant">
              <Select>
                <Option value="public_tenant">Público na Organização</Option>
                <Option value="private">Privado aos Membros</Option>
              </Select>
            </Form.Item>
            <Form.Item name="color_hex" label="Cor do Tema" initialValue="#3B82F6">
              <Select>
                <Option value="#3B82F6">Azul Tech (#3B82F6)</Option>
                <Option value="#10B981">Verde Sucesso (#10B981)</Option>
                <Option value="#8B5CF6">Roxo Moderno (#8B5CF6)</Option>
                <Option value="#F59E0B">Âmbar Destaque (#F59E0B)</Option>
                <Option value="#EC4899">Rosa Vibrante (#EC4899)</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Add Column Modal */}
      <Modal
        title="Adicionar Nova Coluna / Etapa"
        open={addColumnModalOpen}
        onCancel={() => setAddColumnModalOpen(false)}
        onOk={handleCreateColumn}
        okText="Adicionar Coluna"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={columnForm} layout="vertical">
          <Form.Item name="name" label="Nome da Etapa" rules={[{ required: true, message: 'Informe o nome da etapa' }]}>
            <Input placeholder="Ex: Em Homologação, Code Review..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="wip_limit" label="Limite WIP (Opcional)">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Sem limite" />
            </Form.Item>
            <Form.Item name="color_hex" label="Cor da Etapa" initialValue="#38BDF8">
              <Select>
                <Option value="#38BDF8">Ciano (#38BDF8)</Option>
                <Option value="#10B981">Verde (#10B981)</Option>
                <Option value="#F59E0B">Laranja (#F59E0B)</Option>
                <Option value="#EF4444">Vermelho (#EF4444)</Option>
                <Option value="#8B5CF6">Roxo (#8B5CF6)</Option>
                <Option value="#64748B">Cinza (#64748B)</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        title="Novo Cartão no Quadro"
        open={addTaskModalOpen}
        onCancel={() => setAddTaskModalOpen(false)}
        onOk={handleCreateTask}
        okText="Criar Cartão"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={taskForm} layout="vertical">
          <Form.Item
            name="column_id"
            label="Coluna / Etapa"
            rules={[{ required: true, message: 'Selecione a etapa' }]}
            initialValue={targetColumnId || (boardColumns.length > 0 ? boardColumns[0].id : undefined)}
          >
            <Select placeholder="Selecione a etapa">
              {boardColumns.map(col => (
                <Option key={col.id} value={col.id}>
                  {col.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="title" label="Título da Tarefa" rules={[{ required: true, message: 'Informe o título do cartão' }]}>
            <Input placeholder="O que precisa ser feito?" />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={3} placeholder="Instruções, critérios de aceite..." />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="priority" label="Prioridade" initialValue="medium">
              <Select>
                <Option value="low">Baixa (Low)</Option>
                <Option value="medium">Média (Medium)</Option>
                <Option value="high">Alta (High)</Option>
                <Option value="urgent">Urgente (Urgent)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="estimated_hours" label="Horas Estimadas">
              <InputNumber min={0.25} step={0.5} style={{ width: '100%' }} placeholder="Ex: 2.5" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
