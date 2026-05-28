import { Text } from "react-native";
import type { InlineNode } from "../parser/types";

function InlineText({ node }: { node: InlineNode }) {
  switch (node.type) {
    case "text":
      return <Text style={{ fontFamily: "Geist" }}>{node.text}</Text>;
    case "bold":
      return (
        <Text style={{ fontFamily: "Geist-Bold", fontWeight: "700" }}>
          {node.content?.map((n, i) => (
            <InlineText key={i} node={n} />
          ))}
        </Text>
      );
    case "italic":
      return (
        <Text style={{ fontStyle: "italic" }}>
          {node.content?.map((n, i) => (
            <InlineText key={i} node={n} />
          ))}
        </Text>
      );
    case "code":
      return (
        <Text style={{ fontFamily: "Geist-Mono" }}>{node.text}</Text>
      );
    default:
      return null;
  }
}

export function TextScreenRenderer({ nodes }: { nodes: InlineNode[] }) {
  return (
    <Text>
      {nodes.map((node, i) => (
        <InlineText key={i} node={node} />
      ))}
    </Text>
  );
}
