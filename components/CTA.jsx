import { ArrowRight, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './CTA.module.css';

const CTA = async () => {
  const t = await getTranslations('CTA');

  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.ctaCard}>
          <div className={styles.ctaBackground}>
            <div className={styles.orb1}></div>
            <div className={styles.orb2}></div>
          </div>

          <div className={styles.ctaContent}>
            <div className={styles.ctaIcon}>
              <Sparkles size={32} />
            </div>
            <h2>{t('title')}</h2>
            <p>{t('description')}</p>
            <div className={styles.ctaActions}>
              <a href="#" className="btn btn-primary">
                {t('btn')}
                <ArrowRight size={18} />
              </a>
              <span className={styles.ctaNote}>{t('note')}</span>
            </div>

            <div className={styles.benefits}>
              <span className={styles.benefit}>✓ {t('b1')}</span>
              <span className={styles.benefit}>✓ {t('b2')}</span>
              <span className={styles.benefit}>✓ {t('b3')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
