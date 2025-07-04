import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Spinner from "@/components/Spinner";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  category: "A" | "B";
  sort_order: number;
  allow_multiple: boolean;
  visible: boolean;
}

export default function ProductSelector() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [loadingGiftItems, setLoadingGiftItems] = useState(true);
  const [showTooltipId, setShowTooltipId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  useEffect(() => {
    async function fetchLocation() {
      setLoadingLocation(true);
      const { data, error } = await supabase
        .from("donation_locations")
        .select("name")
        .eq("id", locationId)
        .single();

      if (!error && data) {
        setLocationName(data.name);
      } else {
        setLocationName(null);
        showError("헌혈 장소 정보를 불러오지 못했습니다.");
      }
      setLoadingLocation(false);
    }

    if (locationId) fetchLocation();
  }, [locationId]);

  useEffect(() => {
    async function fetchGiftItems() {
      if (!locationId) return;
      setLoadingGiftItems(true);

      const { data, error } = await supabase
        .from("location_gift_items")
        .select(`
          gift_item_id,
          category,
          sort_order,
          allow_multiple,
          visible,
          gift_items (
            id,
            name,
            image_url,
            description
          )
        `)
        .eq("location_id", locationId)
        .eq("visible", true)
        .order("category")
        .order("sort_order");

      if (!error && data) {
        const mapped = data.map((entry: any) => ({
          id: entry.gift_items.id,
          name: entry.gift_items.name,
          image_url: entry.gift_items.image_url,
          description: entry.gift_items.description,
          category: entry.category,
          sort_order: entry.sort_order,
          allow_multiple: entry.allow_multiple,
          visible: entry.visible,
        }));
        setGiftItems(mapped);
      } else {
        showError("기념품 목록을 불러오지 못했습니다.");
      }
      setLoadingGiftItems(false);
    }

    fetchGiftItems();
  }, [locationId]);
  const aItems = giftItems.filter((item) => item.category === "A");
  const bItems = giftItems.filter((item) => item.category === "B");

  const isValidSelection = (itemName: string) => {
    const item = giftItems.find((i) => i.name === itemName);
    if (!item) return false;

    const total = selectedItems.length;
    if (total >= 2) return false;

    if (item.category === "A") {
      const selectedAItems = selectedItems.filter((i) =>
        aItems.some((a) => a.name === i)
      );

      const distinctSelectedA = [...new Set(selectedAItems)];
      const countOfThisItem = selectedItems.filter((i) => i === item.name).length;

      if (
        distinctSelectedA.length === 0 ||
        (distinctSelectedA.length === 1 && distinctSelectedA[0] === item.name)
      ) {
        return item.allow_multiple ? countOfThisItem < 2 : countOfThisItem < 1;
      }

      return false;
    }

    if (item.category === "B") {
      return total < 2;
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

  const handleSubmit = async () => {
    if (selectedItems.length !== 2 || !userName.trim()) return;

    if (!locationId || !locationName) {
      alert("헌혈 장소 정보를 불러오지 못해 저장할 수 없습니다.");
      return;
    }

    const { error } = await supabase.from("gift_records").insert([
      {
        name: userName.trim(),
        items: selectedItems,
        timestamp: new Date().toISOString(),
        location_id: locationId,
      },
    ]);

    if (!error) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      handleReset();
    } else {
      showError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const sortedSelectedItems = [
    ...selectedItems.filter((item) => aItems.some((a) => a.name === item)),
    ...selectedItems.filter((item) => bItems.some((b) => b.name === item)),
  ];

  const canSubmit = selectedItems.length === 2 && userName.trim() !== "";

  const renderItemCard = (item: GiftItem) => {
    const isSelected = selectedItems.includes(item.name);
    return (
      <Button
        key={item.name}
        onClick={() => handleSelect(item.name)}
        disabled={!isValidSelection(item.name)}
        variant="outline"
        className={cn(
          "flex flex-col items-center space-y-2 p-3 h-36 relative",
          isSelected && "border-redCrossRed bg-red-50"
        )}
        onMouseLeave={() => setShowTooltipId(null)}
      >
      <div
        className="relative w-full max-h-24 aspect-[2/1]"
        onTouchStart={() => setShowTooltipId(item.id)}
        onMouseEnter={() => setShowTooltipId(item.id)}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-contain rounded shadow-inner"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded shadow-inner" />
        )}
  
        {item.allow_multiple && (
          <span className="absolute top-1 right-1 text-[10px] bg-yellow-300 text-gray-800 px-1.5 py-0.5 rounded font-medium shadow-sm">
            🔁 중복 선택 가능
          </span>
        )}
  
        {item.description && showTooltipId === item.id && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 w-48 bg-black text-white text-xs rounded px-2 py-1 z-10 pointer-events-none text-center">
            {item.description}
          </div>
        )}
      </div>
  
      <div className="flex items-center gap-1 justify-center mt-2">
        <span className="text-sm text-center">{item.name}</span>
        {item.description && (
          <div
            className="cursor-help text-xs text-gray-400"
            onMouseEnter={() => setShowTooltipId(item.id)}
            onTouchStart={() => setShowTooltipId(item.id)}
          >
            ℹ️
          </div>
        )}
      </div>
    </Button>
  );
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 relative">
      {showToast && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm px-4 py-2 rounded shadow-lg animate-fade-in-out z-50"
        >
          🎉 선택 완료!
        </div>
      )}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-4 py-2 rounded shadow-lg animate-fade-in-out z-50"
        >
          {errorMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold text-center mb-1">기념품 선택</h1>
      {loadingLocation ? (
        <div className="flex justify-center my-2">
          <Spinner className="h-5 w-5 text-gray-400" />
        </div>
      ) : locationName ? (
        <p className="text-center text-sm text-gray-500 mb-4">{locationName}</p>
      ) : (
        <p className="text-center text-sm text-red-500 mb-4">헌혈 장소 정보를 불러오지 못했습니다.</p>
      )}

      <div className="rounded border p-3 bg-blue-50 text-sm text-blue-800 space-y-1">
        <p className="font-medium">🎯 선택 기준</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>A 품목 1개 + B 품목 1개 선택 가능</li>
          <li> 또는 B 품목 2개 선택 가능</li>
        </ul>
        {aItems.some((i) => i.allow_multiple) && (
          <>
            <p className="font-medium pt-2">📌 예외 사항</p>
            <ul className="list-disc pl-5">
              <li>
                아래 A 품목은 동일 품목을 2개까지 선택하실 수 있습니다:&nbsp;
                {aItems
                  .filter((i) => i.allow_multiple)
                  .map((i) => `‘${i.name}’`)
                  .join(", ")}
              </li>
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <label htmlFor="donor-name" className="text-gray-700 font-medium text-base">
          이름을 입력하세요
        </label>
        <Input
          id="donor-name"
          name="name"
          type="text"
          autoComplete="name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="이름 입력"
          className="w-full max-w-sm text-base"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">A 품목</h2>
        {loadingGiftItems ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-36 rounded border bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">{aItems.map(renderItemCard)}</div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">B 품목</h2>
        {loadingGiftItems ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-36 rounded border bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">{bItems.map(renderItemCard)}</div>
        )}
      </div>

      <div>
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          {selectedItems.length === 0 ? (
            <p className="text-gray-400 text-center">아직 선택된 기념품이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {sortedSelectedItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center justify-between gap-3 p-2 border rounded-lg bg-gray-50 shadow-inner"
                >
                  <div className="text-gray-700 text-sm font-medium">{item}</div>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="선택 항목 삭제"
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
        <Button disabled={!canSubmit} onClick={handleSubmit} variant="primary" className="w-1/2">
          완료
        </Button>
      </div>
    </div>
  );
}
