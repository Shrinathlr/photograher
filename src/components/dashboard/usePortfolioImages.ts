import { useState, useEffect, useCallback } from "react";
import { storageService, authService } from "@/lib/supabaseService";
import { toast } from "@/hooks/use-toast";

export function usePortfolioImages() {
  const [images, setImages] = useState<{ name: string; publicUrl: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingImageName, setDeletingImageName] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      const user = await authService.getCurrentUser();
      setUserId(user?.id || null);
    };
    initializeUser();
  }, []);

  const fetchImages = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const imagesData = await storageService.getPortfolioImages(userId);
      setImages(imagesData);
      console.log("[Portfolio] Fetched images:", imagesData.length);
    } catch (error) {
      console.error("[Portfolio] Unexpected error fetching images:", error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchImages();
  }, [userId, fetchImages]);

  const uploadImage = async (file: File) => {
    if (!userId) return;
    setUploading(true);
    try {
      const publicUrl = await storageService.uploadPortfolioImage(userId, file);
      
      if (publicUrl) {
        toast({
          title: "Success",
          description: "Image uploaded to your gallery.",
        });
        await fetchImages();
      } else {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload image.",
        });
      }
    } catch (error) {
      console.error("[Portfolio] Unexpected upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "An unexpected error occurred.",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (filename: string) => {
    if (!userId) return;
    setDeletingImageName(filename);

    try {
      const success = await storageService.deletePortfolioImage(userId, filename);
      
      if (success) {
        toast({
          title: "Deleted",
          description: "Image removed from your gallery.",
        });
        await fetchImages();
      } else {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: "Failed to delete image.",
        });
        await fetchImages();
      }
    } catch (error) {
      console.error("[Portfolio] Unexpected delete error:", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "An unexpected error occurred.",
      });
      await fetchImages();
    } finally {
      setDeletingImageName(null);
    }
  };

  return {
    images,
    isLoading,
    uploading,
    deletingImageName,
    uploadImage,
    deleteImage,
  };
}
