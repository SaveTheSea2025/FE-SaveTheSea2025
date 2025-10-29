import { useState, useRef } from "react";
import starOutline from "/src/assets/star-outline.png";
import starFilled from "/src/assets/star-filled.png";

const PhotoUploadSection = () => {
  const [images, setImages] = useState<{ url: string; favorite: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 10) {
      alert("최대 10장까지만 업로드할 수 있습니다.");
      return;
    }

    const validFiles = newFiles.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/bmp", "image/gif"].includes(file.type);
      const isValidSize = file.size <= 3 * 1024 * 1024; // 3MB 이하
      return isValidType && isValidSize;
    });

    if (validFiles.length !== newFiles.length) {
      alert("형식은 jpg, jpeg, png, bmp, gif만 가능하며, 크기는 3MB 이하만 업로드 가능합니다.");
    }

    const newImages = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      favorite: images.length === 0 && index === 0, // 첫 번째 이미지는 자동 대표
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleFavorite = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        favorite: i === index ? !img.favorite : img.favorite,
      }))
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="mb-10">
      <h3 className="text-lg font-semibold mb-4">활동 사진 첨부</h3>

      <div className="border border-gray-300 border-l-0 border-r-0 p-6 bg-white">
        {/* 안내문 */}
        <p className="text-sm text-gray-600 mb-4">
          이미지는 최대 10장, 3MB 이하로 업로드할 수 있습니다.
          <br />
          등록 가능한 형식: jpg, jpeg, bmp, png, gif
          <br />
          대표사진을 지정하지 않으면, 첫 번째 이미지가 자동으로 대표로 설정됩니다.
        </p>

        {/* 업로드 전 */}
        {images.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md py-10 text-center text-gray-500 mb-4">
            버튼을 클릭하여 파일을 첨부하거나, 원하는 파일을 마우스로 끌어오세요.
          </div>
        )}

        {/* 업로드 후 */}
        {images.length > 0 && (
          <div className="flex gap-4 flex-wrap mb-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative w-[140px] h-[140px] rounded-md overflow-hidden bg-gray-100 shadow-sm"
              >
                <img src={img.url} alt={`uploaded-${index}`} className="object-cover w-full h-full" />
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

        <input
          type="file"
          accept="image/jpeg, image/png, image/bmp, image/gif"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={handleUploadClick}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-md font-medium"
          >
            첨부파일 등록
          </button>
        </div>
      </div>
    </section>
  );
};

export default PhotoUploadSection;
