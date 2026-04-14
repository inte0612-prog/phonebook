'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      alert('회원가입이 완료되었습니다! 바로 로그인해 주세요.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(24,119,242,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(24,119,242,0.05),transparent)]">
      <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-pro-lg shadow-pro-lg mb-6 text-white text-4xl font-bold font-outfit">
            P
          </div>
          <h1 className="text-4xl font-bold font-outfit tracking-tighter text-foreground mb-3">
            Pro <span className="text-primary italic">PhoneBook</span>
          </h1>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-pro-lg shadow-pro-lg border border-border overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold font-outfit mb-2 text-foreground">새 계정 만들기</h2>
            <p className="text-fb-gray text-sm font-medium mb-8">빠르고 안전하게 프리미엄 서비스를 시작하세요.</p>
            
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-pro border border-red-100 italic">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">성명</label>
                <input
                  type="text"
                  placeholder="홍길동"
                  className="w-full bg-background border border-border rounded-pro py-3 px-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">이메일 주소</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-background border border-border rounded-pro py-3 px-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">새 비밀번호</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-background border border-border rounded-pro py-3 px-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <p className="text-[11px] text-fb-gray leading-relaxed my-2 font-medium">
                가입하기 버튼을 클릭하면 <span className="text-primary font-bold cursor-pointer hover:underline">이용약관</span> 및 <span className="text-primary font-bold cursor-pointer hover:underline">개인정보 처리방침</span>에 동의하게 됩니다.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-[15px] py-3.5 rounded-pro shadow-pro hover:shadow-pro-lg transform active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? '계정 생성 중...' : '프리미엄 계정 생성'}
              </button>
            </form>
          </div>
          
          <div className="bg-background/50 border-t border-border p-6 text-center">
            <p className="text-sm text-fb-gray font-medium mb-4">이미 계정이 있으신가요?</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full bg-white border border-border text-foreground font-bold text-[14px] py-3 rounded-pro hover:bg-gray-50 hover:shadow-sm transition-all shadow-pro"
            >
              로그인 화면으로 돌아가기
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-fb-gray/60 uppercase tracking-widest font-bold">
            © 2026 Pro PhoneBook · Managed by Secure Systems
          </p>
        </div>
      </div>
    </div>
  );
}
