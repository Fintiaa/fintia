'use client'

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useTranslations } from 'next-intl';
import styles from './Hero.module.css';

const Hero = () => {
  const t = useTranslations('Hero')
  const { user } = useAuth();

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            {t('badge')}
          </div>

          <h1 className={styles.headline}>
            {t('headline')}{' '}
            <span className="text-gradient">{t('headlineGradient')}</span>
          </h1>

          <p className={styles.subheadline}>{t('subheadline')}</p>

          <div className={styles.ctaGroup}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                {t('goToDashboard')}
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-primary">
                {t('getStarted')}
                <ArrowRight size={18} />
              </Link>
            )}
            <a href="#pricing" className="btn btn-secondary">
              <Play size={18} />
              {t('viewPremium')}
            </a>
          </div>

          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>10k+</span>
              <span className={styles.trustLabel}>{t('activeUsers')}</span>
            </div>
            <div className={styles.trustDivider}></div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>4.9</span>
              <span className={styles.trustLabel}>{t('rating')}</span>
            </div>
            <div className={styles.trustDivider}></div>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>$2M+</span>
              <span className={styles.trustLabel}>{t('managed')}</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.dashboardMockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span></span><span></span><span></span>
              </div>
              <span className={styles.mockupTitle}>Dashboard - Fintia</span>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.mockupStats}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>{t('mockup.totalBalance')}</span>
                  <span className={styles.statValue}>$12,450.00</span>
                  <span className={styles.statChange}>{t('mockup.thisMonth')}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>{t('mockup.expenses')}</span>
                  <span className={styles.statValueRed}>-$2,340.00</span>
                  <span className={styles.statChangeNeg}>{t('mockup.vsPastMonth')}</span>
                </div>
              </div>
              <div className={styles.mockupChart}>
                <div className={styles.chartTitle}>{t('mockup.byCategory')}</div>
                <div className={styles.chartBars}>
                  <div className={styles.chartBar}>
                    <span className={styles.barLabel}>{t('mockup.food')}</span>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{ width: '75%' }}></div></div>
                    <span className={styles.barValue}>$450</span>
                  </div>
                  <div className={styles.chartBar}>
                    <span className={styles.barLabel}>{t('mockup.transport')}</span>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{ width: '55%' }}></div></div>
                    <span className={styles.barValue}>$320</span>
                  </div>
                  <div className={styles.chartBar}>
                    <span className={styles.barLabel}>{t('mockup.services')}</span>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{ width: '40%' }}></div></div>
                    <span className={styles.barValue}>$180</span>
                  </div>
                  <div className={styles.chartBar}>
                    <span className={styles.barLabel}>{t('mockup.leisure')}</span>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{ width: '30%' }}></div></div>
                    <span className={styles.barValue}>$120</span>
                  </div>
                </div>
              </div>
              <div className={styles.mockupTransactions}>
                <div className={styles.transactionTitle}>{t('mockup.latestTransactions')}</div>
                <div className={styles.transactionList}>
                  <div className={styles.transaction}>
                    <div className={styles.transactionIcon} style={{ background: '#fef3c7' }}>🛒</div>
                    <div className={styles.transactionInfo}>
                      <span className={styles.transactionName}>{t('mockup.supermarket')}</span>
                      <span className={styles.transactionDate}>{t('mockup.todayTime')}</span>
                    </div>
                    <span className={styles.transactionAmount}>-$85.50</span>
                  </div>
                  <div className={styles.transaction}>
                    <div className={styles.transactionIcon} style={{ background: '#dcfce7' }}>💰</div>
                    <div className={styles.transactionInfo}>
                      <span className={styles.transactionName}>{t('mockup.salary')}</span>
                      <span className={styles.transactionDate}>{t('mockup.yesterday')}</span>
                    </div>
                    <span className={styles.transactionAmountPositive}>+$3,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.floatingCard1}>
            <div className={styles.alertIcon}>🔔</div>
            <div className={styles.alertContent}>
              <span className={styles.alertTitle}>{t('mockup.alertTitle')}</span>
              <span className={styles.alertText}>{t('mockup.alertText')}</span>
            </div>
          </div>
          <div className={styles.floatingCard2}>
            <div className={styles.syncIcon}>✓</div>
            <span>{t('mockup.synced')}</span>
          </div>
        </div>
      </div>

      <div className={styles.heroBackground}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
      </div>
    </section>
  );
};

export default Hero;
