import { getRatioColor } from "./colors.js";
import { handleHover, clearHover, handleClick, handleLinkClickLTR } from "./event.js";
import { showNodeTooltip, showLinkTooltip, hideTooltip } from "./event.js";

const cellSize = 40;
const nodeSize = 160;
const margin = 60;
const matrixGap = 180;


export function drawAllMatrices(
    zoomGroup,
    matrixList1, matrixList2, pages,
    stepNodeStats1, stepNodeStats2,
    nodeScale, linkScale,
    nodeLimit, linkLimit, stepLimit,
    pageColors
) {
  zoomGroup.selectAll("*").remove();
  const container = zoomGroup.append("g").attr("transform", `rotate(-45)`);

  let xOffset = 0;
  let yOffset = 0;

  matrixList1.forEach((mat1, idx) => {
    const mat2 = matrixList2[idx] || { matrixData: [] };
    const nodeStat1 = stepNodeStats1[idx] || { counts: {} };
    const nodeStat2 = stepNodeStats2[idx] || { counts: {} };

    const g = container.append("g")
      .attr("id", `matrix-group-${idx}`)
      .attr("transform", `translate(${xOffset}, ${yOffset})`);

    const isLTR = idx % 2 === 0;

    if (isLTR) {
      drawMatrixLTR(g, mat1, mat2, pages, nodeStat1, nodeStat2, nodeScale, linkScale, pageColors, nodeLimit, linkLimit);
    } else {
      drawMatrixTTB(g, mat1, mat2, pages, nodeStat1, nodeStat2, nodeScale, linkScale, pageColors, nodeLimit, linkLimit);
    }

    // Tooltip 绑定
    // const nodeSel = isLTR ? g.selectAll(".freq-bar-left") : g.selectAll(".freq-bar-top");
    // const linkSel = g.selectAll("rect.cell");

    // bindNodeTooltip(nodeSel, pages, nodeStat1, nodeStat2);
    // bindLinkTooltip(linkSel, pages, nodeStat1, nodeStat2);

    if (isLTR) {
      yOffset += pages.length * cellSize + matrixGap;
    } else {
      xOffset += pages.length * cellSize + matrixGap;
    }
  });
}

  
  
function drawMatrixLTR(group, mat1, mat2, pages, stat1, stat2, nodeScale, linkScale, pageColors, nodeLimit, linkLimit) {
    const matMap2 = new Map(mat2.matrixData.map(d => [`${d.from}->${d.to}`, d.count]));
  
    // 左侧 node encoding 条
    group.selectAll("rect.freq-bar-left")
      .data(pages.filter(p => (stat1.counts[p] || 0) <= nodeLimit))
      .enter()
      .append("rect")
      .attr("class", "freq-bar-left")
      .attr("x", d => margin - matrixGap / 2 - nodeScale(stat1.counts[d] || 0) / 2)
      .attr("y", d => margin + pages.indexOf(d) * cellSize)
      .attr("width", d => nodeScale(stat1.counts[d] || 0))
      .attr("height", cellSize)
      .attr("fill", d => getRatioColor(stat1.counts[d] || 0, stat2.counts[d] || 0))
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        handleHover(d, group, pages);
        showNodeTooltip(d, stat1, stat2, event);
      })
      .on("mouseout", () => {
        hideTooltip();
        clearHover(group);
      })  // 悬停
      .on("click", (event, d) => handleClick(d, group, mat1.matrixData, pages, linkLimit)); // 点击;
  
    // 右侧 page 圆圈 + 标签
    pages.forEach((d, i) => {
      group.append("circle")
        .attr("cx", margin + pages.length * cellSize + 40)
        .attr("cy", margin + i * cellSize + cellSize / 2)
        .attr("r", cellSize / 2)
        .attr("fill", pageColors[d] || "#ccc");
  
      group.append("text")
        .attr("x", margin + pages.length * cellSize + 70)
        .attr("y", margin + i * cellSize + cellSize / 2 + 10)
        .attr("font-size", 20)
        .text(d);
    });
  
    // 绘制矩阵格子
    group.selectAll("rect.cell")
      .data(mat1.matrixData.filter(d =>
        d.count <= linkLimit &&
        (stat1.counts[d.from] || 0) <= nodeLimit
      ))
      .enter()
      .append("rect")
      .attr("class", "cell2")
      .attr("x", d => margin + pages.indexOf(d.to) * cellSize)
      .attr("y", d => margin + pages.indexOf(d.from) * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => {
        const c1 = d.count;
        const c2 = matMap2.get(`${d.from}->${d.to}`) || 0;
        return getRatioColor(c1, c2);
      })
      .attr("stroke", "#fff");
    group.selectAll("rect.cell")
      .data(mat1.matrixData.filter(d =>
        d.count <= linkLimit &&
        (stat1.counts[d.from] || 0) <= nodeLimit
      ))
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => margin + pages.indexOf(d.to)*cellSize + cellSize/2 - linkScale(d.count || 0)/2)
      .attr("y", d => margin + pages.indexOf(d.from)*cellSize + cellSize/2 - linkScale(d.count || 0)/2)
      .attr("width", d => linkScale(d.count || 0))
      .attr("height", d => linkScale(d.count || 0))
      .attr("fill", "#333")
      .attr("stroke", "#333")
      .on("mouseover", (event, d) => {
        const from = d.from;
        const to = d.to;
        const count2Link = mat2.matrixData.find(x => x.from === from && x.to === to)?.count || 0;
        showLinkTooltip(d, stat1, stat2, count2Link, event);    // 展示tooltip
      })
      .on("mouseout", () => {
        hideTooltip();                     // 隐藏tooltip
      })
      .on("click", (event, d) => handleLinkClickLTR(d, group, pages));
  
    // 步数标签
    group.append("circle")
      .attr("class", "step-circle")
      .attr("cx", margin - matrixGap / 2)
      .attr("cy", 20)
      .attr("r", 30)
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 3);
  
    group.append("text")
      .attr("class", "step")
      .attr("x", margin - matrixGap / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 40)
      .text(`${mat1.step}`);

    // 外框
    group.append("rect")
      .attr("x", margin)
      .attr("y", margin)
      .attr("width", cellSize * pages.length)
      .attr("height", cellSize * pages.length)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "14,14");
  }
  
