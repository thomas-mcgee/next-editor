import type { ReactElement } from "react";
import type { NextEditorConfig } from "../types";

export type NextEditorAdminPageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export declare function createAdminPage(
  config: NextEditorConfig,
): (props: NextEditorAdminPageProps) => ReactElement | Promise<ReactElement>;

declare const NextEditorAdminPage: (
  props: NextEditorAdminPageProps,
) => ReactElement | Promise<ReactElement>;

export default NextEditorAdminPage;
