import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request) {
  // 1. Manejo de idioma (detecta locale, redirige si es necesario)
  const intlResponse = intlMiddleware(request);

  // 2. Refresca la sesión de Supabase sobre la respuesta de intl
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
