import { PenLine, List, BarChart2, RefreshCw, PieChart, Bell, TrendingUp, Check, Crown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './Features.module.css';

const Features = async () => {
  const t = await getTranslations('Features');

  const freeFeatures = [
    { icon: PenLine,  title: t('f1title'), description: t('f1desc') },
    { icon: List,     title: t('f2title'), description: t('f2desc') },
    { icon: BarChart2,title: t('f3title'), description: t('f3desc') },
  ];

  const premiumFeatures = [
    { icon: RefreshCw, title: t('p1title'), description: t('p1desc') },
    { icon: PieChart,  title: t('p2title'), description: t('p2desc') },
    { icon: Bell,      title: t('p3title'), description: t('p3desc') },
    { icon: TrendingUp,title: t('p4title'), description: t('p4desc') },
  ];

  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <div className="section-header">
          <span className={styles.sectionLabel}>{t('label')}</span>
          <h2>{t('title')}</h2>
          <p>{t('description')}</p>
        </div>

        <div className={styles.featuresWrapper}>
          <div className={styles.planSection}>
            <div className={styles.planHeader}>
              <span className={styles.planBadge}>
                <Check size={14} />
                {t('freeBadge')}
              </span>
              <h3>{t('freePlan')}</h3>
              <p>{t('freeDesc')}</p>
            </div>
            <div className={styles.featureGrid}>
              {freeFeatures.map((feature, index) => (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}><feature.icon size={24} /></div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.planSection} ${styles.premium}`}>
            <div className={styles.planHeader}>
              <span className={`${styles.planBadge} ${styles.premiumBadge}`}>
                <Crown size={14} />
                Premium
              </span>
              <h3>{t('premiumPlan')}</h3>
              <p>{t('premiumDesc')}</p>
            </div>
            <div className={styles.featureGrid}>
              {premiumFeatures.map((feature, index) => (
                <div key={index} className={`${styles.featureCard} ${styles.premiumCard}`}>
                  <div className={`${styles.featureIcon} ${styles.premiumIcon}`}><feature.icon size={24} /></div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
