import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axios';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';

interface Attendee {
  id: string;
  name: string;
}

interface BattingRecord {
  id?: number;
  user_id: number;
  user_name: string;
  at_bats: number;
  hits: number;
  doubles: number;
  triples: number;
  home_runs: number;
  rbis: number;
  runs: number;
  walks: number;
  strikeouts: number;
}

interface BattingRecordEntryProps {
  gameId: number;
}

const statLabels: { key: keyof Omit<BattingRecord, 'id' | 'user_id' | 'user_name'>; label: string; width: string }[] = [
  { key: 'at_bats', label: '打席', width: 'w-16' },
  { key: 'hits', label: '安打', width: 'w-16' },
  { key: 'doubles', label: '二垒', width: 'w-16' },
  { key: 'triples', label: '三垒', width: 'w-16' },
  { key: 'home_runs', label: '本垒', width: 'w-16' },
  { key: 'rbis', label: '打点', width: 'w-16' },
  { key: 'runs', label: '得分', width: 'w-16' },
  { key: 'walks', label: '保送', width: 'w-16' },
  { key: 'strikeouts', label: '三振', width: 'w-16' },
];

const emptyRecord = (userId: number, userName: string): BattingRecord => ({
  user_id: userId,
  user_name: userName,
  at_bats: 0,
  hits: 0,
  doubles: 0,
  triples: 0,
  home_runs: 0,
  rbis: 0,
  runs: 0,
  walks: 0,
  strikeouts: 0,
});

export function BattingRecordEntry({ gameId }: BattingRecordEntryProps) {
  const [records, setRecords] = useState<BattingRecord[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsRes, attendanceRes] = await Promise.all([
          api.get<{ success: boolean; data?: BattingRecord[] }>(`/games/${gameId}/batting-records`),
          api.get<{ success: boolean; data?: { confirmed: Attendee[] } }>(`/games/${gameId}/attendance`),
        ]);

        const existing = recordsRes.data.success && recordsRes.data.data ? recordsRes.data.data : [];
        const confirmed = attendanceRes.data.success && attendanceRes.data.data ? attendanceRes.data.data.confirmed : [];

        setAttendees(confirmed);

        // Merge existing records with confirmed attendees who don't have records yet
        const existingUserIds = new Set(existing.map((r) => r.user_id));
        const missing = confirmed
          .filter((a) => !existingUserIds.has(Number(a.id)))
          .map((a) => emptyRecord(Number(a.id), a.name));

        setRecords([...existing, ...missing]);
      } catch (err) {
        setMessage({ type: 'error', text: '加载数据失败' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameId]);

  const availableAttendees = useMemo(() => {
    const usedUserIds = new Set(records.map((r) => r.user_id));
    return attendees.filter((a) => !usedUserIds.has(Number(a.id)));
  }, [records, attendees]);

  const handleChange = (index: number, key: keyof BattingRecord, value: string) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setRecords((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: num };
      return next;
    });
  };

  const handleUserChange = (index: number, userId: number) => {
    const attendee = attendees.find((a) => Number(a.id) === userId);
    if (!attendee) return;
    setRecords((prev) => {
      const next = [...prev];
      next[index] = { ...emptyRecord(userId, attendee.name), ...next[index], user_id: userId, user_name: attendee.name };
      return next;
    });
  };

  const addRow = () => {
    if (availableAttendees.length === 0) return;
    const first = availableAttendees[0];
    setRecords((prev) => [...prev, emptyRecord(Number(first.id), first.name)]);
  };

  const removeRow = (index: number) => {
    setRecords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (records.length === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.post(`/games/${gameId}/batting-records`, {
        records: records.map((r) => ({
          user_id: r.user_id,
          at_bats: r.at_bats,
          hits: r.hits,
          doubles: r.doubles,
          triples: r.triples,
          home_runs: r.home_runs,
          rbis: r.rbis,
          runs: r.runs,
          walks: r.walks,
          strikeouts: r.strikeouts,
        })),
      });
      setMessage({ type: 'success', text: '保存成功' });
      // Reload to get server state
      const recordsRes = await api.get<{ success: boolean; data?: BattingRecord[] }>(`/games/${gameId}/batting-records`);
      const existing = recordsRes.data.success && recordsRes.data.data ? recordsRes.data.data : [];
      const existingUserIds = new Set(existing.map((r) => r.user_id));
      const missing = attendees
        .filter((a) => !existingUserIds.has(Number(a.id)))
        .map((a) => emptyRecord(Number(a.id), a.name));
      setRecords([...existing, ...missing]);
    } catch (err) {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">加载数据中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">数据录入</h3>
        <button
          onClick={addRow}
          disabled={availableAttendees.length === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#041E42] text-white text-sm hover:bg-[#061B3A] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          添加球员
        </button>
      </div>

      {message && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left font-medium px-2 py-2 border-b">球员</th>
              {statLabels.map((s) => (
                <th key={s.key} className={`text-center font-medium px-1 py-2 border-b ${s.width}`}>
                  {s.label}
                </th>
              ))}
              <th className="text-center font-medium px-2 py-2 border-b w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={`${record.user_id}-${index}`} className="hover:bg-gray-50">
                <td className="px-2 py-2 border-b">
                  <select
                    value={record.user_id}
                    onChange={(e) => handleUserChange(index, Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#041E42]"
                  >
                    <option value={record.user_id}>{record.user_name}</option>
                    {availableAttendees.map((a) => (
                      <option key={a.id} value={Number(a.id)}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </td>
                {statLabels.map((s) => (
                  <td key={s.key} className="px-1 py-2 border-b">
                    <input
                      type="number"
                      min={0}
                      value={record[s.key]}
                      onChange={(e) => handleChange(index, s.key, e.target.value)}
                      className="w-full px-1 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#041E42]"
                    />
                  </td>
                ))}
                <td className="px-2 py-2 border-b text-center">
                  <button
                    onClick={() => removeRow(index)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={statLabels.length + 2} className="px-4 py-8 text-center text-gray-400">
                  暂无数据，点击上方按钮添加球员
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving || records.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#BF0D3E] text-white font-medium hover:bg-[#A00B34] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? '保存中...' : '保存数据'}
        </button>
      </div>
    </div>
  );
}

export default BattingRecordEntry;
