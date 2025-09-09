'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  X,
  Plus,
  Save,
  Loader2,
  Award,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface PortfolioData {
  portfolioImages: string[];
  certifications: string[];
  portfolioUrl: string;
  servicesDescription: string;
}

interface PortfolioEditorProps {
  initialData: PortfolioData;
  onSave: (data: PortfolioData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function PortfolioEditor({
  initialData,
  onSave,
  onClose,
  isLoading = false,
}: PortfolioEditorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [portfolioImages, setPortfolioImages] = useState<string[]>(
    initialData.portfolioImages || []
  );
  const [certifications, setCertifications] = useState<string[]>(
    initialData.certifications || []
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    initialData.portfolioUrl || ''
  );
  const [servicesDescription, setServicesDescription] = useState(
    initialData.servicesDescription || ''
  );
  const [newCertification, setNewCertification] = useState('');
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (files: FileList) => {
    const maxImages = 10;
    const currentCount = portfolioImages.length;
    const availableSlots = maxImages - currentCount;

    if (files.length > availableSlots) {
      toast({
        title: 'Limite raggiunto',
        description: `Puoi aggiungere massimo ${availableSlots} immagini`,
      });
      return;
    }

    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
      const file = files[i];

      // Validazione dimensione file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File troppo grande',
          description: `${file.name} è troppo grande (max 5MB)`,
        });
        continue;
      }

      // Validazione tipo file
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo file non valido',
          description: `${file.name} non è un'immagine valida`,
        });
        continue;
      }

      try {
        // Ottieni l'ID dell'utente corrente
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: 'Errore',
            description: 'Utente non autenticato',
          });
          continue;
        }

        // Crea FormData per l'upload
        const formData = new FormData();
        formData.append('image', file);

        // Upload tramite API
        const response = await fetch(`/api/riders/${user.id}/portfolio`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload fallito');
        }

        const result = await response.json();
        newImages.push(result.imageUrl);
      } catch (error: any) {
        console.error('Errore upload immagine:', error);
        toast({
          title: 'Errore upload',
          description: error.message || "Errore durante l'upload dell'immagine",
        });
        continue;
      }
    }

    if (newImages.length > 0) {
      setPortfolioImages(prev => [...prev, ...newImages]);
      toast({
        title: 'Immagini aggiunte',
        description: `Aggiunte ${newImages.length} immagini al portfolio`,
      });
    }
  };

  const removeImage = (index: number) => {
    setPortfolioImages(prev => {
      const newImages = [...prev];
      // Revoke object URL to free memory
      URL.revokeObjectURL(newImages[index]);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const addCertification = () => {
    const cert = newCertification.trim();
    if (cert && !certifications.includes(cert)) {
      setCertifications(prev => [...prev, cert]);
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(prev => prev.filter(c => c !== cert));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate URL if present
      if (portfolioUrl && !portfolioUrl.match(/^https?:\/\/.+/)) {
        toast({
          title: 'Invalid URL',
          description: 'URL must start with http:// or https://',
        });
        return;
      }

      const dataToSave: PortfolioData = {
        portfolioImages,
        certifications,
        portfolioUrl: portfolioUrl.trim(),
        servicesDescription: servicesDescription.trim(),
      };

      await onSave(dataToSave);

      toast({
        title: 'Portfolio salvato',
        description: 'Le modifiche sono state salvate con successo',
      });

      onClose();
    } catch (error) {
      console.error('Errore nel salvataggio del portfolio:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Modifica Portfolio</DialogTitle>
          <p className='text-sm text-gray-600'>
            Gestisci le tue immagini, certificazioni e descrizione dei servizi
          </p>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Portfolio Images */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <ImageIcon className='h-5 w-5 mr-2' />
                Immagini Portfolio
              </CardTitle>
              <CardDescription>
                Aggiungi fino a 10 immagini per mostrare il tuo lavoro (
                {portfolioImages.length}/10)
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Image Grid */}
              {portfolioImages.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {portfolioImages.map((imageUrl, index) => (
                    <div key={index} className='relative group'>
                      <div className='aspect-square relative rounded-lg overflow-hidden border'>
                        <Image
                          src={imageUrl}
                          alt={`Portfolio ${index + 1}`}
                          fill
                          className='object-cover'
                          sizes='(max-width: 768px) 50vw, 33vw'
                        />
                        <Button
                          variant='destructive'
                          size='sm'
                          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                          onClick={() => removeImage(index)}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {portfolioImages.length < 10 && (
                <>
                  <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    accept='image/*'
                    className='hidden'
                    onChange={e =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                  />
                  <Button
                    variant='outline'
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full border-dashed border-2'
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    Aggiungi Immagini
                  </Button>
                </>
              )}

              <p className='text-xs text-gray-500'>
                Formati supportati: JPG, PNG, WebP. Dimensione massima: 5MB per
                immagine.
              </p>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Award className='h-5 w-5 mr-2' />
                Certificazioni
              </CardTitle>
              <CardDescription>
                Aggiungi le tue certificazioni e qualifiche professionali
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Add Certification */}
              <div className='flex gap-2'>
                <Input
                  placeholder='Es: Patente B, Corso Sicurezza, etc.'
                  value={newCertification}
                  onChange={e => setNewCertification(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addCertification()}
                />
                <Button
                  onClick={addCertification}
                  disabled={!newCertification.trim()}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>

              {/* Certifications List */}
              {certifications.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {certifications.map((cert, index) => (
                    <Badge key={index} variant='secondary' className='text-sm'>
                      {cert}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='ml-2 h-4 w-4 p-0 hover:bg-red-100'
                        onClick={() => removeCertification(cert)}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio URL */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <ExternalLink className='h-5 w-5 mr-2' />
                Portfolio Online
              </CardTitle>
              <CardDescription>
                Link al tuo portfolio/website esterno (opzionale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type='url'
                placeholder='https://tuoportfolio.com'
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Services Description */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Descrizione Servizi</CardTitle>
              <CardDescription>
                Descrivi i servizi che offri e la tua esperienza
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='Descrivi i tuoi servizi, la tua esperienza e ciò che ti rende speciale...'
                value={servicesDescription}
                onChange={e => setServicesDescription(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className='text-xs text-gray-500 mt-1'>
                {servicesDescription.length}/1000 caratteri
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-end space-x-3 pt-4 border-t'>
            <Button variant='outline' onClick={onClose} disabled={saving}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Salva Portfolio
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
