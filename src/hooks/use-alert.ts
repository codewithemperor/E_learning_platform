import Swal from 'sweetalert2';

export interface AlertOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  timer?: number;
}

export const useAlert = () => {
  const showAlert = async (options: AlertOptions) => {
    return await Swal.fire({
      title: options.title || 'Notification',
      text: options.text,
      icon: options.icon || 'info',
      confirmButtonText: options.confirmButtonText || 'OK',
      showCancelButton: options.showCancelButton || false,
      cancelButtonText: options.cancelButtonText || 'Cancel',
      timer: options.timer,
      timerProgressBar: true,
    });
  };

  const showSuccess = (title: string, text?: string) => {
    return showAlert({ title, text, icon: 'success' });
  };

  const showError = (title: string, text?: string) => {
    return showAlert({ title, text, icon: 'error' });
  };

  const showWarning = (title: string, text?: string) => {
    return showAlert({ title, text, icon: 'warning' });
  };

  const showInfo = (title: string, text?: string) => {
    return showAlert({ title, text, icon: 'info' });
  };

  const showConfirm = async (title: string, text?: string, confirmText?: string, cancelText?: string) => {
    const result = await showAlert({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmText || 'Yes',
      cancelButtonText: cancelText || 'No',
    });
    return result.isConfirmed;
  };

  const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info', timer: number = 3000) => {
    Swal.fire({
      title,
      icon,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
    });
  };

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showToast,
  };
};