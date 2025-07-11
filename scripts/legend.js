import { getColorByPercent } from './colors.js';

export function drawLegend(globalNodeMaxCount=1, globalLinkMaxCount=1, pages, pageColors) {
  const legendWidth = 350;
  const legendHeight = 800;
  const boxSize = 16;
  
  // 在 #legend 中插入一个 svg
  const svg = d3.select("#legend-out")
  .append("svg")
  .attr("width", legendWidth)
  .attr("height", legendHeight);

  const group = svg.append("g").attr("transform", "translate(20, 20)");

  // node encoding
  group.append("text")
    .attr("class", "node-text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .text(`Node encodings`);

  const nodeBarHeights = d3.range(1, 12).map(i => i * 8);
  const nodeBarSpacing = 18;
  const nodeY = 80;
    
  group.selectAll("rect.node-bar")
    .data(nodeBarHeights)
    .enter()
    .append("rect")
    .attr("class", "node-bar")
    .attr("x", (d, i) => i * nodeBarSpacing + 50)
    .attr("y", d => nodeY - d / 2)
    .attr("width", 12)
    .attr("height", d => d)
    .attr("fill", "#fff")
    .attr("stroke", "#000");
    
    group.append("text")
    .attr("x", 20)
    .attr("y", nodeY + 5)
    .attr("font-size", 16)
    .text("1");
    
    group.append("text")
    .attr("x", 80 + nodeBarSpacing * (nodeBarHeights.length - 1))
    .attr("y", nodeY + 5)
    .attr("font-size", 16)
    .text(globalNodeMaxCount.toString());
    
    // 负数到正数，共11格（-100% ~ 100%）
    const legendData = d3.range(-1.0, 1.01, 0.2);
  
    group.append("text")
      .attr("class", "f100%")
      .attr("x", -10)
      .attr("y", 160)
      .attr("font-size", 15)
      .text(`-100%`);
    group.selectAll("rect.color-bar")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (boxSize + 4) + 50)
      .attr("y", 150)
      .attr("width", boxSize)
      .attr("height", boxSize)
      .attr("fill", d => getColorByPercent(d))
      .attr("stroke", "#000");  
    group.append("text")
      .attr("class", "100%")
      .attr("x", 275)
      .attr("y", 160)
      .attr("font-size", 15)
      .text(`100%`);


    // Link 黑块图例（表示跳转频次）
    group.append("text")
      .attr("class", "node-text")
      .attr("x", -10)
      .attr("y", 200)
      .attr("font-size", 20)
      .attr("font-weight", "bold")
      .text(`Link encodings`);

    const linkSizes = d3.range(1, 12).map(i => i*1.5); // 边长递增
    const linkY = 180;
    
  group.selectAll("rect.link-box")
    .data(linkSizes)
    .enter()
    .append("rect")
    .attr("class", "link-box")
    .attr("x", (d, i) => i * nodeBarSpacing + 50)
    .attr("y", d => linkY + 50 - d / 2)
    .attr("width", d => d)
    .attr("height", d => d)
    .attr("fill", "#333");

  group.append("text")
    .attr("x", 20)
    .attr("y", linkY + 55)
    .attr("font-size", 16)
    .text("1");

  group.append("text")
    .attr("x", 80 + nodeBarSpacing * (linkSizes.length - 1))
    .attr("y", linkY + 55)
    .attr("font-size", 16)
    .text(globalLinkMaxCount.toString());


  // Page Group
  group.append("text")
    .attr("class", "node-text")
    .attr("x", -10)
    .attr("y", 300)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .text(`Page groups`);

  if (globalLinkMaxCount==1) return ;
  
  const pageStartY = 300;

  pages.forEach((page, i) => {
    const y = pageStartY + 20 + i * 20;

    group.append("rect")
      .attr("x", 10)
      .attr("y", y - 12)
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", pageColors[page] || "#ccc")
      .attr("stroke", "#000");

    group.append("text")
      .attr("x", 30)
      .attr("y", y)
      .attr("font-size", 14)
      .text(page);
  });
}

// drawLegend();