export interface UserProfile {
  package_plan?: string | null;
  premium_expires_at?: string | Date | null;
}

/**
 * Memeriksa apakah status premium user masih aktif.
 * @param profile Data profil user dari tabel `profiles`
 * @returns boolean (`true` jika aktif/lifetime, `false` jika tidak aktif/expired)
 */
export function isPremiumActive(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;

  const plan = profile.package_plan;
  const expiresAt = profile.premium_expires_at;

  // Jika tidak ada plan atau plan masih 'FREE'
  if (!plan || plan === 'FREE') {
    return false;
  }

  // Jika paket UNLIMITED / LIFETIME (tidak ada tanggal kadaluarsa)
  if (plan === 'UNLIMITED' || expiresAt === null || expiresAt === undefined) {
    return true;
  }

  // Cek apakah tanggal kadaluarsa masih di masa depan
  const expiryDate = new Date(expiresAt);
  const now = new Date();

  return expiryDate > now;
}

/**
 * Menghitung sisa hari masa aktif premium.
 * @param expiresAt String ISO atau Date tanggal kadaluarsa
 * @returns number (Jumlah hari tersisa, 0 jika sudah lewat/expired)
 */
export function getRemainingDays(expiresAt: string | Date | null | undefined): number {
  if (!expiresAt) return 0;

  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();

  if (diffTime <= 0) return 0;

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}