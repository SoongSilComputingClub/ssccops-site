import type {ReactNode} from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import type BlogPostItemType from '@theme/BlogPostItem';
import type {WrapperProps} from '@docusaurus/types';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {useColorMode} from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useRouteContext from '@docusaurus/useRouteContext';
import Giscus from '@giscus/react';

type Props = WrapperProps<typeof BlogPostItemType>;

type GiscusConfig = {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
};

/**
 * 블로그 글 아래에 giscus 댓글을 붙인다(ssccops ADR-0054).
 *
 * - **글 상세에만** 그린다. 목록 화면의 글 카드마다 댓글이 붙으면 안 된다.
 * - **기본 블로그(/blog)에만** 그린다. 이 래퍼는 모든 블로그 인스턴스에 걸리므로, 릴리즈 노트(/releases)처럼
 *   두 번째 블로그를 열어도 댓글이 따라붙지 않게 플러그인 id로 거른다(ssccops ADR-0061).
 * - **설정이 비어 있으면 그리지 않는다.** repoId·categoryId는 레포에 giscus 앱을 설치하고
 *   Discussions를 켠 뒤에야 나오는 값이라, 그 전에도 사이트가 멀쩡히 빌드·배포돼야 한다.
 * - 글과 토론은 **경로(pathname)**로 잇는다. 게시한 뒤 파일 이름을 바꾸면 경로가 바뀌어
 *   옛 댓글이 떨어진다. 그래서 AGENTS.md가 파일 이름을 바꾸지 말라고 한다.
 */
export default function BlogPostItemWrapper(props: Props): ReactNode {
  const {isBlogPostPage} = useBlogPost();
  const {plugin} = useRouteContext();
  const isMainBlog = plugin?.id === 'default';
  const {colorMode} = useColorMode();
  const {siteConfig} = useDocusaurusContext();
  const giscus = siteConfig.customFields?.giscus as GiscusConfig | undefined;
  const ready = Boolean(giscus?.repoId && giscus?.categoryId);

  return (
    <>
      <BlogPostItem {...props} />
      {isBlogPostPage && isMainBlog && ready && giscus && (
        <div style={{marginTop: '3rem'}}>
          <Giscus
            repo={giscus.repo}
            repoId={giscus.repoId}
            category={giscus.category}
            categoryId={giscus.categoryId}
            mapping="pathname"
            strict="1"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            lang="ko"
            loading="lazy"
          />
        </div>
      )}
    </>
  );
}
