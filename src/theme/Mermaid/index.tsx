import type {ReactNode} from 'react';
import Mermaid from '@theme-original/Mermaid';
import type MermaidType from '@theme/Mermaid';
import type {WrapperProps} from '@docusaurus/types';
import {useColorMode} from '@docusaurus/theme-common';

type Props = WrapperProps<typeof MermaidType>;

/**
 * 색 모드가 바뀌면 Mermaid 그림을 새로 마운트한다.
 *
 * 다크 모드로 처음 열면 hydration 직후 색 모드가 light에서 dark로 한 번 바뀌고, 원래 컴포넌트는 같은 id로
 * 그림을 다시 그린다. Mermaid는 그릴 때 같은 id의 기존 SVG를 문서에서 지우므로, 그림이 둘 이상인 페이지에서는
 * 앞서 그려 둔 SVG가 사라져 두 번째 그림부터 빈칸으로 남았다. key로 다시 마운트하면 새 id를 받아 겹치지 않는다.
 */
export default function MermaidWrapper(props: Props): ReactNode {
  const {colorMode} = useColorMode();
  return <Mermaid key={colorMode} {...props} />;
}
