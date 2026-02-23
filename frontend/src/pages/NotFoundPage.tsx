import {Link} from '@tanstack/react-router';
import SeoMeta from '../components/seo/SeoMeta';
import {absoluteUrl} from '../lib/seo';

const NotFoundPage = () => (
  <section className="mx-auto flex min-h-[40vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
    <SeoMeta
      title="Страница не найдена | RoomFlow"
      description="Запрошенная страница не найдена."
      url={absoluteUrl('/404')}
      noindex
    />
    <h1 className="text-4xl font-bold text-foreground">404</h1>
    <p className="max-w-xl text-sm text-muted-foreground">Страница не найдена или была перемещена.</p>
    <Link to="/schedule" className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-foreground">
      Вернуться к расписанию
    </Link>
  </section>
);

export default NotFoundPage;
