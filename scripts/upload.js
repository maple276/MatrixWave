let data1Raw = null;
let data2Raw = null;

let parsedData1 = null;
let parsedData2 = null;

document.getElementById("upload-json1").addEventListener("change", (event) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    data1Raw = JSON.parse(e.target.result);
    parsedData1 = processRawData(data1Raw);
  };
  reader.readAsText(event.target.files[0]);
});

document.getElementById("upload-json2").addEventListener("change", (event) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    data2Raw = JSON.parse(e.target.result);
    parsedData2 = processRawData(data2Raw);
    tryTriggerDraw();
  };
  reader.readAsText(event.target.files[0]);
});

function tryTriggerDraw() {
  if (parsedData1 && parsedData2) {
    const { globalNodeMaxCount, globalLinkMaxCount } = computeMaxCounts(parsedData1);

    // 调用填充序列列表函数，传入原始点击序列 data1Raw
    fillSequenceDropdown(data1Raw);

    const event = new CustomEvent("BothDataReady", {
      detail: {
        data1: parsedData1,
        data2: parsedData2,
        globalNodeMaxCount,
        globalLinkMaxCount,
      }
    });
    window.dispatchEvent(event);
  }
}

function fillSequenceDropdown(rawSequences) {
  const select = document.getElementById("sequenceSelect");
  if (!select) return;

  select.innerHTML = '<option value="">choice:</option>';

  rawSequences.forEach((seq, idx) => {
    const label = seq.join(" → ");
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = `seq: ${idx + 1}: ${label}`;
    select.appendChild(option);
  });

  // 保存序列数据全局可用
  window.allClickSequences = rawSequences;
}

function processRawData(raw, maxStep = 7) {
  // raw 是数组数组：例如 [["A","B","C"], ["B","C","A"]]
  if (!Array.isArray(raw) || !Array.isArray(raw[0])) {
    console.error("Invalid input format: expected array of sequences");
    return { matrixList: [], stepNodeStats: [], pages: [] };
  }

  const pagesSet = new Set();
  raw.forEach(seq => seq.forEach(p => pagesSet.add(p)));
  pagesSet.add("off"); // 加入终止点
  const pages = Array.from(pagesSet);

  const matrixList = [];
  const stepNodeStats = [];

  for (let step = 0; step < maxStep; step++) {
    const matrixData = [];
    const counts = {};

    raw.forEach(seq => {
      for (let i = 0; i + step + 1 < seq.length; i++) {
        const from = seq[i];
        const to = seq[i + step + 1];

        // 更新链接数据
        const existing = matrixData.find(d => d.from === from && d.to === to);
        if (existing) {
          existing.count++;
        } else {
          matrixData.push({ from, to, count: 1 });
        }

        // node 活跃度统计
        counts[from] = (counts[from] || 0) + 1;
        counts[to] = (counts[to] || 0) + 1;
      }

      // 最后一个点链接到 "off"
      const last = seq[seq.length - 1];
      const existing = matrixData.find(d => d.from === last && d.to === "off");
      if (existing) {
        existing.count++;
      } else {
        matrixData.push({ from: last, to: "off", count: 1 });
      }

      counts[last] = (counts[last] || 0) + 1;
      counts["off"] = (counts["off"] || 0) + 1;
    });

    matrixList.push({ step, matrixData });
    stepNodeStats.push({ step, counts });
  }

  return { matrixList, stepNodeStats, pages };
}


function computeMaxCounts(parsedData) {
  let globalNodeMaxCount = 0;
  let globalLinkMaxCount = 0;

  parsedData.stepNodeStats.forEach(stat => {
    Object.values(stat.counts).forEach(cnt => {
      if (cnt > globalNodeMaxCount) globalNodeMaxCount = cnt;
    });
  });

  parsedData.matrixList.forEach(mat => {
    mat.matrixData.forEach(d => {
      if (d.count > globalLinkMaxCount) globalLinkMaxCount = d.count;
    });
  });

  return { globalNodeMaxCount, globalLinkMaxCount };
}
