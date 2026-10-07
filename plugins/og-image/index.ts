import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import {Resvg} from '@resvg/resvg-js';
import type {LoadContext, Plugin} from '@docusaurus/types';

/**
 * 빌드할 때 링크 공유용 카드(OG 이미지)를 굽는다(ssccops ADR-0054 «OG 이미지는 빌드할 때 굽는다»).
 *
 * - 사이트 카드 `img/social-card.png` 한 장과, 블로그 글마다 `img/og/<글 주소>.png` 한 장.
 * - 글 HTML의 og:image·twitter:image를 사이트 카드에서 그 글의 카드로 바꿔 쓴다. 글 frontmatter에
 *   `image`를 직접 적었으면 그 값이 이미 들어가 있으므로 건드리지 않는다.
 * - 블로그 인스턴스마다 돈다. 릴리스 노트(/releases)를 두 번째 블로그로 열면 그 글도 카드가 생긴다.
 * - 요청 때 그리지 않는 이유: 정적 사이트라 요청마다 도는 코드가 없고, Workers 무료 플랜은 요청당 CPU 10ms라
 *   렌더링이 들어가지 않는다.
 * - 글꼴은 옆 `fonts/`의 Pretendard 1.3.9 OTF 두 벌(Regular, Bold)이다. satori는 woff2를 읽지 못한다.
 *   npm 패키지 `pretendard`는 72MB라 빌드마다 받지 않으려고 쓰는 두 파일만 넣었고, SIL OFL에 따라
 *   `fonts/OFL.txt`를 함께 둔다. 출처: https://github.com/orioncactus/pretendard/tree/v1.3.9/dist/public/static
 */

const SITE_CARD = 'img/social-card.png';
const WIDTH = 1200;
const HEIGHT = 630;
const INK = '#1F2328';
const MUTED = '#59636E';

type Node = {type: string; props: Record<string, unknown>};
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: {style, children},
});

type BlogPost = {
  metadata: {
    permalink: string;
    title: string;
    date: string | Date;
    authors: {name?: string; key?: string}[];
    frontMatter: {image?: string};
  };
};

function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {dateStyle: 'long', timeZone: 'Asia/Seoul'}).format(new Date(date));
}

export default function ogImagePlugin(context: LoadContext): Plugin {
  const {siteDir, siteConfig} = context;
  const host = new URL(siteConfig.url).host;

  async function loadFonts() {
    const dir = path.join(siteDir, 'plugins/og-image/fonts');
    const [regular, bold] = await Promise.all([
      fs.readFile(path.join(dir, 'Pretendard-Regular.otf')),
      fs.readFile(path.join(dir, 'Pretendard-Bold.otf')),
    ]);
    return [
      {name: 'Pretendard', data: regular, weight: 400 as const, style: 'normal' as const},
      {name: 'Pretendard', data: bold, weight: 700 as const, style: 'normal' as const},
    ];
  }

  // 파비콘 SVG에서 다크 모드 스타일을 걷고 한 색으로 칠해 카드 왼쪽 위 로고로 쓴다.
  async function loadLogo(): Promise<string> {
    const svg = await fs.readFile(path.join(siteDir, 'static/img/favicon.svg'), 'utf8');
    const plain = svg.replace(/<style>.*?<\/style>/s, '').replace('<path ', `<path fill="${INK}" `);
    return `data:image/svg+xml;base64,${Buffer.from(plain).toString('base64')}`;
  }

  function card(logo: string, label: string, title: string, footer: string): Node {
    return h(
      'div',
      {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#FFFFFF',
        borderTop: `16px solid ${INK}`,
        fontFamily: 'Pretendard',
        color: INK,
      },
      [
        h('div', {display: 'flex', alignItems: 'center', gap: 20, fontSize: 32, fontWeight: 700}, [
          {type: 'img', props: {src: logo, width: 56, height: 56}},
          h('div', {display: 'flex'}, label),
        ]),
        h(
          'div',
          {display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.3, wordBreak: 'keep-all', lineClamp: 3},
          title,
        ),
        // 글자만 나란히 두면 satori가 한 덩어리로 이어 붙인다. 칸마다 div로 감싼다.
        h('div', {display: 'flex', justifyContent: 'space-between', fontSize: 28, color: MUTED}, [
          h('div', {display: 'flex'}, footer),
          h('div', {display: 'flex'}, host),
        ]),
      ],
    );
  }

  return {
    name: 'og-image',
    async postBuild({outDir, plugins}) {
      const fonts = await loadFonts();
      const logo = await loadLogo();
      const render = async (node: Node, file: string) => {
        const svg = await satori(node as never, {width: WIDTH, height: HEIGHT, fonts});
        const png = new Resvg(svg, {fitTo: {mode: 'width', value: WIDTH}}).render().asPng();
        await fs.mkdir(path.dirname(file), {recursive: true});
        await fs.writeFile(file, png);
      };

      await render(card(logo, 'SSCCOps', siteConfig.tagline, 'SSCC 숭실컴퓨팅클럽'), path.join(outDir, SITE_CARD));

      const siteCardUrl = `${siteConfig.url}${siteConfig.baseUrl}${SITE_CARD}`;
      for (const plugin of plugins) {
        if (plugin.name !== 'docusaurus-plugin-content-blog') continue;
        const label = `SSCCOps ${(plugin.options as {blogTitle?: string}).blogTitle ?? '블로그'}`;
        const posts = (plugin.content as {blogPosts: BlogPost[]}).blogPosts;
        for (const {metadata} of posts) {
          if (metadata.frontMatter.image) continue;
          const slug = metadata.permalink.replace(/^\/|\/$/g, '');
          const rel = `img/og/${slug}.png`;
          const authors = metadata.authors.map((a) => a.name ?? a.key).filter(Boolean).join(', ');
          const footer = [formatDate(metadata.date), authors].filter(Boolean).join(' · ');
          await render(card(logo, label, metadata.title, footer), path.join(outDir, rel));

          const html = path.join(outDir, slug, 'index.html');
          const page = await fs.readFile(html, 'utf8');
          await fs.writeFile(html, page.replaceAll(siteCardUrl, `${siteConfig.url}${siteConfig.baseUrl}${rel}`));
        }
      }
    },
  };
}
