/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import instance from "../../api/axios";

interface ExportButtonProps {
  viewMode: "mine" | "all";
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  region: string;
}

const ExportButton = ({
  viewMode,
  startYear,
  startMonth,
  endYear,
  endMonth,
  region,
}: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 엑셀 다운로드
  const handleExcelDownload = async () => {
    try {
      const params = {
        viewType: viewMode, // mine 또는 all
        startYear,
        startMonth,
        endYear,
        endMonth,
        region: region || undefined,
      };

      console.log("엑셀 다운로드 요청:", params);

      // instance 사용 (headers 설정 제거)
      const response = await instance.get("/api/export/excel", {
        params,
        responseType: "blob", // 파일 다운로드를 위해 blob 타입
      });

      // Blob을 사용하여 파일 다운로드
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 파일명 생성 (예: 통계데이터_2024-12_2025-12.xlsx)
      const fileName = `통계데이터_${startYear}-${String(startMonth).padStart(2, "0")}_${endYear}-${String(endMonth).padStart(2, "0")}.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      // 정리
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("엑셀 다운로드 완료");
      setIsOpen(false);
    } catch (error: any) {
      console.error("엑셀 다운로드 실패:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert("엑셀 다운로드에 실패했습니다.");
    }
  };

  // PDF 다운로드
  const handlePdfDownload = async () => {
    try {
      const params = {
        viewType: viewMode,
        startYear,
        startMonth,
        endYear,
        endMonth,
        region: region || undefined,
      };

      console.log("PDF 다운로드 요청:", params);

      // instance 사용 (headers 설정 제거)
      const response = await instance.get("/api/export/pdf", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName = `통계보고서_${startYear}-${String(startMonth).padStart(2, "0")}_${endYear}-${String(endMonth).padStart(2, "0")}.pdf`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("PDF 다운로드 완료");
      setIsOpen(false);
    } catch (error: any) {
      console.error("PDF 다운로드 실패:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 파일 다운 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">파일 다운</span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {/* PDF 다운로드 */}
            <button
              onClick={handlePdfDownload}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">PDF 보고서 다운로드</p>
                <p className="text-xs text-gray-500">통계 보고서 PDF</p>
              </div>
            </button>

            {/* 구분선 */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* 엑셀 다운로드 */}
            <button
              onClick={handleExcelDownload}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">데이터 엑셀 다운로드</p>
                <p className="text-xs text-gray-500">통계 데이터 Excel</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;