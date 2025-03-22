import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const aItems = ["영화관람권", "모바일 문화 상품권"];
const bItems = ["편의점 상품권", "햄버거 상품권", "커피 상품권", "온누리 상품권", "손톱깎이", "여행용 세트"];

type Group = "A" | "B";
type Item = { name: string; group: Group };

export default function ProductSelector() {
  const [selected, setSelected] = useState<Item[]>([]);
  const [name, setName] = useState("");

  const handleSelect = (item: string, group: Group) => {
    const newItem = { name: item, group };
    const newSelected = [...selected];

    const bCount = newSelected.filter((i) => i.group === "B").length;
    const aCount = newSelected.filter((i) => i.group === "A").length;

    if (group === "A" && aCount >= 1) return;
    if (group === "B" && bCount >= 2) return;
    if (newSelected.length >= 2) return;

    newSelected.push(newItem);
    setSelected(newSelected);
  };

  const handleRemove = (index: number) => {
    const newSelected = [...selected];
    newSelected.splice(index, 1);
    setSelected(newSelected);
  };

  const handleReset = () => setSelected([]);

  const handleConfirm = () => {
    if (name.trim() === "" || selected.length !== 2) return;
    alert(`${name}님이 선택한 기념품: ${selected.map((i) => i.name).join(", ")}`);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-6">
      <h1 className="text-xl font-semibold text-center">기념품 선택</h1>

      {/* 이름 입력 */}
      <div>
        <label className="block text-sm font-medium mb-1">이름</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
        />
      </div>

      {/* A 품목 */}
      <div className="border p-4 rounded-lg space-y-3">
        <h2 className="font-semibold">A 품목 (1개 선택)</h2>
        <div className="grid grid-cols-2 gap-3">
          {aItems.map((item) => (
            <Button
              key={item}
              variant="ghost"
              onClick={() => handleSelect(item, "A")}
              className="flex flex-col items-center gap-2 p-3 border rounded-md"
            >
              <div className="w-20 h-20 bg-gray-200 rounded" />
              <span className="text-sm">{item}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* B 품목 */}
      <div className="border p-4 rounded-lg space-y-3">
        <h2 className="font-semibold">B 품목 (최대 2개 또는 A 1 + B 1)</h2>
        <div className="grid grid-cols-2 gap-3">
          {bItems.map((item) => (
            <Button
              key={item}
              variant="ghost"
              onClick={() => handleSelect(item, "B")}
              className="flex flex-col items-center gap-2 p-3 border rounded-md"
            >
              <div className="w-20 h-20 bg-gray-200 rounded" />
              <span className="text-sm">{item}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* 선택 목록 */}
      <div className="space-y-2">
        <h2 className="font-semibold">선택된 기념품</h2>
        <div className="flex flex-wrap gap-2">
          {selected.map((item, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
            >
              {item.name}
              <button
                className="ml-2 text-gray-500 hover:text-red-500"
                onClick={() => handleRemove(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-4 pt-4">
        <Button onClick={handleReset} variant="ghost" className="px-6 py-2">
          초기화
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selected.length !== 2 || name.trim() === ""}
          className="px-6 py-2"
        >
          확인
        </Button>
      </div>
    </div>
  );
}
