import { slugifyStr } from "./slugify";

const normalizeId = (value: string) =>
  value
    .replace(/\\/g, "/")
    .replace(/\/index\.(md|mdx)$/i, "")
    .replace(/\.(md|mdx)$/i, "")
    .trim();

export const getMomentAnchor = (id: string) => {
  const normalized = normalizeId(id);
  const parts = normalized
    .split("/")
    .map(segment => slugifyStr(segment))
    .filter(Boolean);
  return `moment-${parts.join("-")}`;
};
