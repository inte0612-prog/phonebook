'use client';

const categories = ['전체', '가족', '친구', '친척', '동아리', '직장동료'];

export default function Sidebar({
    selectedCategory,
    onSelectCategory
}: {
    selectedCategory: string,
    onSelectCategory: (cat: string) => void
}) {
    return (
        <aside className="w-80 hidden lg:block p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 px-2">연락처 관리</h2>
            <nav>
                <ul className="space-y-1">
                    {categories.map((cat) => (
                        <li key={cat}>
                            <button
                                onClick={() => onSelectCategory(cat)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition ${selectedCategory === cat
                                        ? 'bg-blue-100 text-fb-blue'
                                        : 'hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
