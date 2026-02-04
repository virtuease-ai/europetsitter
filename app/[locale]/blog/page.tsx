'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';

function SectionBgAccents() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-lg bg-primary/10" />
      <div className="absolute top-[25%] right-[12%] w-8 h-8 rounded-lg bg-primary/10" />
      <div className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-lg bg-primary/10" />
      <div className="absolute bottom-[15%] right-[8%] w-14 h-14 rounded-lg bg-primary/10" />
    </div>
  );
}

export default function BlogPage() {
  const t = useTranslations('blog');
  const [searchQuery, setSearchQuery] = useState('');

  const articles = [
    {
      id: 1,
      title: t('articles.article1.title'),
      excerpt: t('articles.article1.excerpt'),
      image: "🐕",
      date: t('articles.article1.date'),
      author: t('articles.article1.author'),
      category: t('categories.tips')
    },
    {
      id: 2,
      title: t('articles.article2.title'),
      excerpt: t('articles.article2.excerpt'),
      image: "🐈",
      date: t('articles.article2.date'),
      author: t('articles.article2.author'),
      category: t('categories.guides')
    },
    {
      id: 3,
      title: t('articles.article3.title'),
      excerpt: t('articles.article3.excerpt'),
      image: "⭐",
      date: t('articles.article3.date'),
      author: t('articles.article3.author'),
      category: t('categories.testimonials')
    },
    {
      id: 4,
      title: t('articles.article4.title'),
      excerpt: t('articles.article4.excerpt'),
      image: "📚",
      date: t('articles.article4.date'),
      author: t('articles.article4.author'),
      category: t('categories.guides')
    },
    {
      id: 5,
      title: t('articles.article5.title'),
      excerpt: t('articles.article5.excerpt'),
      image: "🎒",
      date: t('articles.article5.date'),
      author: t('articles.article5.author'),
      category: t('categories.tips')
    },
    {
      id: 6,
      title: t('articles.article6.title'),
      excerpt: t('articles.article6.excerpt'),
      image: "🐶",
      date: t('articles.article6.date'),
      author: t('articles.article6.author'),
      category: t('categories.tips')
    }
  ];

  const tags = [
    t('categories.tips'),
    t('categories.guides'),
    t('categories.testimonials'),
    t('categories.dogs'),
    t('categories.cats'),
    t('categories.boarding')
  ];

  const filteredArticles = searchQuery
    ? articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#f0f7f2]" />
        <SectionBgAccents />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('subtitle')}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-0 text-gray-900 tracking-tight">{t('title')}</h1>
        </div>
      </section>

      {/* Recherche */}
      <section className="py-6 px-4 border-b border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            />
          </div>
          {searchQuery && (
            <p className="text-center text-sm text-gray-500 mt-2">
              {t('searchResults')}: {filteredArticles.length} {filteredArticles.length === 1 ? t('articles') : t('articlesPlural')}
            </p>
          )}
        </div>
      </section>

      {/* Catégories / Filtres */}
      <section className="py-6 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <span className="text-sm text-gray-600">{t('latestArticles')}</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">{t('popularArticles')}</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-4 text-sm text-primary font-semibold hover:underline"
              >
                {t('clearFilters')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Liste des articles */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="font-medium">{t('noResults')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden group hover:border-primary/30 transition-colors shadow-sm"
                >
                  <div className="bg-primary-light/30 p-12 flex items-center justify-center text-7xl border-b border-gray-100 rounded-t-3xl">
                    {article.image}
                  </div>
                  <div className="p-6">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author}
                      </span>
                    </div>
                    <Link href={`/blog/${article.id}`} className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                      {t('readArticle')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t('newsletter.title')}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
            {t('newsletter.text')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={t('newsletter.placeholder')}
              className="flex-1 px-5 py-3 rounded-full text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="bg-white hover:bg-gray-100 text-primary font-semibold px-8 py-3 rounded-full transition-all whitespace-nowrap text-sm">
              {t('newsletter.subscribe')}
            </button>
          </div>
        </div>
      </section>

      {/* Tags populaires */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-lg font-bold mb-4 text-center">{t('popularTags')}</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
