'use client';

import { useState, useEffect } from 'react';
import { decrypt } from '@/lib/encryption';

const categories = ['가족', '친구', '친척', '동아리', '직장동료'];

export default function ContactForm({
    onClose,
    onSave,
    initialData
}: {
    onClose: () => void,
    onSave: (contact: any) => void,
    initialData?: any
}) {
    const isEdit = !!initialData;
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: '가족',
        memo: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: decrypt(initialData.name),
                phone: decrypt(initialData.phone),
                category: initialData.category,
                memo: initialData.memo || ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-fb-card w-full max-w-md rounded-fb shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">{isEdit ? '연락처 수정하기' : '새 연락처 만들기'}</h2>
                    <button onClick={onClose} className="text-fb-gray hover:bg-gray-100 p-2 rounded-full transition">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">성함</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-fb-blue"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">전화번호</label>
                        <input
                            required
                            type="tel"
                            placeholder="010-0000-0000"
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-fb-blue"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">카테고리</label>
                        <select
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-fb-blue"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">메모 (선택)</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-fb-blue h-24"
                            value={formData.memo}
                            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 font-semibold text-fb-gray hover:bg-gray-100 rounded-md transition"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2 font-semibold text-white bg-fb-blue hover:bg-blue-600 rounded-md transition"
                        >
                            {isEdit ? '수정 완료' : '만들기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
