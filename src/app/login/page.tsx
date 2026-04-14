'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(24,119,242,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(24,119,242,0.05),transparent)]">
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-pro-lg shadow-pro-lg mb-6 text-white text-4xl font-bold font-outfit">
            P
          </div>
          <h1 className="text-4xl font-bold font-outfit tracking-tighter text-foreground mb-3">
            Pro <span className="text-primary italic">PhoneBook</span>
          </h1>
          <p className="text-fb-gray font-medium tracking-tight">
            보안과 세련됨을 갖춘 프리미엄 연락처 관리 서비스
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-pro-lg shadow-pro-lg border border-border overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold font-outfit mb-6 text-foreground">로그인</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-pro border border-red-100 animate-shake">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">이메일 주소</label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  className="w-full bg-background border border-border rounded-pro py-3 px-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest">비밀번호</label>
                  <Link href="#" className="text-[11px] font-bold text-primary hover:underline uppercase tracking-widest">
                    분실하셨나요?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-pro py-3 px-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-pro shadow-pro hover:shadow-pro-lg transform active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? '인증 중...' : '시스템 접속'}
              </button>
            </form>
          </div>
          
          <div className="bg-background/50 border-t border-border p-6 text-center">
            <p className="text-sm text-fb-gray font-medium mb-4">아직 계정이 없으신가요?</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full bg-white border border-border text-foreground font-bold text-[14px] py-3 rounded-pro hover:bg-gray-50 hover:shadow-sm transition-all shadow-pro"
            >
              프로필 생성하기
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-fb-gray/60 uppercase tracking-widest font-bold">
            © 2026 Pro PhoneBook · Protected by AES-256 Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
