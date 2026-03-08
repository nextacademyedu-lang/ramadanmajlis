import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { LogOut, User as UserIcon, Briefcase, Phone, Award, UserPlus, Share2, X, Building2, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface Contact { id: string; met_person_name: string; met_person_field: string; met_person_phone: string; }

export default function Profile() {
  const { user, logout } = useUser();
  const [showShare, setShowShare] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (user) fetch(`/api/users/${user.id}/contacts`).then(r => r.json()).then(setContacts);
  }, [user]);

  const saveContact = (contact: Contact) => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.met_person_name}\nTITLE:${contact.met_person_field}\nTEL;TYPE=CELL:${contact.met_person_phone}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contact.met_person_name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (!user) return null;

  const photoUrl = user.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
  // N field = Last;First;;; — ensures name shows correctly on iOS & Android
  const nameParts = user.name.trim().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || user.name;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const userVCard = ['BEGIN:VCARD', 'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${user.name}`,
    `TEL;TYPE=CELL:${user.phone}`,
    user.field ? `TITLE:${user.field}` : '',
    user.company ? `ORG:${user.company}` : '',
    user.linkedin_url ? `URL:${user.linkedin_url}` : '',
    'END:VCARD'].filter(Boolean).join('\n');

  return (
    <div className="max-w-md mx-auto p-4 pt-8 pb-24">
      {showShare && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 w-full max-w-sm text-center relative border border-emerald-500/20 bg-[#064e3b]">
            <button onClick={() => setShowShare(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={22} />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Share My Contact</h3>
            <p className="text-emerald-200/50 text-sm mb-5">Scan to save my contact info</p>
            <div className="flex justify-center mb-4 p-3 bg-white rounded-xl inline-block mx-auto">
              <QRCodeSVG value={userVCard} size={180} />
            </div>
            <p className="font-semibold text-white mt-3">{user.name}</p>
            <p className="text-sm text-emerald-200/50">{user.phone}</p>
          </div>
        </div>
      )}

      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
      </header>

      <div className="rounded-2xl border border-emerald-500/20 bg-white/5 overflow-hidden mb-5">
        <div className="p-6 text-center">
          <img src={photoUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-500/30 object-cover"
        onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`; }} />
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-emerald-200/60 text-sm mt-1">{user.field}</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-semibold">
            <Award className="mr-2" size={18} />
            {user.score} Points
          </div>
        </div>
        <div className="border-t border-white/5 px-6 py-4 space-y-3">
          <div className="flex items-center text-emerald-200/70">
            <Phone className="mr-3 text-emerald-400/50" size={16} />
            <span className="text-sm">{user.phone}</span>
          </div>
          {user.company && (
            <div className="flex items-center text-emerald-200/70">
              <Building2 className="mr-3 text-emerald-400/50" size={16} />
              <span className="text-sm">{user.company}</span>
            </div>
          )}
          {user.linkedin_url && (
            <div className="flex items-center text-emerald-200/70">
              <Linkedin className="mr-3 text-emerald-400/50" size={16} />
              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:underline truncate">
                {user.linkedin_url.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowShare(true)}
        className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-black bg-amber-400 hover:bg-amber-500 mb-6 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
        <Share2 className="mr-2" size={18} />
        Share My Contact
      </motion.button>

      {contacts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-bold text-white mb-3">People You Met ({contacts.length})</h3>
          <div className="space-y-2">
            {contacts.map(contact => (
              <div key={contact.id} className="p-3 rounded-xl border border-emerald-500/20 bg-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                    <UserIcon className="text-emerald-400" size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{contact.met_person_name}</h4>
                    <p className="text-xs text-emerald-200/50 truncate">{contact.met_person_field}</p>
                  </div>
                </div>
                <button onClick={() => saveContact(contact)}
                  className="flex items-center px-3 py-1.5 bg-emerald-900/50 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-900 rounded-lg text-xs font-medium flex-shrink-0">
                  <UserPlus size={13} className="mr-1" /> Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button whileTap={{ scale: 0.98 }} onClick={logout}
        className="w-full flex items-center justify-center py-3 px-4 border border-white/10 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:border-white/20 transition-colors">
        <LogOut className="mr-2" size={18} />
        Sign Out
      </motion.button>
    </div>
  );
}