function drawMatrixTTB(group, mat1, mat2, pages, stat1, stat2, nodeScale, linkScale, pageColors, nodeLimit, linkLimit) {
    const matMap2 = new Map(mat2.matrixData.map(d => [`${d.from}->${d.to}`, d.count]));
  
    // 顶部 node encoding 条
    group.selectAll("rect.freq-bar-top")
      .data(pages.filter(p => (stat1.counts[p] || 0) <= nodeLimit))
      .enter()
      .append("rect")
      .attr("class", "freq-bar-top")
      .attr("x", d => margin + pages.indexOf(d) * cellSize)
      .attr("y", d => margin - matrixGap / 2 - nodeScale(stat1.counts[d] || 0) / 2)
      .attr("width", cellSize)
      .attr("height", d => nodeScale(stat1.counts[d] || 0))
      .attr("fill", d => getRatioColor(stat1.counts[d] || 0, stat2.counts[d] || 0))
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        handleHover(d, group, pages, 1);
        showNodeTooltip(d, stat1, stat2, event);
      })
      .on("mouseout", () => {
        hideTooltip();
        clearHover(group);
      })  // 悬停
      .on("click", (event, d) => handleClick(d, group, mat1.matrixData, pages, linkLimit, 1));
  
    // 底部 page 圆圈 + 标签
    pages.forEach((d, i) => {
      group.append("circle")
        .attr("cx", margin + i * cellSize + cellSize / 2)
        .attr("cy", margin + pages.length * cellSize + 40)
        .attr("r", cellSize / 2)
        .attr("fill", pageColors[d] || "#ccc");
  
      group.append("text")
        .attr("x", margin + i * cellSize + cellSize / 2 + 10)
        .attr("y", margin + pages.length * cellSize + 70)
        .attr("font-size", 20)
        .attr("transform", `rotate(90, ${margin + i * cellSize + cellSize / 2 + 10}, ${margin + pages.length * cellSize + 70})`)
        .text(d);
    });
  
    // 绘制矩阵格点
    group.selectAll("rect.cell")
      .data(mat1.matrixData.filter(d =>
        d.count <= linkLimit &&
        (stat1.counts[d.from] || 0) <= nodeLimit
      ))
      .enter()
      .append("rect")
      .attr("class", "cell2")
      .attr("x", d => margin + pages.indexOf(d.from) * cellSize)
      .attr("y", d => margin + pages.indexOf(d.to) * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => {
        const c1 = d.count;
        const c2 = matMap2.get(`${d.from}->${d.to}`) || 0;
        return getRatioColor(c1, c2);
      })
      .attr("stroke", "#fff");
    group.selectAll("rect.cell")
      .data(mat1.matrixData.filter(d =>
        d.count <= linkLimit &&
        (stat1.counts[d.from] || 0) <= nodeLimit
      ))
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => margin + pages.indexOf(d.from) * cellSize + cellSize/2 - linkScale(d.count || 0)/2)
      .attr("y", d => margin + pages.indexOf(d.to) * cellSize + cellSize/2 - linkScale(d.count || 0)/2)
      .attr("width", d => linkScale(d.count || 0))
      .attr("height", d => linkScale(d.count || 0))
      .attr("fill", "#333")
      .attr("stroke", "#333")
      .on("mouseover", (event, d) => {
        const from = d.from;
        const to = d.to;
        const count2Link = mat2.matrixData.find(x => x.from === from && x.to === to)?.count || 0;
        showLinkTooltip(d, stat1, stat2, count2Link, event);    // 展示tooltip
      })
      .on("mouseout", () => {
        hideTooltip();                     // 隐藏tooltip
      })
      .on("click", (event, d) => handleLinkClickLTR(d, group, pages, 1));
      
  
    // 步数标签
    group.append("circle")
      .attr("cx", margin - 40)
      .attr("cy", margin - matrixGap / 2)
      .attr("r", 30)
      .attr("fill", "#fff")
      .attr("stroke", "#000")
      .attr("stroke-width", 3);
  
    group.append("text")
      .attr("x", margin - 40)
      .attr("y", margin - matrixGap / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", 40)
      .text(`${mat1.step}`);

    group.append("rect")
      .attr("x", margin)
      .attr("y", margin)
      .attr("width", cellSize * pages.length)
      .attr("height", cellSize * pages.length)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "14,14");
  }