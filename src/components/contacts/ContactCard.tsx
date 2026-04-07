'use client';

import { decrypt } from '@/lib/encryption';

interface Contact {
    id: string;
    name: string; // Encrypted
    phone: string; // Encrypted
    category: string;
    memo?: string;
    created_at: string;
}

export default function ContactCard({
    contact,
    onEdit,
    onDelete
}: {
    contact: Contact,
    onEdit: (contact: Contact) => void,
    onDelete: (id: string) => void
}) {
    const decryptedName = decrypt(contact.name);
    const decryptedPhone = decrypt(contact.phone);

    return (
        <div className="bg-fb-card rounded-fb shadow-sm p-4 mb-4 border border-gray-200 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-fb-blue">
                        {decryptedName || '이름 없음'}
                    </h3>
                    <p className="text-fb-gray text-sm font-medium">
                        {contact.category}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(contact)}
                        className="text-fb-gray hover:bg-gray-100 p-1.5 rounded-full transition"
                        title="수정"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(contact.id)}
                        className="text-fb-gray hover:bg-gray-100 p-1.5 rounded-full transition"
                        title="삭제"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-base font-semibold">{decryptedPhone}</p>
                {contact.memo && (
                    <p className="text-sm text-fb-gray bg-gray-50 p-2 rounded-md italic">
                        "{contact.memo}"
                    </p>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-fb-gray">
                <span>등록일: {new Date(contact.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
