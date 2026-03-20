import type React from "react";

type LexxyEditorAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  value?: string;
  placeholder?: string;
  preset?: string;
};

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lexxy-editor": LexxyEditorAttributes;
    }
  }
}
