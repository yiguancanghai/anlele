import type { APIContext } from 'astro';
import { wordsFeed } from '../../i18n/rss';

export const GET = (context: APIContext) => wordsFeed(context, 'en');
