import React, { useState } from 'react';
import {
  Typography, Space, Row, Col, Card, Button, Input, Select, DatePicker,
  Switch, Checkbox, Table, Tag, Progress, Modal, Drawer, message,
  notification, Popconfirm, Tabs, Alert, Statistic
} from 'antd';
import {
  SearchOutlined, ArrowUpOutlined, RocketOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { usePlan } from '../context/PlanContext';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export const AntTestPage = () => {
  const { hasAccess } = usePlan();
  
  // Validação IF de plano para a página de teste
  if (!hasAccess('AntTest')) {
    return (
      <Alert
        message="Acesso Restrito ao Applet"
        description="Seu plano atual não possui acesso à suíte de testes Ant Design."
        type="warning"
        showIcon
      />
    );
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const demoColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'COMPONENTE', dataIndex: 'name', key: 'name' },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'Ativo' ? 'green' : 'blue'}>{s}</Tag> },
    { title: 'SCORE', dataIndex: 'score', key: 'score', render: (v) => <Progress percent={v} size="small" /> }
  ];

  const demoData = [
    { id: 1, name: 'Ant Design Table', status: 'Ativo', score: 100 },
    { id: 2, name: 'Procedural CRUD Engine', status: 'Ativo', score: 100 },
    { id: 3, name: 'PostgREST Gateway Client', status: 'Ativo', score: 95 }
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={2} style={{ margin: 0 }}>Ant Design Showcase & Test Suite</Title>
        <Paragraph type="secondary">
          Página de teste validando os componentes essenciais do Ant Design (Layout, Botões, Formulários, Modais, Tabelas e Feedback) integrados ao motor procedural do <code>selene_frontend</code>.
        </Paragraph>
      </div>

      <Tabs defaultActiveKey="1" items={[
        {
          key: '1',
          label: 'Geral & Formulários',
          children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Botões & Ações">
                  <Space wrap direction="vertical" style={{ width: '100%' }}>
                    <Space wrap>
                      <Button type="primary">Primary</Button>
                      <Button>Default</Button>
                      <Button type="dashed">Dashed</Button>
                      <Button danger type="primary">Danger</Button>
                    </Space>
                    <Space wrap>
                      <Button icon={<SearchOutlined />} type="primary">Buscar</Button>
                      <Button icon={<RocketOutlined />}>Executar Ação</Button>
                    </Space>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Entrada de Dados (Form Controls)">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input placeholder="Input de Texto Padrão" allowClear />
                    <Input.Password placeholder="Input de Senha" />
                    <Select defaultValue="enterprise" style={{ width: '100%' }}>
                      <Option value="free">Plano Free</Option>
                      <Option value="pro">Plano Pro</Option>
                      <Option value="enterprise">Plano Enterprise</Option>
                    </Select>
                    <DatePicker style={{ width: '100%' }} />
                    <Space>
                      <Text>Ativar RLS:</Text>
                      <Switch defaultChecked />
                      <Checkbox defaultChecked>Lembrar Sessão</Checkbox>
                    </Space>
                  </Space>
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: '2',
          label: 'Tabelas & Estatísticas',
          children: (
            <div>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card>
                    <Statistic title="Tenants Ativos" value={142} prefix={<ArrowUpOutlined />} valueStyle={{ color: '#3f8600' }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic title="Requisições / Seg" value={3520} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic title="Health Score" value={99.9} suffix="%" />
                  </Card>
                </Col>
              </Row>
              <Card title="Tabela de Dados Ant Design">
                <Table columns={demoColumns} dataSource={demoData} rowKey="id" pagination={false} bordered />
              </Card>
            </div>
          )
        },
        {
          key: '3',
          label: 'Modais & Feedback',
          children: (
            <Card title="Modais, Drawers e Notificações">
              <Space wrap>
                <Button type="primary" onClick={() => setModalOpen(true)}>Abrir Modal de Teste</Button>
                <Button onClick={() => setDrawerOpen(true)}>Abrir Drawer Lateral</Button>
                <Button onClick={() => message.success('Toast message exibido com sucesso!')}>Toast Message</Button>
                <Button onClick={() => notification.info({ message: 'Notificação', description: 'RLS configurado com sucesso.' })}>
                  Notification
                </Button>
                <Popconfirm title="Confirma a execução?" onConfirm={() => message.info('Confirmado!')}>
                  <Button danger>Popconfirm</Button>
                </Popconfirm>
              </Space>

              <Modal title="Modal de Teste" open={modalOpen} onOk={() => setModalOpen(false)} onCancel={() => setModalOpen(false)}>
                <p>Este é um modal de confirmação procedural gerado pelo Ant Design.</p>
              </Modal>

              <Drawer title="Drawer Lateral" placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen}>
                <p>Conteúdo do painel lateral de detalhes ou filtros avançados.</p>
              </Drawer>
            </Card>
          )
        }
      ]} />
    </div>
  );
};
