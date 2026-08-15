import { parse } from "./parser";
import { generateSvg, generateErrorSvg } from "./svg/generator";
import { renderSvg } from "./svg/render";
import { extractShapeDefinitions, type ShapeDefinitions } from "./svg/shapes";
// ?raw を使わず、shapes.svg の中身を文字列として直接 import する
import embeddedShapesSvg from "./svg/shapes.svg";
import { loadSettings } from "./settings/settings";
import type { Settings } from "./types";

const shapes: ShapeDefinitions = extractShapeDefinitions(embeddedShapesSvg as unknown as string);
const settings: Settings = loadSettings(null);

export function convertTekken(source: string): string {
  try {
    const diagram = parse(source);
    return generateSvg(diagram, settings, shapes) || "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return generateErrorSvg(msg);
  }
}

export function renderInto(el: HTMLElement, source: string): void {
  const svg = convertTekken(source);
  if (svg) renderSvg(el, svg);
}