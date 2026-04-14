'use client';

import { decrypt } from '@/lib/encryption';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Contact {
    id: string;
    name: string; // Encrypted
    phone: string; // Encrypted
    category: string;
    memo?: string;
    image_url?: string;
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
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchAttachments = async () => {
            const { data, error } = await supabase
                .from('contact_attachments')
                .select('*')
                .eq('contact_id', contact.id);
            
            if (!error && data) {
                setAttachments(data);
            }
        };
        fetchAttachments();
    }, [contact.id]);

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return '🖼️';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('text')) return '📝';
        return '📁';
    };

    return (
        <div className="bg-white rounded-pro shadow-pro p-5 mb-4 border border-border hover:shadow-pro-lg hover:scale-[1.005] transition-all duration-300">
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-pro-lg bg-background border border-border flex-shrink-0 overflow-hidden shadow-sm">
                        {contact.image_url ? (
                            <img src={contact.image_url} alt={decryptedName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-xl font-bold font-outfit">
                                {decryptedName?.[0]?.toUpperCase() || '?'}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-xl font-bold font-outfit tracking-tight text-foreground">
                                {decryptedName || '이름 없음'}
                            </h3>
                            <span className="px-2 py-0.5 rounded-pro-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                {contact.category}
                            </span>
                        </div>
                        <p className="text-primary font-bold text-sm tracking-wide">
                            {decryptedPhone}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(contact)}
                        className="text-fb-gray hover:text-primary hover:bg-primary/5 p-2 rounded-pro transition-all"
                        title="수정"
                    >
                        <span className="text-sm">✏️</span>
                    </button>
                    <button
                        onClick={() => onDelete(contact.id)}
                        className="text-fb-gray hover:text-red-500 hover:bg-red-50 p-2 rounded-pro transition-all"
                        title="삭제"
                    >
                        <span className="text-sm">🗑️</span>
                    </button>
                </div>
            </div>

            {contact.memo && (
                <div className="mt-4 p-3 rounded-pro bg-background border-l-4 border-primary/20">
                    <p className="text-xs text-fb-gray leading-relaxed font-bold italic">
                        "{contact.memo}"
                    </p>
                </div>
            )}

            {/* Attachments Section */}
            {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-bold text-fb-gray uppercase tracking-widest">첨부 파일 ({attachments.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((file) => (
                            <a 
                                key={file.id}
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2 rounded-pro bg-fb-bg border border-border hover:border-primary/30 hover:bg-white transition-all group"
                            >
                                <span className="text-lg">{getFileIcon(file.file_type)}</span>
                                <span className="text-[12px] font-bold text-fb-gray group-hover:text-primary truncate">{file.file_name}</span>
                                <span className="ml-auto text-fb-gray opacity-0 group-hover:opacity-100 transition-opacity">⬇️</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[10px] text-fb-gray uppercase tracking-widest font-bold">
                    <span className="opacity-50">Added on</span>
                    <span>{new Date(contact.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                    >
                        {isExpanded ? '닫기' : '자세히 보기'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 p-4 rounded-pro bg-slate-50 border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-fb-gray font-bold mb-2 uppercase tracking-widest opacity-60">System Metadata</p>
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                        <div>
                            <span className="block text-fb-gray font-bold">Unique ID</span>
                            <span className="font-mono">{contact.id}</span>
                        </div>
                        <div>
                            <span className="block text-fb-gray font-bold">Encrypted Data Status</span>
                            <span className="text-green-600 font-bold">🛡️ Secure AES-256</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
