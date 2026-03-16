import Image from 'next/image';
import { Mail, Twitter, Instagram, Linkedin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import styles from './Footer.module.css';

const Footer = async () => {
  const t = await getTranslations('Footer');

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <a href="/" className={styles.logo}>
              <Image src="/images/LogoFintia.png" alt="Fintia" width={36} height={36} style={{ objectFit: 'contain' }} />
              <span className={styles.logoText}>Fintia</span>
            </a>
            <p className={styles.brandDescription}>{t('description')}</p>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Twitter" className={styles.socialLink}><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram" className={styles.socialLink}><Instagram size={20} /></a>
              <a href="#" aria-label="LinkedIn" className={styles.socialLink}><Linkedin size={20} /></a>
              <a href="#" aria-label="Email" className={styles.socialLink}><Mail size={20} /></a>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <h4>{t('productCol')}</h4>
              <a href="#features">{t('features')}</a>
              <a href="#pricing">{t('pricing')}</a>
              <a href="#how-it-works">{t('howItWorks')}</a>
              <a href="#">{t('integrations')}</a>
            </div>
            <div className={styles.linkColumn}>
              <h4>{t('companyCol')}</h4>
              <a href="#">{t('about')}</a>
              <a href="#">{t('blog')}</a>
              <a href="#">{t('careers')}</a>
              <a href="#">{t('contact')}</a>
            </div>
            <div className={styles.linkColumn}>
              <h4>{t('supportCol')}</h4>
              <a href="#">{t('helpCenter')}</a>
              <a href="#">{t('faq')}</a>
              <a href="#">{t('community')}</a>
              <a href="#">{t('status')}</a>
            </div>
            <div className={styles.linkColumn}>
              <h4>{t('legalCol')}</h4>
              <a href="#">{t('privacy')}</a>
              <a href="#">{t('terms')}</a>
              <a href="#">{t('cookies')}</a>
              <a href="#">{t('security')}</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <div className={styles.footerBottomLinks}>
            <a href="#">{t('privacyLink')}</a>
            <span>·</span>
            <a href="#">{t('termsLink')}</a>
            <span>·</span>
            <a href="#">{t('cookiesLink')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
