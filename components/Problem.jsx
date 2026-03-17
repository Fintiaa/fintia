import { HelpCircle, Clock, Puzzle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './Problem.module.css';

const Problem = async () => {
  const t = await getTranslations('Problem');

  const problems = [
    { icon: HelpCircle, title: t('p1title'), description: t('p1desc'), color: '#ef4444', bgColor: '#fef2f2' },
    { icon: Clock,       title: t('p2title'), description: t('p2desc'), color: '#f59e0b', bgColor: '#fffbeb' },
    { icon: Puzzle,      title: t('p3title'), description: t('p3desc'), color: '#8b5cf6', bgColor: '#f5f3ff' },
  ];

  return (
    <section className={styles.problem}>
      <div className="container">
        <div className="section-header">
          <span className={styles.sectionLabel}>{t('label')}</span>
          <h2>
            {t('title')}{' '}
            <span className={styles.highlight}>{t('titleHighlight')}</span>
          </h2>
          <p>{t('description')}</p>
        </div>

        <div className={styles.problemGrid}>
          {problems.map((problem, index) => (
            <div key={index} className={styles.problemCard}>
              <div className={styles.iconWrapper} style={{ backgroundColor: problem.bgColor }}>
                <problem.icon size={28} style={{ color: problem.color }} />
              </div>
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
