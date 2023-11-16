const dataSets = {
  kickstart: {
    title: "Kickstarter Pledges",
    description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    path: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
  },
  movie: {
    title: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
    path: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
  },
  video: {
    title: "Video Game Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
    path: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
  }
};

const searchParams = new URLSearchParams(window.location.search);
const dataSet = dataSets[searchParams.get("dataset") || "kickstart"];

document.getElementById("title").innerHTML = dataSet.title;
document.getElementById("description").innerHTML = dataSet.description;

d3.json(dataSet.path)
  .then((data) => {
  
    const width = 960;
    const height = 570;
  
    const colorScale = d3.scaleOrdinal()
      .domain(data.children.map((d) => d.name))
      .range(d3.schemeTableau10)

    const root = d3.treemap()
      .tile(d3.treemapSquarify)
      .size([width, height])
      .padding(1)
      .round(true)
    (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));

    const svg = d3.select('body')
    .append('svg')
    .attr('id', 'tree-map')
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("title")
      .attr('id', 'tooltip')
      .text((d) => `Name: ${d.data.name}\nCategory: ${d.data.category}\nValue: ${d.data.value}`);

    leaf
      .append('rect')
      .attr('id', (d) => `${d.ancestors().reverse().map(d => d.data.name).join(".")}`)
      .attr('class', 'tile')
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return colorScale(d.data.name); })
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);

    leaf
      .append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .join("tspan")
      .attr("x", 3)
      .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
      .text(d => d);

    let lastCategory = null;
    const categories = root.leaves().flatMap((obj) => {
      if (lastCategory == obj.data.category) {
        return [];
      }
      lastCategory = obj.data.category;
      return obj.data.category
    });

    const legendWidth = 500;
    const legendHeight = 150;
    
    const legendPadding = 10;
    const legendElemPerRow = Math.floor(legendWidth / legendHeight);

    const legendContainer = d3.select('body')
      .append('svg')
      .attr('id', 'legend')
      .attr('width', legendWidth)
      .attr('height', legendHeight);

    const legendElem = legendContainer
      .append('g')
      .attr('transform', 'translate(60,' + legendPadding + ')')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', (d, i) =>    
          'translate(' +
          (i % legendElemPerRow) * legendHeight +
          ',' +
          (Math.floor(i / legendElemPerRow) * 15 +
            10 * Math.floor(i / legendElemPerRow)) +
          ')'
        );

    legendElem
      .append('rect')
      .attr('class', 'legend-item')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', (d) => colorScale(d));

    legendElem
      .append('text')
      .attr('x', 18)
      .attr('y', 13)
      .text((d) => d);
    
  })
  .catch((err) => console.error(err));