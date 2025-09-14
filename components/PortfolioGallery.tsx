'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';

interface PortfolioGalleryProps {
  portfolioImages: string[];
  certifications: string[];
  portfolioUrl?: string;
  servicesDescription?: string;
  riderName: string;
  isOwner?: boolean; // Se il viewer è il proprietario del portfolio
  onEdit?: () => void; // Callback per aprire l'editor
}

export default function PortfolioGallery({
  portfolioImages = [],
  certifications = [],
  portfolioUrl,
  servicesDescription,
  riderName,
  isOwner = false,
  onEdit,
}: PortfolioGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (portfolioImages.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % portfolioImages.length);
    }
  };

  const prevImage = () => {
    if (portfolioImages.length > 0) {
      setCurrentImageIndex(prev =>
        prev === 0 ? portfolioImages.length - 1 : prev - 1
      );
    }
  };

  // Non mostrare nulla se non ci sono immagini e non è il proprietario
  if (portfolioImages.length === 0 && !isOwner) {
    return null;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>Portfolio</h3>
          <p className='text-sm text-gray-600'>
            {isOwner
              ? 'Gestisci il tuo portfolio'
              : `Portfolio di ${riderName}`}
          </p>
        </div>
        {isOwner && onEdit && (
          <Button onClick={onEdit} size='sm' variant='outline'>
            Modifica Portfolio
          </Button>
        )}
      </div>

      {/* Portfolio Images Grid */}
      {portfolioImages.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          {portfolioImages.map((imageUrl, index) => (
            <Card
              key={index}
              className='overflow-hidden cursor-pointer hover:shadow-lg transition-shadow'
              onClick={() => openImageModal(index)}
            >
              <CardContent className='p-0'>
                <div className='relative aspect-square'>
                  <Image
                    src={imageUrl}
                    alt={`Portfolio ${riderName} - ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 50vw, 33vw'
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className='border-dashed border-2 border-gray-300'>
          <CardContent className='p-8 text-center'>
            <div className='text-4xl mb-4'>📸</div>
            <h4 className='font-medium text-gray-900 mb-2'>
              {isOwner ? 'Nessuna immagine nel portfolio' : 'Portfolio vuoto'}
            </h4>
            <p className='text-gray-600 text-sm'>
              {isOwner
                ? 'Aggiungi delle immagini per mostrare il tuo lavoro'
                : `${riderName} non ha ancora aggiunto immagini al portfolio`}
            </p>
            {isOwner && onEdit && (
              <Button onClick={onEdit} className='mt-4'>
                Aggiungi Immagini
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h4 className='font-medium text-gray-900 mb-3 flex items-center'>
            <Award className='h-4 w-4 mr-2' />
            Certificazioni
          </h4>
          <div className='flex flex-wrap gap-2'>
            {certifications.map((cert, index) => (
              <Badge key={index} variant='secondary' className='text-xs'>
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Services Description */}
      {servicesDescription && (
        <div>
          <h4 className='font-medium text-gray-900 mb-2'>Servizi Offerti</h4>
          <p className='text-gray-700 text-sm leading-relaxed'>
            {servicesDescription}
          </p>
        </div>
      )}

      {/* Portfolio URL */}
      {portfolioUrl && (
        <div>
          <h4 className='font-medium text-gray-900 mb-2'>Portfolio Online</h4>
          <Button
            variant='outline'
            size='sm'
            onClick={() => window.open(portfolioUrl, '_blank')}
            className='text-blue-600 hover:text-blue-800'
          >
            <ExternalLink className='h-4 w-4 mr-2' />
            Visita Portfolio
          </Button>
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={closeImageModal}>
        <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
          <DialogHeader className='p-4 pb-0'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-lg'>
                Portfolio di {riderName} ({currentImageIndex + 1} di{' '}
                {portfolioImages.length})
              </DialogTitle>
              <Button variant='ghost' size='sm' onClick={closeImageModal}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </DialogHeader>

          <div className='relative flex items-center justify-center p-4'>
            {portfolioImages.length > 1 && (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute left-2 z-10 bg-black/50 text-white hover:bg-black/70'
                  onClick={prevImage}
                >
                  <ChevronLeft className='h-6 w-6' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute right-2 z-10 bg-black/50 text-white hover:bg-black/70'
                  onClick={nextImage}
                >
                  <ChevronRight className='h-6 w-6' />
                </Button>
              </>
            )}

            <div className='relative max-h-[70vh] max-w-full'>
              <Image
                src={portfolioImages[currentImageIndex]}
                alt={`Portfolio ${riderName} - ${currentImageIndex + 1}`}
                width={800}
                height={600}
                className='max-h-[70vh] max-w-full object-contain rounded-lg'
                priority
              />
            </div>
          </div>

          {/* Thumbnail navigation */}
          {portfolioImages.length > 1 && (
            <div className='flex justify-center gap-2 p-4 pt-0 overflow-x-auto'>
              {portfolioImages.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 rounded border-2 flex-shrink-0 ${
                    index === currentImageIndex
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className='object-cover rounded'
                    sizes='64px'
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
