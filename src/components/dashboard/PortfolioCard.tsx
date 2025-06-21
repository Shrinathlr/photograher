import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { usePortfolioImages } from "@/components/dashboard/usePortfolioImages";
import { toast } from "@/hooks/use-toast";

const PortfolioCard = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const {
    images, isLoading, uploadImage, deleteImage,
    uploading, deletingImageName
  } = usePortfolioImages();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      await uploadImage(files[0]);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-0 shadow-2xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
      
      <CardHeader className="relative z-10 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm border-b border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                My Portfolio
              </CardTitle>
              <CardDescription className="text-purple-200/80 mt-1">
                Showcase your best work to attract clients
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  await uploadImage(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Add Photo"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <p className="text-purple-200/80">Loading your portfolio...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-purple-400 bg-purple-500/20 scale-105' 
                : 'border-purple-300/50 bg-white/5 hover:border-purple-300 hover:bg-white/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full">
                <ImageIcon className="h-12 w-12 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No portfolio images yet</h3>
                <p className="text-purple-200/70 mb-4">Upload your best work to showcase your skills</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Image
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div 
                  key={img.name} 
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={img.publicUrl}
                    alt="Portfolio"
                    className="h-full w-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay with delete button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-2 right-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 bg-red-500/90 hover:bg-red-600 border-0 shadow-lg backdrop-blur-sm"
                        onClick={() => deleteImage(img.name)}
                        disabled={deletingImageName === img.name}
                        aria-label="Delete"
                      >
                        {deletingImageName === img.name ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              ))}
            </div>
            
            {/* Upload more section */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                isDragOver 
                  ? 'border-purple-400 bg-purple-500/20 scale-105' 
                  : 'border-purple-300/30 bg-white/5 hover:border-purple-300/50 hover:bg-white/10'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-purple-200/80">Drag & drop more images here or</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                >
                  browse files
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioCard;
