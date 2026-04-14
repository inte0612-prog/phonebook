'use client';

import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header({
    searchTerm,
    onSearchChange,
    onAddClick,
    user
}: {
    searchTerm: string,
    onSearchChange: (val: string) => void,
    onAddClick: () => void,
    user: any
}) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 h-16 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-pro flex items-center justify-center text-white text-2xl font-bold font-outfit shadow-pro group-hover:scale-105 transition-transform">
                        P
                    </div>
                    <span className="hidden sm:block text-xl font-bold font-outfit tracking-tight text-foreground">
                        Pro <span className="text-primary italic">PhoneBook</span>
                    </span>
                </Link>
                <div className="relative flex items-center group">
                    <input
                        type="text"
                        placeholder="연락처 검색..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="hidden md:block bg-background border border-border rounded-pro py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-72 transition-all placeholder:text-fb-gray"
                    />
                    <span className="absolute left-3 text-fb-gray group-focus-within:text-primary transition-colors">🔍</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-border mr-2">
                        <div className="w-9 h-9 rounded-pro-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                            {(user.user_metadata?.full_name?.[0] || user.email?.[0])?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground leading-tight">{user.user_metadata?.full_name || '사용자'}</span>
                            <span className="text-[10px] text-fb-gray uppercase tracking-widest font-bold">Premium</span>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={onAddClick}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-5 rounded-pro shadow-pro hover:shadow-pro-lg transition-all text-sm flex items-center gap-2"
                    >
                        <span>+</span>
                        <span className="hidden lg:block">새 연락처</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-fb-gray hover:text-foreground hover:bg-background h-10 w-10 flex items-center justify-center rounded-pro transition-all"
                        title="로그아웃"
                    >
                        🚪
                    </button>
                </div>
            </div>
        </header>
    );
}
