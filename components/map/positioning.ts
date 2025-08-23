export type PanelSide = "right" | "left" | "top" | "bottom";

export function getAnchorPosition(
  anchor: { x: number; y: number },
  panelSize: { width: number; height: number },
  containerSize: { width: number; height: number },
  preferred: PanelSide = "right",
  offset = 12
): { left: number; top: number; side: PanelSide } {
  let side: PanelSide = preferred;
  let left = anchor.x + offset;
  let top = anchor.y - panelSize.height / 2;

  if (preferred === "right") {
    if (left + panelSize.width > containerSize.width) {
      side = "left";
      left = anchor.x - offset - panelSize.width;
      top = anchor.y - panelSize.height / 2;
    }
  } else if (preferred === "left") {
    left = anchor.x - offset - panelSize.width;
    if (left < 0) {
      side = "right";
      left = anchor.x + offset;
    }
  } else if (preferred === "top") {
    side = "top";
    left = anchor.x - panelSize.width / 2;
    top = anchor.y - offset - panelSize.height;
  } else {
    side = "bottom";
    left = anchor.x - panelSize.width / 2;
    top = anchor.y + offset;
  }

  if (top < 8) top = 8;
  if (top + panelSize.height > containerSize.height)
    top = Math.max(8, containerSize.height - panelSize.height - 8);
  if (left < 8) left = 8;
  if (left + panelSize.width > containerSize.width)
    left = Math.max(8, containerSize.width - panelSize.width - 8);

  return { left, top, side };
}
