'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronRight, Building2, TrendingUp, Wallet, Calendar, Plus, X } from 'lucide-react';
import { APARTMENT_DATA, Apartment } from '@/constants/apartments';
import { formatKoreanCurrency } from '@/utils/format';

export default function Home() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); 
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState({ seed: '', saving: '' });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState({ name: '', price: '' });

  const filteredApartments = useMemo(() => {
    return APARTMENT_DATA.filter(apt => 
      apt.name.includes(searchTerm) || apt.region.includes(searchTerm)
    );
  }, [searchTerm]);

  const handleSelectApt = (apt: Apartment) => {
    setSelectedApt(apt);
  };

  const handleCustomSubmit = () => {
    if (customInput.name && customInput.price) {
      const newApt: Apartment = {
        id: Date.now(),
        region: '직접 입력',
        name: customInput.name,
        price: Number(customInput.price)
      };
      setSelectedApt(newApt);
      setIsModalOpen(false);
      setStep(2); // 직접 입력 완료 시 바로 자산 입력 단계로 이동
    }
  };

  const goNext = () => {
    if (step === 0) setStep(1);
    else if (step === 1 && selectedApt) setStep(2);
    else if (step === 2 && assets.seed && assets.saving) setStep(3);
    else if (step === 3) {
      setStep(0);
      setSelectedApt(null);
      setAssets({ seed: '', saving: '' });
      setSearchTerm('');
      setCustomInput({ name: '', price: '' });
    }
  };

  const calculateResult = () => {
    if (!selectedApt || !assets.seed || !assets.saving) return 0;
    const goal = selectedApt.price;
    const current = Number(assets.seed);
    const monthly = Number(assets.saving);
    const remaining = goal - current;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / (monthly * 12));
  };

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#f2f4f6] shadow-lg overflow-hidden relative flex flex-col font-sans">
      
      {/* --- STEP 0: 랜딩 페이지 (2줄 교차 애니메이션) --- */}
      {step === 0 && (
        <div className="flex-1 flex flex-col relative animate-fade-in">
          <div className="pt-20 px-8 pb-10 z-10">
            <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-4">Beta</div>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tighter">내 집 마련,<br /><span className="text-blue-600">몇 년</span> 남았을까?</h1>
            <p className="text-gray-500 text-lg font-medium">100대 아파트 타임라인 확인하기</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6 overflow-hidden pb-32">
            {/* 첫 번째 줄 (왼쪽으로) */}
            <div className="relative w-full">
              <div className="flex w-max animate-scroll-left space-x-4 px-4">
                {[...APARTMENT_DATA.slice(0, 20), ...APARTMENT_DATA.slice(0, 20)].map((apt, index) => (
                  <div key={`row1-${index}`} className="flex-shrink-0 w-48 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-transform active:scale-95">
                    <div className="text-xs text-gray-400 mb-1">{apt.region}</div>
                    <div className="font-bold text-gray-800 truncate mb-1">{apt.name}</div>
                    <div className="text-blue-600 font-bold text-sm">{formatKoreanCurrency(apt.price)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 두 번째 줄 (오른쪽으로) */}
            <div className="relative w-full">
              <div className="flex w-max animate-scroll-right space-x-4 px-4">
                {[...APARTMENT_DATA.slice(20, 40), ...APARTMENT_DATA.slice(20, 40)].map((apt, index) => (
                  <div key={`row2-${index}`} className="flex-shrink-0 w-48 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-transform active:scale-95">
                    <div className="text-xs text-gray-400 mb-1 flex items-center"><TrendingUp size={12} className="mr-1 text-red-400"/> 실거래가</div>
                    <div className="font-bold text-gray-800 truncate mb-1">{apt.name}</div>
                    <div className="text-gray-900 font-bold text-sm">{formatKoreanCurrency(apt.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f2f4f6] via-[#f2f4f6] to-transparent max-w-md mx-auto z-20">
            <button onClick={goNext} className="w-full py-5 rounded-2xl font-bold text-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl">시작하기</button>
          </div>
        </div>
      )}

      {/* --- STEP 1~3 공통 화면 --- */}
      {step > 0 && (
        <>
          <header className="px-6 flex items-center h-16 bg-[#f2f4f6] sticky top-0 z-10">
            <button onClick={() => setStep((prev) => (prev - 1) as any)} className="text-gray-500 mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors">←</button>
            <div className="flex-1 text-center font-bold text-lg text-gray-800 mr-8">
              {step === 1 ? '목표 설정' : step === 2 ? '자산 입력' : '분석 결과'}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
            {/* STEP 1: 아파트 선택 */}
            {step === 1 && (
              <div className="p-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">어디에 살고 싶으세요?</h1>
                
                <div className="mt-8 flex gap-2 mb-6">
                    <div className="flex-1 bg-white p-4 rounded-2xl flex items-center text-gray-400 shadow-sm border border-transparent focus-within:border-blue-500 transition-all">
                        <Search size={20} className="mr-3" />
                        <input 
                            placeholder="아파트 검색" 
                            className="bg-transparent outline-none w-full text-gray-800 font-medium placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white px-4 rounded-2xl shadow-sm border border-transparent hover:border-blue-500 text-blue-600 transition-all flex flex-col items-center justify-center min-w-[75px] active:scale-95"
                    >
                        <Plus size={18} className="mb-0.5" />
                        <span className="text-[10px] font-extrabold uppercase tracking-tight">직접입력</span>
                    </button>
                </div>

                <div className="space-y-4">
                  {filteredApartments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleSelectApt(apt)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer flex justify-between items-center bg-white shadow-sm active:scale-[0.98] ${
                        selectedApt?.id === apt.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">{apt.region}</div>
                        <div className="font-bold text-gray-900">{apt.name}</div>
                      </div>
                      <div className="font-bold text-blue-600">{formatKoreanCurrency(apt.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: 자산 입력 */}
            {step === 2 && (
              <div className="p-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">자산을 입력해주세요</h1>
                <p className="text-gray-500 mb-8 font-medium">{selectedApt?.name} 마련 계획을 세울게요.</p>
                <div className="space-y-10 bg-white p-8 rounded-[2.5rem] shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-blue-500 block mb-3 uppercase tracking-wider">현재 보유 자산</label>
                    <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 pb-3 transition-all">
                      <input type="number" placeholder="0" value={assets.seed} onChange={(e) => setAssets({ ...assets, seed: e.target.value })} className="w-full text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-100" />
                      <span className="text-xl font-bold text-gray-900 ml-2">원</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{assets.seed ? formatKoreanCurrency(Number(assets.seed)) : ''}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-blue-500 block mb-3 uppercase tracking-wider">한 달 저축액</label>
                    <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 pb-3 transition-all">
                      <input type="number" placeholder="0" value={assets.saving} onChange={(e) => setAssets({ ...assets, saving: e.target.value })} className="w-full text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-100" />
                      <span className="text-xl font-bold text-gray-900 ml-2">원</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{assets.saving ? formatKoreanCurrency(Number(assets.saving)) : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: 결과 출력 */}
            {step === 3 && (
              <div className="p-6 animate-fade-in flex flex-col items-center">
                <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-sm text-center mb-6">
                  <div className="inline-block p-4 bg-blue-50 rounded-full mb-6"><Calendar size={48} className="text-blue-500" /></div>
                  <p className="text-gray-500 mb-2 font-medium">{selectedApt?.name}까지</p>
                  <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">앞으로 <span className="text-blue-600">{calculateResult()}년</span></h1>
                  <div className="h-px bg-gray-100 w-full mb-6" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">목표가</span>
                    <span className="font-bold text-gray-800 bg-blue-50 px-2 py-0.5 rounded">{formatKoreanCurrency(selectedApt?.price || 0)}</span>
                  </div>
                </div>
                <div className="w-full bg-blue-600 rounded-3xl p-6 text-white shadow-lg active:scale-95 transition-transform">
                  <p className="text-blue-100 text-sm mb-1 font-bold">나희님을 위한 꿀팁 💡</p>
                  <p className="font-bold leading-relaxed text-pretty">대출을 40% 활용하면 기간을 약 <span className="text-yellow-300">{Math.floor(calculateResult() * 0.4)}년</span> 단축할 수 있어요!</p>
                </div>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 max-w-md mx-auto z-20">
            <button
              onClick={goNext}
              disabled={(step === 1 && !selectedApt) || (step === 2 && (!assets.seed || !assets.saving))}
              className={`w-full py-5 rounded-2xl font-bold text-xl flex justify-center items-center transition-all active:scale-[0.98] ${
                ((step === 1 && selectedApt) || (step === 2 && assets.seed && assets.saving) || step === 3)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {step === 3 ? '다시 계산하기' : '다음'}<ChevronRight className="ml-1" size={24} />
            </button>
          </div>
        </>
      )}

      {/* --- 직접 입력 모달 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">직접 입력하기</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 p-1 active:scale-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="space-y-8 mb-10">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-tighter">아파트 이름</label>
                <input type="text" placeholder="예: 우리집" className="w-full border-b-2 border-gray-100 focus:border-blue-500 outline-none pb-2 font-bold text-xl text-gray-900 transition-all placeholder:text-gray-200" value={customInput.name} onChange={(e) => setCustomInput({...customInput, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-tighter">매매 가격 (원)</label>
                <input type="number" placeholder="예: 500000000" className="w-full border-b-2 border-gray-100 focus:border-blue-500 outline-none pb-2 font-bold text-xl text-gray-900 transition-all placeholder:text-gray-200" value={customInput.price} onChange={(e) => setCustomInput({...customInput, price: e.target.value})} />
                <p className="text-sm text-blue-500 mt-2 font-bold">{customInput.price ? formatKoreanCurrency(Number(customInput.price)) : '가격을 입력해주세요'}</p>
              </div>
            </div>
            <button onClick={handleCustomSubmit} disabled={!customInput.name || !customInput.price} className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${customInput.name && customInput.price ? 'bg-blue-600 text-white shadow-lg active:scale-95' : 'bg-gray-100 text-gray-400'}`}>확인</button>
          </div>
        </div>
      )}
    </main>
  );
}