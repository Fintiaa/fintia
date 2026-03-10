import { Sparkles, BarChart3, Zap, Heart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './Solution.module.css';

const Solution = async () => {
  const t = await getTranslations('Solution');

  const features = [
    { icon: Sparkles, title: t('f1title'), description: t('f1desc') },
    { icon: BarChart3, title: t('f2title'), description: t('f2desc') },
    { icon: Zap,       title: t('f3title'), description: t('f3desc') },
    { icon: Heart,     title: t('f4title'), description: t('f4desc') },
  ];

  return (
    <section className={styles.solution}>
      <div className="container">
        <div className={styles.solutionContent}>
          <div className={styles.solutionText}>
            <span className={styles.sectionLabel}>{t('label')}</span>
            <h2>
              {t('title')} <span className="text-gradient">Fintia</span>
            </h2>
            <p className={styles.solutionDescription}>{t('description')}</p>

            <div className={styles.featureList}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <feature.icon size={22} />
                  </div>
                  <div className={styles.featureContent}>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.solutionVisual}>
            <div className={styles.phoneFrame}>
              <div className={styles.phoneNotch}></div>
              <div className={styles.phoneScreen}>
                <div className={styles.appHeader}>
                  <span className={styles.greeting}>{t('mockup.greeting')}</span>
                  <span className={styles.date}>Febrero 2025</span>
                </div>
                <div className={styles.balanceCard}>
                  <span className={styles.balanceLabel}>{t('mockup.balance')}</span>
                  <span className={styles.balanceAmount}>$8,542.00</span>
                  <div className={styles.balanceTrend}>
                    <span className={styles.trendUp}>↑ 12%</span>
                    <span>{t('mockup.vsPastMonth')}</span>
                  </div>
                </div>
                <div className={styles.quickStats}>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatIcon}>💰</span>
                    <span className={styles.quickStatValue}>$4,200</span>
                    <span className={styles.quickStatLabel}>{t('mockup.income')}</span>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatIcon}>🛍️</span>
                    <span className={styles.quickStatValue}>$1,658</span>
                    <span className={styles.quickStatLabel}>{t('mockup.expenses')}</span>
                  </div>
                  <div className={styles.quickStat}>
                    <span className={styles.quickStatIcon}>🎯</span>
                    <span className={styles.quickStatValue}>85%</span>
                    <span className={styles.quickStatLabel}>{t('mockup.goal')}</span>
                  </div>
                </div>
                <div className={styles.miniChart}>
                  <div className={styles.chartLine}></div>
                </div>
              </div>
            </div>
            <div className={styles.decoration1}></div>
            <div className={styles.decoration2}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
