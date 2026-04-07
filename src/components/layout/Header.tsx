'use client';

import Link from 'next/link';

export default function Header({
    searchTerm,
    onSearchChange,
    onAddClick
}: {
    searchTerm: string,
    onSearchChange: (val: string) => void,
    onAddClick: () => void
}) {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 h-14 bg-fb-header shadow-sm border-b">
            <div className="flex items-center gap-2">
                <Link href="/" className="text-fb-blue text-4xl font-bold tracking-tighter">
                    f
                </Link>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="연락처 검색"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="hidden md:block bg-fb-bg rounded-full py-2 px-4 pl-10 text-sm focus:outline-none w-60"
                    />
                    <span className="absolute left-3 text-fb-gray">🔍</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onAddClick}
                    className="bg-fb-blue text-white font-semibold py-1.5 px-4 rounded-md hover:bg-blue-600 transition"
                >
                    새 연락처
                </button>
            </div>
        </header>
    );
}
