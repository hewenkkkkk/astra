const bilibiliPattern = /\{video:bilibili\}\(BV[0-9A-Za-z]{10}\)/gi;

const hasMeaningfulContent = (children: any[]) =>
  children.some(node => {
    if (!node) return false;
    if (node.type !== "text") return true;
    return String(node.value || "").trim() !== "";
  });

const remarkBilibili = () => {
  return (tree: any) => {
    if (!tree || !Array.isArray(tree.children)) return;

    tree.children = tree.children.filter((node: any) => {
      if (!node || node.type !== "paragraph") return true;
      if (!Array.isArray(node.children)) return true;

      node.children = node.children
        .map((child: any) => {
          if (!child || child.type !== "text") return child;
          const value = String(child.value || "");
          const cleaned = value.replace(bilibiliPattern, "").trim();
          return { ...child, value: cleaned };
        })
        .filter(Boolean);

      return hasMeaningfulContent(node.children);
    });
  };
};

export default remarkBilibili;
