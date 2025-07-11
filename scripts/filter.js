export function setupSliders({ maxNodeCount, maxLinkCount, maxStep }, onFilterChange) {
    const settings = [
      { slider: "nodeThreshold", input: "nodeValue", max: maxNodeCount },
      { slider: "linkThreshold", input: "linkValue", max: maxLinkCount },
      { slider: "stepThreshold", input: "stepValue", max: maxStep }
    ];
  
    settings.forEach(({ slider, input, max }) => {
      const sliderElem = document.getElementById(slider);
      const inputElem = document.getElementById(input);
  
      sliderElem.max = inputElem.max = max;
      sliderElem.value = inputElem.value = max;
  
      sliderElem.addEventListener("input", () => {
        inputElem.value = sliderElem.value;
        trigger();
      });
  
      inputElem.addEventListener("input", () => {
        sliderElem.value = inputElem.value;
        trigger();
      });
    });
  
    function trigger() {
      onFilterChange({
        nodeLimit: +document.getElementById("nodeThreshold").value,
        linkLimit: +document.getElementById("linkThreshold").value,
        stepLimit: +document.getElementById("stepValue").value
      });
    }
  }
  