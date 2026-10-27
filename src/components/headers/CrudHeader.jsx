import React from 'react';
import { Button, Space, Input } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Search } = Input;

export const CrudHeader = ({
  onSearch,
  onOpenSearchModal,
  onOpenAddModal,
  onAdd,
  onRefresh,
  allowAdd = true
}) => {
  const handleAddClick = onOpenAddModal || onAdd;
  const handleSearchModalClick = onOpenSearchModal || onSearch;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
      <Space>
        <Search
          placeholder="Busca rápida..."
          allowClear
          onSearch={onSearch}
          style={{ width: 260 }}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearchModalClick}>
          Filtros Avançados
        </Button>
        <Button icon={<ReloadOutlined />} onClick={onRefresh} />
      </Space>
      <Space>
        {allowAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
            Adicionar Registro
          </Button>
        )}
      </Space>
    </div>
  );
};

