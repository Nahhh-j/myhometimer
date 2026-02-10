'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, Building2, TrendingUp, Wallet, Calendar, Plus, X, BarChart3, RefreshCw, Lightbulb } from 'lucide-react';
import { Apartment, MOCK_DATA } from '@/constants/apartments';
import { formatKoreanCurrency } from '@/utils/format';

export default function Home() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); 
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState({ seed: '', saving: '' });
  
  const [realData, setRealData] = useState<Apartment[]>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(true); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState({ name: '', price: '' });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/apartments');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setRealData(json.data);
        }
      } catch (err) {
        console.error("데이터 로드 실패");
      } finally {
        setTimeout(() => setIsLoading(false), 300); 
      }
    };
    fetchData();
  }, []);

  const displayRows = useMemo(() => {
    const pool = realData.slice(0, 20);
    const row1 = pool.slice(0, 10);
    const row2 = pool.slice(10, 20);
    return {
      row1: [...row1, ...row1, ...row1],
      row2: [...row2, ...row2, ...row2]
    };
  }, [realData]);

  const filteredApartments = useMemo(() => {
    return realData.filter(apt => 
      apt.name.includes(searchTerm) || apt.region.includes(searchTerm)
    );
  }, [searchTerm, realData]);

  const handleSelectApt = (apt: Apartment) => {
    setSelectedApt(apt);
  };

  const handleCustomSubmit = () => {
    if (customInput.name && customInput.price) {
      const newApt: Apartment = {
        id: Date.now(),
        region: '직접 입력',
        name: customInput.name,
        price: Number(customInput.price) * 10000,
        dealDate: new Date().toLocaleDateString()
      };
      setSelectedApt(newApt);
      setIsModalOpen(false);
      setStep(2); 
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
    if (!selectedApt || !assets.seed || !assets.saving) return { years: 0, advice: "" };
    const goal = selectedApt.price;
    const current = Number(assets.seed) * 10000;
    const monthly = Number(assets.saving) * 10000;
    const remaining = goal - current;
    
    const years = remaining <= 0 ? 0 : Math.ceil(remaining / (monthly * 12));
    
    // 🚨 AI 조언 로직 (임시: 백엔드 AI 연동 전까지 조건별 메시지 생성)
    let advice = "";
    if (years === 0) advice = "이미 목표 금액을 달성하셨네요! 지금 바로 매수 타이밍을 잡아보세요.";
    else if (years <= 5) advice = "목표가 코앞이에요! 조금만 더 절약하거나 대출 전략을 세우면 기간을 더 단축할 수 있어요.";
    else if (years <= 15) advice = "안정적인 자산 형성기입니다. 저축뿐만 아니라 연 5% 이상의 투자 수익을 고려해보세요.";
    else advice = "긴 호흡이 필요한 시점입니다. 소형 아파트부터 시작하는 '갈아타기' 전략이 더 빠를 수 있어요.";

    return { years, advice };
  };

  const result = calculateResult();

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#f2f4f6] shadow-lg overflow-hidden relative flex flex-col font-sans">
      
      {/* STEP 0: 랜딩 페이지 */}
      {step === 0 && (
        <div className="flex-1 flex flex-col relative animate-fade-in">
          <div className="pt-20 px-8 pb-10 z-10">
            <div className={`inline-flex items-center bg-white/80 backdrop-blur-sm border px-3 py-1.5 rounded-full shadow-sm mb-4 transition-colors ${isLoading ? 'border-blue-200' : 'border-blue-100'}`}>
              <BarChart3 size={14} className="text-blue-600 mr-1.5" />
              <span className="text-[11px] font-bold text-blue-700 tracking-tight">
                {isLoading ? "데이터를 가져오는 중입니다" : `실시간 ${realData.length}개 단지 데이터 반영`}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tighter">내 집 마련,<br /><span className="text-blue-600">몇 년</span> 남았을까?</h1>
            <p className="text-gray-500 text-lg font-medium">{realData.length}대 아파트 타임라인 확인하기</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6 overflow-hidden pb-32">
             {!isLoading ? (
               <div className="animate-fade-in">
                 <div className="relative w-full h-32 flex items-center overflow-hidden mb-4">
                  <div className="flex w-max animate-scroll-left space-x-4 px-4">
                    {displayRows.row1.map((apt, index) => (
                      <div key={`row1-${apt.id}-${index}`} className="flex-shrink-0 w-44 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                        <div className="text-[10px] text-gray-400 mb-1">{apt.region}</div>
                        <div className="font-bold text-gray-800 truncate mb-1 text-sm">{apt.name}</div>
                        <div className="text-blue-600 font-bold text-sm">{formatKoreanCurrency(apt.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative w-full h-32 flex items-center overflow-hidden">
                  <div className="flex w-max animate-scroll-right space-x-4 px-4">
                    {displayRows.row2.map((apt, index) => (
                      <div key={`row2-${apt.id}-${index}`} className="flex-shrink-0 w-44 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                        <div className="text-[10px] text-gray-400 mb-1 flex items-center"><TrendingUp size={12} className="mr-1 text-red-400"/> {apt.dealDate}</div>
                        <div className="font-bold text-gray-800 truncate mb-1 text-sm">{apt.name}</div>
                        <div className="text-gray-900 font-bold text-sm">{formatKoreanCurrency(apt.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
               </div>
             ) : (
               <div className="h-64 flex flex-col items-center justify-center space-y-4">
                 <RefreshCw className="text-blue-600 animate-spin" size={32} />
                 <p className="text-sm font-bold text-gray-400 animate-pulse">실거래가를 가져오는 중입니다</p>
               </div>
             )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f2f4f6] via-[#f2f4f6] to-transparent max-w-md mx-auto z-20">
            <button onClick={goNext} className="w-full py-5 rounded-2xl font-bold text-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl text-center">
              시작하기
            </button>
          </div>
        </div>
      )}

      {/* STEP 1~3 공통 화면 */}
      {step > 0 && (
        <>
          <header className="px-6 flex items-center h-20 bg-[#f2f4f6] sticky top-0 z-10">
            <button onClick={() => setStep((prev) => (prev - 1) as any)} className="text-gray-800 mr-2 p-3 hover:bg-gray-200 rounded-full transition-colors active:scale-90"><ChevronLeft size={32} /></button>
            <div className="flex-1 text-center font-bold text-xl text-gray-900 mr-10">{step === 1 ? '목표 설정' : step === 2 ? '자산 입력' : '분석 결과'}</div>
          </header>
          
          <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
            {step === 1 && (
              <div className="p-6 animate-fade-in">
                 <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">어디에 살고 싶으세요?</h1>
                 <p className="text-sm text-gray-400 mb-8 font-medium italic">국토부 2025년 07월 데이터 기준</p>
                 <div className="flex gap-2 mb-6">
                    <div className="flex-1 bg-white p-4 rounded-2xl flex items-center text-gray-400 shadow-sm border border-transparent focus-within:border-blue-500 transition-all">
                        <Search size={20} className="mr-3" />
                        <input placeholder="아파트 검색" className="bg-transparent outline-none w-full text-gray-800 font-medium placeholder:text-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-white px-4 rounded-2xl shadow-sm border border-transparent hover:border-blue-500 text-blue-600 transition-all flex flex-col items-center justify-center min-w-[75px] active:scale-95">
                        <Plus size={18} className="mb-0.5" /> <span className="text-[10px] font-extrabold uppercase tracking-tight">직접입력</span>
                    </button>
                </div>
                <div className="space-y-4">
                  {filteredApartments.map((apt) => (
                    <div key={apt.id} onClick={() => handleSelectApt(apt)} className={`p-5 rounded-3xl border transition-all cursor-pointer flex justify-between items-center bg-white shadow-sm active:scale-[0.98] ${selectedApt?.id === apt.id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-transparent'}`}>
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
            
            {step === 2 && (
              <div className="p-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">자산을 입력해주세요</h1>
                <p className="text-gray-500 mb-8 font-medium">{selectedApt?.name} 마련 계획을 세울게요.</p>
                <div className="space-y-10 bg-white p-8 rounded-[2.5rem] shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-blue-500 block mb-3 uppercase tracking-wider">현재 보유 자산</label>
                    <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 pb-3 transition-all">
                      <input type="number" placeholder="0" value={assets.seed} onChange={(e) => setAssets({ ...assets, seed: e.target.value })} className="w-full text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-400 bg-transparent min-w-0" />
                      <span className="text-xl font-bold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">만원</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-blue-500 block mb-3 uppercase tracking-wider">한 달 저축액</label>
                    <div className="flex items-center border-b-2 border-gray-100 focus-within:border-blue-500 pb-3 transition-all">
                      <input type="number" placeholder="0" value={assets.saving} onChange={(e) => setAssets({ ...assets, saving: e.target.value })} className="w-full text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-400 bg-transparent min-w-0" />
                      <span className="text-xl font-bold text-gray-900 ml-2 whitespace-nowrap flex-shrink-0">만원</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🚨 STEP 3: 결과 및 AI 조언 영역 복구 */}
            {step === 3 && (
              <div className="p-6 animate-fade-in flex flex-col items-center">
                <div className="w-full bg-white rounded-[2.5rem] p-8 shadow-sm text-center mb-6">
                  <div className="inline-block p-4 bg-blue-50 rounded-full mb-6"><Calendar size={48} className="text-blue-500" /></div>
                  <p className="text-gray-500 mb-2 font-medium">{selectedApt?.name}까지</p>
                  <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">앞으로 <span className="text-blue-600">{result.years}년</span></h1>
                  <div className="h-px bg-gray-100 w-full mb-6" />
                  <div className="flex justify-between text-sm items-center mb-2">
                    <span className="text-gray-400">목표가</span>
                    <span className="font-bold text-gray-800">{formatKoreanCurrency(selectedApt?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-400">준비된 자산</span>
                    <span className="font-bold text-blue-600">{formatKoreanCurrency(Number(assets.seed) * 10000)}</span>
                  </div>
                </div>

                {/* AI 조언 카드 섹션 */}
                <div className="w-full bg-blue-600 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Lightbulb size={80} className="text-white" />
                  </div>
                  <div className="flex items-center space-x-2 mb-3 relative z-10">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                      <Lightbulb size={18} className="text-white" />
                    </div>
                    <span className="text-white font-bold">나희님을 위한 AI 조언</span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed font-medium relative z-10">
                    {result.advice}
                  </p>
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
              {step === 1 ? '다음' : step === 2 ? '분석 결과 보러가기' : '다시 계산하기'}
            </button>
          </div>
          
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
                            <input type="text" placeholder="예: 우리집" className="w-full border-b-2 border-gray-100 focus:border-blue-500 outline-none pb-2 font-bold text-xl text-gray-900 transition-all placeholder:text-gray-400" value={customInput.name} onChange={(e) => setCustomInput({...customInput, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-tighter">매매 가격</label>
                            <div className="flex items-center border-b-2 border-gray-100 focus:border-blue-500 transition-all">
                                <input type="number" placeholder="예: 50000" className="w-full outline-none pb-2 font-bold text-xl text-gray-900 bg-transparent min-w-0 placeholder:text-gray-400" value={customInput.price} onChange={(e) => setCustomInput({...customInput, price: e.target.value})} />
                                <span className="font-bold text-gray-900 pb-2 ml-1 whitespace-nowrap flex-shrink-0">만원</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleCustomSubmit} disabled={!customInput.name || !customInput.price} className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${customInput.name && customInput.price ? 'bg-blue-600 text-white shadow-lg active:scale-95' : 'bg-gray-100 text-gray-400'}`}>확인</button>
                </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}