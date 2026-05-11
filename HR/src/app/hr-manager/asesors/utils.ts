export const avatarColors = [
  'bg-amber-100 text-amber-700', 'bg-orange-100 text-orange-700',
  'bg-yellow-100 text-yellow-700', 'bg-lime-100 text-lime-700',
  'bg-emerald-100 text-emerald-700', 'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700', 'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700', 'bg-purple-100 text-purple-700',
  'bg-fuchsia-100 text-fuchsia-700', 'bg-pink-100 text-pink-700',
  'bg-rose-100 text-rose-700',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function getStatusBadge(status: string) {
  return status === 'active'
    ? 'bg-green-100 text-green-700 hover:bg-green-100'
    : 'bg-slate-100 text-slate-700 hover:bg-slate-100';
}

export function getStatusLabel(status: string) {
  return status === 'active' ? 'Aktif' : 'Non-Aktif';
}
