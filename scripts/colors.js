const customPurpleScale = d3.interpolateRgbBasis([
  "rgb(128, 116, 173)", // 深紫色
  "rgb(199, 192, 218)", // 淡紫
  "#ffffff"
]);

const customOrangeScale = d3.interpolateRgbBasis([
  "#ffffff",
  "rgb(249, 200, 159)", // 淡橙
  "rgb(223, 131, 038)"     // 深橙色
]);

export function getColorByPercent(p) {
  if (p < 0) {
    return customPurpleScale(1 + p);  // p = -1 → 0, p = 0 → 1
  } else {
    return customOrangeScale(p);      // p = 0 → 0, p = 1 → 1
  }
}

export function getRatioColor(v1, v2) {
  if (v1 === 0 && v2 === 0) return "#eee"; // 无活动
  const max = Math.max(v1, v2);
  let diffRatio = (v2 - v1) / max; // [-1, 1]
  if (v1%2==0) diffRatio = -diffRatio;

  if (diffRatio >= 0) {
    return d3.interpolateRgb("#ffffff", "#DF8326")(diffRatio); // 白到橙
  } else {
    return d3.interpolateRgb("#ffffff", "#8074AD")(-diffRatio); // 白到紫
  }
}
