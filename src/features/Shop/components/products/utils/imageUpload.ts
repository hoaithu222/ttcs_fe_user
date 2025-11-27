import { imagesApi } from "@/core/api/images";
import type { UploadedImageAsset } from "../types";

export const uploadAndRegisterImage = async (file: File): Promise<UploadedImageAsset> => {
  const uploadResult = await imagesApi.uploadImage(file);
  if (!uploadResult?.url || !uploadResult?.publicId) {
    throw new Error("Không thể tải lên ảnh. Vui lòng thử lại.");
  }

  const createdImage = await imagesApi.createImage({
    url: uploadResult.url,
    publicId: uploadResult.publicId,
  });

  const imageData = (createdImage?.data || createdImage) as {
    _id?: string;
    url?: string;
    publicId?: string;
  };

  return {
    _id: imageData?._id,
    url: imageData?.url || uploadResult.url,
    publicId: imageData?.publicId || uploadResult.publicId,
  };
};

