import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// SSCCOps 공개 사이트 — 랜딩 · 사용 설명서 · 블로그 (SoongSilComputingClub/ssccops ADR-0054)
// 이 파일은 Node에서 돈다. 브라우저 API·JSX를 쓰지 않는다.

const REPO = 'SoongSilComputingClub/ssccops-site';

const config: Config = {
  title: 'SSCCOps',
  tagline: '숭실컴퓨팅클럽의 회원·학술·업무·행사·폼을 한 곳에서 다루는 시스템',
  // 본문 글꼴 Pretendard(SIL OFL 1.1). 페이지에 쓰인 글자만 내려받는 dynamic subset을 jsDelivr에서 불러온다.
  // 레포에 글꼴 파일을 두지 않으므로 라이선스 파일도 따로 두지 않는다. CDN이 막히면 시스템 글꼴로 대체된다.
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css',
      crossorigin: 'anonymous',
    },
  ],

  // 아이콘은 icon/SSCC-Flat.png를 벡터로 옮긴 것이다. GitHub처럼 배경 없이 다크 모드에서 밝은 색으로 바뀌고,
  // SVG를 못 읽는 브라우저는 어두운 색 favicon.ico를 쓴다.
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/favicon.ico', sizes: '32x32'}},
    {tagName: 'link', attributes: {rel: 'icon', href: '/img/favicon.svg', type: 'image/svg+xml'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
    // 글꼴 CDN에 미리 연결해 첫 화면의 글꼴 지연을 줄인다.
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: 'anonymous'}},
  ],

  future: {
    v4: true,
  },

  url: 'https://ssccops.sscc-ssu.com',
  baseUrl: '/',
  organizationName: 'SoongSilComputingClub',
  projectName: 'ssccops-site',

  onBrokenLinks: 'throw',

  customFields: {
    // giscus 댓글(블로그 글에만). repoId와 categoryId는 https://giscus.app 에 이 레포를 넣으면 나온다.
    // 비밀값이 아니고 페이지에 그대로 실린다. 비어 있으면 댓글 영역을 그리지 않는다.
    giscus: {
      repo: REPO,
      repoId: 'R_kgDOUsvIDA',
      category: 'Blog Comments',
      categoryId: 'DIC_kwDOUsvIDM4DHBYK',
    },
  },

  markdown: {
    // `.md`는 CommonMark(GFM)로, `.mdx`만 MDX로 읽는다. 기본값(전부 MDX)이면 본문의 `{`·`<`가
    // 코드로 해석돼 평범한 글이 빌드를 깬다 — 글은 순수 GFM으로 쓴다는 규칙(ADR-0054 규칙 1)과 같은 선택이다.
    format: 'detect',
    // ```mermaid 코드 블록을 그림으로 그린다(@docusaurus/theme-mermaid). .md에서도 동작한다.
    mermaid: true,
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

  // 링크 공유용 카드를 빌드 때 굽는다(plugins/og-image). 사이트 카드 한 장과 블로그 글마다 한 장.
  plugins: [
    './plugins/og-image/index.ts',
    // 개발 참여(/contributing). 사용 설명서와 목차, 검색 범위가 섞이지 않게 문서 묶음을 따로 둔다(ssccops ADR-0061).
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'contributing',
        path: 'contributing',
        routeBasePath: 'contributing',
        sidebarPath: './sidebarsContributing.ts',
        editUrl: `https://github.com/${REPO}/edit/develop/`,
      },
    ],
    // 릴리즈 노트(/releases). 운영진과 회원이 읽는 버전별 안내라 기술 블로그와 목록, RSS를 따로 둔다(ssccops ADR-0061).
    // 댓글은 붙지 않는다(src/theme/BlogPostItem이 기본 블로그에만 그린다).
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'releases',
        path: 'releases',
        routeBasePath: 'releases',
        authorsMapPath: '../blog/authors.yml',
        blogTitle: '릴리즈 노트',
        blogDescription: 'SSCCOps 버전마다 달라진 것과 해 주실 일',
        blogSidebarTitle: '모든 릴리즈',
        blogSidebarCount: 'ALL',
        showReadingTime: false,
        feedOptions: {
          type: ['rss', 'atom'],
          xslt: true,
        },
        editUrl: `https://github.com/${REPO}/edit/develop/`,
        onInlineTags: 'warn',
        onInlineAuthors: 'throw',
        onUntruncatedBlogPosts: 'ignore',
      },
    ],
  ],

  // 사이트 검색. 빌드 때 색인을 만들어 브라우저에서 찾는다(외부 서비스 없음). lunr의 한국어 모듈(lunr.ko)로
  // 조사가 붙은 말(«행사를»)과 합성어 안의 말(«참가신청서»의 «참가»)까지 찾는다. 대상은 문서 묶음 둘과 블로그 둘.
  // 화면 문구는 이 플러그인에 한국어가 없어 i18n/ko/code.json에서 번역한다.
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en', 'ko'],
        docsDir: ['guide', 'contributing'],
        docsRouteBasePath: ['guide', 'contributing'],
        blogDir: ['blog', 'releases'],
        blogRouteBasePath: ['blog', 'releases'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        // 기본값 1이면 두 글자 낱말에서 한 글자만 같아도 걸린다(«참가»로 «참여»가 나온다). 한국어에서는 끈다.
        fuzzyMatchingDistance: 0,
      },
    ],
  ],

  themeConfig: {
    // 사이트 카드. 파일은 plugins/og-image가 빌드 때 만든다.
    image: 'img/social-card.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SSCCOps',
      items: [
        {type: 'docSidebar', sidebarId: 'guideSidebar', label: '사용 설명서', position: 'left'},
        {to: '/releases', label: '릴리즈 노트', position: 'left'},
        {to: '/blog', label: '블로그', position: 'left'},
        {to: '/contributing', label: '개발 참여', position: 'right'},
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
            {label: '릴리즈 노트', to: '/releases'},
            {label: '블로그', to: '/blog'},
          ],
        },
        {
          title: '동아리',
          items: [{label: 'SSCC 홈페이지', href: 'https://www.sscc-ssu.com'}],
        },
        {
          title: '소스',
          items: [
            {label: '개발 참여', to: '/contributing'},
            {label: 'GitHub', href: `https://github.com/${REPO}`},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} SSCC 숭실컴퓨팅클럽`,
    },
    // Mermaid 그림도 본문과 같은 글꼴로. 다크 모드에서는 dark 테마로 바뀐다.
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
      options: {
        fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'yaml', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
