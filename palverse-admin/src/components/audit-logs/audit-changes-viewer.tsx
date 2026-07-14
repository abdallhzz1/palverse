import React from 'react';

interface AuditChangesViewerProps {
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
}

const SENSITIVE_KEYS = [
  'password',
  'password_confirmation',
  'token',
  'secret',
  'api_key',
  'private_key',
  'authorization',
  'access_token',
  'refresh_token',
];

export function AuditChangesViewer({ oldValues, newValues }: AuditChangesViewerProps) {
  if (!oldValues && !newValues) {
    return (
      <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-100">
        لا توجد تفاصيل إضافية لهذه العملية.
      </div>
    );
  }

  // Filter sensitive keys
  const filterSensitive = (obj: Record<string, unknown> | null) => {
    if (!obj) return null;
    const filtered: Record<string, unknown> = {};
    for (const key in obj) {
      if (SENSITIVE_KEYS.some(sensitive => key.toLowerCase().includes(sensitive))) {
        filtered[key] = "محمي";
      } else {
        filtered[key] = obj[key];
      }
    }
    return filtered;
  };

  const safeOld = filterSensitive(oldValues);
  const safeNew = filterSensitive(newValues);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {safeOld && (
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">القيم السابقة</h4>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 overflow-auto max-h-[400px]">
            <pre className="text-xs text-red-900 font-mono text-left" dir="ltr">
              {JSON.stringify(safeOld, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {safeNew && (
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">القيم الجديدة</h4>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 overflow-auto max-h-[400px]">
            <pre className="text-xs text-emerald-900 font-mono text-left" dir="ltr">
              {JSON.stringify(safeNew, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
