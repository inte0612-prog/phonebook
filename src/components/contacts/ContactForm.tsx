'use client';

import { useState, useEffect, useRef } from 'react';
import { decrypt } from '@/lib/encryption';
import { supabase } from '@/lib/supabase';

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: '가족',
        memo: '',
        image_url: ''
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const loadContactData = async () => {
            if (initialData) {
                setFormData({
                    name: decrypt(initialData.name),
                    phone: decrypt(initialData.phone),
                    category: initialData.category,
                    memo: initialData.memo || '',
                    image_url: initialData.image_url || ''
                });
                if (initialData.image_url) {
                    setPreviewUrl(initialData.image_url);
                }

                // Fetch existing attachments if editing
                const { data, error } = await supabase
                    .from('contact_attachments')
                    .select('*')
                    .eq('contact_id', initialData.id);
                
                if (!error && data) {
                    setExistingAttachments(data);
                }
            }
        };
        loadContactData();
    }, [initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('프로필 사진은 2MB 이하여야 합니다.');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        
        if (totalSize > 10 * 1024 * 1024) {
            alert('전체 첨부 파일 크기는 10MB를 넘을 수 없습니다.');
            return;
        }

        setSelectedAttachments(prev => [...prev, ...files]);
    };

    const removeSelectedAttachment = (index: number) => {
        setSelectedAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const deleteExistingAttachment = async (id: string) => {
        if (confirm('이 첨부 파일을 삭제하시겠습니까?')) {
            const { error } = await supabase
                .from('contact_attachments')
                .delete()
                .eq('id', id);
            
            if (!error) {
                setExistingAttachments(prev => prev.filter(att => att.id !== id));
            }
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `profile/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('contact_images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('contact_images')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const uploadAttachments = async (contactId: string) => {
        const uploadPromises = selectedAttachments.map(async (file) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${contactId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('contact_files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('contact_files')
                .getPublicUrl(filePath);

            return {
                contact_id: contactId,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type
            };
        });

        const attachmentDatas = await Promise.all(uploadPromises);
        
        const { error } = await supabase
            .from('contact_attachments')
            .insert(attachmentDatas);

        if (error) throw error;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            let finalImageUrl = formData.image_url;

            if (selectedFile) {
                finalImageUrl = await uploadImage(selectedFile);
            }

            // Call onSave which returns the contact or its ID
            await onSave({ ...formData, image_url: finalImageUrl, attachments: selectedAttachments });
            onClose();
        } catch (error) {
            console.error('Error in form submission:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-pro-lg shadow-pro-lg overflow-hidden animate-in zoom-in duration-300 border border-border">
                <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
                    <h2 className="text-2xl font-bold font-outfit tracking-tighter text-foreground">
                        {isEdit ? '연락처 수정' : '새 연락처'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-fb-gray hover:bg-background hover:text-foreground w-10 h-10 flex items-center justify-center rounded-pro transition-all"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Image Column */}
                        <div className="md:col-span-1 flex flex-col items-center gap-4">
                            <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest self-start px-1">프로필 사진</label>
                            <div 
                                className="w-full aspect-square rounded-pro bg-background border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all relative group shadow-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-3xl block mb-1">📸</span>
                                        <span className="text-[10px] font-bold text-fb-gray uppercase tracking-widest">사진 추가</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <span className="text-white text-xs font-bold bg-primary px-3 py-1.5 rounded-pro shadow-pro">변경</span>
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>

                        {/* Basic Info Column */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">성함</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="이름을 입력하세요"
                                    className="w-full bg-background border border-border rounded-pro py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">전화번호</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="010-0000-0000"
                                    className="w-full bg-background border border-border rounded-pro py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">분류 카테고리</label>
                                <select
                                    className="w-full bg-background border border-border rounded-pro py-2.5 px-4 focus:outline-none focus:border-primary transition-all text-sm font-bold cursor-pointer"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">첨부 파일</label>
                            <div className="border-2 border-dashed border-border rounded-pro p-4 bg-background/30 hover:bg-background/50 transition-all">
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={handleAttachmentsChange} 
                                    className="hidden" 
                                    id="attachments-upload"
                                />
                                <label 
                                    htmlFor="attachments-upload" 
                                    className="flex flex-col items-center justify-center cursor-pointer py-2"
                                >
                                    <span className="text-2xl mb-1">📁</span>
                                    <span className="text-xs font-bold text-fb-gray">여기를 눌러 파일 추가 (최대 10MB)</span>
                                </label>
                            </div>

                            {/* Existing & Selected Files List */}
                            {(existingAttachments.length > 0 || selectedAttachments.length > 0) && (
                                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto p-1">
                                    {existingAttachments.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-pro border border-slate-100 text-[13px]">
                                            <span className="flex items-center gap-2 truncate">
                                                <span className="text-blue-500">📎</span>
                                                <span className="truncate font-medium">{file.file_name}</span>
                                            </span>
                                            <button 
                                                type="button"
                                                onClick={() => deleteExistingAttachment(file.id)}
                                                className="text-red-400 hover:text-red-600 px-2"
                                            >✕</button>
                                        </div>
                                    ))}
                                    {selectedAttachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded-pro border border-blue-100 text-[13px]">
                                            <span className="flex items-center gap-2 truncate text-blue-700">
                                                <span className="animate-pulse">📤</span>
                                                <span className="truncate font-bold italic">{file.name}</span>
                                            </span>
                                            <button 
                                                type="button"
                                                onClick={() => removeSelectedAttachment(idx)}
                                                className="text-blue-400 hover:text-blue-600 px-2"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-fb-gray uppercase tracking-widest px-1">참조 메모 (선택)</label>
                            <textarea
                                placeholder="특이사항을 입력하세요..."
                                className="w-full bg-background border border-border rounded-pro py-3 px-4 focus:outline-none focus:border-primary transition-all text-sm font-medium h-24 resize-none"
                                value={formData.memo}
                                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 font-bold text-fb-gray hover:bg-background rounded-pro transition-all text-[14px]"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-[2] px-4 py-3.5 font-bold text-white bg-primary hover:bg-primary-dark rounded-pro shadow-pro hover:shadow-pro-lg transform active:scale-[0.98] transition-all disabled:opacity-50 text-[14px]"
                        >
                            {isUploading ? '처리 중...' : (isEdit ? '수정 완료' : '새 연락처 등록')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
