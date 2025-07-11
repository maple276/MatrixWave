import { drawAllMatrices } from "./draw.js";
import { setupSliders } from "./filter.js";
import { drawLegend } from "./legend.js";
import { handleLinkClickLTR } from "./event.js";

const svg = d3.select("#canvas");
const zoomGroup = svg.append("g");

const cellSize = 40;
const nodeSize = 160;

const zoom = d3.zoom()
  .scaleExtent([0.1, 10])
  .on("zoom", (event) => zoomGroup.attr("transform", event.transform));

svg.call(zoom);

window.addEventListener("BothDataReady", e => {
  const { data1, data2, globalNodeMaxCount, globalLinkMaxCount } = e.detail;
  const pages = data1.pages;
  window.allPages = pages;

  const maxStep = data1.matrixList.length;

  const pageColors = {};
  pages.forEach(p => {
    if (p === "off") {
      pageColors[p] = "#000000"; // 黑色
    } else {
      const hue = Math.floor(Math.random() * 360);
      pageColors[p] = `hsl(${hue}, 70%, 60%)`;
    }
  });

  drawLegend(globalNodeMaxCount, globalLinkMaxCount, pages, pageColors);

  // 创建缩放比例函数（最大值保留，用于scale）
  const rawNodeScale = d3.scaleLinear().domain([0, globalNodeMaxCount]).range([5, nodeSize]);
  const rawLinkScale = d3.scaleLinear().domain([0, globalLinkMaxCount]).range([10, cellSize - 10]);

  // 注册滑条 + 筛选器逻辑
  setupSliders(
    {
      maxNodeCount: globalNodeMaxCount,
      maxLinkCount: globalLinkMaxCount,
      maxStep
    },
    ({ nodeLimit, linkLimit, stepLimit }) => {
      // const nodeScale = d3.scaleLinear().domain([0, nodeLimit]).range([5, nodeSize]);
      // const linkScale = d3.scaleLinear().domain([0, linkLimit]).range([10, cellSize - 10]);

      const mat1 = data1.matrixList.slice(0, stepLimit);
      const mat2 = data2.matrixList.slice(0, stepLimit);
      const stat1 = data1.stepNodeStats.slice(0, stepLimit);
      const stat2 = data2.stepNodeStats.slice(0, stepLimit);

      drawAllMatrices(
        zoomGroup,
        mat1, mat2,
        pages,
        stat1, stat2,
        nodeScale, linkScale,
        nodeLimit, linkLimit, stepLimit,
        pageColors
      );
    }
  );

  // 首次自动绘图（最大值）
  const nodeScale = d3.scaleLinear().domain([0, globalNodeMaxCount]).range([5, nodeSize]);
  const linkScale = d3.scaleLinear().domain([0, globalLinkMaxCount]).range([10, cellSize - 10]);

  drawAllMatrices(
    zoomGroup,
    data1.matrixList, data2.matrixList,
    pages,
    data1.stepNodeStats, data2.stepNodeStats,
    nodeScale, linkScale,
    globalNodeMaxCount, globalLinkMaxCount, maxStep,
    pageColors
  );

});

// ---------- 增加点击序列选择框的监听，选中路径高亮 ----------
document.getElementById("sequenceSelect").addEventListener("change", (e) => {
  const idx = +e.target.value;
  if (isNaN(idx)) return;

  const sequence = window.allClickSequences[idx];
  if (!sequence || sequence.length < 2) return;

  triggerPathHighlight(sequence);
});


function triggerPathHighlight(sequence) {
  const pages = window.allPages;
  if (!pages) return;

  d3.selectAll(".link-mask").remove();
  d3.selectAll(".link-line").remove();

  for (let step = 0; step < sequence.length; step++) {
    const from = sequence[step];
    // 最后一步的to是 "off"
    const to = (step === sequence.length - 1) ? "off" : sequence[step + 1];

    const group = d3.select(`#matrix-group-${step}`);
    if (!group.empty()) {
      const fakeData = { from, to };
      handleLinkClickLTR(fakeData, group, pages, step%2);
    }
  }
}

document.getElementById("clearSelection").addEventListener("click", () => {
  d3.selectAll(".link-mask").remove();
  d3.selectAll(".link-line").remove();

  const select = document.getElementById("sequenceSelect");
  select.value = "";
});
