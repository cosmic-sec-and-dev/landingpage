import React from 'react';
import { Modal } from 'antd';
import { NoteWriterView } from './NoteWriterView';

export const NoteEditModal = ({
  open,
  onCancel,
  onSuccess,
  note,
  labels = [],
  noteLabels = [],
  todos = [],
  attachments = [],
  currentUser
}) => {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1050}
      centered
      destroyOnHidden
      styles={{
        content: { padding: '24px 20px', borderRadius: 18 },
        body: { padding: 0 }
      }}
    >
      <NoteWriterView
        initialNote={note}
        labels={labels}
        noteLabels={noteLabels}
        todos={todos}
        attachments={attachments}
        currentUser={currentUser}
        onClose={onCancel}
        onSaved={() => {
          if (onSuccess) onSuccess();
          onCancel();
        }}
      />
    </Modal>
  );
};
export default NoteEditModal;
