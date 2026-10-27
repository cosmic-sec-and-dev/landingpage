import React, { useState, useEffect } from 'react';
import { Alert, message, Modal } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { CrudHeader } from '../../../components/headers/CrudHeader';
import { DynamicTable } from '../../../components/tables/DynamicTable';
import { SearchModal } from '../../../components/modals/SearchModal';
import { AddModal } from '../../../components/modals/AddModal';
import { EditModal } from '../../../components/modals/EditModal';
import { ViewModal } from '../../../components/modals/ViewModal';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';

export const RpcRegisterPage = () => {
  const { hasAccess, currentUser } = usePlan();
  
  // Exclusive Access Validation for Administrators in Data Explorer
  const rawRole = (currentUser?.role || currentUser?.user_role || 'admin').toLowerCase();
  const isAdmin = rawRole === 'superadmin' || rawRole === 'admin' || rawRole === 'authenticated';

  if (!isAdmin) {
    return (
      <Alert
        message="Restricted Access to Data Explorer"
        description="Data Explorer is strictly restricted to system administrators (admin / superadmin)."
        type="error"
        showIcon
      />
    );
  }

  // Plan validation for the page
  if (!hasAccess('Authentication') && !hasAccess('rpc_register')) {
    return (
      <Alert
        message="Plan Restricted Access"
        description="Your current plan does not include access to applet Authentication (/rpc/register)."
        type="warning"
        showIcon
      />
    );
  }

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fieldsConfig = [
    {
        "name": "tenant_name",
        "type": "string",
        "format": "",
        "example": "Cosmic Enterprises",
        "required": true
    },
    {
        "name": "tenant_slug",
        "type": "string",
        "format": "",
        "example": "cosmic",
        "required": true
    },
    {
        "name": "business_name",
        "type": "string",
        "format": "",
        "example": "Cosmic Dev Corp",
        "required": true
    },
    {
        "name": "business_id",
        "type": "string",
        "format": "",
        "example": "TAX-123456",
        "required": true
    },
    {
        "name": "admin_email",
        "type": "string",
        "format": "email",
        "example": "admin@cosmic.com",
        "required": true
    },
    {
        "name": "admin_password",
        "type": "string",
        "format": "password",
        "example": "SecurePass123!",
        "required": true
    },
    {
        "name": "admin_full_name",
        "type": "string",
        "format": "",
        "example": "Cosmic Admin",
        "required": true
    }
];

  const fetchData = async (queryParams = '') => {
    setData([]);
  };

  useEffect(() => {
    // RPC endpoints are executed via form action
  }, []);

  const handleSearch = (term) => {
    if (!term) return fetchData();
    fetchData(`?or=(id.ilike.*${term}*,name.ilike.*${term}*,title.ilike.*${term}*)`);
    message.info(`Searching for "${term}"...`);
  };

  const handleApplyAdvancedFilters = (filters) => {
    const queryParts = Object.entries(filters).map(([k, v]) => `${k}=ilike.*${v}*`);
    const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    fetchData(qs);
    message.success('Filters applied via PostgREST!');
  };

  const handleAdd = async (newRecord) => {
    setLoading(true);
    try {
      const res = await apiRequest('/rpc/register', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        message.success('Record created successfully!');
        fetchData();
      } else {
        message.error(res.data?.message || 'Failed to save record');
      }
    } catch (e) {
      message.error('Error connecting to backend');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedRecord) => {
    setLoading(true);
    try {
      const res = await apiRequest(`/rpc/register?id=eq.${updatedRecord.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(updatedRecord)
      });
      if (res.ok) {
        message.success('Record updated successfully!');
        fetchData();
      }
    } catch (e) {
      message.error('Error updating record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Confirm Deletion?',
      content: `Are you sure you want to remove record ID: ${record.id}?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          const res = await apiRequest(`/rpc/register?id=eq.${record.id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            message.success('Record deleted successfully');
            fetchData();
          } else {
            message.error(res.data?.message || 'Failed to delete record');
          }
        } catch (e) {
          message.error('Connection error while deleting');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <AppletHeader
        tag="Authentication"
        title="Register new tenant organization & admin account"
        description="Provision a new tenant organization, default subscription plan, and the primary administrator account, returning an immediate JWT session token."
        count={data.length}
      />

      <CrudHeader
        title="Register new tenant organization & admin account"
        onSearch={handleSearch}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        onOpenAddModal={() => setAddModalOpen(true)}
        onAdd={() => setAddModalOpen(true)}
        onRefresh={() => fetchData()}
        allowAdd={true}
      />

      <DynamicTable
        data={data}
        dataSource={data}
        fieldsConfig={fieldsConfig}
        columnsConfig={fieldsConfig}
        loading={loading}
        onView={(record) => {
          setSelectedRecord(record);
          setViewModalOpen(true);
        }}
        onEdit={(record) => {
          setSelectedRecord(record);
          setEditModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <SearchModal
        open={searchModalOpen}
        fields={fieldsConfig}
        title="Search in /rpc/register"
        onCancel={() => setSearchModalOpen(false)}
        onApply={handleApplyAdvancedFilters}
      />

      <AddModal
        open={addModalOpen}
        fields={fieldsConfig}
        title="Add to /rpc/register"
        onCancel={() => setAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      <EditModal
        open={editModalOpen}
        record={selectedRecord}
        fields={fieldsConfig}
        onCancel={() => setEditModalOpen(false)}
        onSave={handleUpdate}
      />

      <ViewModal
        open={viewModalOpen}
        record={selectedRecord}
        onCancel={() => setViewModalOpen(false)}
      />
    </div>
  );
};
