import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Renault Club Bulgaria',
  tagline: 'Technical Documentation — BE · FE · Architecture',
  favicon: 'img/favicon.ico',

  url: 'https://ivelin1936.github.io',
  baseUrl: '/rcb-docusaurus/',

  organizationName: 'ivelin1936',
  projectName: 'rcb-docusaurus',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ivelin1936/rcb-docusaurus/edit/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/rcb-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'RCB Docs',
      logo: {
        alt: 'Renault Club Bulgaria',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'overviewSidebar',
          position: 'left',
          label: 'Overview',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'docSidebar',
          sidebarId: 'adrSidebar',
          position: 'left',
          label: 'ADRs',
        },
        {
          type: 'docSidebar',
          sidebarId: 'deploymentSidebar',
          position: 'left',
          label: 'Deployment',
        },
        {
          href: 'https://github.com/ivelin1936/Renault-Club-Bulgaria',
          label: 'BE Repo',
          position: 'right',
        },
        {
          href: 'https://github.com/ivelin1936/rcb-docusaurus',
          label: 'Docs Repo',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Overview', to: '/docs/overview/architecture' },
            { label: 'BE Setup', to: '/docs/guides/be-setup' },
            { label: 'FE Setup', to: '/docs/guides/fe-setup' },
            { label: 'Deployment', to: '/docs/deployment' },
          ],
        },
        {
          title: 'Architecture',
          items: [
            { label: 'ADR Index', to: '/docs/adr' },
            { label: 'ADR-001: PostgreSQL', to: '/docs/adr/adr-001-postgresql-database-design' },
            { label: 'ADR-005: IAM Boundary', to: '/docs/adr/adr-005-iam-domain-boundary' },
          ],
        },
        {
          title: 'Repositories',
          items: [
            { label: 'Backend', href: 'https://github.com/ivelin1936/Renault-Club-Bulgaria' },
            { label: 'Frontend', href: 'https://github.com/ivelin1936/renault-club-bulgaria-fe' },
            { label: 'Docs', href: 'https://github.com/ivelin1936/rcb-docusaurus' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Renault Club Bulgaria. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'yaml', 'sql', 'docker', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
