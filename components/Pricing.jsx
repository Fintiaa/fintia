import { Check, Crown, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './Pricing.module.css';

const Pricing = async () => {
  const t = await getTranslations('Pricing');

  const plans = [
    {
      name: t('free.name'),
      price: '$0',
      period: t('free.period'),
      description: t('free.description'),
      features: [t('free.f1'), t('free.f2'), t('free.f3'), t('free.f4'), t('free.f5')],
      cta: t('free.cta'),
      popular: false,
    },
    {
      name: t('premium.name'),
      price: '$9.99',
      period: t('premium.period'),
      description: t('premium.description'),
      features: [t('premium.f1'), t('premium.f2'), t('premium.f3'), t('premium.f4'), t('premium.f5'), t('premium.f6'), t('premium.f7')],
      cta: t('premium.cta'),
      popular: true,
    },
  ];

  return (
    <section id="pricing" className={styles.pricing}>
      <div className="container">
        <div className="section-header">
          <span className={styles.sectionLabel}>{t('label')}</span>
          <h2>{t('title')}</h2>
          <p>{t('description')}</p>
        </div>

        <div className={styles.pricingGrid}>
          {plans.map((plan, index) => (
            <div key={index} className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}>
              {plan.popular && (
                <div className={styles.popularBadge}>
                  <Crown size={14} />
                  {t('mostPopular')}
                </div>
              )}
              <div className={styles.planHeader}>
                <h3>{plan.name}</h3>
                <div className={styles.priceWrapper}>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.period}>{plan.period}</span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>

              <ul className={styles.featureList}>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={18} className={styles.checkIcon} />
                    {feature}
                  </li>
                ))}
              </ul>

              <a href="#" className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} ${styles.planBtn}`}>
                {plan.cta}
                <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>

        <div className={styles.guarantee}>
          <div className={styles.guaranteeIcon}>🛡️</div>
          <div className={styles.guaranteeContent}>
            <h4>{t('guarantee')}</h4>
            <p>{t('guaranteeDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
