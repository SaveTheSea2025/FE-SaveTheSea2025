import { useRef, useState} from "react";
import starOutline from "/src/assets/star-outline.png";
import starFilled from "/src/assets/star-filled.png";

interface PhotoUploadSectionProps {
  onChange?: (files: File[]) => void;
  onFavoriteChange?: (index: number) => void;
}

const PhotoUploadSection = ({ onChange, onFavoriteChange }: PhotoUploadSectionProps) => {
  const [images, setImages] = useState<{ url: string; file: File; favorite: boolean }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);

    if (images.length + newFiles.length > 10) {
      alert("최대 10장까지만 업로드할 수 있습니다.");
      return;
    }

    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/bmp", "image/gif"].includes(file.type);
      const isValidSize = file.size <= 3 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length !== newFiles.length) {
      alert("형식은 jpg, jpeg, png, bmp, gif만 가능하며, 크기는 3MB 이하만 업로드 가능합니다.");
    }

    const newImages = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      file,
      favorite: images.length === 0 && index === 0,
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onChange?.(updatedImages.map((img) => img.file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleFavorite = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, favorite: i === index }));
    setImages(updated);
    onFavoriteChange?.(index);
  };

  return (
    <section className="mb-10">
      <h3 className="text-base md:text-lg font-semibold mb-4">활동 사진 첨부</h3>

      <div className="border border-gray-300 border-l-0 border-r-0 p-4 md:p-6 bg-white">
        <p className="text-xs md:text-sm text-gray-600 mb-4 leading-relaxed">
          이미지는 최대 10장, 3MB 이하로 업로드할 수 있습니다.
          <br />
          등록 가능한 형식: jpg, jpeg, bmp, png, gif
          <br />
          대표사진을 지정하지 않으면, 첫 번째 이미지가 자동으로 대표로 설정됩니다.
        </p>

        {/* 드래그 앤 드롭 박스 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${
            isDragging ? "border-sky-500 bg-sky-50" : "border-gray-300 bg-gray-50"
          } border border-dashed rounded-md py-8 md:py-10 px-4 md:px-6 text-center text-gray-500 mb-4 transition-colors`}
        >
          {images.length === 0 ? (
            <p className="text-xs md:text-sm">버튼을 클릭하거나, 이미지를 마우스로 끌어와 업로드하세요.</p>
          ) : (
            <div className="flex flex-wrap justify-start gap-3 md:gap-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-[calc(50%-6px)] md:w-[140px] aspect-square rounded-md overflow-hidden bg-gray-100 shadow-sm"
                >
                  <img
                    src={img.url}
                    alt={`uploaded-${index}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleFavorite(index)}
                    className="absolute top-2 right-2"
                  >
                    <img
                      src={img.favorite ? starFilled : starOutline}
                      alt="star"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 숨겨진 input */}
        <input
          type="file"
          accept="image/jpeg, image/png, image/bmp, image/gif"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 버튼 */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleUploadClick}
            className="bg-[#0369A1] hover:bg-[#025985] text-white px-6 py-2 rounded-md font-medium text-sm md:text-base w-full md:w-auto"
          >
            첨부파일 등록
          </button>
        </div>
      </div>
    </section>
  );
};

export default PhotoUploadSection;