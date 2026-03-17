import { UserPlus, Wallet, LineChart, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './HowItWorks.module.css';

const HowItWorks = async () => {
  const t = await getTranslations('HowItWorks');

  const steps = [
    { number: '01', icon: UserPlus,   title: t('s1title'), description: t('s1desc') },
    { number: '02', icon: Wallet,     title: t('s2title'), description: t('s2desc') },
    { number: '03', icon: LineChart,  title: t('s3title'), description: t('s3desc') },
  ];

  return (
    <section id="how-it-works" className={styles.howItWorks}>
      <div className="container">
        <div className="section-header">
          <span className={styles.sectionLabel}>{t('label')}</span>
          <h2>{t('title')}</h2>
          <p>{t('description')}</p>
        </div>

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.number}</span>
                <div className={styles.stepIcon}><step.icon size={32} /></div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.stepConnector}><ArrowRight size={24} /></div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.ctaBox}>
          <div className={styles.ctaContent}>
            <h3>{t('ctaTitle')}</h3>
            <p>{t('ctaDesc')}</p>
          </div>
          <a href="#" className="btn btn-primary">
            {t('ctaBtn')}
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
