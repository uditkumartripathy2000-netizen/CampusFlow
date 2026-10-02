import React, { useState } from 'react';
import { 
  Calendar, 
  UtensilsCrossed, 
  PhoneCall, 
  MapPin, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import { TODAY_TIMETABLE, WEEKLY_MESS_MENU } from '../../data/seedData.ts';

export const MyCampusView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timetable' | 'mess' | 'directory'>('timetable');
  const [selectedDay, setSelectedDay] = useState<string>('Friday');

  const currentMenu = WEEKLY_MESS_MENU.find(m => m.day.startsWith(selectedDay)) || WEEKLY_MESS_MENU[4];

  const campusContacts = [
    { name: 'Campus Health Centre & Ambulance', phone: '+91 661 2482 112', type: 'Emergency 24x7', icon: '🚑' },
    { name: 'Hostel Warden (Brahmaputra Block B)', phone: '+91 94371 88200', type: 'Residential Care', icon: '🏢' },
    { name: 'Main Security Control (Gate 1)', phone: '+91 661 2482 100', type: 'Campus Security', icon: '🛡️' },
    { name: 'Anti-Ragging Helpline (UGC/BPUT)', phone: '1800-180-5522', type: 'Toll-Free Helpline', icon: '⚖️' },
    { name: 'Estate & Hostel Works Helpdesk', phone: '+91 98610 44321', type: 'Plumbing & Electric', icon: '🔧' },
    { name: 'Central Mess Catering Committee', phone: '+91 94380 99112', type: 'Dining Council', icon: '🍲' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E9E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202722] tracking-tight">
            My Campus Directory & Daily Roster
          </h2>
          <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
            Verified timetables, weekly dining menus, and essential emergency contacts
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-white border border-[#E5E9E5] rounded-xl shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'timetable' ? 'bg-[#E6F5EF] text-[#0D8B65] font-semibold' : 'text-[#5E6D64] hover:text-[#202722]'
            }`}
          >
            Academic Timetable
          </button>
          <button
            onClick={() => setActiveTab('mess')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'mess' ? 'bg-[#E6F5EF] text-[#0D8B65] font-semibold' : 'text-[#5E6D64] hover:text-[#202722]'
            }`}
          >
            Weekly Mess Menu
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'directory' ? 'bg-[#E6F5EF] text-[#0D8B65] font-semibold' : 'text-[#5E6D64] hover:text-[#202722]'
            }`}
          >
            Emergency Directory
          </button>
        </div>
      </div>

      {/* 1. TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#202722]">B.Tech Computer Science & Engineering (6th Semester)</h3>
                <p className="text-xs text-[#5E6D64]">Friday Academic Schedule · Synchronized via LMS Scheduler</p>
              </div>
              <span className="text-[11px] font-mono text-[#0D8B65] bg-[#E6F5EF] px-2.5 py-1 rounded-lg font-semibold">
                Section CSE-A · Core Academic Block
              </span>
            </div>

            <div className="divide-y divide-[#E5E9E5]">
              {TODAY_TIMETABLE.map(slot => (
                <div key={slot.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-24 px-2.5 py-1.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-lg text-center shrink-0">
                      <span className="font-mono text-xs font-bold text-[#202722] block">{slot.time}</span>
                      <span className="text-[10px] text-[#5E6D64] uppercase font-semibold">{slot.type}</span>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-[#202722] flex items-center gap-2">
                        <span>{slot.subject}</span>
                        <span className="text-[10px] font-mono text-[#5E6D64]">({slot.code})</span>
                      </div>
                      <div className="text-xs text-[#5E6D64] mt-0.5">
                        {slot.room} · Faculty: {slot.faculty}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {slot.status === 'rescheduled' ? (
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-[#8A5B15] bg-[#FDF6EB] border border-[#F1DFC4] px-2.5 py-0.5 rounded inline-block">
                          Room Clashed & Relocated
                        </span>
                        {slot.note && <div className="text-[10px] text-[#5E6D64]">{slot.note}</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-[#5E6D64]">Scheduled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MESS MENU TAB */}
      {activeTab === 'mess' && (
        <div className="space-y-4">
          {/* Day Selector */}
          <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-[#E5E9E5] rounded-xl shadow-2xs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-[#0D8B65] text-white shadow-2xs font-semibold'
                    : 'text-[#5E6D64] hover:bg-neutral-100 hover:text-[#202722]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Menu Details Card */}
          <div className="bg-white border border-[#E5E9E5] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E5]">
              <div>
                <h3 className="text-base font-bold text-[#202722]">{currentMenu.day} Dining Roster</h3>
                <p className="text-xs text-[#5E6D64]">Central Dining Hall · Managed by Chief Catering Officer Jena</p>
              </div>
              {currentMenu.specialNote && (
                <span className="text-xs font-semibold text-[#8A5B15] bg-[#FDF6EB] border border-[#F1DFC4] px-2.5 py-1 rounded-lg">
                  {currentMenu.specialNote}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-1">
                <span className="text-[10px] font-bold text-[#5E6D64] uppercase tracking-wider block">Breakfast (07:30 – 09:15)</span>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{currentMenu.breakfast}</p>
              </div>

              <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-1">
                <span className="text-[10px] font-bold text-[#5E6D64] uppercase tracking-wider block">Lunch (12:30 – 14:15)</span>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{currentMenu.lunch}</p>
              </div>

              <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-1">
                <span className="text-[10px] font-bold text-[#5E6D64] uppercase tracking-wider block">Evening Snacks (17:00 – 18:00)</span>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{currentMenu.snacks}</p>
              </div>

              <div className="p-4 bg-[#F7F8F6] rounded-xl border border-[#E5E9E5] space-y-1">
                <span className="text-[10px] font-bold text-[#5E6D64] uppercase tracking-wider block">Dinner (20:00 – 21:45)</span>
                <p className="text-xs font-medium text-[#202722] leading-relaxed">{currentMenu.dinner}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campusContacts.map((contact, i) => (
            <div key={i} className="bg-white border border-[#E5E9E5] rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
              <span className="text-2xl p-2.5 bg-[#F7F8F6] border border-[#E5E9E5] rounded-xl">{contact.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-[#0D8B65] uppercase font-semibold">{contact.type}</span>
                <h4 className="text-xs font-bold text-[#202722] mt-0.5">{contact.name}</h4>
                <div className="font-mono text-xs font-semibold text-[#202722] mt-1">{contact.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
