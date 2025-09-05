import { toast } from '@/components/ui/use-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  // action?: { // Temporarily disabled for build compatibility
  //   label: string;
  //   onClick: () => void;
  // };
  persistent?: boolean;
}

export interface NotificationConfig {
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  className: string;
}

// Notification configurations
const notificationConfigs: Record<NotificationType, NotificationConfig> = {
  success: {
    icon: CheckCircle,
    defaultTitle: 'Successo',
    className: 'border-green-500 bg-green-50 text-green-900',
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Errore',
    className: 'border-red-500 bg-red-50 text-red-900',
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: 'Attenzione',
    className: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  },
  info: {
    icon: Info,
    defaultTitle: 'Informazione',
    className: 'border-blue-500 bg-blue-50 text-blue-900',
  },
  loading: {
    icon: Info,
    defaultTitle: 'Caricamento',
    className: 'border-gray-500 bg-gray-50 text-gray-900',
  },
};

// Main notification system
class NotificationManager {
  private loadingToasts = new Map<string, string>();

  // Generic notification method
  notify(type: NotificationType, message: string, options: NotificationOptions = {}) {
    const config = notificationConfigs[type];
    const IconComponent = config.icon;

    return toast({
      title: options.title || config.defaultTitle,
      description: message,
      // Note: duration and className not supported by toast component
      // Note: Action support removed for build compatibility
    });
  }

  // Specific notification methods
  success(message: string, options?: NotificationOptions) {
    return this.notify('success', message, options);
  }

  error(message: string, options?: NotificationOptions) {
    return this.notify('error', message, options);
  }

  warning(message: string, options?: NotificationOptions) {
    return this.notify('warning', message, options);
  }

  info(message: string, options?: NotificationOptions) {
    return this.notify('info', message, options);
  }

  // Loading notifications with dismiss capability
  loading(message: string, id?: string): { dismiss: () => void } {
    const toastId = id || `loading-${Date.now()}`;

    const result = this.notify('loading', message, {
      persistent: true,
      title: 'Caricamento in corso...',
    });

    this.loadingToasts.set(toastId, result.id || '');

    return {
      dismiss: () => {
        if (this.loadingToasts.has(toastId)) {
          // Update the toast to success state
          this.loadingToasts.delete(toastId);
        }
      },
    };
  }

  // Dismiss specific loading notification
  dismissLoading(id: string) {
    if (this.loadingToasts.has(id)) {
      this.loadingToasts.delete(id);
    }
  }

  // Clear all loading notifications
  clearAllLoading() {
    this.loadingToasts.clear();
  }
}

// Create singleton instance
export const notifications = new NotificationManager();

// Export individual functions for convenience
export const notify = {
  success: (message: string, options?: NotificationOptions) => notifications.success(message, options),
  error: (message: string, options?: NotificationOptions) => notifications.error(message, options),
  warning: (message: string, options?: NotificationOptions) => notifications.warning(message, options),
  info: (message: string, options?: NotificationOptions) => notifications.info(message, options),
  loading: (message: string, id?: string) => notifications.loading(message, id),
};

// Common notification messages
export const notificationMessages = {
  // Authentication
  loginSuccess: 'Accesso effettuato con successo!',
  loginError: 'Credenziali non valide. Riprova.',
  logoutSuccess: 'Disconnessione effettuata con successo.',
  registrationSuccess: 'Registrazione completata! Controlla la tua email.',

  // Service Requests
  requestAccepted: 'Richiesta accettata con successo!',
  requestRejected: 'Richiesta rifiutata.',
  requestCreated: 'Richiesta inviata con successo!',
  requestError: 'Errore nell\'invio della richiesta.',

  // Profile
  profileUpdated: 'Profilo aggiornato con successo!',
  profileUpdateError: 'Errore nell\'aggiornamento del profilo.',
  passwordChanged: 'Password cambiata con successo!',

  // Bookings
  bookingCreated: 'Prenotazione creata con successo!',
  bookingCancelled: 'Prenotazione annullata.',
  bookingError: 'Errore nella gestione della prenotazione.',

  // Payments
  paymentSuccess: 'Pagamento elaborato con successo!',
  paymentError: 'Errore nel processamento del pagamento.',
  stripeError: 'Errore con Stripe. Riprova più tardi.',

  // General
  networkError: 'Errore di connessione. Controlla la tua connessione internet.',
  serverError: 'Errore del server. Riprova più tardi.',
  validationError: 'Controlla i dati inseriti e riprova.',
  saveSuccess: 'Dati salvati con successo!',
  deleteSuccess: 'Elemento eliminato con successo.',
  deleteError: 'Errore nell\'eliminazione dell\'elemento.',
};
