import { supabase } from '@/lib/supabase';

export interface UploadOptions {
  folder: 'avatars' | 'logos' | 'services';
  fileName?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

/**
 * Serviço para upload de imagens no Supabase Storage
 */
export const storageService = {
  /**
   * Upload de imagem
   */
  async uploadImage(
    file: File,
    tenantId: string,
    options: UploadOptions
  ): Promise<string> {
    const {
      folder,
      fileName,
      maxSizeMB = 5,
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    } = options;

    // Validar tipo de arquivo
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
    }

    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB.`);
    }

    // Gerar nome do arquivo único
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const finalFileName = fileName || `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${tenantId}/${folder}/${finalFileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('salon-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('salon-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Erro ao obter URL da imagem.');
    }

    return urlData.publicUrl;
  },

  /**
   * Deletar imagem
   */
  async deleteImage(fileUrl: string, tenantId: string): Promise<void> {
    try {
      // Extrair caminho do arquivo da URL
      const urlParts = fileUrl.split('/');
      const filePathIndex = urlParts.findIndex(part => part === 'salon-images') + 1;
      if (filePathIndex === 0) {
        throw new Error('URL inválida');
      }

      const filePath = urlParts.slice(filePathIndex).join('/');

      const { error } = await supabase.storage
        .from('salon-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        // Não lançar erro se o arquivo não existir
        if (error.message !== 'The resource was not found') {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      // Não bloquear se houver erro ao deletar
    }
  },

  /**
   * Redimensionar imagem no cliente (opcional, usando canvas)
   */
  async resizeImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular novas dimensões mantendo proporção
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Erro ao criar contexto do canvas'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erro ao redimensionar imagem'));
                return;
              }
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};



