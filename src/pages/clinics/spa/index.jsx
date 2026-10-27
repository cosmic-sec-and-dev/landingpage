import React, { useState, useEffect } from 'react';
import { Spin, Alert, message } from 'antd';
import { AppletHeader } from '../../../components/headers/AppletHeader';
import { usePlan } from '../../../context/PlanContext';
import { apiRequest } from '../../../services/api';
import { MainAppView } from './views/MainAppView';

export const ClinicsSpaPage = () => {
  const { hasAccess } = usePlan();

  if (!hasAccess('Clinics') && !hasAccess('clinic_appointments') && !hasAccess('clinics')) {
    return (
      <Alert
        message="Acesso Restrito ao Plano"
        description="Seu plano atual não inclui acesso ao applet Clínicas e Consultórios."
        type="warning"
        showIcon
      />
    );
  }

  const [moduleData, setModuleData] = useState({
    appointments: [],
    professionals: [],
    patientRecords: [],
    services: [],
    rooms: [],
    specialties: [],
    treatmentPlans: [],
    queueTickets: [],
    routings: [],
    users: [],
    currentUser: null
  });
  const [loading, setLoading] = useState(false);

  const fetchAllClinicsData = async () => {
    setLoading(true);
    try {
      const [
        appsRes,
        profsRes,
        recordsRes,
        servicesRes,
        roomsRes,
        specRes,
        plansRes,
        ticketsRes,
        routingsRes,
        usersRes,
        meRes
      ] = await Promise.all([
        apiRequest('/clinic_appointments?order=appointment_date.desc,start_time.asc'),
        apiRequest('/clinic_professionals'),
        apiRequest('/clinic_patient_records?order=created_at.desc'),
        apiRequest('/catalog_items?item_type=eq.service&is_active=eq.true'),
        apiRequest('/clinic_rooms'),
        apiRequest('/clinic_specialties'),
        apiRequest('/clinic_treatment_plans'),
        apiRequest('/clinic_queue_tickets?order=issued_at.desc&limit=100'),
        apiRequest('/clinic_ticket_routings?order=routed_at.desc&limit=100'),
        apiRequest('/users'),
        apiRequest('/me')
      ]);

      const meData = meRes.ok && meRes.data
        ? (Array.isArray(meRes.data) ? meRes.data[0] : meRes.data)
        : null;

      setModuleData({
        appointments: appsRes.ok && Array.isArray(appsRes.data) ? appsRes.data : [],
        professionals: profsRes.ok && Array.isArray(profsRes.data) ? profsRes.data : [],
        patientRecords: recordsRes.ok && Array.isArray(recordsRes.data) ? recordsRes.data : [],
        services: servicesRes.ok && Array.isArray(servicesRes.data) ? servicesRes.data : [],
        rooms: roomsRes.ok && Array.isArray(roomsRes.data) ? roomsRes.data : [],
        specialties: specRes.ok && Array.isArray(specRes.data) ? specRes.data : [],
        treatmentPlans: plansRes.ok && Array.isArray(plansRes.data) ? plansRes.data : [],
        queueTickets: ticketsRes.ok && Array.isArray(ticketsRes.data) ? ticketsRes.data : [],
        routings: routingsRes.ok && Array.isArray(routingsRes.data) ? routingsRes.data : [],
        users: usersRes.ok && Array.isArray(usersRes.data) ? usersRes.data : [],
        currentUser: meData
      });
    } catch {
      message.error('Erro ao carregar dados do Applet Clínico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClinicsData();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <AppletHeader
          tag="Clinics"
          title="Gestão de Clínicas, Consultórios & Saúde"
          description="Controle integrado de senhas, roteamento de salas append-only, agendamentos, prontuário PEP e faturamento unificado."
          count={moduleData.appointments.length}
        />
      </div>

      {loading && moduleData.appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <MainAppView
          appointments={moduleData.appointments}
          professionals={moduleData.professionals}
          patientRecords={moduleData.patientRecords}
          services={moduleData.services}
          rooms={moduleData.rooms}
          specialties={moduleData.specialties}
          treatmentPlans={moduleData.treatmentPlans}
          queueTickets={moduleData.queueTickets}
          routings={moduleData.routings}
          users={moduleData.users}
          currentUser={moduleData.currentUser}
          onRefresh={fetchAllClinicsData}
          loading={loading}
        />
      )}
    </div>
  );
};
export default ClinicsSpaPage;
