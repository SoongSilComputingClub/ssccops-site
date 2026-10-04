import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// SSCCOps 공개 사이트 — 랜딩 · 사용 설명서 · 블로그 (SoongSilComputingClub/ssccops ADR-0054)
// 이 파일은 Node에서 돈다. 브라우저 API·JSX를 쓰지 않는다.

const REPO = 'SoongSilComputingClub/ssccops-site';

const config: Config = {
  title: 'SSCCOps',
  tagline: '숭실컴퓨팅클럽의 회원·학술·업무·행사·폼을 한 곳에서 다루는 시스템',
  // 아이콘은 icon/SSCC-Flat.png를 벡터로 옮긴 것이다. GitHub처럼 배경 없이 다크 모드에서 밝은 색으로 바뀌고,
  // SVG를 못 읽는 브라우저는 어두운 색 favicon.ico를 쓴다.
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/favicon.ico', sizes: '32x32'}},
    {tagName: 'link', attributes: {rel: 'icon', href: '/img/favicon.svg', type: 'image/svg+xml'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
  ],

  future: {
    v4: true,
  },

  url: 'https://ssccops.sscc-ssu.com',
  baseUrl: '/',
  organizationName: 'SoongSilComputingClub',
  projectName: 'ssccops-site',

  onBrokenLinks: 'throw',

  markdown: {
    // `.md`는 CommonMark(GFM)로, `.mdx`만 MDX로 읽는다. 기본값(전부 MDX)이면 본문의 `{`·`<`가
    // 코드로 해석돼 평범한 글이 빌드를 깬다 — 글은 순수 GFM으로 쓴다는 규칙(ADR-0054 규칙 1)과 같은 선택이다.
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        // 사용 설명서. 옛 설명서(guide.sscc-ssu.com)는 guide/index.md 한 곳에서만 안내한다(ssccops ADR-0061).
        docs: {
          path: 'guide',
          routeBasePath: 'guide',
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${REPO}/edit/develop/`,
        },
        blog: {
          routeBasePath: 'blog',
          showReadingTime: true,
          blogTitle: '블로그',
          blogDescription: 'SSCCOps를 만들고 운영하며 정한 것과 겪은 것',
          blogSidebarTitle: '모든 글',
          blogSidebarCount: 'ALL',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: `https://github.com/${REPO}/edit/develop/`,
          onInlineTags: 'warn',
          // 작성자는 authors.yml에 등록된 GitHub ID만 받는다(ADR-0054 — 작성자 표기).
          onInlineAuthors: 'throw',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SSCCOps',
      items: [
        {type: 'docSidebar', sidebarId: 'guideSidebar', label: '사용 설명서', position: 'left'},
        {to: '/blog', label: '블로그', position: 'left'},
        {href: `https://github.com/${REPO}`, label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'SSCCOps',
          items: [
            {label: '사용 설명서', to: '/guide'},
            {label: '블로그', to: '/blog'},
          ],
        },
        {
          title: '동아리',
          items: [{label: 'SSCC 홈페이지', href: 'https://www.sscc-ssu.com'}],
        },
        {
          title: '소스',
          items: [{label: 'GitHub', href: `https://github.com/${REPO}`}],
        },
      ],
      copyright: `© ${new Date().getFullYear()} SSCC 숭실컴퓨팅클럽`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'yaml', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
