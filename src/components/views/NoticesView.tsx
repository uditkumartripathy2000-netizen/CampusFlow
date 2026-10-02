import React, { useState } from 'react';
import { 
  Bell, 
  PlusCircle, 
  Send, 
  Users, 
  Smartphone, 
  Clock, 
  CheckCheck, 
  Eye, 
  AlertCircle, 
  Info, 
  Filter, 
  Check, 
  X,
  Radio,
  Sparkles
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext.tsx';
import { NoticeItem } from '../../types/index.ts';

export const NoticesView: React.FC = () => {
  const { notices, createNotice, markNoticeRead, role, currentUser } = useCampus();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);

  // Composer Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'academic' | 'hostel' | 'administrative' | 'emergency'>('hostel');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [targetType, setTargetType] = useState<'all' | 'branch' | 'hostel' | 'year'>('all');
  const [targetLabel, setTargetLabel] = useState('All Campus Students');
  const [selectedChannels, setSelectedChannels] = useState<('in_app' | 'sms' | 'push')[]>(['in_app', 'sms']);
  const [showPreview, setShowPreview] = useState(false);

  const filteredNotices = notices.filter(n => {
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let explanation = 'Published for the general student body.';
    if (targetType === 'hostel') explanation = `Targeted to residents of ${targetLabel}.`;
    else if (targetType === 'branch') explanation = `Targeted to students in ${targetLabel}.`;
    else if (targetType === 'year') explanation = `Targeted to enrolled students in ${targetLabel}.`;

    createNotice({
      title,
      content,
      category,
      priority,
      targetAudience: {
        type: targetType,
        label: targetLabel,
        explanation
      },
      channels: selectedChannels,
    });

    // Reset & Close
    setTitle('');
    setContent('');
    setIsComposerOpen(false);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            Campus Announcements & Bulletins
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            Verified official communications to replace fragmented WhatsApp rumor mills
          </p>
        </div>

        {role !== 'student' && (
          <button
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0D8B65] hover:bg-[#0A7353] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E5E9E5] rounded-xl p-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'hostel', label: 'Hostel & Mess' },
            { id: 'academic', label: 'Academic & Exams' },
            { id: 'administrative', label: 'Administrative' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-[#E6F5EF] text-[#0D8B65] font-semibold'
                  : 'text-[#5E6D64] hover:bg-neutral-100 hover:text-[#202722]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#5E6D64] font-mono">
          {filteredNotices.length} Active Bulletins
        </span>
      </div>

      {/* Notice Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotices.map(notice => {
          const isUrgent = notice.priority === 'urgent';
          const isImportant = notice.priority === 'important';

          return (
            <div
              key={notice.id}
              className={`p-5 sm:p-6 rounded-2xl border transition-all bg-white shadow-2xs flex flex-col justify-between ${
                isUrgent 
                  ? 'border-[#F5CBC8] bg-[#FCEDEC]/25' 
                  : isImportant 
                    ? 'border-[#F1DFC4] bg-[#FDF6EB]/25' 
                    : 'border-[#E5E9E5]'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded ${
                      isUrgent 
                        ? 'bg-[#FCEDEC] text-[#992828] border border-[#F5CBC8]' 
                        : isImportant 
                          ? 'bg-[#FDF6EB] text-[#8A5B15] border border-[#F1DFC4]' 
                          : 'bg-[#F7F8F6] text-[#5E6D64] border border-[#E5E9E5]'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-[#5E6D64]">·</span>
                    <span className="text-[11px] text-[#5E6D64]">{new Date(notice.publishedAt).toLocaleDateString()}</span>
                  </div>

                  {!notice.isRead && (
                    <button
                      onClick={() => markNoticeRead(notice.id)}
                      className="text-[10px] text-[#0D8B65] font-semibold hover:underline"
                    >
                      Mark Read
                    </button>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#202722] mb-1.5">
                  {notice.title}
                </h3>

                <p className="text-xs text-[#5E6D64] leading-relaxed mb-4">
                  {notice.content}
                </p>

                {/* "Why am I seeing this?" Audience Targeting Box */}
                <div className="p-3 rounded-xl bg-[#F7F8F6] border border-[#E5E9E5] text-[11px] text-[#5E6D64] mb-3">
                  <div className="font-semibold text-[#202722] flex items-center gap-1.5 mb-0.5">
                    <Info className="w-3.5 h-3.5 text-[#0D8B65]" />
                    <span>Audience: {notice.targetAudience.label}</span>
                  </div>
                  <div>{notice.targetAudience.explanation}</div>
                </div>
              </div>

              {/* Delivery Stats & Channels Footer */}
              <div className="pt-3 border-t border-[#E5E9E5] text-xs">
                <div className="flex items-center justify-between text-[#5E6D64] text-[11px] mb-1">
                  <span>Author: {notice.author}</span>
                  <span className="font-mono">In-App: {notice.deliveryStats.inAppDelivered} · SMS: {notice.deliveryStats.smsSimulated}</span>
                </div>
                <div className="text-[10px] text-[#5E6D64] italic">
                  * Read counts and delivery figures are simulated demonstration metrics.
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* NEW NOTICE COMPOSER MODAL (Admin & Staff) */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E7E2] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E7E2]">
              <div>
                <h3 className="text-base font-bold text-[#202722]">Publish Official Campus Notice</h3>
                <p className="text-xs text-[#5F6B62]">Broadcast to designated student wings across multi-channel gateways</p>
              </div>
              <button 
                onClick={() => setIsComposerOpen(false)}
                className="p-1.5 text-[#8A968D] hover:text-[#202722]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#202722] mb-1">Notice Headline *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Power Outage in Mahanadi Hall"
                  className="w-full bg-[#F7F8F6] border border-[#E2E7E2] rounded-lg px-3 py-2 text-xs text-[#202722] focus:outline-none focus:border-[#0D8B65]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F7F8F6] border border-[#E2E7E2] rounded-lg px-2.5 py-1.5 text-xs text-[#202722]"
                  >
                    <option value="hostel">Hostel & Mess</option>
                    <option value="academic">Academic & Exams</option>
                    <option value="administrative">Administrative</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202722] mb-1">Urgency</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#F7F8F6] border border-[#E2E7E2] rounded-lg px-2.5 py-1.5 text-xs text-[#202722]"
                  >
                    <option value="normal">Normal Bulletin</option>
                    <option value="important">Important (Pinned)</option>
                    <option value="urgent">Urgent Alert (Simulated SMS Push)</option>
                  </select>
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="p-3 bg-[#F7F8F6] rounded-xl border border-[#E2E7E2] space-y-2">
                <label className="block font-semibold text-[#202722]">Target Audience Scope</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Campus' },
                    { id: 'hostel', label: 'Specific Hostel' },
                    { id: 'branch', label: 'Department' },
                    { id: 'year', label: 'Academic Year' },
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        setTargetType(t.id as any);
                        if (t.id === 'all') setTargetLabel('All Registered Students');
                        else if (t.id === 'hostel') setTargetLabel('Brahmaputra Hall (Block B)');
                        else if (t.id === 'branch') setTargetLabel('B.Tech Computer Science');
                        else if (t.id === 'year') setTargetLabel('3rd Year (6th Semester)');
                      }}
                      className={`p-2 rounded-lg border text-center font-medium ${
                        targetType === t.id
                          ? 'bg-[#E6F5EF] text-[#0D8B65] border-[#0D8B65]'
                          : 'bg-white text-[#5F6B62] border-[#E2E7E2]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={targetLabel}
                  onChange={(e) => setTargetLabel(e.target.value)}
                  placeholder="Target label description"
                  className="w-full bg-white border border-[#E2E7E2] rounded-md px-2.5 py-1 text-xs text-[#202722]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202722] mb-1">Notice Body Content *</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter detailed announcement message..."
                  className="w-full bg-[#F7F8F6] border border-[#E2E7E2] rounded-lg px-3 py-2 text-xs text-[#202722] focus:outline-none focus:border-[#0D8B65]"
                  required
                />
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block font-semibold text-[#202722] mb-1">Simulated Broadcast Channels</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedChannels.includes('in_app')} 
                      readOnly 
                      className="accent-[#0D8B65]"
                    />
                    <span>In-App Banner</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedChannels.includes('sms')} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedChannels(prev => [...prev, 'sms']);
                        else setSelectedChannels(prev => prev.filter(c => c !== 'sms'));
                      }}
                      className="accent-[#0D8B65]"
                    />
                    <span>Simulated SMS Push</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedChannels.includes('push')} 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedChannels(prev => [...prev, 'push']);
                        else setSelectedChannels(prev => prev.filter(c => c !== 'push'));
                      }}
                      className="accent-[#0D8B65]"
                    />
                    <span>PWA Browser Notification</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E7E2]">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-3.5 py-2 bg-white border border-[#E2E7E2] rounded-lg text-xs font-medium text-[#5F6B62] hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D8B65] hover:bg-[#0A7353] text-white rounded-lg text-xs font-medium shadow-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
