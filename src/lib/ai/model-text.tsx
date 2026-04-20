import type { ReactNode } from "react";

type TextBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] };

function pushParagraph(blocks: TextBlock[], lines: string[]) {
  if (lines.length === 0) return;
  blocks.push({
    type: "paragraph",
    content: lines.join(" ").trim(),
  });
  lines.length = 0;
}

export function parseModelText(text: string): TextBlock[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const blocks: TextBlock[] = [];
  const paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trim();

    if (!line) {
      pushParagraph(blocks, paragraphLines);
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.*)$/.exec(line);
    if (headingMatch) {
      pushParagraph(blocks, paragraphLines);
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1]!.length as 1 | 2 | 3,
        content: headingMatch[2]!.trim(),
      });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      pushParagraph(blocks, paragraphLines);
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  pushParagraph(blocks, paragraphLines);
  flushList();

  return blocks;
}

function renderInlineText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`strong-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`em-${index}`}>{part.slice(1, -1)}</em>;
    }

    return <span key={`span-${index}`}>{part}</span>;
  });
}

export function renderModelText(text: string) {
  const blocks = parseModelText(text);
  if (blocks.length === 0) {
    return null;
  }

  return blocks.map((block, index) => {
    if (block.type === "heading") {
      const content = renderInlineText(block.content);
      if (block.level === 1) {
        return (
          <h1 key={`heading-${index}`} className="text-2xl font-semibold tracking-[-0.03em]">
            {content}
          </h1>
        );
      }
      if (block.level === 2) {
        return (
          <h2 key={`heading-${index}`} className="text-xl font-semibold tracking-[-0.03em]">
            {content}
          </h2>
        );
      }
      return (
        <h3 key={`heading-${index}`} className="text-lg font-semibold">
          {content}
        </h3>
      );
    }

    if (block.type === "list") {
      return (
        <ul key={`list-${index}`} className="list-disc space-y-2 pl-5">
          {block.items.map((item, itemIndex) => (
            <li key={`item-${itemIndex}`}>{renderInlineText(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`paragraph-${index}`} className="leading-7">
        {renderInlineText(block.content)}
      </p>
    );
  });
}
