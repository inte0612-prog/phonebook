'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContactCard from '@/components/contacts/ContactCard';
import ContactForm from '@/components/contacts/ContactForm';
import { supabase } from '@/lib/supabase';
import { encrypt, generateSearchToken } from '@/lib/encryption';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // fetch contacts from Supabase
  const fetchContacts = useCallback(async (isMore = false) => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    if (!isMore) setIsLoading(true);
    try {
      let query = supabase
        .from('contacts')
        .select('*');

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
    try {
      const contactData = {
        name: encrypt(formData.name),
        phone: encrypt(formData.phone),
        name_search: generateSearchToken(formData.name),
        phone_search: generateSearchToken(formData.phone),
        category: formData.category,
        memo: formData.memo
      };

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', editingContact.id);

        if (!error) {
          fetchContacts();
          setIsModalOpen(false);
          setEditingContact(null);
        } else {
          alert('수정에 실패했습니다.');
        }
      } else {
        // Insert new contact
        const { error } = await supabase
          .from('contacts')
          .insert([contactData]);

        if (!error) {
          fetchContacts();
          setIsModalOpen(false);
        } else {
          alert('저장에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error(err);
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
      />

      <div className="flex min-h-[calc(100vh-3.5rem)] max-w-7xl mx-auto w-full">
        {/* Sidebar - Fixed on large screens */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Main Feed */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {selectedCategory === '전체' ? '모든 연락처' : `${selectedCategory}`}
            </h1>
            <p className="text-fb-gray text-sm">
              {isLoading ? '불러오는 중...' : `총 ${contacts.length}개의 연락처가 있습니다.`}
            </p>
          </div>

          <div className="space-y-4">
            {isLoading && page === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fb-blue"></div>
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
                      className="text-fb-blue font-semibold hover:underline text-sm disabled:opacity-50"
                    >
                      {isLoading ? '불러오는 중...' : '더 보기'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {!isLoading && contacts.length === 0 && (
            <div className="bg-fb-card rounded-fb p-8 text-center border dashed border-gray-300">
              <p className="text-fb-gray font-medium">검색 결과가 없거나 등록된 연락처가 없습니다.</p>
              <p className="text-xs text-gray-400 mt-2">Supabase 테이블 설정 및 환경 변수가 올바른지 확인해 주세요.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-72 p-4 pt-8">
          <div className="bg-fb-card p-4 rounded-fb border border-gray-200 shadow-sm">
            <h3 className="font-bold mb-2">검색 및 보안</h3>
            <p className="text-xs text-fb-gray leading-relaxed mb-4">
              성함 또는 전화번호를 정확히 입력하시면 검색이 가능합니다. (보안상의 이유로 정확한 일치 검색만 지원합니다.)
            </p>
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
