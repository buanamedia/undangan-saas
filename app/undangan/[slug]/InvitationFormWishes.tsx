'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface InvitationFormWishesProps {
  invitationId: string;
  theme: any;
  wishesList: any[];
  setWishesList: React.Dispatch<React.SetStateAction<any[]>>;
  formatLocalDateString: (dateStr: string) => string;
}

export default function InvitationFormWishes({
  invitationId,
  theme,
  wishesList,
  setWishesList,
  formatLocalDateString,
}: InvitationFormWishesProps) {
  const supabase = createClient();
  const [guestName, setGuestName] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState('hadir');
  const [sendingWish, setSendingWish] = useState(false);

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !message) return alert("Nama dan Ucapan wajib diisi!");
    setSendingWish(true);
    try {
      const newWish = {
        invitation_id: invitationId,
        name: guestName,
        relation: relation || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        message: message,
        attendance: attendance
      };

      const { data, error } = await supabase.from('rsvps').insert(newWish).select('*').single();
      if (error) throw error;
      alert("✨ Terima kasih! Doa dan harapan Anda berhasil dikirim.");
      setWishesList((prev) => [data || newWish, ...prev]);
      setGuestName(''); setRelation(''); setEmail(''); setPhone(''); setAddress(''); setMessage('');
    } catch (err: any) {
      alert("Gagal mengirimkan ucapan: " + err.message);
    } finally {
      setSendingWish(false);
    }
  };

  return (
    <div id="ucapan" className={`scroll-mt-4 max-w-md mx-auto my-4 p-6 ${theme.formBg} rounded-2xl border ${theme.cardBorder} text-center font-sans`}>
      <h2 className="text-base font-bold text-stone-800">Doa dan Harapan</h2>
      <p className="text-[11px] text-stone-500 mt-1 mb-5">Saya sangat berterima kasih atas doa dan harapan yang telah Anda berikan</p>

      <form onSubmit={handleSubmitWish} className="space-y-3 text-left" autoComplete="off">
        <input type="text" placeholder="Tulis nama lengkap Anda" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
        <input type="text" placeholder="Hubungan dengan pemilik acara (optional)" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={relation} onChange={(e) => setRelation(e.target.value)} />
        <input type="email" placeholder="Tulis alamat email Anda (optional)" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="tel" placeholder="Tulis nomor handphone Anda (optional)" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="text" placeholder="Tulis alamat tinggal Anda" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={address} onChange={(e) => setAddress(e.target.value)} />
        <textarea rows={4} placeholder="Tuliskan ucapan atau doa untuk pemilik acara" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs resize-none text-stone-800" value={message} onChange={(e) => setMessage(e.target.value)} required />

        <div className="py-2 space-y-2">
          <p className="text-xs font-semibold text-stone-700">Apakah Anda akan hadir menghadiri acara ?</p>
          <div className="flex flex-col gap-2 text-xs text-stone-600">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="attendance" value="hadir" checked={attendance === 'hadir'} onChange={() => setAttendance('hadir')} /> Saya akan hadir</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="attendance" value="tidak_hadir" checked={attendance === 'tidak_hadir'} onChange={() => setAttendance('tidak_hadir')} /> Saya tidak akan hadir</label>
          </div>
        </div>

        <button type="submit" disabled={sendingWish} className={`w-full py-3 ${theme.formBtn} ${theme.formBtnHover} disabled:bg-stone-400 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer`}>
          {sendingWish ? "Mengirim..." : "Kirim"}
        </button>
      </form>

      <hr className="border-t-2 border-stone-200 my-6" />

      <div className="pt-2 text-left space-y-3">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Ucapan Doa & Kehadiran ({wishesList.length})</h3>
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {wishesList.length === 0 ? (
            <p className="text-center text-stone-400 py-4 italic text-[11px]">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>
          ) : (
            wishesList.map((wish, index) => (
              <div key={index} className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs text-center space-y-3 animate-in fade-in duration-300">
                <div>
                  <span className="font-bold text-stone-600 text-xs">
                    {wish.name} {wish.address ? ` - ${wish.address}` : ''}
                  </span>
                </div>
                <hr className="border-t border-stone-200 my-1 w-full" />
                <p className="text-stone-600 text-xs leading-relaxed px-2">{wish.message}</p>
                <div className="text-[10px] text-stone-400 font-medium pt-1">
                  {wish.created_at ? formatLocalDateString(wish.created_at) : formatLocalDateString(new Date().toISOString())}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}