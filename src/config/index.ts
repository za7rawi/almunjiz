export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://munjiz.store';

export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 12,
  maxLimit: 100,
  limits: [6, 12, 24, 48],
};

export const SUPPORTED_FILE_TYPES = {
  images: '.jpg,.jpeg,.png,.webp,.gif',
  documents: '.pdf,.doc,.docx,.xls,.xlsx',
  all: '.jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx',
};

export const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  avatar: 2 * 1024 * 1024, // 2MB
};

export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 5000;
export const ANIMATION_DURATION = 300;
