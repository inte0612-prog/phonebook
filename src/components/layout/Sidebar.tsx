'use client';

const categoriesWithIcons = [
    { name: '전체', icon: '📱' },
    { name: '가족', icon: '🏠' },
    { name: '친구', icon: '👋' },
    { name: '친척', icon: '🤝' },
    { name: '동아리', icon: '🏀' },
    { name: '직장동료', icon: '💼' }
];

export default function Sidebar({
    selectedCategory,
    onSelectCategory
}: {
    selectedCategory: string,
    onSelectCategory: (cat: string) => void
}) {
    return (
        <aside className="w-72 hidden lg:block p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-border bg-white/50 backdrop-blur-sm">
            <div className="mb-8 px-2">
                <h2 className="text-xs font-bold text-fb-gray uppercase tracking-widest mb-4">내비게이션</h2>
                <nav>
                    <ul className="space-y-2">
                        {categoriesWithIcons.map((cat) => (
                            <li key={cat.name}>
                                <button
                                    onClick={() => onSelectCategory(cat.name)}
                                    className={`w-full text-left px-4 py-3 rounded-pro font-bold text-[14px] transition-all flex items-center gap-3 ${selectedCategory === cat.name
                                            ? 'bg-primary text-white shadow-pro scale-[1.02]'
                                            : 'text-fb-gray hover:bg-white hover:text-foreground hover:shadow-sm'
                                        }`}
                                >
                                    <span className={`text-lg ${selectedCategory === cat.name ? '' : 'filter grayscale opacity-70'}`}>
                                        {cat.icon}
                                    </span>
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="px-2 mt-auto">
                <div className="bg-primary/5 rounded-pro p-4 border border-primary/10">
                    <p className="text-xs font-bold text-primary mb-1 italic">Pro Feature</p>
                    <p className="text-[11px] text-fb-gray leading-relaxed font-medium">
                        그룹을 무제한으로 생성하고 팀원과 연락처를 연동하세요.
                    </p>
                </div>
            </div>
        </aside>
    );
}
