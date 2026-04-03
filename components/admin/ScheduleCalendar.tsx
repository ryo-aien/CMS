'use client';

import Image from 'next/image';
import type { Schedule, Cast } from '@/types';

type Props = {
  year: number;
  month: number; // 1-12
  schedules: Schedule[];
  onClickCell: (date: string, schedule?: Schedule) => void;
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function ScheduleCalendar({ year, month, schedules, onClickCell }: Props) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startOffset = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  // Map date string -> schedule
  const scheduleMap = new Map<string, Schedule>();
  for (const s of schedules) {
    scheduleMap.set(s.date, s);
  }

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-2 text-center text-xs font-medium ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[80px] border-b border-r border-gray-100 last:border-r-0 bg-gray-50"
              />
            );
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const schedule = scheduleMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const dayOfWeek = (startOffset + day - 1) % 7;
          const isSun = dayOfWeek === 0;
          const isSat = dayOfWeek === 6;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onClickCell(dateStr, schedule)}
              className={`min-h-[80px] border-b border-r border-gray-100 last:border-r-0 p-1.5 text-left hover:bg-pink-50 transition-colors group ${
                isToday ? 'bg-pink-50' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                  isToday
                    ? 'text-white'
                    : isSun
                    ? 'text-red-500'
                    : isSat
                    ? 'text-blue-500'
                    : 'text-gray-700'
                }`}
                style={isToday ? { backgroundColor: '#e91e8c' } : {}}
              >
                {day}
              </span>

              {/* Cast avatars */}
              {schedule?.casts && schedule.casts.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {schedule.casts.slice(0, 4).map((cast: Cast) => (
                    <div
                      key={cast.id}
                      className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0"
                      title={cast.name}
                    >
                      {cast.main_image_url ? (
                        <Image
                          src={cast.main_image_url}
                          alt={cast.name}
                          fill
                          sizes="20px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-[8px] text-gray-500">
                          {cast.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                  ))}
                  {schedule.casts.length > 4 && (
                    <span className="text-[9px] text-gray-400">+{schedule.casts.length - 4}</span>
                  )}
                </div>
              )}

              {/* Public badge */}
              {schedule && (
                <div className="mt-0.5">
                  <span
                    className={`inline-block text-[9px] px-1 rounded ${
                      schedule.is_public
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {schedule.is_public ? '公開' : '非公開'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
