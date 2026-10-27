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

export const CatalogBomBillOfMaterialsPage = () => {
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
  if (!hasAccess('Commerce Hub') && !hasAccess('catalog_bom_bill_of_materials')) {
    return (
      <Alert
        message="Plan Restricted Access"
        description="Your current plan does not include access to applet Commerce Hub (/catalog_bom_bill_of_materials)."
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
        "name": "id",
        "type": "string",
        "format": "uuid",
        "example": "",
        "required": false
    },
    {
        "name": "tenant_id",
        "type": "string",
        "format": "uuid",
        "example": "",
        "required": true
    },
    {
        "name": "parent_item_id",
        "type": "string",
        "format": "uuid",
        "example": "",
        "required": true
    },
    {
        "name": "component_item_id",
        "type": "string",
        "format": "uuid",
        "example": "",
        "required": true
    },
    {
        "name": "component_quantity",
        "type": "number",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "scrap_percentage",
        "type": "number",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "yield_factor",
        "type": "number",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "is_subassembly",
        "type": "boolean",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "operation_step",
        "type": "integer",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "instructions",
        "type": "string",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "is_optional",
        "type": "boolean",
        "format": "",
        "example": "",
        "required": false
    },
    {
        "name": "created_at",
        "type": "string",
        "format": "date-time",
        "example": "",
        "required": false
    },
    {
        "name": "updated_at",
        "type": "string",
        "format": "date-time",
        "example": "",
        "required": false
    }
];

  const fetchData = async (queryParams = '') => {
    setLoading(true);
    try {
      const res = await apiRequest('/catalog_bom_bill_of_materials' + queryParams);
      if (res.ok && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      const res = await apiRequest('/catalog_bom_bill_of_materials', {
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
      const res = await apiRequest(`/catalog_bom_bill_of_materials?id=eq.${updatedRecord.id}`, {
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
          const res = await apiRequest(`/catalog_bom_bill_of_materials?id=eq.${record.id}`, {
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
        tag="Commerce Hub"
        title="Catalog Bom Bill Of Materials"
        description="engineering bill of materials decomposing manufactured products and dishes into raw ingredients"
        count={data.length}
      />

      <CrudHeader
        title="Catalog Bom Bill Of Materials"
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
        title="Search in /catalog_bom_bill_of_materials"
        onCancel={() => setSearchModalOpen(false)}
        onApply={handleApplyAdvancedFilters}
      />

      <AddModal
        open={addModalOpen}
        fields={fieldsConfig}
        title="Add to /catalog_bom_bill_of_materials"
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
