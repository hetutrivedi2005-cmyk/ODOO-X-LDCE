import React, { useState } from 'react';
import { Copy, Trash2, Check, Globe, Clock } from 'lucide-react';

export const ShareLinkList = ({ shares = [], onRevoke, isLoading }) => {
  const [copyStates, setCopyStates] = useState({});

  const handleCopy = (shareId, url) => {
    navigator.clipboard.writeText(url);
    setCopyStates(prev => ({ ...prev, [shareId]: true }));
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [shareId]: false }));
    }, 2000);
  };

  const getStatus = (expiresAt) => {
    if (!expiresAt) return { label: 'Active', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    const isExpired = new Date() > new Date(expiresAt);
    if (isExpired) return { label: 'Expired', color: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
    return { label: 'Active', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl">
        <div className="text-slate-400 text-xs font-semibold animate-pulse">Loading shared links...</div>
      </div>
    );
  }

  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-850 bg-slate-900/10 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Globe className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-300">No active shares found</h4>
        <p className="text-[11px] text-slate-450 mt-0.5">
          Generate your first public link using the "Share Trip" option above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-slate-850 rounded-2xl bg-slate-900/20 backdrop-blur-sm">
      {/* Mobile view (list stack) */}
      <div className="block sm:hidden divide-y divide-slate-850">
        {shares.map(share => {
          const status = getStatus(share.expiresAt);
          const isCopied = copyStates[share.id];
          return (
            <div key={share.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-[10px] text-slate-500">
                  Created: {new Date(share.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-teal-400 font-medium truncate select-all bg-slate-950/60 p-2 rounded-lg border border-slate-850">
                {share.shareUrl}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires: {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy(share.id, share.shareUrl)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold ${
                    isCopied
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-850'
                  } transition-all cursor-pointer`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRevoke(share.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 hover:border-rose-500/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop view (table) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 bg-slate-900/40 text-[10px] uppercase font-bold tracking-wider text-slate-450">
              <th className="px-5 py-3">Link URL</th>
              <th className="px-5 py-3">Expires</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {shares.map(share => {
              const status = getStatus(share.expiresAt);
              const isCopied = copyStates[share.id];
              return (
                <tr key={share.id} className="hover:bg-slate-900/10 text-xs">
                  <td className="px-5 py-4 font-medium text-teal-400 select-all max-w-[240px] truncate">
                    {share.shareUrl}
                  </td>
                  <td className="px-5 py-4 text-slate-350">
                    {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(share.id, share.shareUrl)}
                        className={`p-2 rounded-xl transition-all cursor-pointer border ${
                          isCopied
                            ? 'bg-teal-500/20 border-teal-500/35 text-teal-400'
                            : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-450 hover:text-white'
                        }`}
                        title="Copy share link"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRevoke(share.id)}
                        className="p-2 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 text-rose-450 hover:text-rose-450 transition-all cursor-pointer"
                        title="Revoke share link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShareLinkList;
