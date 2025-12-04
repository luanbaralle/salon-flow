import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storageService } from '@/services/storage.service';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  folder: 'avatars' | 'logos' | 'services';
  tenantId: string;
  label?: string;
  className?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder,
  tenantId,
  label = 'Imagem',
  className,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Redimensionar imagem se necessário
      const resizedFile = await storageService.resizeImage(file, 800, 800, 0.8);

      // Upload
      const imageUrl = await storageService.uploadImage(resizedFile, tenantId, {
        folder,
        maxSizeMB,
      });

      setPreview(imageUrl);
      onImageUploaded(imageUrl);

      toast({
        title: 'Upload concluído!',
        description: 'A imagem foi enviada com sucesso.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      try {
        await storageService.deleteImage(currentImageUrl, tenantId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    setPreview(null);
    if (onImageRemoved) {
      onImageRemoved();
    }

    toast({
      title: 'Imagem removida',
      description: 'A imagem foi removida com sucesso.',
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={preview || undefined} />
          <AvatarFallback className="bg-muted">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {preview ? 'Alterar imagem' : 'Enviar imagem'}
              </>
            )}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remover
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Formatos aceitos: JPG, PNG, WEBP. Tamanho máximo: {maxSizeMB}MB
      </p>
    </div>
  );
}



