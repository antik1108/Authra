import React from "react";

export default function UserDetailsCard({
  name,
  role,
  idLabel,
  idValue,
  phone,
  email,
  extraLabel,
  extraValue,
  links
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 border border-gray-100">
      <div className="flex-shrink-0 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
          <svg width="48" height="48" fill="none" stroke="#C62828" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          {role && <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#C62828]/10 text-[#C62828]">{role}</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
          {idLabel && (
            <div>
              <span className="font-medium text-gray-500">{idLabel}</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900">{idValue}</span>
                {/* Copy button can be added here if needed */}
              </div>
            </div>
          )}
          {phone && (
            <div>
              <span className="font-medium text-gray-500">Phone No.</span>
              <div className="font-semibold text-gray-900">{phone}</div>
            </div>
          )}
          {email && (
            <div>
              <span className="font-medium text-gray-500">Email Id</span>
              <div className="font-semibold text-gray-900">{email}</div>
            </div>
          )}
          {extraLabel && (
            <div>
              <span className="font-medium text-gray-500">{extraLabel}</span>
              <div className="font-semibold text-gray-900">{extraValue || "-"}</div>
            </div>
          )}
          {links && (
            <div>
              <span className="font-medium text-gray-500">Links</span>
              <div className="font-semibold text-gray-900">{links.length ? links.join(", ") : "No social links"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
