import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList, PackageOpen } from "lucide-react";

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">관리자 페이지</h1>
        <Button
          onClick={() => navigate("/")}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          돌아가기
        </Button>
      </div>

      <div className="grid gap-4">
        <Button
          className="w-full justify-start gap-3 text-left"
          variant="outline"
          onClick={() => navigate("/admin/records")}
        >
          <ClipboardList size={18} />
          선택 내역 보기
        </Button>

        <Button
          className="w-full justify-start gap-3 text-left"
          variant="outline"
          onClick={() => navigate("/admin/items")}
        >
          <PackageOpen size={18} />
          기념품 목록 편집
        </Button>
      </div>
    </div>
  );
}
