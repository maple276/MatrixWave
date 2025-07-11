
let activeSelectedPage = null;  // 当前点击激活的 page 名称

export function handleHover(targetPage, group, pages, direct=0) {
  console.info("??????????")
  const i = pages.indexOf(targetPage);
  const cellSize = 40;
  const margin = 60;
  const matrixSize = pages.length * cellSize;

  const extraHeight = 100;
  const extraRight = 600;

  // 遮住上半
  group.append("rect")
    .attr("class", "hover-mask top-mask")
    .attr((direct==0) ? "x" : "y", margin - 160)
    .attr((direct==0) ? "y" : "x", margin - extraHeight)
    .attr((direct==0) ? "width" : "height", matrixSize + extraRight)
    .attr((direct==0) ? "height" : "width", i * cellSize + extraHeight)
    .attr("fill", "white")
    .attr("opacity", 0.7);

  // 遮住下半
  group.append("rect")
    .attr("class", "hover-mask bottom-mask")
    .attr((direct==0) ? "x" : "y", margin - 160)
    .attr((direct==0) ? "y" : "x", margin + (i + 1) * cellSize)
    .attr((direct==0) ? "width" : "height", matrixSize + extraRight)
    .attr((direct==0) ? "height" : "width", matrixSize - (i + 1) * cellSize + extraHeight)
    .attr("fill", "white")
    .attr("opacity", 0.7);

  // 当前行边框红框高亮
  group.append("rect")
    .attr("class", "hover-frame")
    .attr((direct==0) ? "x" : "y", margin)
    .attr((direct==0) ? "y" : "x", margin + i * cellSize)
    .attr((direct==0) ? "width" : "height", matrixSize)
    .attr((direct==0) ? "height" : "width", cellSize)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 3);
}

export function clearHover(group) {
  group.selectAll(".hover-mask").remove();
  group.selectAll(".hover-frame").remove();
}

export function handleClick(targetPage, group, matrixData, pages, linkLimit, direct=0) {
  // 重复点击则取消蓝线
  if (activeSelectedPage === targetPage) {
    activeSelectedPage = null;
    group.selectAll(".path-line").remove();
    return;
  }

  activeSelectedPage = targetPage;
  group.selectAll(".path-line").remove();

  const i = pages.indexOf(targetPage);
  const margin = 60;
  const cellSize = 40;
  const matrixHeight = pages.length * cellSize;
  const yCenter = margin + i * cellSize + cellSize / 2;

  // 横线
  group.append("line")
    .attr("class", "path-line")
    .attr((direct==0) ? "x1" : "y1", margin)
    .attr((direct==0) ? "x2" : "y2", margin + matrixHeight)
    .attr((direct==0) ? "y1" : "x1", yCenter)
    .attr((direct==0) ? "y2" : "x2", yCenter)
    .attr("stroke", "blue")
    .attr("stroke-width", 4);

  // 查找所有该行有值的跳转目标
  const relatedCols = new Set();
  matrixData.forEach(d => {
    if (d.from === targetPage && d.count > 0 && d.count <= linkLimit) {
      relatedCols.add(d.to);
    }
  });

  relatedCols.forEach(colPage => {
    const j = pages.indexOf(colPage);
    const x = margin + j * cellSize + cellSize / 2;

    // 向下线，从该行中点开始向下
    group.append("line")
      .attr("class", "path-line")
      .attr((direct==0) ? "x1" : "y1", x)
      .attr((direct==0) ? "x2" : "y2", x)
      .attr((direct==0) ? "y1" : "x1", yCenter)
      .attr((direct==0) ? "y2" : "x2", margin + matrixHeight)
      .attr("stroke", "blue")
      .attr("stroke-width", 3);
  });
}


