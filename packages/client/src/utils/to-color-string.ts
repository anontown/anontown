import { RGBColor } from "react-color";

export function toColorString(color: RGBColor) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || "1"})`;
}
