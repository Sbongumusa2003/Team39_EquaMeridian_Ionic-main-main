import { HttpContextToken } from '@angular/common/http';

/** When true, the error interceptor must not force a redirect on HTTP 403. */
export const SUPPRESS_403_REDIRECT = new HttpContextToken<boolean>(() => false);
