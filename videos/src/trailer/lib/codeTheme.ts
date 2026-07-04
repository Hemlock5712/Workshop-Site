import type { PrismTheme } from "prism-react-renderer";
import { brand } from "../../lib/brand";

// Same palette as the classic CodeSlide, shared by trailer artifacts.
export const codeTheme: PrismTheme = {
  plain: {
    color: brand.code.plain,
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: { color: brand.code.comment, fontStyle: "italic" },
    },
    {
      types: ["keyword", "boolean", "operator", "punctuation"],
      style: { color: brand.code.keyword },
    },
    {
      types: ["builtin", "class-name", "tag"],
      style: { color: brand.code.type },
    },
    {
      types: ["string", "char", "attr-value"],
      style: { color: brand.code.string },
    },
    { types: ["number", "constant"], style: { color: brand.code.number } },
    { types: ["function", "method"], style: { color: brand.code.function } },
    { types: ["annotation"], style: { color: brand.code.annotation } },
  ],
};
