import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={`hero hero--primary ${styles.heroBanner}`}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/overview/architecture">
            Architecture Overview
          </Link>
          <Link className="button button--outline button--lg" to="/docs/guides/be-setup">
            Setup Guide
          </Link>
          <Link className="button button--outline button--lg" to="/docs/adr">
            ADR Index
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: ReactNode;
  link: string;
};

const features: FeatureItem[] = [
  {
    title: 'Backend (Spring Boot)',
    description: 'Java 21 · Spring Boot 3.5.x · Keycloak 26 · PostgreSQL 16 · Maven multi-module',
    link: '/docs/guides/be-setup',
  },
  {
    title: 'Frontend (React)',
    description: 'React 19 · TypeScript · Vite 6 · MUI v6 · TanStack Query v5 · Keycloakify',
    link: '/docs/guides/fe-setup',
  },
  {
    title: 'Architecture Decisions',
    description: 'ADRs capturing key technical decisions: PostgreSQL schema standards, IAM boundary, vehicle APIs, payment gateway',
    link: '/docs/adr',
  },
];

export default function Home(): ReactNode {
  return (
    <Layout title="Home" description="Renault Club Bulgaria — Technical Documentation">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map(({ title, description, link }) => (
                <div key={title} className="col col--4">
                  <div className={styles.featureCard}>
                    <h3>
                      <Link to={link}>{title}</Link>
                    </h3>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
