function drawChartQ1() {
    const svgId = "#chart-Q1";
    d3.select(svgId).selectAll("*").remove();

    // Sắp xếp và lấy Top 10 từ q1_values
    const counts = q1_values
        .map(item => ({
            type: item.property_type || "Không xác định",
            count: item.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Giảm kích thước và lề
    const margin = { top: 30, right: 100, bottom: 30, left: 80 },
          width = 350 - margin.left - margin.right,
          height = counts.length * 18;

    const svg = d3.select(svgId)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(counts, d => d.count)])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(counts.map(d => d.type))
        .range([0, height])
        .padding(0.18);

    const colorScale = d3.scaleOrdinal(d3.schemeSet2);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "3px 5px")
        .style("border", "1px solid #000")
        .style("border-radius", "3px")
        .style("visibility", "hidden")
        .style("font-size", "10px")
        .style("text-align", "left");

    // Vẽ các thanh
    svg.selectAll(".bar")
        .data(counts)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.type))
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.count))
        .attr("fill", d => colorScale(d.type))
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                   .html(`<strong>Loại chỗ ở:</strong> ${d.type}<br>
                          <strong>Số lượng lưu trú:</strong> ${d.count}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY - 5) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Nhãn số
    svg.selectAll(".label")
        .data(counts)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.count) + 2)
        .attr("y", d => yScale(d.type) + yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif")
        .text(d => d.count);

    // Trục
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(3))
        .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Calibri, sans-serif");

    // Tiêu đề
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Calibri, sans-serif")
        .style("fill", "#d1495b")
        .text("Số lượng lưu trú theo loại chỗ ở (Top 10)");
}