export function handleLinkClickLTR(d, group, pages, direct=0) {
  const margin = 60;
  const cellSize = 40;
  const matrixSize = pages.length * cellSize;

  // 已存在就清除
  const active = group.selectAll(".link-mask").size() > 0;
  group.selectAll(".link-mask").remove();
  group.selectAll(".link-line").remove();
  if (active) return;

  const fromIdx = pages.indexOf(d.from);
  const toIdx = pages.indexOf(d.to);

  // 1. 遮盖所有 link 块（除了当前块）
  pages.forEach((p1, i) => {
    pages.forEach((p2, j) => {
      if (p1 === d.from && p2 === d.to) return;

      group.append("rect")
        .attr("class", "link-mask")
        .attr((direct==0) ? "x" : "y", margin + j * cellSize)
        .attr((direct==0) ? "y" : "x", margin + i * cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", "white")
        .attr("opacity", 0.7);
    });
  });

  // 2. 遮盖所有 node encoding 和 label（非 from/to）
  pages.forEach((p, i) => {
    if (p === d.from) return;

    const y = margin + i * cellSize;

    // 左侧 node encoding 遮罩
    group.append("rect")
      .attr("class", "link-mask")
      .attr((direct==0) ? "x" : "y", margin - 170)
      .attr((direct==0) ? "y" : "x", y)
      .attr((direct==0) ? "width" : "height", 170)
      .attr((direct==0) ? "height" : "width", cellSize)
      .attr("fill", "white")
      .attr("opacity", 0.7);

    // 右侧 label 遮罩
    group.append("rect")
      .attr("class", "link-mask")
      .attr((direct==0) ? "x" : "y", margin + matrixSize + 10)
      .attr((direct==0) ? "y" : "x", y)
      .attr((direct==0) ? "width" : "height", 400)
      .attr((direct==0) ? "height" : "width", cellSize)
      .attr("fill", "white")
      .attr("opacity", 0.7);
  });

 // 3. 画两条蓝线：from → 左边，to → 向下
  const linkX = margin + toIdx * cellSize + cellSize / 2;
  const linkY = margin + fromIdx * cellSize + cellSize / 2;

  // 从 link block 向左画线（from 行 → 左边）
  group.append("line")
    .attr("class", "link-line")
    .attr((direct==0) ? "x1" : "y1", linkX)
    .attr((direct==0) ? "y1" : "x1", linkY)
    .attr((direct==0) ? "x2" : "y2", linkX - toIdx * cellSize - cellSize / 2)
    .attr((direct==0) ? "y2" : "x2", linkY)
    .attr("stroke", "blue")
    .attr("stroke-width", 4);

  // 从 link block 向下画线（to 列 → 下方）
  group.append("line")
    .attr("class", "link-line")
    .attr((direct==0) ? "x1" : "y1", linkX)
    .attr((direct==0) ? "y1" : "x1", linkY)
    .attr((direct==0) ? "x2" : "y2", linkX)
    .attr((direct==0) ? "y2" : "x2", linkY + (pages.length - fromIdx - 0.5) * cellSize)
    .attr("stroke", "blue")
    .attr("stroke-width", 4);


}


// 悬停弹出的信息框
const tooltip = d3.select("#tooltip");

function showTooltip(html, event) {
  tooltip.html(html)
    .style("left", (event.pageX + 15) + "px")
    .style("top", (event.pageY + 15) + "px")
    .style("display", "block");
}

export function hideTooltip() {
  console.info("12121");
  tooltip.style("display", "none");
}


export function showNodeTooltip(page, stat1, stat2, event) {
  const count1 = stat1.counts[page] || 0;
  const count2 = stat2.counts[page] || 0;
  const diffRatio = count1 + count2 === 0 ? 0 : ((count1 - count2) / (count1 + count2)).toFixed(2);

  const html = `
    <div><b>Page: </b>${page}</div>
    <div>Data1 Count: ${count1}</div>
    <div>Data2 Count: ${count2}</div>
    <div>Difference Ratio: ${diffRatio}</div>
  `;
  showTooltip(html, event);
}

export function showLinkTooltip(link, stat1, stat2, count2Link, event) {
  const { from, to, count: count1Link = 0 } = link;

  const count1From = stat1.counts[from] || 0;
  const count2From = stat2.counts[from] || 0;
  const count1To = stat1.counts[to] || 0;
  const count2To = stat2.counts[to] || 0;

  const diffRatioLink = count1Link + count2Link === 0
    ? 0
    : ((count1Link - count2Link) / (count1Link + count2Link)).toFixed(2);

  const html = `
    <div><b>Link: </b>${from} → ${to}</div>
    <div>Data1 Count: ${count1Link}</div>
    <div>Data2 Count: ${count2Link}</div>
    <div>Difference Ratio: ${diffRatioLink}</div>
    <hr style="margin: 5px 0;">
    <div><b>From Node: </b>${from}</div>
    <div>Data1 Count: ${count1From}</div>
    <div>Data2 Count: ${count2From}</div>
    <div><b>To Node: </b>${to}</div>
    <div>Data1 Count: ${count1To}</div>
    <div>Data2 Count: ${count2To}</div>
  `;
  showTooltip(html, event);
}