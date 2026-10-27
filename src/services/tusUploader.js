/**
 * TUSD Resumable File Uploader Service
 * Provides secure file uploads using relative proxy paths (/files/)
 * without exposing internal server ports or hosts to the browser.
 */

const rawTusdPrefix = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TUSD_PREFIX !== undefined)
  ? String(import.meta.env.VITE_TUSD_PREFIX).trim()
  : '/tusd';

export const TUSD_PREFIX = rawTusdPrefix
  ? (rawTusdPrefix.startsWith('/') ? rawTusdPrefix.replace(/\/+$/, '') : `/${rawTusdPrefix.replace(/\/+$/, '')}`)
  : '/tusd';

export const uploadTusFile = (file, onProgress = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Nenhum arquivo fornecido para upload.'));
    }

    const encodeMetadata = (meta) => {
      return Object.entries(meta)
        .map(([key, val]) => `${key} ${btoa(unescape(encodeURIComponent(val || '')))}`)
        .join(',');
    };

    const metadataHeader = encodeMetadata({
      filename: file.name,
      filetype: file.type || 'application/octet-stream',
      filesize: String(file.size)
    });

    // Step 1: Create upload session on configured TUSD prefix
    const createReq = new XMLHttpRequest();
    createReq.open('POST', `${TUSD_PREFIX}/`, true);
    createReq.setRequestHeader('Tus-Resumable', '1.0.0');
    createReq.setRequestHeader('Upload-Length', String(file.size));
    createReq.setRequestHeader('Upload-Metadata', metadataHeader);

    createReq.onload = () => {
      if (createReq.status !== 201) {
        return reject(new Error(`Falha ao iniciar upload: HTTP ${createReq.status}`));
      }

      const locationHeader = createReq.getResponseHeader('Location');
      if (!locationHeader) {
        return reject(new Error('Servidor Tus não retornou o cabeçalho Location.'));
      }

      // Ensure relative path only (e.g. /files/abcdef123456)
      let uploadUrl = locationHeader;
      try {
        if (locationHeader.startsWith('http://') || locationHeader.startsWith('https://')) {
          const parsed = new URL(locationHeader);
          uploadUrl = parsed.pathname;
        }
      } catch {
        uploadUrl = locationHeader;
      }

      // Step 2: Upload file binary via PATCH
      const patchReq = new XMLHttpRequest();
      patchReq.open('PATCH', uploadUrl, true);
      patchReq.setRequestHeader('Tus-Resumable', '1.0.0');
      patchReq.setRequestHeader('Upload-Offset', '0');
      patchReq.setRequestHeader('Content-Type', 'application/offset+octet-stream');

      if (onProgress && patchReq.upload) {
        patchReq.upload.onprogress = (evt) => {
          if (evt.lengthComputable) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            onProgress(percent, evt.loaded, evt.total);
          }
        };
      }

      patchReq.onload = () => {
        if (patchReq.status === 200 || patchReq.status === 204) {
          const fileId = uploadUrl.split('/').filter(Boolean).pop();
          resolve({
            url: uploadUrl,
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type
          });
        } else {
          reject(new Error(`Falha no envio do arquivo: HTTP ${patchReq.status}`));
        }
      };

      patchReq.onerror = () => {
        reject(new Error('Erro de rede ao enviar o arquivo via Tus.'));
      };

      patchReq.send(file);
    };

    createReq.onerror = () => {
      reject(new Error('Erro de conexão com o servidor de upload (/files/).'));
    };

    createReq.send();
  });
};
