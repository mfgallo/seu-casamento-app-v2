import { Fragment, type ReactNode } from "react";

// Subconjunto minimo de markdown (**negrito**, *itálico*, quebra de linha) -
// de proposito nao é HTML (o valor vem de um campo editado por admin e é
// mostrado pra qualquer visitante do site, então evitamos dangerouslySetInnerHTML
// e qualquer parser que aceite tags arbitrárias).
const INLINE_PATTERN = /\*\*(.+?)\*\*|\*(.+?)\*/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    }
    lastIndex = INLINE_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

/** Renderiza **negrito**, *itálico* e quebras de linha como JSX de verdade
 * (não HTML) a partir do texto salvo em site_content. */
export function renderRichText(value: string): ReactNode {
  const lines = value.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {renderInline(line)}
    </Fragment>
  ));
}
