'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDateString: string;
  isReception?: boolean;
  theme: any;
}

export default function InvitationCountdown({
  targetDateString,
  isReception = false,
  theme,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDateString) return;

    const calculateTime = () => {
      const numbers = targetDateString.match(/\d+/g);
      if (!numbers || numbers.length < 5) return;

      const year = numbers[0];
      const month = numbers[1].padStart(2, '0');
      const day = numbers[2].padStart(2, '0');
      const hour = numbers[3].padStart(2, '0');
      const minute = numbers[4].padStart(2, '0');
      const second = numbers[5] ? numbers[5].padStart(2, '0') : '00';

      const isoTargetString = `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
      const target = new Date(isoTargetString).getTime();
      const now = Date.now();

      const diff = target - now;

      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          isExpired: true,
        });
        return;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const totalHours = Math.floor(totalMinutes / 60);

      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDateString]);

  if (timeLeft.isExpired) {
    return (
      <div className="w-full text-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-xl my-2">
        <p className="text-[11px] font-black tracking-wider text-rose-600 animate-pulse">
          ⚠️ MAAF, WAKTU ACARA SUDAH TERLEWATI (EXPIRED)
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full py-3 px-4 ${theme.countdownBg} border ${theme.countdownBorder} rounded-xl my-2 text-center`}>
      <p className={`text-[10px] font-bold ${theme.countdownNumber} tracking-widest uppercase mb-1.5`}>
        Hitung Mundur {isReception ? "Resepsi" : "Acara"}
      </p>

      <div className="flex justify-center items-center gap-3 font-mono text-xs font-bold text-stone-800">
        <div className="bg-white px-2.5 py-1 rounded border">
          <span className={`${theme.countdownNumber} text-sm`}>{timeLeft.days}</span> Hari
        </div>

        <div className="bg-white px-2.5 py-1 rounded border">
          <span className={`${theme.countdownNumber} text-sm`}>{timeLeft.hours}</span> Jam
        </div>

        <div className="bg-white px-2.5 py-1 rounded border">
          <span className={`${theme.countdownNumber} text-sm`}>{timeLeft.minutes}</span> Menit
        </div>
      </div>
    </div>
  );
}