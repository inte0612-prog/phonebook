'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContactCard from '@/components/contacts/ContactCard';
import ContactForm from '@/components/contacts/ContactForm';
import { supabase } from '@/lib/supabase';
import { encrypt, generateSearchToken } from '@/lib/encryption';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const PAGE_SIZE = 10;

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // fetch contacts from Supabase
  const fetchContacts = useCallback(async (isMore = false) => {
    if (!supabase || !user) {
      setIsLoading(false);
      return;
    }
    if (!isMore) setIsLoading(true);
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (selectedCategory !== '전체') {
        query = query.eq('category', selectedCategory);
      }

      if (searchTerm.trim()) {
        const token = generateSearchToken(searchTerm);
        query = query.or(`name_search.eq.${token},phone_search.eq.${token}`);
      }

      const from = isMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        if (isMore) {
          setContacts(prev => [...prev, ...data]);
          setPage(prev => prev + 1);
        } else {
          setContacts(data);
          setPage(0);
        }
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error('Supabase fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchTerm, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        fetchContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContacts]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchContacts(true);
    }
  };

  const handleSaveContact = async (formData: any) => {
    if (!supabase) {
      alert('데이터베이스 연결 설정이 필요합니다.');
      return;
    }

    const uploadAttachments = async (contactId: string, files: File[]) => {
      if (files.length === 0) return;

      const uploadPromises = files.map(async (file) => {
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
          file_type: file.type,
          user_id: user.id
        };
      });

      const attachmentDatas = await Promise.all(uploadPromises);
      
      const { error } = await supabase
        .from('contact_attachments')
        .insert(attachmentDatas);

      if (error) throw error;
    };

    try {
      const contactData = {
        name: encrypt(formData.name),
        phone: encrypt(formData.phone),
        name_search: generateSearchToken(formData.name),
        phone_search: generateSearchToken(formData.phone),
        category: formData.category,
        memo: formData.memo,
        image_url: formData.image_url,
        user_id: user.id
      };

      let contactId = editingContact?.id;

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', editingContact.id);

        if (error) throw error;
      } else {
        // Insert new contact and get the ID
        const { data, error } = await supabase
          .from('contacts')
          .insert([contactData])
          .select()
          .single();

        if (error) throw error;
        contactId = data.id;
      }

      // Handle attachments if any new files were selected
      if (formData.attachments && formData.attachments.length > 0) {
        await uploadAttachments(contactId, formData.attachments);
      }

      fetchContacts();
      setIsModalOpen(false);
      setEditingContact(null);
    } catch (err) {
      console.error(err);
      alert('저장에 실패했습니다.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!supabase) {
      alert('데이터베이스 연결 설정이 필요합니다.');
      return;
    }
    if (confirm('정말로 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchContacts();
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEditClick = (contact: any) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => { setEditingContact(null); setIsModalOpen(true); }}
        user={user}
      />

      <div className="flex min-h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full">
        {/* Sidebar - Fixed on large screens */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Main Feed */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-outfit tracking-tighter mb-2 text-foreground">
              {selectedCategory === '전체' ? '모든 연락처' : `${selectedCategory}`}
            </h1>
            <p className="text-fb-gray text-sm font-medium">
              {isLoading ? '연락처를 동기화하는 중...' : `${user?.user_metadata?.full_name || user?.email}님의 보관함에 총 ${contacts.length}개의 연락처가 있습니다.`}
            </p>
          </div>

          <div className="space-y-4">
            {isLoading && page === 0 ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {contacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteContact}
                  />
                ))}

                {hasMore && (
                  <div className="py-4 text-center">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="text-primary font-bold hover:underline text-sm disabled:opacity-50 tracking-tight"
                    >
                      {isLoading ? '추가 데이터를 불러오는 중...' : '연락처 더 보기'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {!isLoading && contacts.length === 0 && (
            <div className="bg-white rounded-pro p-12 text-center border-2 border-dashed border-border shadow-sm">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-foreground font-bold font-outfit text-lg mb-1">찾으시는 연락처가 없습니다.</p>
              <p className="text-xs text-fb-gray max-w-xs mx-auto leading-relaxed font-medium">
                검색어를 확인하거나 새로운 연락처를 등록해 보세요. 개인 정보는 철저히 암호화되어 보호됩니다.
              </p>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-72 p-4 pt-8">
          <div className="bg-white p-6 rounded-pro border border-border shadow-pro">
            <h3 className="font-bold font-outfit text-foreground mb-3 flex items-center gap-2">
              <span className="text-primary">🛡️</span> 보안 및 검색 가이드
            </h3>
            <p className="text-xs text-fb-gray leading-relaxed mb-4 font-medium">
              Pro PhoneBook은 <span className="text-primary font-bold">AES-256</span> 등급의 강력한 암호화 기술을 사용합니다. 성함 또는 전화번호를 <span className="text-foreground font-bold">정확히</span> 입력하시면 즉시 검색이 완료됩니다.
            </p>
            <div className="pt-4 border-t border-border mt-4">
               <p className="text-[10px] text-fb-gray font-bold uppercase tracking-widest">System Status</p>
               <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-foreground">Encrypted Cloud Active</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ContactForm
          onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
          onSave={handleSaveContact}
          initialData={editingContact}
        />
      )}
    </>
  );
}
