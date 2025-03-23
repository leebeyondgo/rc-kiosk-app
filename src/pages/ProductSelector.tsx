import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  category: "A" | "B";
  image?: string;
}

export default function ProductSelector() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const navigate = useNavigate();

  // Supabase로 바꾸는 예시
  useEffect(() => {
    async function fetchGiftItems() {
      const { data, error } = await supabase.from('gift_items').select('*');
      if (error) {
        console.error(error);
        return;
      }
      setGiftItems(data as GiftItem[]);
    }

    fetchGiftItems();
  }, []);

  const aItems = giftItems.filter((item) => item.category === "A");
  const bItems = giftItems.filter((item) => item.category === "B");

  const countA = selectedItems.filter((item) => aItems.some((a) => a.name === item)).length;
  const countB = selectedItems.filter((item) => bItems.some((b) => b.name === item)).length;

  const isValidSelection = (item: string) => {
    if (aItems.some((i) => i.name === item)) {
      return countA < 1 && selectedItems.length < 2;
    } else if (bItems.some((i) => i.name === item)) {
      return selectedItems.length < 2;
    }
    return false;
  };

  const handleSelect = (item: string) => {
    if (isValidSelection(item)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemove = (item: string) => {
    const index = selectedItems.indexOf(item);
    if (index !== -1) {
      const updated = [...selectedItems];
      updated.splice(index, 1);
      setSelectedItems(updated);
    }
  };

  const handleReset = () => {
    setSelectedItems([]);
    setUserName("");
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const newRecord = {
      name: userName.trim(),
      items: selectedItems,
      timestamp: new Date(),
    };

    addDoc(collection(db, "giftData"), newRecord).catch((err) => {
      console.error("저장 실패:", err);
    });

    alert(`${userName}님 선택 완료!`);
    handleReset();
  };

  const getItemCounts = (items: string[]) => {
    const counts: { [key: string]: number } = {};
    items.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
    return counts;
  };

  const itemCounts = getItemCounts(selectedItems);
  const canSubmit = selectedItems.length === 2 && userName.trim() !== "";

  const renderItemCard = (item: GiftItem) => (
    <Button
      key={item.name}
      onClick={() => handleSelect(item.name)}
      disabled={!isValidSelection(item.name)}
      variant="outline"
      className="flex flex-col items-center space-y-2 p-3 h-32"
    >
      <div className="w-16 h-16 bg-gray-200 rounded shadow-inner" />
      <span className="text-sm text-center">{item.name}</span>
    </Button>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">기념품 선택</h1>
        <Button variant="ghost" onClick={() => navigate("/admin")}>
          관리자 페이지
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <label htmlFor="username" className="text-gray-700 font-medium">이름을 입력하세요</label>
        <Input
          id="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="이름 입력"
          className="w-full max-w-sm"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">A 품목</h2>
        <div className="grid grid-cols-2 gap-4">
          {aItems.map(renderItemCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">B 품목</h2>
        <div className="grid grid-cols-2 gap-4">
          {bItems.map(renderItemCard)}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">선택된 기념품</h2>
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          {selectedItems.length === 0 ? (
            <p className="text-gray-400 text-center">아직 선택된 기념품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(itemCounts).map(([item, count], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-2 border rounded-lg bg-gray-50 shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded" />
                    <div className="text-gray-700 text-sm font-medium">
                      {item} {count > 1 ? `x${count}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <Button onClick={handleReset} variant="secondary" className="w-1/2">
          초기화
        </Button>
        <Button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-1/2"
        >
          완료
        </Button>
      </div>
    </div>
  );
}